/**
 * ChatMessage.jsx — Phase 2C
 *
 * Single chat message bubble. Accepts { role: 'user' | 'ai', text, ts }.
 *
 * User messages are right-aligned with cyan tint.
 * AI messages are left-aligned with purple tint.
 *
 * No emoji anywhere per platform directive.
 */

import React from 'react';
import styles from './ChatMessage.module.css';

/**
 * fmtTs(ts) — format a Unix timestamp as "HH:MM" (24-hour, local time).
 */
function fmtTs(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function ChatMessage({ role, text, ts }) {
  const isUser = role === 'user';
  const bubbleClass = isUser ? styles.bubbleUser : styles.bubbleAi;
  const wrapClass = isUser ? styles.wrapUser : styles.wrapAi;

  return (
    <div
      className={`${styles.wrap} ${wrapClass}`}
      role="article"
    >
      {/* Screen-reader label */}
      <span className={styles.srOnly}>
        {isUser ? 'You said: ' : 'AI replied: '}
        {text}
      </span>

      <div className={bubbleClass} aria-hidden="true">
        <span className={styles.messageText}>{text}</span>
        {ts ? (
          <span className={styles.timestamp}>{fmtTs(ts)}</span>
        ) : null}
      </div>
    </div>
  );
}
