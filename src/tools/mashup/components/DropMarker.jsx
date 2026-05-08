/**
 * DropMarker.jsx — Draggable drop-point flag on a track lane timeline
 *
 * Renders a downward-pointing red triangle + vertical line pinned to a
 * specific time in a track lane, relative to track duration.
 *
 * Props:
 *   slot: 'a' | 'b'                    — which track
 *   index: number                       — which drop in drops[slot][]
 *   containerWidth: number              — pixel width of the lane content area
 *   laneHeight: number                  — pixel height of the lane (for the vertical line)
 *
 * Reads drop position from Zustand: drops[slot][index].valleyAtSec / tracks[slot].duration
 * Writes: updateDrop(slot, index, { valleyAtSec }) on drag end
 *
 * Uses Pointer Events for unified mouse + touch handling.
 * No emoji anywhere.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import useMashupState from '../useMashupState.js';
import styles from './DropMarker.module.css';

/**
 * Format seconds as m:ss string.
 */
function formatSec(sec) {
  if (sec == null || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * @param {{ slot: 'a'|'b', index: number, containerWidth: number, laneHeight: number }} props
 */
export default function DropMarker({ slot, index, containerWidth, laneHeight }) {
  const drop = useMashupState((s) => s.drops[slot]?.[index]);
  const track = useMashupState((s) => s.tracks[slot]);
  const updateDrop = useMashupState((s) => s.updateDrop);

  const markerRef = useRef(null);
  const dragStateRef = useRef(null); // { startX, startValleySec }
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  // Local visual position during drag (0..1 normalized, or null to use store value)
  const [dragNorm, setDragNorm] = useState(null);

  const duration = track?.duration ?? 0;
  const valleyAtSec = drop?.valleyAtSec ?? 0;

  // Normalized position 0..1
  const normPos = duration > 0 ? valleyAtSec / duration : 0;
  const displayNorm = dragNorm !== null ? dragNorm : normPos;
  const leftPx = displayNorm * containerWidth;

  // ---------------------------------------------------------------------------
  // Pointer drag handlers
  // ---------------------------------------------------------------------------

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    markerRef.current?.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      startX: e.clientX,
      startValleySec: valleyAtSec,
    };
    setIsDragging(true);
    setTooltipVisible(true);
  }, [valleyAtSec]);

  const handlePointerMove = useCallback((e) => {
    if (!dragStateRef.current || !isDragging) return;
    const { startX, startValleySec } = dragStateRef.current;
    const deltaX = e.clientX - startX;
    const deltaSec = (deltaX / containerWidth) * duration;
    const newSec = Math.max(0, Math.min(duration, startValleySec + deltaSec));
    const newNorm = duration > 0 ? newSec / duration : 0;
    setDragNorm(newNorm);
  }, [isDragging, containerWidth, duration]);

  const handlePointerUp = useCallback((e) => {
    if (!dragStateRef.current || !isDragging) return;
    const { startX, startValleySec } = dragStateRef.current;
    const deltaX = e.clientX - startX;
    const deltaSec = (deltaX / containerWidth) * duration;
    const newSec = Math.max(0, Math.min(duration, startValleySec + deltaSec));

    updateDrop(slot, index, { valleyAtSec: newSec, valleyAt: duration > 0 ? newSec / duration : 0 });
    dragStateRef.current = null;
    setIsDragging(false);
    setDragNorm(null);
    setTimeout(() => setTooltipVisible(false), 800);
  }, [isDragging, containerWidth, duration, slot, index, updateDrop]);

  // Fallback: release if pointer leaves the window
  useEffect(() => {
    if (!isDragging) return;
    function onPointerCancel() {
      dragStateRef.current = null;
      setIsDragging(false);
      setDragNorm(null);
      setTooltipVisible(false);
    }
    window.addEventListener('pointercancel', onPointerCancel);
    return () => window.removeEventListener('pointercancel', onPointerCancel);
  }, [isDragging]);

  // ---------------------------------------------------------------------------
  // Render guard
  // ---------------------------------------------------------------------------

  if (!drop || !track || containerWidth <= 0) return null;

  // Display values for tooltip
  const displaySec = dragNorm !== null ? dragNorm * duration : valleyAtSec;
  const strengthPct = drop.strength != null ? (drop.strength * 100).toFixed(0) : null;

  const ariaLabel = strengthPct
    ? `Drop marker at ${formatSec(displaySec)}, strength ${strengthPct}%, drag to reposition`
    : `Drop marker at ${formatSec(displaySec)}, drag to reposition`;

  return (
    <div
      ref={markerRef}
      className={`${styles.marker} ${isDragging ? styles.markerDragging : ''}`}
      style={{ left: leftPx }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => !isDragging && setTooltipVisible(true)}
      onMouseLeave={() => !isDragging && setTooltipVisible(false)}
      aria-label={ariaLabel}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={displaySec}
      aria-valuetext={`Drop at ${formatSec(displaySec)}`}
      tabIndex={0}
    >
      {/* Downward triangle */}
      <div className={styles.triangle} aria-hidden="true" />

      {/* Vertical line */}
      <div
        className={styles.line}
        style={{ height: laneHeight - 12 }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      {tooltipVisible && (
        <div className={styles.tooltip} role="tooltip">
          <span className={styles.tooltipTime}>DROP @ {formatSec(displaySec)}</span>
          {strengthPct && (
            <span className={styles.tooltipStrength}>strength: {strengthPct}%</span>
          )}
        </div>
      )}
    </div>
  );
}
