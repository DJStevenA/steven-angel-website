/**
 * audioAnalysis.js
 *
 * Ported verbatim from AI-DAW/mashup-generator/index.html (the prototype).
 * All three algorithms — detectBPM, detectKey, detectDrops — are lifted
 * unchanged from the prototype's inline script. Only the module boundary
 * (export/import) and the KEYS constant are new; behavior is identical.
 *
 * No emoji anywhere in this file.
 */

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * detectBPM(audioBuffer)
 *
 * RMS energy envelope (downsampled to 200 Hz) + autocorrelation across
 * BPM candidates in the 80-180 range.
 *
 * Returns { bpm: number, confidence: number }
 * confidence is the raw autocorrelation score (not normalised — use for
 * relative comparison only).
 */
export async function detectBPM(buffer) {
  const ch = buffer.getChannelData(0);
  const sr = buffer.sampleRate;

  // Downsample to 200 Hz energy envelope
  const block = Math.floor(sr / 200);
  const env = [];
  for (let i = 0; i < ch.length; i += block) {
    let sum = 0;
    for (let j = 0; j < block && i + j < ch.length; j++) sum += Math.abs(ch[i + j]);
    env.push(sum / block);
  }

  // Autocorrelation across BPM candidates
  const minBPM = 80;
  const maxBPM = 180;
  let bestBPM = 120;
  let bestScore = -1;

  for (let bpm = minBPM; bpm <= maxBPM; bpm += 0.5) {
    const period = (60 / bpm) * 200;
    let score = 0;
    let count = 0;
    for (let i = 0; i + period * 2 < env.length; i += Math.floor(period)) {
      score += env[i] * env[Math.floor(i + period)];
      count++;
    }
    score /= count || 1;
    if (score > bestScore) {
      bestScore = score;
      bestBPM = bpm;
    }
  }

  return { bpm: Math.round(bestBPM * 10) / 10, confidence: bestScore };
}

/**
 * detectKey(audioBuffer)
 *
 * Single-window DFT chroma analysis on a 30-second sample from the
 * middle of the track. Rough (~60% accuracy) but instant.
 *
 * Returns { key: string, keyPc: number, confidence: number }
 * key     — note name e.g. "C#"
 * keyPc   — pitch class 0-11
 * confidence — magnitude of the strongest chroma bin
 */
export async function detectKey(buffer) {
  const ch = buffer.getChannelData(0);
  const sr = buffer.sampleRate;

  // Take a 30-second sample from the middle of the track
  const sampleLen = Math.min(sr * 30, ch.length);
  const start = Math.floor((ch.length - sampleLen) / 2);

  // Build a temporary buffer for the offline context (mirrors prototype exactly)
  const OfflineCtx =
    window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineCtx = new OfflineCtx(1, sampleLen, sr);
  const src = offlineCtx.createBufferSource();
  const tmpBuf = offlineCtx.createBuffer(1, sampleLen, sr);
  tmpBuf.copyToChannel(ch.slice(start, start + sampleLen), 0);
  src.buffer = tmpBuf;
  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = 4096;
  src.connect(analyser);
  src.connect(offlineCtx.destination);
  src.start(0);
  await offlineCtx.startRendering();

  // DFT chroma from the time-domain buffer (one window, as in prototype)
  const buf = tmpBuf.getChannelData(0);
  const win = 4096;
  const chroma = new Array(12).fill(0);

  // Single window at pos=0 (prototype breaks after first iteration for perf)
  for (let pos = 0; pos + win < buf.length; pos += win) {
    const re = new Float32Array(win / 2);
    const im = new Float32Array(win / 2);
    for (let k = 0; k < win / 2; k++) {
      let r = 0;
      let imVal = 0;
      for (let n = 0; n < win; n++) {
        const ang = (-2 * Math.PI * k * n) / win;
        r += buf[pos + n] * Math.cos(ang);
        imVal += buf[pos + n] * Math.sin(ang);
      }
      re[k] = r;
      im[k] = imVal;
    }
    for (let k = 1; k < win / 2; k++) {
      const freq = (k * sr) / win;
      if (freq < 60 || freq > 5000) continue;
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      const midi = 12 * Math.log2(freq / 440) + 69;
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      chroma[pc] += mag;
    }
    // Prototype processes only the first window for performance
    break;
  }

  let maxIdx = 0;
  let maxVal = -1;
  chroma.forEach((v, i) => {
    if (v > maxVal) {
      maxVal = v;
      maxIdx = i;
    }
  });

  return { key: KEYS[maxIdx], keyPc: maxIdx, confidence: maxVal };
}

