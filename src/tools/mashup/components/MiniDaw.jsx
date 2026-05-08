/**
 * MiniDaw.jsx — 2-track horizontal arrangement view (Ableton-inspired)
 *
 * Layout (top to bottom inside the component):
 *   - Time ruler row (24px): tick marks, loop region brackets
 *   - Track A lane (120px): header strip + waveform canvas + drop markers + region overlay
 *   - Track B lane (120px): same structure
 *   - TransportBar mounted at the bottom
 *
 * Visual grammar borrowed from Ableton Live:
 *   - Dense lane headers (60px wide): track badge, mute/solo micro-buttons
 *   - Color-coded waveforms: cyan = instr donor, purple = vocal donor, dim white = no role
 *   - Drop markers: draggable red flags (DropMarker component)
 *   - Region overlays: translucent colored band showing render window, draggable + resizable
 *   - Playhead: 1px white line tracking scrubAt (0..1)
 *   - Click anywhere on timeline sets scrubAt
 *   - Loop brackets on time ruler: cyan lines at vocal region start/end
 *   - Inset shadows for depth, Barlow Condensed labels, DM Sans monospace numbers
 *
 * Performance:
 *   - Waveforms rendered once per buffer reference change (useEffect with buffer dep)
 *   - Region drag via Pointer Events + inline style updates (no re-render mid-drag)
 *   - requestAnimationFrame used for region drag to batch DOM writes
 *
 * No emoji anywhere.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import useMashupState from '../useMashupState.js';
import { renderWaveform, clearWaveform } from '../lib/waveformRenderer.js';
import TransportBar from './TransportBar.jsx';
import DropMarker from './DropMarker.jsx';
import styles from './MiniDaw.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEADER_WIDTH = 60;  // px — left lane header strip
const LANE_HEIGHT = 120;  // px — waveform lane height
const RULER_HEIGHT = 24;  // px — time ruler

const WAVEFORM_COLOR_VOCAL = '#BB86FC';   // purple — vocal donor
const WAVEFORM_COLOR_INSTR = '#00E5FF';   // cyan — instrumental donor
const WAVEFORM_COLOR_NONE  = 'rgba(255,255,255,0.25)'; // dim — no role assigned

const REGION_SNAP_THRESHOLD = 0.015; // 1.5% — snap to drop when within this distance

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Try to snap a normalized position to nearby drop markers.
 * Returns the snapped value if within threshold, or the original value.
 */
function snapToDrops(norm, drops, duration, threshold) {
  if (!drops || drops.length === 0 || !duration) return norm;
  for (const d of drops) {
    const dropNorm = d.valleyAtSec / duration;
    if (Math.abs(norm - dropNorm) < threshold) return dropNorm;
  }
  return norm;
}

// ---------------------------------------------------------------------------
// Time Ruler sub-component
// ---------------------------------------------------------------------------

/**
 * TimeRuler — horizontal ruler showing seconds, with loop region brackets.
 *
 * tickEvery: render a tick mark every N seconds
 * contentWidth: pixel width of the scrollable area (excluding lane header)
 * maxDuration: total seconds for the longer of the two tracks
 * vocalRegion: { start, end } normalized — where the loop brackets go
 * onScrub: (norm: 0..1) => void — fired when user clicks the ruler
 */
