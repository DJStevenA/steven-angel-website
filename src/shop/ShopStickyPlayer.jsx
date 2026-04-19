import React, { useState, useRef, useCallback, useEffect } from "react";
import { useShopPlayer } from "./ShopPlayerContext.jsx";

const CYAN = "#00E5FF";
const BG = "#04040f";

function fmt(s) {
  if (!s || isNaN(s) || s === Infinity) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * ShopStickyPlayer — Spotify-style fixed bottom bar.
 * Renders nothing when no track is loaded.
 * Consumes ShopPlayerContext — no local audio state.
 */
export default function ShopStickyPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, playTrack, pauseTrack, closeTrack, seek } = useShopPlayer();

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 600 : false
  );
  // Seeking drag state
  const seekBarRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Seek bar interactions ──────────────────────────────────
  const getTimeFromEvent = useCallback((e) => {
    if (!seekBarRef.current || !duration) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleSeekDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    setDragTime(getTimeFromEvent(e));
  }, [getTimeFromEvent]);

  const handleSeekMove = useCallback((e) => {
    if (!dragging) return;
    setDragTime(getTimeFromEvent(e));
  }, [dragging, getTimeFromEvent]);

  const handleSeekUp = useCallback((e) => {
    if (!dragging) return;
    setDragging(false);
    const t = getTimeFromEvent(e);
    seek(t);
  }, [dragging, getTimeFromEvent, seek]);

  // Attach pointer/touch move + up globally while dragging
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => setDragTime(getTimeFromEvent(e));
    const onUp = (e) => {
      setDragging(false);
      seek(getTimeFromEvent(e));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, getTimeFromEvent, seek]);

  // ── Render nothing when no track ──────────────────────────
  if (!currentTrack) return null;

  const displayTime = dragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
  const barHeight = isMobile ? 64 : 72;

  // ── Inline styles ──────────────────────────────────────────
  const containerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: barHeight,
    background: BG,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 14,
    padding: isMobile ? "0 10px" : "0 20px",
    boxSizing: "border-box",
    // Slide-up entrance animation
    animation: "shopPlayerSlideUp 0.25s ease-out both",
  };

  const coverStyle = {
    width: isMobile ? 40 : 48,
    height: isMobile ? 40 : 48,
    borderRadius: 4,
    objectFit: "cover",
    flexShrink: 0,
    background: "rgba(255,255,255,0.06)",
  };

  const trackInfoStyle = {
    flex: isMobile ? "1 1 0" : "0 0 auto",
    minWidth: 0,
    maxWidth: isMobile ? undefined : 200,
    overflow: "hidden",
  };

  const titleStyle = {
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 700,
    fontSize: isMobile ? 13 : 14,
    letterSpacing: "0.04em",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.2,
    marginBottom: 2,
  };

  const subtitleStyle = {
    fontFamily: "DM Sans, sans-serif",
    fontSize: isMobile ? 10 : 11,
    color: "rgba(255,255,255,0.5)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.3,
  };

  const playBtnStyle = {
    flexShrink: 0,
    width: isMobile ? 32 : 36,
    height: isMobile ? 32 : 36,
    borderRadius: "50%",
    background: CYAN,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    boxShadow: `0 0 14px rgba(0,229,255,0.45)`,
    transition: "transform 0.1s",
    padding: 0,
  };

  const seekAreaStyle = {
    flex: "1 1 0",
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 6 : 10,
    minWidth: 0,
  };

  const timeStyle = {
    fontFamily: "DM Sans, sans-serif",
    fontSize: isMobile ? 9 : 10,
    color: "rgba(255,255,255,0.45)",
    whiteSpace: "nowrap",
    flexShrink: 0,
    lineHeight: 1,
  };

  const trackBgStyle = {
    flex: 1,
    height: isMobile ? 3 : 4,
    background: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    position: "relative",
    cursor: "pointer",
    userSelect: "none",
    touchAction: "none",
  };

  const trackFillStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: `${progress}%`,
    background: `linear-gradient(90deg, ${CYAN}, #00b8d4)`,
    borderRadius: 2,
    pointerEvents: "none",
  };

  const seekHandleStyle = {
    position: "absolute",
    top: "50%",
    left: `${progress}%`,
    transform: "translate(-50%, -50%)",
    width: isMobile ? 10 : 12,
    height: isMobile ? 10 : 12,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: `0 0 6px ${CYAN}`,
    pointerEvents: "none",
    transition: dragging ? "none" : "left 0.25s linear",
  };

  const closeBtnStyle = {
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "rgba(255,255,255,0.45)",
    fontSize: isMobile ? 18 : 20,
    lineHeight: 1,
    padding: isMobile ? "4px" : "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    transition: "color 0.15s",
  };

  return (
    <>
      {/* Keyframe injection — once in DOM */}
      <style>{`
        @keyframes shopPlayerSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div style={containerStyle} role="region" aria-label="Now playing">
        {/* Cover thumbnail */}
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            style={coverStyle}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{ ...coverStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Track info */}
        <div style={trackInfoStyle}>
          <div style={titleStyle} title={currentTrack.title}>{currentTrack.title}</div>
          {currentTrack.subtitle && (
            <div style={subtitleStyle} title={currentTrack.subtitle}>{currentTrack.subtitle}</div>
          )}
        </div>

        {/* Play / Pause */}
        <button
          style={playBtnStyle}
          onClick={() => isPlaying ? pauseTrack() : playTrack(currentTrack)}
          aria-label={isPlaying ? "Pause" : "Play"}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isPlaying ? (
            /* Pause icon */
            <svg width={isMobile ? 13 : 15} height={isMobile ? 13 : 15} viewBox="0 0 24 24" fill="#000">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            /* Play icon */
            <svg width={isMobile ? 13 : 15} height={isMobile ? 13 : 15} viewBox="0 0 24 24" fill="#000">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Seek area: current time — bar — total time */}
        <div style={seekAreaStyle}>
          {!isMobile && (
            <span style={timeStyle}>{fmt(displayTime)}</span>
          )}

          {/* Seek bar */}
          <div
            ref={seekBarRef}
            style={trackBgStyle}
            onMouseDown={handleSeekDown}
            onTouchStart={handleSeekDown}
            aria-label="Seek"
            role="slider"
            aria-valuenow={Math.round(displayTime)}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
          >
            <div style={trackFillStyle} />
            <div style={seekHandleStyle} />
          </div>

          <span style={timeStyle}>
            {isMobile ? fmt(displayTime) : fmt(duration)}
          </span>
          {isMobile && (
            <span style={{ ...timeStyle, color: "rgba(255,255,255,0.25)" }}>/</span>
          )}
          {isMobile && (
            <span style={timeStyle}>{fmt(duration)}</span>
          )}
          {!isMobile && (
            <span style={{ ...timeStyle, color: "rgba(255,255,255,0.25)" }}>/ {fmt(duration)}</span>
          )}
        </div>

        {/* Close */}
        <button
          style={closeBtnStyle}
          onClick={closeTrack}
          aria-label="Close player"
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