/**
 * detectDrops(audioBuffer)
 *
 * RMS energy envelope (100 ms windows, smoothed with a 1-second moving
 * average) scanned for breakdown->drop transitions: sustained quiet
 * valleys followed by sharp energy jumps within 2.5 seconds.
 *
 * Returns Drop[] sorted by time ascending (top 2 by strength).
 * Drop = { at, atSec, valleyAt, valleyAtSec, strength }
 */
export function detectDrops(buffer) {
  const sr = buffer.sampleRate;
  const ch = buffer.getChannelData(0);

  // 100 ms RMS windows (10 frames per second)
  const winSize = Math.floor(sr / 10);
  const env = [];
  for (let i = 0; i + winSize < ch.length; i += winSize) {
    let sum = 0;
    for (let j = 0; j < winSize; j++) sum += ch[i + j] * ch[i + j];
    env.push(Math.sqrt(sum / winSize));
  }

  // Smooth with 1-second moving average
  const smoothW = 10;
  const smooth = [];
  for (let i = 0; i < env.length; i++) {
    let sum = 0;
    let cnt = 0;
    for (let j = -smoothW / 2; j <= smoothW / 2; j++) {
      const idx = i + Math.floor(j);
      if (idx >= 0 && idx < env.length) {
        sum += env[idx];
        cnt++;
      }
    }
    smooth.push(sum / cnt);
  }

  const totalFrames = smooth.length;
  if (totalFrames < 100) return [];

  const avg = smooth.reduce((a, b) => a + b, 0) / totalFrames;
  const peakEnergy = Math.max(...smooth);

  const valleyThreshold = avg * 0.55;
  const minValleyFrames = 25; // ~2.5 seconds of quiet
  const lookAheadFrames = 25; // 2.5 seconds to find the jump
  const jumpRatio = 1.7;
  const candidates = [];

  let i = 0;
  while (i < totalFrames) {
    if (smooth[i] < valleyThreshold) {
      const valleyStart = i;
      while (i < totalFrames && smooth[i] < valleyThreshold) i++;
      const valleyEnd = i;
      const valleyLen = valleyEnd - valleyStart;

      if (valleyLen >= minValleyFrames) {
        let valleyAvg = 0;
        for (let k = valleyStart; k < valleyEnd; k++) valleyAvg += smooth[k];
        valleyAvg /= valleyLen;

        let bestJumpIdx = -1;
        let bestJumpEnergy = 0;
        for (
          let k = valleyEnd;
          k < Math.min(valleyEnd + lookAheadFrames, totalFrames);
          k++
        ) {
          if (
            smooth[k] > valleyAvg * jumpRatio &&
            smooth[k] > bestJumpEnergy
          ) {
            bestJumpEnergy = smooth[k];
            bestJumpIdx = k;
          }
        }

        if (bestJumpIdx >= 0) {
          candidates.push({
            at: bestJumpIdx / totalFrames,
            atSec: bestJumpIdx * (winSize / sr),
            valleyAt: valleyStart / totalFrames,
            valleyAtSec: valleyStart * (winSize / sr),
            strength: (bestJumpEnergy - valleyAvg) / peakEnergy,
          });
        }
      }
    } else {
      i++;
    }
  }

  // Keep top 2 by strength, return in time order
  candidates.sort((a, b) => b.strength - a.strength);
  return candidates.slice(0, 2).sort((a, b) => a.at - b.at);
}
