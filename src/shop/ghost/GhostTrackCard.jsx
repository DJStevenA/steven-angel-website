import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useShopPlayer } from "../ShopPlayerContext.jsx";
import { useCart } from "../CartContext.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG_CARD = "#04040f";
// Production: hits Railway directly. Dev: relative URL routed via vite.config.js proxy.
const API_BASE = import.meta.env.DEV ? "" : "https://ghost-backend-production-adb6.up.railway.app";

const GENRE_COLORS = {
  "Afro House": CYAN,
  "Afro Latin": PURPLE,
  "Afro Latin / Ethnic House": PURPLE,
  "Indie Dance": "#FFB347",
  "Tech House": "#FF6B6B",
};

export default function GhostTrackCard({ track, isMobile, onBuy }) {
  const { playTrack, pauseTrack, seek, currentTrack, isPlaying, currentTime, duration } = useShopPlayer();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const inCart = isInCart(`ghost-${track.id}`);
  const [showNdaMsg, setShowNdaMsg] = useState(false);
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
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 10,
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
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {/* Play overlay + skip buttons (skip only visible when this track is active) */}
        {!isSold && (
          <>
            {/* Skip back 15s — circular button styled like play (left side) */}
            {isThisTrack && (
              <button
                onClick={(e) => { e.stopPropagation(); seek(Math.max(0, cardCurrentTime - 15)); }}
                aria-label="Skip back 15 seconds"
                style={{
                  position: "absolute",
                  left: "16%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  border: `2px solid ${accentColor}`,
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", zIndex: 3,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: accentColor,
                  letterSpacing: "0.04em",
                  transition: "transform 0.15s, opacity 0.15s",
                  opacity: 0.92,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-50%) scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
              >
                <span aria-hidden="true">↺ 15</span>
              </button>
            )}

            {/* Center play/pause — circular button (always present when not sold).
                Filled accent color + black icon matches BRAND_GUIDE Primary CTA. */}
            <button
              onClick={handlePlayPause}
              style={{
                position: "absolute",
                left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: accentColor, border: "none",
                boxShadow: `0 0 24px ${accentColor}66`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 3,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.05)"; e.currentTarget.style.boxShadow = `0 0 32px ${accentColor}99`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)"; e.currentTarget.style.boxShadow = `0 0 24px ${accentColor}66`; }}
              aria-label={isThisPlaying ? "Pause" : "Play preview"}
            >
              {loading ? (
                <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>…</span>
              ) : isThisPlaying ? (
                <span style={{ color: "#000", fontSize: 16, letterSpacing: "-1px" }}>⏸</span>
              ) : (
                <span style={{ color: "#000", fontSize: 16, marginLeft: 2 }}>▶</span>
              )}
            </button>

            {/* Skip forward 15s — circular button styled like play (right side) */}
            {isThisTrack && (
              <button
                onClick={(e) => { e.stopPropagation(); seek(Math.min(cardDuration || 0, cardCurrentTime + 15)); }}
                aria-label="Skip forward 15 seconds"
                style={{
                  position: "absolute",
                  right: "16%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)",
                  border: `2px solid ${accentColor}`,
                  backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", zIndex: 3,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: accentColor,
                  letterSpacing: "0.04em",
                  transition: "transform 0.15s, opacity 0.15s",
                  opacity: 0.92,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-50%) scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
              >
                <span aria-hidden="true">15 ↻</span>
              </button>
            )}
          </>
        )}

        {/* Progress bar — bottom of image, visible when this track is active */}
        {isThisTrack && !isSold && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3 }}>
            {/* Time display */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "0 8px 3px",
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 10,
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
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700,
          fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
          color: accentColor,
        }}>
          {track.genre}
        </div>

        {/* Track name */}
        <div style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900,
          fontSize: isMobile ? 20 : 22, textTransform: "uppercase",
          letterSpacing: "0.04em", color: isSold ? "rgba(255,255,255,0.4)" : "#fff",
          lineHeight: 1.2, marginBottom: 6,
        }}>
          {track.name}
        </div>

        {/* Exclusive tag */}
        <div style={{
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 11,
          color: "rgba(255,255,255,0.4)", marginBottom: 8,
        }}>
          {isSold ? "No longer available" : "Exclusive · One-time sale · Full rights transfer"}
        </div>

        {/* Deliverables */}
        {!isSold && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12,
          }}>
            {["Mastered WAV & MP3", "Extended + Radio Edit", "Stems"].map((d) => (
              <span key={d} style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 9, fontWeight: 500,
                color: "rgba(255,255,255,0.55)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "2px 8px", borderRadius: 10,
                whiteSpace: "nowrap",
              }}>
                {d}
              </span>
            ))}
          </div>
        )}

        {/* Price + BUY row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Strikethrough original price (when on sale) */}
            {track.original_price_eur && !isSold && (
              <span style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700,
                fontSize: isMobile ? 16 : 18,
                color: "rgba(255,255,255,0.4)",
                textDecoration: "line-through",
                letterSpacing: "0.02em",
              }}>
                €{track.original_price_eur}
              </span>
            )}
            {/* Current price (sale price if on sale) */}
            <div style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900,
              fontSize: isMobile ? 24 : 28,
              color: isSold ? "rgba(255,255,255,0.3)" : accentColor,
              letterSpacing: "0.02em",
            }}>
              €{track.price_eur}
            </div>
            {/* SALE badge */}
            {track.original_price_eur && !isSold && (
              <span style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 800,
                fontSize: 10,
                color: "#fff",
                background: "#ff3b5c",
                padding: "3px 8px",
                borderRadius: 4,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}>
                Sale
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (isSold) return;
              if (inCart) {
                navigate("/shop/cart");
                return;
              }
              if (window.gtag) window.gtag("event", "add_to_cart", {
                event_category: "ghost_catalog",
                event_label: track.name,
                value: track.price_usd,
                currency: "USD",
                items: [{ item_id: track.id, item_name: track.name, item_category: track.genre, price: track.price_usd, quantity: 1 }],
              });
              // Add the ghost track
              addToCart({
                id: `ghost-${track.id}`,
                slug: `ghost-${track.id}`,
                name: track.name,
                price: track.price_usd,
                image: `/shop/ghost-${track.id}-cover.webp`,
                headline: `${track.genre} Ghost Track`,
                isGhost: true,
                trackId: track.id,
              });
              // Auto-add NDA + 100% Ownership as $0 companion item
              addToCart({
                id: `nda-${track.id}`,
                slug: `nda-${track.id}`,
                name: `NDA + 100% Ownership — ${track.name}`,
                price: 0,
                image: `/shop/ghost-${track.id}-cover.webp`,
                headline: "Non-Disclosure Agreement + Full Copyright Transfer",
                isNda: true,
                trackId: track.id,
              });
              // Show NDA included message
              setShowNdaMsg(true);
              setTimeout(() => setShowNdaMsg(false), 4000);
            }}
            disabled={isSold}
            style={{
              padding: isMobile ? "10px 18px" : "11px 22px",
              background: isSold
                ? "rgba(255,255,255,0.06)"
                : inCart
                  ? "rgba(0,229,255,0.08)"
                  : `linear-gradient(135deg, ${accentColor}, ${accentColor === CYAN ? "#00b8d4" : "#9b59d4"})`,
              color: isSold ? "rgba(255,255,255,0.3)" : inCart ? CYAN : "#000",
              border: inCart ? `1px solid ${CYAN}` : "none",
              borderRadius: 6,
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 800, fontSize: 13,
              letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: isSold ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
          >
            {isSold ? "Sold" : inCart ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                In Cart
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* NDA included toast */}
      {showNdaMsg && (
        <div style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          background: "rgba(0,229,255,0.12)", border: `1px solid ${CYAN}44`,
          borderRadius: 8, padding: "10px 14px", zIndex: 5,
          fontFamily: "'DM Sans', sans-serif", fontSize: 12,
          color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
          animation: "fadeIn 0.2s ease",
        }}>
          <strong style={{ color: CYAN }}>NDA + 100% Ownership</strong> included automatically. Sent to your email after purchase.
        </div>
      )}
    </div>
  );
}
