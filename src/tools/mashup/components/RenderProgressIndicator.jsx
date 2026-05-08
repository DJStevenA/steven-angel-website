/**
 * RenderProgressIndicator.jsx
 *
 * Visible when job.status === 'processing'.
 * Shows animated bars, an elapsed-time counter, and a Cancel button.
 *
 * Props:
 *   job        { jobId, status, createdAt }
 *   onCancel   async () => void  — called when the user clicks "CANCEL RENDER"
 *   onToast    (message: string) => void  — display a non-blocking toast message
 *
 * Cancel outcomes:
 *   success: true          → parent clears job, shows refund banner
 *   reason: 'too_late'     → toast + continue polling (parent still holds job)
 *   reason: 'race_lost'    → toast + continue polling
 *
 * No emoji.
 */

import React, { useState, useEffect, useRef } from "react";
import styles from "./RenderProgressIndicator.module.css";
import { cancelRenderFlow } from "../lib/renderFlow.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format elapsed seconds as MM:SS with tabular digits.
 */
function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RenderProgressIndicator({ job, token, apiBase, onCancelled, onToast }) {
  const [elapsed, setElapsed] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const createdAt = job?.createdAt || Date.now();
  const jobId = job?.jobId;

  // Elapsed time ticker
  useEffect(() => {
    const update = () => {
      const secs = Math.floor((Date.now() - createdAt) / 1000);
      setElapsed(secs);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  async function handleCancel() {
    if (!jobId || cancelling) return;
    setCancelling(true);
    try {
      const result = await cancelRenderFlow({ token, apiBase, jobId });
      if (result.success) {
        // Parent resets job state and shows a refund notice
        if (onCancelled) {
          onCancelled({ refunded: result.refunded ?? 6 });
        }
      } else if (result.reason === "too_late" || result.reason === "race_lost") {
        if (onToast) {
          onToast("Render already completed. Waiting for results...");
        }
        // Stop the cancelling spinner but keep the parent polling
        setCancelling(false);
      } else {
        if (onToast) {
          onToast(result.message || "Cancel request failed. Continuing render.");
        }
        setCancelling(false);
      }
    } catch (_err) {
      if (onToast) {
        onToast("Could not reach server to cancel. Continuing render.");
      }
      setCancelling(false);
    }
  }

  return (
    <div className={styles.container} role="status" aria-live="polite" aria-label="Render in progress">
      {/* Screen-reader announcement — announces when component mounts */}
      <span className={styles.srOnly} aria-live="polite">
        Render in progress. Estimated time 30 to 60 seconds.
      </span>

      {/* Heading */}
      <div className={styles.heading}>RENDERING...</div>

      {/* Sub-text */}
      <p className={styles.subtext}>
        Roughly 30-60 seconds. Modal Labs is separating stems on a GPU.
      </p>

      {/* Animated bars */}
      <div className={styles.barsWrapper} aria-hidden="true">
        <div className={`${styles.bar} ${styles.bar1}`} />
        <div className={`${styles.bar} ${styles.bar2}`} />
        <div className={`${styles.bar} ${styles.bar3}`} />
        <div className={`${styles.bar} ${styles.bar4}`} />
        <div className={`${styles.bar} ${styles.bar5}`} />
      </div>

      {/* Elapsed timer */}
      <div className={styles.elapsed} aria-label={`Elapsed time: ${formatElapsed(elapsed)}`}>
        {formatElapsed(elapsed)}
      </div>

      {/* Cancel button */}
      <button
        type="button"
        className={styles.cancelBtn}
        onClick={handleCancel}
        disabled={cancelling || !jobId}
        aria-label="Cancel render"
      >
        {cancelling ? "CANCELLING..." : "CANCEL RENDER"}
      </button>
    </div>
  );
}
