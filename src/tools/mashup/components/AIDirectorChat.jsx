/**
 * AIDirectorChat.jsx — Phase 2E (updated from Phase 2C)
 *
 * Right-column AI Director chat panel for MashupGeneratorPage.
 *
 * Layout (top to bottom):
 *   1. Panel header — "AI DIRECTOR" eyebrow + pulsing status dot
 *   2. Message scroll list — chatMessages from store, oldest first
 *   3. Quick-command chip row — 5 preset commands
 *   4. Input row — single-line input + send button
 *
 * Phase 2E adds:
 *   - `modalMode` prop: when true, renders as full-screen fixed overlay
 *     (used on mobile when triggered from AIDirectorFloatingButton)
 *   - `onClose` prop: called when the close button inside the modal header is clicked
 *   - Focus trap + Escape key inside modal mode (delegated from
 *     AIDirectorFloatingButton which also handles body scroll lock)
 *
 * The submit handler calls processCommand() from regexDirector.js (Stage 1
 * regex parser). Stage 3 will swap in processCommandLLM() with the same
 * signature without touching this component.
 *
 * Keyboard: the input stops propagation on keydown so TransportBar's
 * space-toggle never fires while typing here.
 *
 * No emoji anywhere per platform directive.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import useMashupState from '../useMashupState.js';
import { processCommand } from '../lib/regexDirector.js';
import ChatMessage from './ChatMessage.jsx';
import styles from './AIDirectorChat.module.css';

// ---------------------------------------------------------------------------
// Close icon SVG (modal mode header)
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Quick chips (spec: 5 presets)
// ---------------------------------------------------------------------------

const QUICK_CHIPS = [
  { label: 'Vocal on drop', cmd: 'vocal on the drop' },
  { label: 'Vocal chops',   cmd: 'vocal chops on drop' },
  { label: 'Reverb buildup', cmd: 'reverb buildup' },
  { label: 'Fadeout vocal', cmd: 'fadeout vocal' },
  { label: 'Filter sweep',  cmd: 'filter sweep' },
];

// ---------------------------------------------------------------------------
// Send icon SVG (no emoji — inline arrow)
// ---------------------------------------------------------------------------

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14 8L2 2L5 8L2 14L14 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Focusable elements selector (for focus trap in modal mode)
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @param {{ modalMode?: boolean, onClose?: () => void }} props
 */
export default function AIDirectorChat({ modalMode = false, onClose }) {
  const chatMessages   = useMashupState((s) => s.chatMessages);
  const addChatMessage = useMashupState((s) => s.addChatMessage);
  const roles          = useMashupState((s) => s.roles);
  const drops          = useMashupState((s) => s.drops);
  const regions        = useMashupState((s) => s.regions);
  const effects        = useMashupState((s) => s.effects);
  const tracks         = useMashupState((s) => s.tracks);
  const setRegion      = useMashupState((s) => s.setRegion);
  const addEffect      = useMashupState((s) => s.addEffect);
  const clearEffects   = useMashupState((s) => s.clearEffects);

  const [inputValue, setInputValue] = useState('');
  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const modalRef   = useRef(null);

  // ── Modal mode: Escape closes + focus trap ─────────────────────────────────

  useEffect(() => {
    if (!modalMode) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];

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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalMode, onClose]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatMessages]);

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // 1. Push user message
      addChatMessage({ role: 'user', text: trimmed, ts: Date.now() });

      // 2. Build snapshot from current store state
      const snapshot = { roles, drops, regions, effects, tracks };

      // 3. Run regex parser
      const result = processCommand(trimmed, snapshot);

      // 4. Apply mutations via store setters
      const { mutations } = result;

      if (mutations.effects === 'clear') {
        clearEffects();
      } else if (Array.isArray(mutations.effects) && mutations.effects.length > 0) {
        mutations.effects.forEach((e) => addEffect(e));
      }

      if (mutations.clearRegions) {
        // Reset both regions to defaults (mirrors prototype "clear" behaviour)
        setRegion('vocal', { start: 0.25, end: 0.75 });
        setRegion('instr', { start: 0, end: 1 });
      } else {
        if (mutations.regions?.vocal) {
          setRegion('vocal', mutations.regions.vocal);
        }
        if (mutations.regions?.instr) {
          setRegion('instr', mutations.regions.instr);
        }
      }

      // 5. Push AI reply
      addChatMessage({ role: 'ai', text: result.replyText, ts: Date.now() });

      // 6. Clear input
      setInputValue('');
    },
    [
      addChatMessage,
      roles,
      drops,
      regions,
      effects,
      tracks,
      setRegion,
      addEffect,
      clearEffects,
    ]
  );

  // ── Keyboard handler ───────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e) => {
      // Stop propagation so TransportBar's space-toggle is never triggered
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(inputValue);
      }
    },
    [handleSubmit, inputValue]
  );

  // ── Chip click ─────────────────────────────────────────────────────────────

  const handleChipClick = useCallback(
    (cmd) => {
      handleSubmit(cmd);
      // Return focus to input after chip press
      inputRef.current?.focus();
    },
    [handleSubmit]
  );

  // ── Empty state ────────────────────────────────────────────────────────────

  const isEmpty = chatMessages.length === 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  const chatContent = (
    <>
      {/* Header — differs between desktop (no close) and modal (has close btn) */}
      <div className={`${styles.header} ${modalMode ? styles.headerModal : ''}`}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.headerLabel}>AI DIRECTOR</span>
        {modalMode && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close AI Director"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Message scroll list */}
      <div
        ref={scrollRef}
        className={styles.messageList}
        aria-live="polite"
        aria-label="Chat messages"
      >
        {isEmpty ? (
          <p className={styles.emptyState}>
            Tell me what you want. Try: &quot;vocal on the drop&quot; or pick a chip below.
          </p>
        ) : (
          chatMessages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              text={msg.text}
              ts={msg.ts}
            />
          ))
        )}
      </div>

      {/* Quick-command chip row */}
      <div className={styles.chipRow} aria-label="Quick commands">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.cmd}
            type="button"
            className={styles.chip}
            onClick={() => handleChipClick(chip.cmd)}
            aria-label={`Quick command: ${chip.label}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a direction..."
          aria-label="AI Director command input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={() => handleSubmit(inputValue)}
          aria-label="Send command"
          disabled={!inputValue.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </>
  );

  // Modal mode: full-screen fixed overlay with backdrop
  if (modalMode) {
    return (
      <div
        className={styles.modalOverlay}
        aria-hidden="false"
        onClick={(e) => {
          // Clicking the backdrop (not the panel itself) closes the modal
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <section
          ref={modalRef}
          className={`${styles.panel} ${styles.panelModal}`}
          role="dialog"
          aria-modal="true"
          aria-label="AI Director"
          aria-labelledby="ai-director-modal-heading"
        >
          {chatContent}
        </section>
      </div>
    );
  }

  // Desktop mode: regular panel
  return (
    <section
      className={styles.panel}
      role="region"
      aria-label="AI Director"
    >
      {chatContent}
    </section>
  );
}
