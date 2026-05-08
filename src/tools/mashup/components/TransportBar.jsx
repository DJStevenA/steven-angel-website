/**
 * TransportBar.jsx — DAW-style transport controls for the Mashup Generator
 *
 * Reads from and writes to useMashupState. Does NOT wire Web Audio playback —
 * that is Phase 2B's job. This component is purely state-driven: it dispatches
 * state changes that Phase 2B's audio engine will react to.
 *
 * Controls:
 *   - Play / Stop toggle button
 *   - Full-width scrubber (playhead position 0..1)
 *   - Vocal volume slider (purple)
 *   - Instrumental volume slider (cyan)
 *   - Mute / Solo pill toggles per role (4 buttons)
 *
 * Keyboard shortcuts (fired when any child of the toolbar has focus,
 * or when the document listener fires and nothing else captured it):
 *   Space       — toggle play/stop
 *   ArrowLeft   — scrub back 1%
 *   ArrowRight  — scrub forward 1%
 *
 * ARIA: role="toolbar", labelled buttons, labelled sliders.
 * No emoji in labels or aria text (brand rule).
 */

import { useEffect, useCallback } from 'react';
import useMashupState from '../useMashupState.js';
import styles from './TransportBar.module.css';

// ---------------------------------------------------------------------------
// Sub-components (internal)
// ---------------------------------------------------------------------------

/**
 * PlayStopButton — the large play/stop toggle.
 * Filled cyan when stopped (play action), outline cyan when playing (stop action).
 */
function PlayStopButton({ isPlaying, onToggle }) {
  return (
    <button
      type="button"
      className={isPlaying ? styles.stopBtn : styles.playBtn}
      onClick={onToggle}
      aria-label={isPlaying ? 'Stop playback' : 'Start playback'}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        // Stop icon — two vertical bars
        <span className={styles.stopIcon} aria-hidden="true">
          <span className={styles.stopBar} />
          <span className={styles.stopBar} />
        </span>
      ) : (
        // Play icon — right-pointing triangle
        <span className={styles.playIcon} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * Scrubber — thin full-width range input for playhead position (0..1).
 */
function Scrubber({ scrubAt, onChange }) {
  return (
    <div className={styles.scrubberWrap}>
      <input
        type="range"
        className={styles.scrubber}
        min="0"
        max="1"
        step="0.001"
        value={scrubAt}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Playhead position"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={scrubAt}
        aria-valuetext={`${Math.round(scrubAt * 100)}%`}
      />
    </div>
  );
}

/**
 * VolumeSlider — a labeled range input for a single role's volume.
 * color: 'cyan' | 'purple'
 */
function VolumeSlider({ label, value, onChange, color, ariaLabel }) {
  return (
    <div className={styles.volumeGroup}>
      <span
        className={styles.volumeLabel}
        style={{ color: color === 'purple' ? '#BB86FC' : '#00E5FF' }}
      >
        {label}
      </span>
      <input
        type="range"
        className={`${styles.volumeSlider} ${color === 'purple' ? styles.volumeSliderPurple : styles.volumeSliderCyan}`}
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={`${Math.round(value * 100)}%`}
      />
    </div>
  );
}

/**
 * MuteSoloGroup — mute + solo pill buttons for one role.
 * role: 'vocal' | 'instr'
 * color: 'cyan' | 'purple'
 */
function MuteSoloGroup({ role, color, muteActive, soloActive, onToggleMute, onToggleSolo }) {
  const roleLabel = role === 'vocal' ? 'Vocal' : 'Instr';

  return (
    <div className={styles.muteSoloGroup}>
      <button
        type="button"
        className={`${styles.pillBtn} ${muteActive ? styles.pillBtnMuteActive : ''}`}
        onClick={() => onToggleMute(role)}
        aria-label={`${muteActive ? 'Unmute' : 'Mute'} ${roleLabel}`}
        aria-pressed={muteActive}
      >
        M
      </button>
      <button
        type="button"
        className={`${styles.pillBtn} ${soloActive ? (color === 'purple' ? styles.pillBtnSoloPurpleActive : styles.pillBtnSoloCyanActive) : ''}`}
        onClick={() => onToggleSolo(role)}
        aria-label={`${soloActive ? 'Unsolo' : 'Solo'} ${roleLabel}`}
        aria-pressed={soloActive}
      >
        S
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * TransportBar
 *
 * Renders the full transport row. Mounts a document-level keydown listener
 * for Space / ArrowLeft / ArrowRight when the component is mounted.
 *
 * The listener only fires when neither a text input nor textarea is focused,
 * so it doesn't interfere with the AI Director chat input.
 *
 * @param {{ className?: string }} props
 */
export default function TransportBar({ className = '' }) {
  // Read state
  const isPlaying = useMashupState((s) => s.isPlaying);
  const scrubAt = useMashupState((s) => s.scrubAt);
  const volumeVocal = useMashupState((s) => s.volumeVocal);
  const volumeInstr = useMashupState((s) => s.volumeInstr);
  const mute = useMashupState((s) => s.mute);
  const solo = useMashupState((s) => s.solo);

  // Write actions
  const setIsPlaying = useMashupState((s) => s.setIsPlaying);
  const setScrubAt = useMashupState((s) => s.setScrubAt);
  const setVolumeVocal = useMashupState((s) => s.setVolumeVocal);
  const setVolumeInstr = useMashupState((s) => s.setVolumeInstr);
  const toggleMute = useMashupState((s) => s.toggleMute);
  const toggleSolo = useMashupState((s) => s.toggleSolo);

  // Play/stop toggle
  const handlePlayStop = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // Document-level keyboard handler
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't intercept when typing in text inputs
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setScrubAt(scrubAt - 0.01);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setScrubAt(scrubAt + 0.01);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, scrubAt, setIsPlaying, setScrubAt]);

  return (
    <div
      className={`${styles.transportBar} ${className}`}
      role="toolbar"
      aria-label="Playback transport controls"
    >
      {/* Row 1: scrubber (full width) */}
      <div className={styles.scrubberRow}>
        <Scrubber scrubAt={scrubAt} onChange={setScrubAt} />
      </div>

      {/* Row 2: play/stop + volumes + mute/solo */}
      <div className={styles.controlsRow}>
        {/* Play/Stop */}
        <div className={styles.playStopWrap}>
          <PlayStopButton isPlaying={isPlaying} onToggle={handlePlayStop} />
        </div>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Vocal controls */}
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel} style={{ color: '#BB86FC' }}>VOCAL</span>
          <div className={styles.roleControls}>
            <VolumeSlider
              label="VOL"
              value={volumeVocal}
              onChange={setVolumeVocal}
              color="purple"
              ariaLabel="Vocal volume"
            />
            <MuteSoloGroup
              role="vocal"
              color="purple"
              muteActive={mute.vocal}
              soloActive={solo.vocal}
              onToggleMute={toggleMute}
              onToggleSolo={toggleSolo}
            />
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Instrumental controls */}
        <div className={styles.roleGroup}>
          <span className={styles.roleLabel} style={{ color: '#00E5FF' }}>INSTR</span>
          <div className={styles.roleControls}>
            <VolumeSlider
              label="VOL"
              value={volumeInstr}
              onChange={setVolumeInstr}
              color="cyan"
              ariaLabel="Instrumental volume"
            />
            <MuteSoloGroup
              role="instr"
              color="cyan"
              muteActive={mute.instr}
              soloActive={solo.instr}
              onToggleMute={toggleMute}
              onToggleSolo={toggleSolo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
