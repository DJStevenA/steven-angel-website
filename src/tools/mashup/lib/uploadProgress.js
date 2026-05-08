/**
 * uploadProgress.js — XHR upload to R2 presigned PUT URL with progress reporting
 *
 * Uses XMLHttpRequest instead of fetch because the Fetch API does not expose
 * upload progress events in any current browser. XHR's upload.onprogress
 * fires every ~50ms with loaded/total byte counts.
 *
 * Exported:
 *   uploadToR2(file, signedUrl, onProgress?)  → Promise<void>
 *   cancelUpload(xhr)                          → void
 *
 * No React, no Zustand, no external dependencies.
 */

// ---------------------------------------------------------------------------
// Types (JSDoc only — no TypeScript)
// ---------------------------------------------------------------------------

/**
 * @typedef {object} ProgressEvent
 * @property {number} loaded   — bytes uploaded so far
 * @property {number} total    — total bytes in the file
 * @property {number} percent  — 0-100 (integer, clamped)
 */

// ---------------------------------------------------------------------------
// Core upload
// ---------------------------------------------------------------------------

/**
 * uploadToR2(file, signedUrl, onProgress?)
 *
 * PUTs `file` to `signedUrl` using XHR.
 * The Content-Type header is set from file.type (or 'application/octet-stream'
 * if the browser didn't detect a MIME type).
 *
 * onProgress is called with a ProgressEvent object on each XHR progress tick,
 * including a synthetic final call with percent=100 just before resolution
 * so callers don't need to special-case the "done" transition.
 *
 * Resolves with undefined on 2xx. Rejects with { status, body } on non-2xx
 * or network failure.
 *
 * @param {File}     file        — the File (or Blob) to upload
 * @param {string}   signedUrl   — presigned PUT URL from /mashup/upload-url
 * @param {(evt: ProgressEvent) => void} [onProgress]
 * @returns {{ xhr: XMLHttpRequest, promise: Promise<void> }}
 *   Returns both the xhr handle (for cancellation) and the upload promise.
 *   This shape lets callers cancel without needing a separate `cancelUpload` call.
 */
export function uploadToR2(file, signedUrl, onProgress) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.min(100, Math.round((evt.loaded / evt.total) * 100));
          onProgress({ loaded: evt.loaded, total: evt.total, percent });
        }
      });
    }

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Synthetic 100% progress notification before resolving
        if (onProgress) {
          onProgress({ loaded: file.size, total: file.size, percent: 100 });
        }
        resolve();
      } else {
        // Non-2xx — try to parse body for a useful error message
        let body = xhr.responseText;
        try {
          body = JSON.parse(xhr.responseText);
        } catch (_) {
          // plain text body; leave as string
        }
        reject({ status: xhr.status, body });
      }
    });

    // Network-level failure (DNS, CORS, connection refused, etc.)
    xhr.addEventListener('error', () => {
      reject({ status: 0, body: 'Network error — upload failed' });
    });

    // Timeout
    xhr.addEventListener('timeout', () => {
      reject({ status: 0, body: 'Upload timed out' });
    });

    // Abort (triggered by cancelUpload)
    xhr.addEventListener('abort', () => {
      reject({ status: 0, body: 'Upload cancelled' });
    });

    // Open and configure request
    xhr.open('PUT', signedUrl, true); // async=true
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

    // R2 presigned PUT: do NOT set Content-Disposition or other headers that
    // were not included in the presigned URL signature, or the request will
    // fail with a 403 SignatureDoesNotMatch error.

    xhr.send(file);
  });

  return { xhr, promise };
}

/**
 * cancelUpload(xhr)
 *
 * Aborts an in-flight XHR upload. The promise returned by uploadToR2 will
 * reject with { status: 0, body: 'Upload cancelled' }.
 *
 * Safe to call on an already-completed XHR — it becomes a no-op.
 *
 * @param {XMLHttpRequest} xhr — the xhr handle returned from uploadToR2
 */
export function cancelUpload(xhr) {
  if (xhr && typeof xhr.abort === 'function') {
    xhr.abort();
  }
}
