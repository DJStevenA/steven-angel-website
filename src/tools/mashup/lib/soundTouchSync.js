/**
 * soundTouchSync.js — SoundTouch.js pitch-shift + time-stretch for Mashup Generator
 *
 * Ports Stage 2 auto-sync from AI-DAW/mashup-generator/index.html.
 *
 * SoundTouch.js is loaded from CDN on first use (dynamic import, once).
 * All processing uses OfflineAudioContext — no live audio playback is started.
 *
 * Exported functions:
 *   computePlannedSync(vocalTrack, instrumentalTrack) → { semitones, tempo }
 *   processWithSoundTouch(audioBuffer, { semitones, tempo })  → Promise<AudioBuffer>
 *   applySync(getState, setters)  → Promise<void>
 *   resetSync(setters)            → void
 *
 * No external npm dependencies — SoundTouch.js is loaded via a dynamic script tag.
 *
 * CDN: https://cdn.jsdelivr.net/npm/soundtouchjs@0.2.0/dist/soundtouch.js
 * (0.2.0 matches the prototype; exports PitchShifter as named ES module export)
 */

// ---------------------------------------------------------------------------
// CDN load guard
// ---------------------------------------------------------------------------

const SOUNDTOUCH_CDN = 'https://cdn.jsdelivr.net/npm/soundtouchjs@0.2.0/dist/soundtouch.js';

let _loadPromise = null; // singleton: resolves once PitchShifter is on window

/**
 * Ensure SoundTouch.js is loaded exactly once. Returns a Promise that
 * resolves when window.PitchShifter is available.
 *
 * Strategy: dynamic import() works for ES modules served from CDN.
 * We set window.PitchShifter so the offline processor can reference it
 * without coupling to module scope (matches prototype pattern).
 */
function loadSoundTouch() {
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // Already loaded (e.g. page reload, HMR)
    if (typeof window !== 'undefined' && window.PitchShifter) return;

    try {
      // Dynamic import of the ESM CDN build
      const mod = await import(/* @vite-ignore */ SOUNDTOUCH_CDN);
      // The package exports PitchShifter as a named export
      const PitchShifter = mod.PitchShifter || mod.default?.PitchShifter;
      if (!PitchShifter) {
        throw new Error('SoundTouch CDN module did not export PitchShifter');
      }
      window.PitchShifter = PitchShifter;
    } catch (err) {
      // Reset promise so a future call retries
      _loadPromise = null;
      throw new Error(`Failed to load SoundTouch.js from CDN: ${err.message}`);
    }
  })();

  return _loadPromise;
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------

/**
 * processWithSoundTouch(audioBuffer, { semitones, tempo })
 *
 * Applies pitch shift (semitones) and tempo change to an AudioBuffer using
 * SoundTouch.js PitchShifter, rendered via OfflineAudioContext.
 *
 * pitchSemitones > 0 shifts up; tempo > 1 speeds up (shorter output).
 * Returns a new AudioBuffer. Duration changes when tempo != 1.
 *
 * Near-identity inputs (|semitones| < 0.01, |tempo-1| < 0.001) return the
 * original buffer unchanged to avoid unnecessary CPU work.
 *
 * @param {AudioBuffer} audioBuffer
 * @param {{ semitones?: number, tempo?: number }} opts
 * @returns {Promise<AudioBuffer>}
 */
export async function processWithSoundTouch(audioBuffer, { semitones = 0, tempo = 1.0 } = {}) {
  if (!audioBuffer) throw new Error('processWithSoundTouch: audioBuffer is required');

  // No-op fast path — matches prototype behaviour
  if (Math.abs(semitones) < 0.01 && Math.abs(tempo - 1) < 0.001) {
    return audioBuffer;
  }

  await loadSoundTouch();

  const sampleRate = audioBuffer.sampleRate;
  const outputDuration = audioBuffer.duration / tempo;
  const outputLength = Math.ceil(outputDuration * sampleRate);

  // OfflineAudioContext: always 2-channel output for compatibility
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineCtx) throw new Error('OfflineAudioContext is not available in this browser');

  const offlineCtx = new OfflineCtx(2, outputLength, sampleRate);

  const PitchShifter = window.PitchShifter;
  const shifter = new PitchShifter(offlineCtx, audioBuffer, 1024);
  shifter.tempo = tempo;
  shifter.pitchSemitones = semitones;
  shifter.node.connect(offlineCtx.destination);

  const rendered = await offlineCtx.startRendering();
  return rendered;
}

