/**
 * InsufficientCreditsModal.jsx
 *
 * Modal overlay displayed when the render attempt returns 402 INSUFFICIENT_CREDITS.
 *
 * Props:
 *   required   number — credits needed (typically 6)
 *   available  number — user's current balance
 *   onDismiss  () => void — called when dismissed (click-outside, Escape, "Maybe Later")
 *
 * Behaviour:
 *   - Traps keyboard focus inside the modal.
 *   - Escape key dismisses.
 *   - Body scroll locked while open.
 *   - Default focus on the "BUY MORE CREDITS" button.
 *
 * ARIA: role="dialog", aria-modal="true", aria-labelledby heading id.
 *
 * No emoji.
 */

import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./InsufficientCreditsModal.module.css";

const HEADING_ID = "insufficient-credits-heading";

// Focus-trappable element selectors
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function InsufficientCreditsModal({ required, available, onDismiss }) {
  const modalRef = useRef(null);
  const buyBtnRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Auto-focus "Buy More Credits" on mount
  useEffect(() => {
    if (buyBtnRef.current) {
      buyBtnRef.current.focus();
    }
  }, []);

  // Escape to dismiss + focus trap
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onDismiss();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll(FOCUSABLE));
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={HEADING_ID}
      >
        {/* Heading */}
        <h2 id={HEADING_ID} className={styles.heading}>
          NOT ENOUGH CREDITS
        </h2>

        {/* Body */}
        <p className={styles.body}>
          You need {required} credits to render a mashup.{" "}
          {available != null ? (
            <>You have <strong className={styles.balance}>{available}</strong>.</>
          ) : null}
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <Link
            to="/tools/mashup/credits"
            className={styles.btnBuy}
            ref={buyBtnRef}
            onClick={onDismiss}
          >
            BUY MORE CREDITS
          </Link>
          <button
            type="button"
            className={styles.btnLater}
            onClick={onDismiss}
          >
            MAYBE LATER
          </button>
        </div>
      </div>
    </div>
  );
}
