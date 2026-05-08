/**
 * RenderErrorBanner.jsx
 *
 * Visible when job.status === 'failed' | 'refunded' | 'cancelled'.
 *
 * Props:
 *   job         { jobId, status, errorMessage }
 *   onTryAgain  () => void — clears job + uploadIds, keeps tracks + roles
 *   onStartOver () => void — full store reset
 *
 * No emoji.
 */

import React from "react";
import styles from "./RenderErrorBanner.module.css";

const REFUND_AMOUNT = 6;

export default function RenderErrorBanner({ job, onTryAgain, onStartOver }) {
  const isCancelled = job?.status === "cancelled" || job?.status === "refunded";
  const heading = isCancelled ? "RENDER CANCELLED" : "RENDER FAILED";

  const rawMessage = job?.errorMessage || "";
  const truncatedMessage =
    rawMessage.length > 200 ? rawMessage.slice(0, 200) + "..." : rawMessage;

  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <div className={styles.inner}>
        {/* Heading */}
        <div className={styles.heading}>{heading}</div>

        {/* Error body */}
        {truncatedMessage && (
          <p className={styles.errorBody}>{truncatedMessage}</p>
        )}

        {/* Reassurance */}
        <p className={styles.reassurance}>
          Your {REFUND_AMOUNT} credits were refunded automatically. Try again when ready.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={onTryAgain}
            aria-label="Try again — keep tracks and roles"
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={onStartOver}
            aria-label="Start over — reset everything"
          >
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
}
