/**
 * renderFlow.js — Render orchestration logic for the Mashup Generator
 *
 * Pure async orchestration. No React, no Zustand imports.
 * Takes token, apiBase, state slices, and callbacks as arguments.
 * Returns a promise that resolves when render + poll reaches a terminal state.
 *
 * Exported:
 *   startRenderFlow({ token, apiBase, tracks, roles, arrangement,
 *                     uploadIds, setJob, setUploadId, setUploadProgress, signal })
 *   cancelRenderFlow({ token, apiBase, jobId })
 *
 * Error taxonomy:
 *   { kind: 'INSUFFICIENT_CREDITS', required, available }  — 402 on /render
 *   { kind: 'UPLOAD_FAILED', slot, message }               — XHR PUT failed
 *   { kind: 'RENDER_FAILED', message }                     — 5xx or network
 *   { kind: 'ROLES_MISSING' }                              — validation
 *   { kind: 'TRACKS_MISSING' }                             — validation
 *
 * No emoji.
 */

import { getUploadUrl, startRender, getJob, cancelRender as cancelRenderApi } from "./api.js";
import { uploadToR2 } from "./uploadProgress.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** Terminal statuses — polling stops on any of these. */
const TERMINAL_STATUSES = new Set(["ready", "failed", "refunded", "cancelled"]);

// ---------------------------------------------------------------------------
// Typed error factory
// ---------------------------------------------------------------------------

function makeError(kind, extra = {}) {
  const err = new Error(extra.message || kind);
  err.kind = kind;
  Object.assign(err, extra);
  return err;
}

// ---------------------------------------------------------------------------
// Upload one track if not already uploaded
// ---------------------------------------------------------------------------

/**
 * uploadTrackIfNeeded
 *
 * Skips upload if uploadIds[slot] is already set (reuse from previous render).
 * Returns the R2 key for the uploaded track.
 *
 * @param {object} opts
 * @param {string}   opts.slot          - 'a' | 'b'
 * @param {File}     opts.file          - the raw File object from Track
 * @param {string|undefined} opts.existingUploadId - if set, skip upload
 * @param {string}   opts.token
 * @param {string}   opts.apiBase
 * @param {(slot: string, percent: number) => void} opts.onProgress
 * @param {AbortSignal} opts.signal
 * @param {(slot: string, id: string) => void} opts.onUploaded - called with uploadId on completion
 * @returns {Promise<string>} resolves with the R2 key
 */
async function uploadTrackIfNeeded({
  slot,
  file,
  existingUploadId,
  token,
  apiBase,
  onProgress,
  signal,
  onUploaded,
}) {
  // If already uploaded, return the cached upload ID as the key fragment
  if (existingUploadId) {
    onProgress(slot, 100);
    return existingUploadId;
  }

  if (!file) {
    throw makeError("TRACKS_MISSING", { message: `Track ${slot.toUpperCase()} has no file` });
  }

  // Determine contentType and ext
  const mimeType = file.type || "audio/mpeg";
  const extMatch = file.name ? file.name.match(/\.([^.]+)$/) : null;
  const ext = extMatch ? extMatch[1].toLowerCase() : "mp3";

  // Request a presigned PUT URL
  const urlData = await getUploadUrl(apiBase, token, {
    role: slot,
    contentType: mimeType,
    ext,
  });

  const { uploadId, key, uploadUrl } = urlData;

  if (signal && signal.aborted) {
    throw makeError("UPLOAD_FAILED", { slot, message: "Upload aborted" });
  }

  // Upload via XHR so we get progress events
  const { xhr, promise: uploadPromise } = uploadToR2(file, uploadUrl, ({ percent }) => {
    onProgress(slot, percent);
  });

  // Wire AbortSignal to XHR abort
  let abortHandler;
  if (signal) {
    abortHandler = () => xhr.abort();
    signal.addEventListener("abort", abortHandler);
  }

  try {
    await uploadPromise;
  } catch (uploadErr) {
    const msg =
      uploadErr && typeof uploadErr.body === "string"
        ? uploadErr.body
        : `Upload failed for track ${slot.toUpperCase()}`;
    throw makeError("UPLOAD_FAILED", { slot, message: msg });
  } finally {
    if (signal && abortHandler) {
      signal.removeEventListener("abort", abortHandler);
    }
  }

  // Notify caller so the uploadId can be persisted to the store
  onUploaded(slot, uploadId);

  // Return the R2 key (used as source_a_key / source_b_key in /render)
  return key;
}

// ---------------------------------------------------------------------------
// Poll loop
// ---------------------------------------------------------------------------

/**
 * pollJob
 *
 * Polls GET /mashup/jobs/:jobId every POLL_INTERVAL_MS.
 * Calls setJob on each tick so the UI reflects live state.
 * Resolves with the final job object when a terminal status is reached.
 * Rejects after POLL_TIMEOUT_MS.
 *
 * @param {object} opts
 * @param {string} opts.token
 * @param {string} opts.apiBase
 * @param {string} opts.jobId
 * @param {(job: object) => void} opts.setJob
 * @returns {Promise<object>} final job
 */
