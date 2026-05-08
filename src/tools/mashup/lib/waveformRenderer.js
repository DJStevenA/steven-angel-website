/**
 * waveformRenderer.js — Canvas waveform rendering from Web Audio AudioBuffer
 *
 * Renders a max-amplitude-per-pixel waveform onto a Canvas 2D context.
 * Mirror mode (default): symmetric top+bottom like a DAW lane.
 * Top-only mode: draws only the upper half, useful for compact views.
 *
 * Performance strategy for long tracks (>5 min):
 *   Peak data is downsampled once into a Float32Array of canvas-width values
 *   and cached on the canvas element as canvas._peakCache. Subsequent redraws
 *   (e.g. on resize) use the cache instead of re-scanning the full buffer.
 *   Cache is invalidated whenever the buffer reference changes.
 *
 * Device pixel ratio: reads window.devicePixelRatio and scales the canvas
 * backing store accordingly, then calls ctx.scale so logical drawing
 * coordinates stay in CSS pixels. Callers set canvas CSS size; this module
 * sets the physical (backing store) size.
 *
 * No external dependencies — pure Canvas 2D + Web Audio AudioBuffer.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tracks longer than this threshold get a pre-downsampled peak cache. */
const LONG_TRACK_THRESHOLD_SEC = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute device pixel ratio, falling back to 1 in non-browser environments.
 */
function getDpr() {
  return (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
}

/**
 * Parse a CSS hex color string (#rrggbb or #rgb) into a [r,g,b] integer tuple.
 * Falls back to [0, 229, 255] (brand cyan) on any parse failure.
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [0, 229, 255];
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  if (h.length === 6) {
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }
  return [0, 229, 255];
}

/**
 * Build a Float32Array of peak-per-pixel values from an AudioBuffer.
 * Uses only channel 0 (mono peak). Returns array of length `width`.
 *
 * For stereo tracks the peak across both channels could be computed here;
 * channel 0 matches the prototype behaviour and is sufficient for visual use.
 */
function computePeaks(audioBuffer, width) {
  const data = audioBuffer.getChannelData(0);
  const totalSamples = data.length;
  const peaks = new Float32Array(width);

  // Use exact float step to avoid accumulating integer-rounding drift
  const step = totalSamples / width;

  for (let x = 0; x < width; x++) {
    const start = Math.floor(x * step);
    const end = Math.min(Math.floor((x + 1) * step), totalSamples);
    let max = 0;
    for (let i = start; i < end; i++) {
      const v = Math.abs(data[i]);
      if (v > max) max = v;
    }
    peaks[x] = max;
  }

  return peaks;
}

/**
 * Retrieve or build the peak cache for a given canvas + audioBuffer pair.
 * Cache is stored on the canvas DOM element to survive React re-renders
 * (the canvas element identity is stable within a component's lifecycle).
 *
 * Cache is keyed by (buffer duration × sampleRate) as a proxy for identity —
 * cheap to compute, good enough because a changed buffer almost certainly
 * has a different length. For tracks under the long-track threshold we skip
 * the cache and recompute inline (the scan is fast enough on short tracks).
 */
function getPeaks(canvas, audioBuffer, logicalWidth) {
  const isLong = audioBuffer.duration > LONG_TRACK_THRESHOLD_SEC;
  const cacheKey = audioBuffer.length; // samples is exact identity proxy

  if (isLong && canvas._peakCache && canvas._peakCacheKey === cacheKey && canvas._peakCacheWidth === logicalWidth) {
    return canvas._peakCache;
  }

  const peaks = computePeaks(audioBuffer, logicalWidth);

  if (isLong) {
    canvas._peakCache = peaks;
    canvas._peakCacheKey = cacheKey;
    canvas._peakCacheWidth = logicalWidth;
  }

  return peaks;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * renderWaveform(canvas, audioBuffer, options)
 *
 * Paints a waveform onto `canvas` from the samples in `audioBuffer`.
 *
 * @param {HTMLCanvasElement} canvas   — target canvas element (CSS size already set by caller)
 * @param {AudioBuffer}       audioBuffer
 * @param {object}           [options]
 * @param {string}           [options.color='#00E5FF']   — waveform fill color (hex)
 * @param {string}           [options.bgColor='#04040f'] — background fill color (hex or 'transparent')
 * @param {boolean}          [options.mirror=true]       — symmetric top+bottom vs top-only
 * @param {number}           [options.amplitude=0.85]    — scale factor applied to peak height (0..1)
 */
export function renderWaveform(canvas, audioBuffer, options = {}) {
  if (!canvas || !audioBuffer) return;

  const {
    color = '#00E5FF',
    bgColor = '#04040f',
    mirror = true,
    amplitude = 0.85,
  } = options;

  const dpr = getDpr();

  // The CSS width/height are set by the parent layout. We read them here to
  // compute the backing-store size. offsetWidth/offsetHeight give CSS pixels.
  const logicalWidth = canvas.offsetWidth || 600;
  const logicalHeight = canvas.offsetHeight || 80;
  const physWidth = Math.round(logicalWidth * dpr);
  const physHeight = Math.round(logicalHeight * dpr);

  // Only resize the canvas if needed — resizing clears the canvas and is slow
  if (canvas.width !== physWidth || canvas.height !== physHeight) {
    canvas.width = physWidth;
    canvas.height = physHeight;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any previous scale
  ctx.scale(dpr, dpr);

  // Background
  if (bgColor === 'transparent') {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }

  const peaks = getPeaks(canvas, audioBuffer, logicalWidth);
  const [r, g, b] = hexToRgb(color);
  const centerY = logicalHeight / 2;
  const halfHeight = logicalHeight / 2;

  ctx.fillStyle = color;

  // Draw each pixel column
  for (let x = 0; x < logicalWidth; x++) {
    const peakVal = peaks[x];
    const barHalf = peakVal * halfHeight * amplitude;

    if (mirror) {
      // Symmetric: from (centerY - barHalf) to (centerY + barHalf)
      // Add 1px minimum height so silent sections are still visible as a line
      const top = centerY - barHalf;
      const height = Math.max(1, barHalf * 2);
      ctx.fillRect(x, top, 1, height);
    } else {
      // Top-only: from top edge downward
      const height = Math.max(1, peakVal * logicalHeight * amplitude);
      ctx.fillRect(x, 0, 1, height);
    }
  }

  // Center line for visual reference (very subtle, matches waveform color at low opacity)
  ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
  ctx.fillRect(0, centerY, logicalWidth, 1);
}

/**
 * clearWaveform(canvas, bgColor)
 *
 * Clears the canvas with the given background color (or transparent).
 * Also invalidates the peak cache.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string}           [bgColor='#04040f']
 */
export function clearWaveform(canvas, bgColor = '#04040f') {
  if (!canvas) return;

  // Invalidate cache so next render recomputes
  canvas._peakCache = null;
  canvas._peakCacheKey = null;
  canvas._peakCacheWidth = null;

  const dpr = getDpr();
  const logicalWidth = canvas.offsetWidth || canvas.width / dpr;
  const logicalHeight = canvas.offsetHeight || canvas.height / dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  if (bgColor === 'transparent') {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  }
}
