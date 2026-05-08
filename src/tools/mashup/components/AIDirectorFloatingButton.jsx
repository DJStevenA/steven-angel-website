/**
 * AIDirectorFloatingButton.jsx — Phase 2E
 *
 * Mobile-only floating action button (bottom-right) that opens the AI Director
 * chat as a full-screen modal on devices <= 900px wide.
 *
 * Visible ONLY when the CSS media query (max-width: 900px) applies — the button
 * has `display: none` above 900px in its CSS module.
 *
 * Props:
 *   isOpen    boolean — whether the chat modal is currently open
 *   onToggle  () => void — toggle open/closed
 *
 * No emoji anywhere.
 */

import React, { useEffect } from 'react';
import styles from './AIDirectorFloatingButton.module.css';

// ---------------------------------------------------------------------------
// Chat bubble icon — inline SVG, no emoji
// ---------------------------------------------------------------------------

function ChatBubbleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded speech bubble */}
      <path
        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Three dots inside */}
      <circle cx="8" cy="11" r="1.2" fill="#000" />
      <circle cx="12" cy="11" r="1.2" fill="#000" />
      <circle cx="16" cy="11" r="1.2" fill="#000" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIDirectorFloatingButton({ isOpen, onToggle }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  return (
    <button
      type="button"
      className={`${styles.floatingBtn} ${isOpen ? styles.floatingBtnOpen : ''}`}
      onClick={onToggle}
      aria-label="Open AI Director"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <ChatBubbleIcon />
      <span className={styles.btnLabel}>AI</span>
    </button>
  );
}