function TimeRuler({ contentWidth, maxDuration, vocalRegion, onScrub }) {
  const tickEvery = maxDuration > 120 ? 30 : maxDuration > 60 ? 15 : 10;

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const norm = clamp(x / contentWidth, 0, 1);
    onScrub(norm);
  }, [contentWidth, onScrub]);

  // Tick positions
  const ticks = [];
  if (maxDuration > 0) {
    for (let t = 0; t <= maxDuration; t += tickEvery) {
      const norm = t / maxDuration;
      ticks.push({ norm, label: formatTime(t) });
    }
  }

  // Loop brackets — cyan lines at vocal region edges
  const loopLeft = (vocalRegion?.start ?? 0.25) * contentWidth;
  const loopRight = (vocalRegion?.end ?? 0.75) * contentWidth;

  return (
    <div
      className={styles.ruler}
      style={{ paddingLeft: HEADER_WIDTH }}
      onClick={handleClick}
    >
      <div className={styles.rulerInner} style={{ width: contentWidth, position: 'relative' }}>
        {/* Tick marks */}
        {ticks.map(({ norm, label }) => (
          <div
            key={norm}
            className={styles.tick}
            style={{ left: norm * contentWidth }}
          >
            <span className={styles.tickLabel}>{label}</span>
          </div>
        ))}

        {/* Loop region brackets (vocal region) */}
        {maxDuration > 0 && (
          <>
            {/* Left bracket */}
            <div
              className={styles.loopBracketLeft}
              style={{ left: loopLeft }}
              aria-hidden="true"
            />
            {/* Top bar */}
            <div
              className={styles.loopBar}
              style={{
                left: loopLeft,
                width: Math.max(0, loopRight - loopLeft),
              }}
              aria-hidden="true"
            />
            {/* Right bracket */}
            <div
              className={styles.loopBracketRight}
              style={{ left: loopRight }}
              aria-hidden="true"
            />
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lane sub-component
// ---------------------------------------------------------------------------

/**
 * Lane — one track lane: header strip + waveform + overlays.
 *
 * slot: 'a' | 'b'
 * track: Track object from store (or null)
 * role: 'vocal' | 'instr' | null — this slot's assigned role
 * region: { start, end } normalized — the render window for this role
 * drops: Drop[]
 * scrubAt: 0..1 — playhead position
 * contentWidth: px
 * onScrub: (norm) => void
 * onRegionChange: (which: 'vocal'|'instr', region: {start,end}) => void
 * mute: boolean
 * solo: boolean
 * onToggleMute: (role) => void
 * onToggleSolo: (role) => void
 */
function Lane({
  slot,
  track,
  role,
  region,
  drops,
  scrubAt,
  contentWidth,
  onScrub,
  onRegionChange,
  mute,
  solo,
  onToggleMute,
  onToggleSolo,
}) {
  const canvasRef = useRef(null);
  const laneContentRef = useRef(null);

  // Which region does this lane show?
  // Vocal slot shows vocal region (purple); instr slot shows instr region (cyan).
  const regionColor = role === 'vocal' ? 'rgba(187,134,252,0.18)' : 'rgba(0,229,255,0.14)';
  const regionBorderColor = role === 'vocal' ? '#BB86FC' : '#00E5FF';

  const waveColor = role === 'vocal'
    ? WAVEFORM_COLOR_VOCAL
    : role === 'instr'
    ? WAVEFORM_COLOR_INSTR
    : WAVEFORM_COLOR_NONE;

  // Render waveform when buffer changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!track?.buffer) {
      clearWaveform(canvas, '#08081a');
      return;
    }
    // Defer one tick so canvas has CSS dimensions
    const raf = requestAnimationFrame(() => {
      renderWaveform(canvas, track.buffer, {
        color: waveColor,
        bgColor: '#08081a',
        mirror: true,
        amplitude: 0.85,
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [track?.buffer, waveColor]);

  // ---------------------------------------------------------------------------
  // Region drag/resize (Pointer Events)
  // ---------------------------------------------------------------------------

  const regionDragRef = useRef(null);
  // regionDragRef.current = { mode: 'move'|'left'|'right', startX, origStart, origEnd }

  const handleRegionPointerDown = useCallback((e, mode) => {
    if (!role || !contentWidth) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    regionDragRef.current = {
      mode,
      startX: e.clientX,
      origStart: region.start,
      origEnd: region.end,
      duration: track?.duration ?? 0,
    };
  }, [role, contentWidth, region, track]);

  const handleRegionPointerMove = useCallback((e) => {
    const rd = regionDragRef.current;
    if (!rd || !role) return;

    const deltaX = e.clientX - rd.startX;
    const deltaNorm = deltaX / contentWidth;
    let newStart = rd.origStart;
    let newEnd = rd.origEnd;
    const minSize = 0.02;

    if (rd.mode === 'move') {
      const span = rd.origEnd - rd.origStart;
      newStart = clamp(rd.origStart + deltaNorm, 0, 1 - span);
      newEnd = newStart + span;
    } else if (rd.mode === 'left') {
      newStart = clamp(rd.origStart + deltaNorm, 0, rd.origEnd - minSize);
      // Snap to drops
      newStart = snapToDrops(newStart, drops, rd.duration, REGION_SNAP_THRESHOLD);
    } else if (rd.mode === 'right') {
      newEnd = clamp(rd.origEnd + deltaNorm, rd.origStart + minSize, 1);
      newEnd = snapToDrops(newEnd, drops, rd.duration, REGION_SNAP_THRESHOLD);
    }

    onRegionChange(role, { start: newStart, end: newEnd });
  }, [role, contentWidth, drops, onRegionChange]);

  const handleRegionPointerUp = useCallback(() => {
    regionDragRef.current = null;
  }, []);

  // ---------------------------------------------------------------------------
  // Click on lane content to scrub
  // ---------------------------------------------------------------------------

  const handleLaneClick = useCallback((e) => {
    if (regionDragRef.current) return; // don't scrub during region drag
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const norm = clamp(x / contentWidth, 0, 1);
    onScrub(norm);
  }, [contentWidth, onScrub]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const slotLabel = slot === 'a' ? 'A' : 'B';
  const slotColor = slot === 'a' ? '#00E5FF' : '#BB86FC';
  const roleLabel = role ? role.toUpperCase() : '';

  // Region pixel positions
  const regionLeft = (region?.start ?? 0) * contentWidth;
  const regionWidth = ((region?.end ?? 1) - (region?.start ?? 0)) * contentWidth;

  // Playhead pixel position
  const playheadLeft = scrubAt * contentWidth;

  return (
    <div className={styles.lane}>
      {/* Lane header strip (fixed 60px wide) */}
      <div className={styles.laneHeader}>
        {/* Slot badge */}
        <div className={styles.laneBadge}>
          <span
            className={styles.laneBadgeDot}
            style={{ background: slotColor }}
            aria-hidden="true"
          />
          <span className={styles.laneBadgeLabel} style={{ color: slotColor }}>
            {slotLabel}
          </span>
        </div>

        {/* Role label + mute/solo */}
        {role && (
          <span className={styles.laneRoleLabel} style={{ color: role === 'vocal' ? '#BB86FC' : '#00E5FF' }}>
            {roleLabel}
          </span>
        )}

        <div className={styles.laneMuteSolo}>
          <button
            type="button"
            className={`${styles.microBtn} ${mute ? styles.microBtnMuteActive : ''}`}
            onClick={() => role && onToggleMute(role)}
            aria-label={`${mute ? 'Unmute' : 'Mute'} ${roleLabel || slotLabel}`}
            aria-pressed={mute}
            disabled={!role}
          >
            M
          </button>
          <button
            type="button"
            className={`${styles.microBtn} ${solo ? styles.microBtnSoloActive : ''}`}
            onClick={() => role && onToggleSolo(role)}
            aria-label={`${solo ? 'Unsolo' : 'Solo'} ${roleLabel || slotLabel}`}
            aria-pressed={solo}
            disabled={!role}
          >
            S
          </button>
        </div>

        {/* Duration readout */}
        {track?.duration && (
          <span className={styles.laneDuration}>
            {formatTime(track.duration)}
          </span>
        )}
      </div>

      {/* Waveform area */}
      <div
        ref={laneContentRef}
        className={styles.laneContent}
        style={{ width: contentWidth }}
        onClick={handleLaneClick}
      >
        {/* Waveform canvas */}
        <canvas
          ref={canvasRef}
          className={styles.waveformCanvas}
          aria-label={`Waveform for track ${slotLabel}`}
        />

        {/* Empty state hint */}
        {!track && (
          <div className={styles.emptyHint}>
            <span>NO TRACK LOADED</span>
          </div>
        )}

        {/* Region overlay */}
        {track && role && region && (
          <div
            className={styles.region}
            style={{
              left: regionLeft,
              width: Math.max(4, regionWidth),
              background: regionColor,
              borderLeftColor: regionBorderColor,
              borderRightColor: regionBorderColor,
            }}
            onPointerDown={(e) => handleRegionPointerDown(e, 'move')}
            onPointerMove={handleRegionPointerMove}
            onPointerUp={handleRegionPointerUp}
            aria-label={`Render region for ${role}`}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(region.start * 100)}
          >
            {/* Left resize handle */}
            <div
              className={styles.regionHandleLeft}
              onPointerDown={(e) => handleRegionPointerDown(e, 'left')}
              aria-label="Resize region left edge"
            />
            {/* Right resize handle */}
            <div
              className={styles.regionHandleRight}
              onPointerDown={(e) => handleRegionPointerDown(e, 'right')}
              aria-label="Resize region right edge"
            />
          </div>
        )}

        {/* Drop markers */}
        {track && drops?.map((drop, i) => (
          <DropMarker
            key={i}
            slot={slot}
            index={i}
            containerWidth={contentWidth}
            laneHeight={LANE_HEIGHT}
          />
        ))}

        {/* Playhead */}
        <div
          className={styles.playhead}
          style={{ left: playheadLeft }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MiniDaw component
// ---------------------------------------------------------------------------

/**
 * MiniDaw — 2-track arrangement view.
 * Reads everything from Zustand; writes via Zustand setters.
 */
export default function MiniDaw({ className = '' }) {
  const tracks = useMashupState((s) => s.tracks);
  const roles = useMashupState((s) => s.roles);
  const drops = useMashupState((s) => s.drops);
  const regions = useMashupState((s) => s.regions);
  const mute = useMashupState((s) => s.mute);
  const solo = useMashupState((s) => s.solo);
  const scrubAt = useMashupState((s) => s.scrubAt);
  const setScrubAt = useMashupState((s) => s.setScrubAt);
  const setRegion = useMashupState((s) => s.setRegion);
  const toggleMute = useMashupState((s) => s.toggleMute);
  const toggleSolo = useMashupState((s) => s.toggleSolo);

  const containerRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  // Measure the lane content width (total width minus header)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const w = container.clientWidth - HEADER_WIDTH;
      setContentWidth(Math.max(0, w));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Max duration across both loaded tracks (for ruler scale)
  const maxDuration = Math.max(
    tracks.a?.duration ?? 0,
    tracks.b?.duration ?? 0,
  );

  // Which region does each slot show?
  const roleA = roles.vocal === 'a' ? 'vocal' : roles.instr === 'a' ? 'instr' : null;
  const roleB = roles.vocal === 'b' ? 'vocal' : roles.instr === 'b' ? 'instr' : null;

  const regionA = roleA ? regions[roleA] : null;
  const regionB = roleB ? regions[roleB] : null;

  const muteA = roleA ? mute[roleA] : false;
  const muteB = roleB ? mute[roleB] : false;
  const soloA = roleA ? solo[roleA] : false;
  const soloB = roleB ? solo[roleB] : false;

  const handleScrub = useCallback((norm) => {
    setScrubAt(norm);
  }, [setScrubAt]);

  const handleRegionChange = useCallback((which, region) => {
    setRegion(which, region);
  }, [setRegion]);

  // Vocal region for loop brackets on ruler
  const vocalRegion = regions.vocal;

  return (
    <div
      className={`${styles.daw} ${className}`}
      ref={containerRef}
      role="application"
      aria-label="Mini DAW arrangement view"
    >
      {/* Time ruler */}
      <TimeRuler
        contentWidth={contentWidth}
        maxDuration={maxDuration}
        vocalRegion={vocalRegion}
        onScrub={handleScrub}
      />

      {/* Track A lane */}
      <Lane
        slot="a"
        track={tracks.a}
        role={roleA}
        region={regionA}
        drops={drops.a}
        scrubAt={scrubAt}
        contentWidth={contentWidth}
        onScrub={handleScrub}
        onRegionChange={handleRegionChange}
        mute={muteA}
        solo={soloA}
        onToggleMute={toggleMute}
        onToggleSolo={toggleSolo}
      />

      {/* Track B lane */}
      <Lane
        slot="b"
        track={tracks.b}
        role={roleB}
        region={regionB}
        drops={drops.b}
        scrubAt={scrubAt}
        contentWidth={contentWidth}
        onScrub={handleScrub}
        onRegionChange={handleRegionChange}
        mute={muteB}
        solo={soloB}
        onToggleMute={toggleMute}
        onToggleSolo={toggleSolo}
      />

      {/* Transport bar */}
      <TransportBar className={styles.transport} />
    </div>
  );
}