function pollJob({ token, apiBase, jobId, setJob }) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    let intervalId = null;

    async function tick() {
      try {
        const job = await getJob(apiBase, token, jobId);
        setJob(job);

        if (TERMINAL_STATUSES.has(job.status)) {
          clearInterval(intervalId);
          resolve(job);
          return;
        }

        // Hard timeout — backend also enforces 5 min, but UI must not hang
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          clearInterval(intervalId);
          // Synthesise a failed job so UI shows the error banner
          const timedOutJob = {
            ...job,
            status: "failed",
            errorMessage: "Render timed out after 5 minutes. Your credits were refunded automatically.",
          };
          setJob(timedOutJob);
          resolve(timedOutJob);
        }
      } catch (err) {
        // Network error during polling — don't bail immediately, keep trying
        // (unless we're past timeout)
        if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
          clearInterval(intervalId);
          reject(makeError("RENDER_FAILED", { message: "Lost connection while polling render status." }));
        }
      }
    }

    intervalId = setInterval(tick, POLL_INTERVAL_MS);

    // Run an immediate first tick so we don't wait 3s for the first update
    tick();
  });
}

// ---------------------------------------------------------------------------
// Main render flow
// ---------------------------------------------------------------------------

/**
 * startRenderFlow
 *
 * Full end-to-end flow: upload A + upload B (in parallel) → POST /render
 * → poll until terminal status.
 *
 * @param {object} opts
 * @param {string}   opts.token
 * @param {string}   opts.apiBase
 * @param {{ a: object|null, b: object|null }} opts.tracks   - store.tracks
 * @param {{ vocal: string|null, instr: string|null }} opts.roles
 * @param {{ regions: object, effects: object[], drops: object }} opts.arrangement
 * @param {{ a?: string, b?: string }} opts.uploadIds        - store.uploadIds
 * @param {(job: object|null) => void} opts.setJob
 * @param {(slot: string, id: string) => void} opts.setUploadId
 * @param {(slot: string, percent: number) => void} opts.setUploadProgress
 * @param {AbortSignal} [opts.signal]
 * @returns {Promise<object>} final job object
 */
export async function startRenderFlow({
  token,
  apiBase,
  tracks,
  roles,
  arrangement,
  uploadIds,
  setJob,
  setUploadId,
  setUploadProgress,
  signal,
}) {
  // ── Validation ──────────────────────────────────────────────────────────
  if (!tracks.a?.buffer || !tracks.b?.buffer) {
    throw makeError("TRACKS_MISSING", { message: "Both tracks must be loaded before rendering." });
  }

  if (!roles.vocal || !roles.instr) {
    throw makeError("ROLES_MISSING", { message: "Assign vocal and instrumental roles before rendering." });
  }

  // ── Set initial processing state ────────────────────────────────────────
  setJob({
    jobId: null,
    status: "processing",
    createdAt: Date.now(),
    errorMessage: null,
  });

  // ── Upload tracks A and B in parallel ───────────────────────────────────
  let keyA, keyB;
  try {
    [keyA, keyB] = await Promise.all([
      uploadTrackIfNeeded({
        slot: "a",
        file: tracks.a.file,
        existingUploadId: uploadIds.a,
        token,
        apiBase,
        onProgress: setUploadProgress,
        signal: signal || null,
        onUploaded: (slot, id) => setUploadId(slot, id),
      }),
      uploadTrackIfNeeded({
        slot: "b",
        file: tracks.b.file,
        existingUploadId: uploadIds.b,
        token,
        apiBase,
        onProgress: setUploadProgress,
        signal: signal || null,
        onUploaded: (slot, id) => setUploadId(slot, id),
      }),
    ]);
  } catch (uploadErr) {
    // Re-throw as-is (already typed) so the page handler can display it
    throw uploadErr;
  }

  if (signal && signal.aborted) {
    throw makeError("UPLOAD_FAILED", { slot: "both", message: "Uploads aborted before render start." });
  }

  // ── POST /mashup/render ─────────────────────────────────────────────────
  let renderData;
  try {
    renderData = await startRender(apiBase, token, {
      source_a_key: keyA,
      source_b_key: keyB,
      vocal_role: roles.vocal,
      arrangement: {
        regions: arrangement.regions,
        effects: arrangement.effects,
        drops: arrangement.drops,
      },
    });
  } catch (apiErr) {
    // 402 — not enough credits
    if (apiErr.status === 402) {
      throw makeError("INSUFFICIENT_CREDITS", {
        required: apiErr.required ?? 6,
        available: apiErr.available ?? 0,
        message: apiErr.message || "Insufficient credits",
      });
    }

    // 409 — duplicate render — switch to polling the existing job
    if (apiErr.status === 409 && apiErr.existing?.jobId) {
      const existingJobId = apiErr.existing.jobId;
      // Set job state optimistically, then fall through to poll
      setJob({ jobId: existingJobId, status: "processing", createdAt: Date.now() });
      renderData = { jobId: existingJobId, status: "processing" };
    } else {
      // 5xx / network error
      throw makeError("RENDER_FAILED", {
        message: apiErr.message || "Render request failed. Please try again.",
      });
    }
  }

  // Update job state with the real jobId from /render
  const jobId = renderData.jobId;
  setJob({ jobId, status: "processing", createdAt: Date.now() });

  // ── Poll until terminal ─────────────────────────────────────────────────
  const finalJob = await pollJob({ token, apiBase, jobId, setJob });

  return finalJob;
}

// ---------------------------------------------------------------------------
// Cancel flow
// ---------------------------------------------------------------------------

/**
 * cancelRenderFlow
 *
 * Calls POST /mashup/jobs/:jobId/cancel.
 * Returns the raw backend response: { success, refunded?, reason?, message? }.
 * Callers handle UI transitions.
 *
 * @param {object} opts
 * @param {string} opts.token
 * @param {string} opts.apiBase
 * @param {string} opts.jobId
 * @returns {Promise<{ success: boolean, refunded?: number, reason?: string, message?: string }>}
 */
export async function cancelRenderFlow({ token, apiBase, jobId }) {
  return cancelRenderApi(token, apiBase, jobId);
}
