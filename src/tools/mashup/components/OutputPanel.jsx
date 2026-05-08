/**
 * OutputPanel.jsx
 *
 * Visible when job.status === 'ready' AND !job.stemsExpired.
 *
 * Audio preview approach (dual-audio-tag fallback):
 *   When job.finalMixUrl is present: use it as the <audio> source.
 *   When absent (backend hasn't shipped the server-side mixdown yet):
 *     Render TWO hidden <audio> elements (vocals + noVocals) controlled by
 *     a single Play/Pause button. Both are started/paused together. This
 *     gives a usable preview without a full OfflineAudioContext mixdown.
 *     Caveat: browser decode/sample-rate mismatch can cause tiny drift on
 *     very long tracks. Phase 2E can upgrade to a true OfflineAudioContext
 *     mixdown when final_mix_url arrives consistently.
 *
 * Props:
 *   job           { jobId, status, stemsExpired, finalMixUrl?,
 *                   vocalsUrl, noVocalsUrl, drumsUrl, bassUrl, otherUrl }
 *   onTryAnother  () => void — clear job + uploadIds, keep tracks + roles
 *   onNewMashup   () => void — full store reset
 *
 * No emoji.
 */

import React, { useRef, useState, useEffect } from "react";
import styles from "./OutputPanel.module.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Programmatically trigger a download anchor.
 */
function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ---------------------------------------------------------------------------
// Dual-audio player (fallback for missing finalMixUrl)
// ---------------------------------------------------------------------------

function DualAudioPlayer({ vocalsUrl, noVocalsUrl }) {
  const vocalsRef = useRef(null);
  const instrRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  function handlePlayPause() {
    const v = vocalsRef.current;
    const i = instrRef.current;
    if (!v || !i) return;

    if (playing) {
      v.pause();
      i.pause();
      setPlaying(false);
    } else {
      // Both start from their current time; reset to 0 if ended
      if (v.ended) { v.currentTime = 0; i.currentTime = 0; }
      Promise.all([v.play(), i.play()])
        .then(() => setPlaying(true))
        .catch(() => setError(true));
    }
  }

  function handleEnded() {
    setPlaying(false);
  }

  function handleError() {
    setError(true);
    setPlaying(false);
  }

  return (
    <div className={styles.audioWrapper}>
      {/* Hidden audio elements */}
      {vocalsUrl && (
        <audio
          ref={vocalsRef}
          src={vocalsUrl}
          preload="metadata"
          onEnded={handleEnded}
          onError={handleError}
          aria-hidden="true"
        />
      )}
      {noVocalsUrl && (
        <audio
          ref={instrRef}
          src={noVocalsUrl}
          preload="metadata"
          onEnded={handleEnded}
          onError={handleError}
          aria-hidden="true"
        />
      )}

      {/* Play/pause control */}
      <div className={styles.dualPlayerControls}>
        <button
          type="button"
          className={styles.playBtn}
          onClick={handlePlayPause}
          aria-label={playing ? "Pause preview" : "Play preview"}
          disabled={error || (!vocalsUrl && !noVocalsUrl)}
        >
          {playing ? "PAUSE" : "PLAY PREVIEW"}
        </button>

        {error && (
          <span className={styles.audioError}>Preview unavailable</span>
        )}

        <span className={styles.audioNote}>
          Preview: vocals + no-vocals mixed in browser
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-source audio player (when finalMixUrl is present)
// ---------------------------------------------------------------------------

function SingleAudioPlayer({ url }) {
  return (
    <div className={styles.audioWrapper}>
      <audio
        controls
        src={url}
        preload="metadata"
        className={styles.audioNative}
        aria-label="Mashup preview"
      >
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stem download button
// ---------------------------------------------------------------------------

function StemButton({ label, url, colorVariant }) {
  function handleClick() {
    if (!url) return;
    triggerDownload(url, `stem-${label.toLowerCase().replace(/\s+/g, "-")}.wav`);
  }

  return (
    <button
      type="button"
      className={`${styles.stemBtn} ${styles[`stemBtn_${colorVariant}`] || ""}`}
      onClick={handleClick}
      disabled={!url}
      aria-label={`Download ${label} stem`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// OutputPanel
// ---------------------------------------------------------------------------

export default function OutputPanel({ job, onTryAnother, onNewMashup }) {
  const [revealed, setRevealed] = useState(false);

  // Trigger the reveal animation once on mount
  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(id);
  }, []);

  if (!job || job.status !== "ready") return null;

  const {
    finalMixUrl,
    vocalsUrl,
    noVocalsUrl,
    drumsUrl,
    bassUrl,
    otherUrl,
  } = job;

  const hasFinalMix = Boolean(finalMixUrl);

  function handleDownloadMashup() {
    if (!finalMixUrl) return;
    triggerDownload(finalMixUrl, "mashup.wav");
  }

  return (
    <section
      className={`${styles.panel} ${revealed ? styles.panelRevealed : ""}`}
      aria-label="Mashup output"
    >
      {/* Heading */}
      <div
        className={styles.heading}
        aria-live="polite"
        aria-atomic="true"
      >
        MASHUP READY
      </div>

      {/* Audio preview */}
      {hasFinalMix ? (
        <SingleAudioPlayer url={finalMixUrl} />
      ) : (
        <DualAudioPlayer vocalsUrl={vocalsUrl} noVocalsUrl={noVocalsUrl} />
      )}

      {/* Primary download CTA */}
      <div className={styles.primaryDownloadWrapper}>
        {hasFinalMix ? (
          <button
            type="button"
            className={styles.downloadBtn}
            onClick={handleDownloadMashup}
            aria-label="Download mashup WAV"
          >
            DOWNLOAD MASHUP (WAV)
          </button>
        ) : (
          <button
            type="button"
            className={styles.downloadBtnDisabled}
            disabled
            aria-label="Mixed version is not yet available"
          >
            MIXED VERSION COMING SOON
          </button>
        )}
      </div>

      {/* Stems section */}
      <div className={styles.stemsSection}>
        <div className={styles.stemsLabel}>STEMS</div>
        <div className={styles.stemsGrid}>
          <StemButton label="Vocals" url={vocalsUrl} colorVariant="purple" />
          <StemButton label="No Vocals" url={noVocalsUrl} colorVariant="cyan" />
          <StemButton label="Drums" url={drumsUrl} colorVariant="neutral" />
          <StemButton label="Bass" url={bassUrl} colorVariant="neutral" />
          <StemButton label="Other" url={otherUrl} colorVariant="neutral" />
        </div>
      </div>

      {/* Restart actions */}
      <div className={styles.restartActions}>
        <button
          type="button"
          className={styles.btnTryAnother}
          onClick={onTryAnother}
          aria-label="Try another arrangement — keep tracks and roles"
        >
          TRY ANOTHER ARRANGEMENT
        </button>
        <button
          type="button"
          className={styles.btnNewMashup}
          onClick={onNewMashup}
          aria-label="New mashup — reset everything"
        >
          NEW MASHUP
        </button>
      </div>
    </section>
  );
}
