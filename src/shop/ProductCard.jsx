import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── Color Constants (matches BRAND_GUIDE.md) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG_ALT = "#04040f";

/* ─── Style Helpers ─── */
const heading = (fontSize) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 900,
  fontSize,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.15,
  overflowWrap: "break-word",
  wordBreak: "break-word",
});

const body = {
  fontFamily: "DM Sans, sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.6,
  overflowWrap: "break-word",
  wordBreak: "break-word",
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
 * AudioPlayer — minimal track preview for product cards
 *
 * Hidden until the user clicks "Play Preview". Renders a native HTML5 <audio>
 * with controls so users can scrub. Returns null if the product has no audioUrl.
 */
function AudioPlayer({ product, accentColor, accentRgba }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  if (!product.audioUrl) return null;

  if (!playing) {
    return (
      <button
        onClick={() => {
          setPlaying(true);
          if (window.gtag) window.gtag("event", "select_content", { event_category: "product_preview", event_label: product.name, content_type: "template" });
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          padding: "10px 16px",
          background: "transparent",
          border: `1px solid rgba(${accentRgba},0.45)`,
          borderRadius: 6,
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accentColor,
          cursor: "pointer",
          marginBottom: 14,
        }}
        aria-label="Play track preview"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={accentColor}>
          <path d="M8 5v14l11-7z" />
        </svg>
        Play Track Preview
      </button>
    );
  }

  return (
    <audio
      ref={audioRef}
      src={product.audioUrl}
      controls
      autoPlay
      preload="metadata"
      style={{
        width: "100%",
        marginBottom: 14,
        filter: "invert(0.92) hue-rotate(180deg)",
      }}
    >
      Your browser does not support the audio element.
    </audio>
  );
}

/**
 * ProductCard — single shop product
 *
 * Visual structure:
 *   ┌─────────────────────────┐
 *   │  [BADGE]                 │
 *   │  [Video player OR Box3D] │
 *   │  Genre · DAW · BPM · Key │
 *   │  Product Name (h3)       │
 *   │  Headline                │
 *   │  Short description       │
 *   │  [SEO tag pills]         │
 *   │  [Audio preview button]  │
 *   │  $XX.XX                  │
 *   │  [BUY NOW button]        │
 *   └─────────────────────────┘
 */
export default function ProductCard({ product, isMobile, onBuy }) {
  const isPurple = product.badgeColor === "purple";
  const accentColor = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";

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
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Badge — top-left (inside the card, not overlapping the border) */}
      {product.badge && (
        <div
          style={{
            display: "inline-block",
            alignSelf: "flex-start",
            background: isPurple
              ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})`
              : `rgba(${accentRgba},0.15)`,
            border: isPurple ? "none" : `1px solid ${accentColor}`,
            color: isPurple ? "#000" : accentColor,
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? 9 : 10,
            letterSpacing: isMobile ? "0.12em" : "0.2em",
            padding: "4px 14px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            marginBottom: 8,
          }}
        >
          {product.badge}
        </div>
      )}

      {/* Product cover — always show the 3D box image (consistent grid) */}
      <Link
        to={`/shop/${product.slug}`}
        style={{
          display: "block",
          marginBottom: 18,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            borderRadius: 6,
          }}
        />
      </Link>

      {/* Genre · DAW · BPM · Key label */}
      <div style={{ ...label(accentColor), marginBottom: 8, lineHeight: 1.4 }}>
        {product.genre} · {product.daw}
        {product.bpm && ` · ${product.bpm} BPM`}
        {product.musicalKey && ` · ${product.musicalKey}`}
      </div>

      {/* Product Name (linked to per-product page) */}
      <h3 style={{ marginBottom: 6, marginTop: 0 }}>
        <Link
          to={`/shop/${product.slug}`}
          style={{
            ...heading(isMobile ? 22 : 24),
            display: "block",
            textDecoration: "none",
          }}
        >
          {product.name}
        </Link>
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
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {product.headline}
      </div>

      {/* Short description */}
      <div style={{ ...body, fontSize: isMobile ? 12 : 13, marginBottom: 14, flexGrow: 1 }}>
        {product.shortDescription}
      </div>

      {/* SEO tag pills (replaces generic trust pills — better for SEO + UX) */}
      {product.seoTags && product.seoTags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {product.seoTags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                background: `rgba(${accentRgba},0.06)`,
                border: `1px solid rgba(${accentRgba},0.18)`,
                padding: "3px 9px",
                borderRadius: 20,
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Audio preview player (only shown if product has audioUrl) */}
      <AudioPlayer product={product} accentColor={accentColor} accentRgba={accentRgba} />

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
        Buy Now
      </button>
    </div>
  );
}
