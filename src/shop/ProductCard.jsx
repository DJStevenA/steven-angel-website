import React, { useState } from "react";

/* ─── Color Constants (matches BRAND_GUIDE.md) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

/* ─── Style Helpers (matches Ghost.jsx patterns) ─── */
const heading = (fontSize) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 900,
  fontSize,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.1,
});

const body = {
  fontFamily: "DM Sans, sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.6,
};

const label = (color = CYAN) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color,
});

/**
 * ProductCard — single shop product
 *
 * Visual structure (matches Ghost.jsx packages section):
 *   ┌─────────────────────────┐
 *   │  [BADGE]                 │
 *   │  [Image / Preview]       │
 *   │  Genre · DAW             │
 *   │  Product Name (h3)       │
 *   │  Headline                │
 *   │  Short description       │
 *   │  ✓ Feature 1             │
 *   │  ✓ Feature 2             │
 *   │  ...                     │
 *   │  $XX.XX                  │
 *   │  [BUY NOW button]        │
 *   └─────────────────────────┘
 */
export default function ProductCard({ product, isMobile, onBuy }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const isPurple = product.badgeColor === "purple";
  const accentColor = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";
  const hasVideo = !!product.previewVideoUrl;

  return (
    <div
      style={{
        background: isPurple ? "linear-gradient(135deg,#0a0a20,#0d0418)" : BG_ALT,
        border: `1px solid ${isPurple ? PURPLE : "#141420"}`,
        borderTop: `2px solid ${accentColor}`,
        borderRadius: 10,
        padding: isMobile ? "24px 18px" : "28px 24px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxShadow: isPurple ? "0 0 40px rgba(187,134,252,0.1)" : "none",
      }}
    >
      {/* Badge — top-left */}
      {product.badge && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: isMobile ? 12 : 20,
            background: isPurple
              ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})`
              : `rgba(${accentRgba},0.15)`,
            border: isPurple ? "none" : `1px solid ${accentColor}`,
            color: isPurple ? "#000" : accentColor,
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? 9 : 10,
            letterSpacing: isMobile ? "0.12em" : "0.2em",
            padding: "3px 12px",
            borderRadius: 20,
            whiteSpace: "nowrap",
          }}
        >
          {product.badge}
        </div>
      )}

      {/* Product cover — video player (if previewVideoUrl) OR album-art mockup */}
      {hasVideo ? (
        <div
          style={{
            width: "100%",
            aspectRatio: "1/1",
            background: "#06060f",
            borderRadius: 8,
            marginBottom: 18,
            marginTop: product.badge ? 8 : 0,
            overflow: "hidden",
            position: "relative",
            border: `1px solid rgba(${accentRgba},0.3)`,
            cursor: videoPlaying ? "default" : "pointer",
          }}
          onClick={() => !videoPlaying && setVideoPlaying(true)}
        >
          {videoPlaying ? (
            <video
              src={product.previewVideoUrl}
              controls
              autoPlay
              playsInline
              preload="metadata"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <>
              {/* Thumbnail */}
              {product.previewVideoThumb && (
                <img
                  src={product.previewVideoThumb}
                  alt={product.previewVideoCaption || product.name}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.75,
                  }}
                />
              )}

              {/* Dark overlay for readability */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
                }}
              />

              {/* Top-left: "WATCH" tag */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: 9,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: accentColor,
                  padding: "3px 10px",
                  border: `1px solid ${accentColor}`,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(4px)",
                }}
              >
                ▶ Watch
              </div>

              {/* Centered play button */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `${accentColor}E6`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 32px rgba(${accentRgba},0.6)`,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Bottom caption */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "16px 14px",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 12 : 13,
                  letterSpacing: "0.05em",
                  color: "#fff",
                  textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {product.previewVideoCaption || product.name}
              </div>
            </>
          )}
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "1/1",
            background: "#06060f",
            borderRadius: 8,
            marginBottom: 18,
            marginTop: product.badge ? 8 : 0,
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Layered gradient background — accent color → black */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isPurple
                ? `radial-gradient(circle at 30% 20%, ${PURPLE}55 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${CYAN}33 0%, transparent 50%), linear-gradient(135deg, #0a0a20, #0d0418)`
                : `radial-gradient(circle at 25% 25%, ${accentColor}55 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${PURPLE}22 0%, transparent 50%), linear-gradient(135deg, #08081a, #02020a)`,
            }}
          />

          {/* Geometric overlay (subtle grid lines for texture) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />

          {/* Top: small genre tag */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: accentColor,
              padding: "3px 8px",
              border: `1px solid ${accentColor}`,
              borderRadius: 12,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.genre.split("/")[0].trim()}
          </div>

          {/* Center: large product name */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 28 : 36,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#fff",
                lineHeight: 1,
                marginBottom: 8,
                textShadow: `0 4px 24px rgba(0,0,0,0.6)`,
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                width: 40,
                height: 2,
                background: accentColor,
                marginBottom: 10,
              }}
            />
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              By Steven Angel
            </div>
          </div>

          {/* Bottom: DAW info */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 9,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.05em",
            }}
          >
            {product.daw}
          </div>
        </div>
      )}

      {/* Genre · DAW label */}
      <div style={{ ...label(accentColor), marginBottom: 8 }}>
        {product.genre} · {product.daw}
      </div>

      {/* Product Name */}
      <h3
        style={{
          ...heading(isMobile ? 22 : 24),
          marginBottom: 6,
        }}
      >
        {product.name}
      </h3>

      {/* Headline */}
      <div
        style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
          color: accentColor,
          letterSpacing: "0.05em",
          marginBottom: 12,
          lineHeight: 1.3,
        }}
      >
        {product.headline}
      </div>

      {/* Short description */}
      <div style={{ ...body, fontSize: isMobile ? 12 : 13, marginBottom: 16 }}>
        {product.shortDescription}
      </div>

      {/* Features list */}
      <div style={{ marginBottom: 16, flexGrow: 1 }}>
        {product.features.slice(0, 4).map((feature) => (
          <div
            key={feature}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span style={{ color: accentColor, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>
              ✓
            </span>
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobile ? 12 : 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.4,
              }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* File size + warning */}
      <div
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 12,
        }}
      >
        ⤓ {product.fileSize}
        {product.largeFileWarning && (
          <span style={{ display: "block", marginTop: 4, color: "rgba(255,200,100,0.7)" }}>
            ⚠ Large file — recommended on Wi-Fi
          </span>
        )}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? 32 : 38,
          color: accentColor,
          marginBottom: 12,
          lineHeight: 1,
        }}
      >
        ${product.price}
        <span
          style={{
            fontSize: isMobile ? 12 : 14,
            color: "rgba(255,255,255,0.4)",
            marginLeft: 6,
            fontWeight: 600,
          }}
        >
          USD
        </span>
      </div>

      {/* Buy Now button */}
      <button
        onClick={() => onBuy(product)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: isPurple ? PURPLE : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
          color: "#000",
          border: "none",
          borderRadius: 50,
          padding: isMobile ? "13px 20px" : "15px 28px",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: isPurple
            ? "0 0 24px rgba(187,134,252,0.4)"
            : "0 0 28px rgba(0,229,255,0.5)",
          marginTop: "auto",
        }}
      >
        Buy Now →
      </button>
    </div>
  );
}
