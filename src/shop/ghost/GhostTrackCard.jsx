import React, { useState, useRef } from "react";
import { useShopPlayer } from "../ShopPlayerContext.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG_CARD = "#04040f";
const API_BASE = "https://ghost-backend-production-adb6.up.railway.app";

const GENRE_COLORS = {
  "Afro House": CYAN,
  "Afro Latin": PURPLE,
  "Afro Latin / Ethnic House": PURPLE,
  "Indie Dance": "#FFB347",
  "Tech House": "#FF6B6B",
};

export default function GhostTrackCard({ track, isMobile, onBuy }) {
  const { playTrack, pauseTrack, seek, currentTrack, isPlaying, currentTime, duration } = useShopPlayer();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const progressRef = useRef(null);

  const accentColor = GENRE_COLORS[track.genre] || CYAN;
  const isSold = track.sold === 1;

  // Is THIS card the one currently loaded in the sticky player?
  const isThisTrack = currentTrack && currentTrack.id === String(track.id);
  const isThisPlaying = isThisTrack && isPlaying;

  const handlePlayPause = async () => {
    if (isSold) return;

    let url = previewUrl;

    if (!url) {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/shop/media/${track.preview_key}`);
        // fetch follows redirects; use response.url for the actual media URL
        url = res.url;
        setPreviewUrl(url);
      } catch {
        url = `${API_BASE}/shop/media/${track.preview_key}`;
        setPreviewUrl(url);
      } finally {
        setLoading(false);
      }
    }

    if (isThisPlaying) {
      pauseTrack();
    } else {
      if (window.gtag) window.gtag("event", "select_content", { event_category: "catalog_preview", event_label: track.name, content_type: "ghost_track" });
      playTrack({
        id: String(track.id),
        title: track.name,
        subtitle: track.genre || "Ghost Track",
        audioUrl: url,
        coverUrl: `/shop/ghost-${track.id}-cover.webp`,
      });
    }
  };

  const handleSeek = (e) => {
    if (!isThisTrack || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    seek(ratio * duration);
  };

  // Use context time/duration for this card when active; zero otherwise
  const cardCurrentTime = isThisTrack ? currentTime : 0;
  const cardDuration = isThisTrack ? duration : 0;
  const progress = cardDuration > 0 ? (cardCurrentTime / cardDuration) * 100 : 0;

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: isSold
          ? "rgba(255,255,255,0.02)"
          : `linear-gradient(135deg, ${BG_CARD}, #0a0a1a)`,
        border: isSold
          ? "1px solid rgba(255,255,255,0.06)"
          : `1px solid rgba(${accentColor === CYAN ? "0,229,255" : "187,134,252"},0.15)`,
        borderRadius: 14,
        overflow: "hidden",
        opacity: isSold ? 0.55 : 1,
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isSold) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 8px 32px rgba(${accentColor === CYAN ? "0,229,255" : "187,134,252"},0.12)`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* SOLD badge */}
      {isSold && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 4, padding: "4px 10px",
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10,
          letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
        }}>
          Sold
        </div>
      )}

      {/* Cover image */}
      <div style={{ position: "relative", aspectRatio: "11/6", background: "#0a0a14", overflow: "hidden" }}>
        <img
          src={`/shop/ghost-${track.id}-cover.webp`}
          alt={track.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {/* Play overlay */}
        {!isSold && (
          <button
            onClick={handlePlayPause}
            style={{
              position: "absolute", inset: 0, background: "transparent",
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
            aria-label={isThisPlaying ? "Pause" : "Play preview"}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(0,0,0,0.7)", border: `2px solid ${accentColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              opacity: isThisPlaying ? 1 : 0.85,
              transition: "opacity 0.15s",
            }}>
              {loading ? (
                <span style={{ color: accentColor, fontSize: 12 }}>…</span>
              ) : isThisPlaying ? (
                <span style={{ color: accentColor, fontSize: 16, letterSpacing: "-1px" }}>⏸</span>
              ) : (
                <span style={{ color: accentColor, fontSize: 16, marginLeft: 2 }}>▶</span>
              )}
            </div>
          </button>
        )}

        {/* Progress bar — bottom of image, visible when this track is active */}
        {isThisTrack && !isSold && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
            {/* Time display */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "0 8px 3px",
              fontFamily: "DM Sans, sans-serif", fontSize: 10,
              color: "rgba(255,255,255,0.6)",
            }}>
              <span>{fmt(cardCurrentTime)}</span>
              <span>{fmt(cardDuration)}</span>
            </div>
            {/* Seekable bar */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              style={{
                height: 4, background: "rgba(255,255,255,0.15)",
                cursor: "pointer", position: "relative",
              }}
            >
              <div style={{
                height: "100%", width: `${progress}%`,
                background: `linear-gradient(90deg, ${accentColor}, ${accentColor}aa)`,
                transition: "width 0.25s linear",
                position: "relative",
              }}>
                {/* Seek handle */}
                <div style={{
                  position: "absolute", right: -4, top: "50%",
                  transform: "translateY(-50%)",
                  width: 8, height: 8, borderRadius: "50%",
                  background: accentColor,
                  boxShadow: `0 0 6px ${accentColor}`,
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? "14px 16px 18px" : "16px 20px 20px" }}>
        {/* Genre pill */}
        <div style={{
          display: "inline-block", marginBottom: 8,
          padding: "3px 10px", borderRadius: 20,
          border: `1px solid ${accentColor}40`,
          background: `${accentColor}10`,
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: accentColor,
        }}>
          {track.genre}
        </div>

        {/* Track name */}
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900,
          fontSize: isMobile ? 20 : 22, textTransform: "uppercase",
          letterSpacing: "0.04em", color: isSold ? "rgba(255,255,255,0.4)" : "#fff",
          lineHeight: 1.2, marginBottom: 6,
        }}>
          {track.name}
        </div>

        {/* Exclusive tag */}
        <div style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 11,
          color: "rgba(255,255,255,0.4)", marginBottom: 14,
        }}>
          {isSold ? "No longer available" : "Exclusive · One-time sale · Full rights transfer"}
        </div>

        {/* Price + BUY row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900,
            fontSize: isMobile ? 24 : 28,
            color: isSold ? "rgba(255,255,255,0.3)" : accentColor,
            letterSpacing: "0.02em",
          }}>
            €{track.price_eur}
          </div>

          <button
            onClick={() => {
              if (isSold) return;
              if (window.gtag) window.gtag("event", "begin_checkout", {
                event_category: "ghost_catalog",
                event_label: track.name,
                value: track.price_eur,
                currency: "EUR",
                items: [{ item_id: track.id, item_name: track.name, item_category: track.genre, price: track.price_eur, quantity: 1 }],
              });
              onBuy(track);
            }}
            disabled={isSold}
            style={{
              padding: isMobile ? "10px 18px" : "11px 22px",
              background: isSold
                ? "rgba(255,255,255,0.06)"
                : `linear-gradient(135deg, ${accentColor}, ${accentColor === CYAN ? "#00b8d4" : "#9b59d4"})`,
              color: isSold ? "rgba(255,255,255,0.3)" : "#000",
              border: "none", borderRadius: 6,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800, fontSize: 13,
              letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: isSold ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isSold ? "Sold" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