// ---------------------------------------------------------------------------
// Sync plan computation
// ---------------------------------------------------------------------------

/**
 * computePlannedSync(vocalTrack, instrumentalTrack)
 *
 * Computes the pitch shift and tempo ratio needed to align the vocal track
 * to the instrumental track.
 *
 * Tempo: vocal tempo is stretched to match instrumental BPM. tempo = i.bpm / v.bpm
 * Pitch: shortest chromatic distance from vocal key to instrumental key (-6..+6 semitones).
 *        Uses keyPc (pitch class 0-11) stored on each track.
 *
 * If either track is null or lacks BPM/keyPc, returns identity { semitones: 0, tempo: 1.0 }.
 *
 * @param {{ bpm: number, key: string, keyPc: number }} vocalTrack
 * @param {{ bpm: number, key: string, keyPc: number }} instrumentalTrack
 * @returns {{ semitones: number, tempo: number }}
 */
export function computePlannedSync(vocalTrack, instrumentalTrack) {
  if (!vocalTrack || !instrumentalTrack) return { semitones: 0, tempo: 1.0 };

  const vBpm = vocalTrack.bpm;
  const iBpm = instrumentalTrack.bpm;
  const vPc = vocalTrack.keyPc;
  const iPc = instrumentalTrack.keyPc;

  if (!vBpm || !iBpm || vPc == null || iPc == null) return { semitones: 0, tempo: 1.0 };

  // Tempo ratio: how much faster/slower to play the vocal to match instrumental BPM
  const tempo = iBpm / vBpm;

  // Chromatic distance, resolved to shortest direction in [-6, +6]
  let semitones = ((iPc - vPc) + 12) % 12;
  if (semitones > 6) semitones -= 12;

  return { semitones, tempo };
}

// ---------------------------------------------------------------------------
// Store-level actions (take Zustand state/setters, not raw buffers)
// ---------------------------------------------------------------------------

/**
 * applySync(getState, setters)
 *
 * High-level action: reads tracks and roles from state, computes the sync
 * plan, runs processWithSoundTouch on the vocal AudioBuffer, then pushes
 * results back via setters.
 *
 * setters expected:
 *   setProcessedVocal(buf: AudioBuffer | null)
 *   setSyncApplied(v: boolean)
 *   setSyncProcessing(v: boolean)
 *   setPlannedSync(plan: { semitones, tempo } | null)
 *
 * getState() returns the current Zustand state snapshot.
 *
 * @param {() => object} getState     — Zustand store's get()
 * @param {object}       setters      — destructured Zustand setters
 * @returns {Promise<void>}
 */
export async function applySync(getState, setters) {
  const {
    setProcessedVocal,
    setSyncApplied,
    setSyncProcessing,
    setPlannedSync,
  } = setters;

  const state = getState();
  const { tracks, roles } = state;

  if (!roles.vocal || !roles.instr) {
    // Not enough information to compute sync — silently return
    return;
  }

  const vocalTrack = tracks[roles.vocal];
  const instrTrack = tracks[roles.instr];

  if (!vocalTrack || !instrTrack) return;
  if (!vocalTrack.buffer) return;

  // Guard against double invocation
  if (state.syncProcessing) return;

  setSyncProcessing(true);

  const plan = computePlannedSync(vocalTrack, instrTrack);
  setPlannedSync(plan);

  try {
    const processed = await processWithSoundTouch(vocalTrack.buffer, {
      semitones: plan.semitones,
      tempo: plan.tempo,
    });
    setProcessedVocal(processed);
    setSyncApplied(true);
  } catch (err) {
    // Let caller handle UI error messaging; we just clean up state
    setProcessedVocal(null);
    setSyncApplied(false);
    // Re-throw so the caller can display an error if desired
    throw err;
  } finally {
    setSyncProcessing(false);
  }
}

/**
 * resetSync(setters)
 *
 * Clears all sync state: processed vocal buffer, applied flag, planned values.
 * Does not touch the original track buffers.
 *
 * @param {object} setters — same setters signature as applySync
 */
export function resetSync(setters) {
  const {
    setProcessedVocal,
    setSyncApplied,
    setSyncProcessing,
    setPlannedSync,
  } = setters;

  setProcessedVocal(null);
  setSyncApplied(false);
  setSyncProcessing(false);
  setPlannedSync(null);
}
