import React, { useState } from "react";
import { useShopPlayer } from "./ShopPlayerContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { trackSelectItem, trackAudioPreview, trackAddToCart } from "../lib/analytics/events";
import { useCart } from "./CartContext.jsx";

/* ─── Color Constants (matches BRAND_GUIDE.md) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG_ALT = "#04040f";

/* ─── Style Helpers ─── */
const heading = (fontSize) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
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
  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.6,
  overflowWrap: "break-word",
  wordBreak: "break-word",
};

const label = (color = CYAN) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color,
});

/**
 * AudioPlayer — triggers the shop-wide sticky player via context.
 * Returns null if the product has no audioUrl.
 */
function AudioPlayer({ product, accentColor, accentRgba }) {
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useShopPlayer();

  if (!product.audioUrl) return null;

  const isThisTrack = currentTrack && currentTrack.id === product.id;
  const isThisPlaying = isThisTrack && isPlaying;

  const handleClick = () => {
    if (isThisPlaying) {
      pauseTrack();
    } else {
      trackSelectItem(product);
      trackAudioPreview('click', { product_id: product.id, track_name: product.name, genre: product.genre });
      playTrack({
        id: product.id,
        title: product.name,
        genre: product.genre,
        subtitle: product.genre ? `${product.genre} · ${product.daw || ""}`.replace(/ · $/, "") : product.daw || "",
        audioUrl: product.audioUrl,
        coverUrl: product.image || null,
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        width: "100%",
        padding: "12px 18px",
        background: isThisPlaying
          ? `rgba(${accentRgba},0.12)`
          : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        border: `1px solid ${accentColor}`,
        borderRadius: 50, // pill per Brand Kit
        fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: isThisPlaying ? accentColor : "#000",
        cursor: "pointer",
        marginBottom: 14,
        boxShadow: isThisPlaying ? "none" : `0 0 20px rgba(${accentRgba},0.4)`,
        transition: "all 0.15s",
      }}
      aria-label={isThisPlaying ? "Pause" : "Play preview"}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: isThisPlaying ? accentColor : "#000",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill={isThisPlaying ? "#000" : accentColor}>
          {isThisPlaying
            ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
            : <path d="M8 5v14l11-7z" />}
        </svg>
      </span>
      {isThisPlaying ? "Pause" : "Play Preview"}
    </button>
  );
}

/**
 * StarRating — renders 5 stars (filled/half/empty) from a 0-5 rating.
 */
function StarRating({ rating, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: size }}>&#9733;</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} style={{ color: "#FFD700", fontSize: size, opacity: 0.7 }}>&#9733;</span>);
    } else {
      stars.push(<span key={i} style={{ color: "rgba(255,255,255,0.15)", fontSize: size }}>&#9733;</span>);
    }
  }
  return <span style={{ display: "inline-flex", gap: 1 }}>{stars}</span>;
}

/**
 * MiniPlayButton — small circular play/pause button overlaid on the product
 * image. Triggers the shop-wide sticky player. Compact enough not to dominate
 * the card, but visible enough to invite a click.
 */
function MiniPlayButton({ product, accentColor, accentRgba }) {
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useShopPlayer();

  const isThisTrack = currentTrack && currentTrack.id === product.id;
  const isThisPlaying = isThisTrack && isPlaying;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isThisPlaying) {
      pauseTrack();
    } else {
      trackAudioPreview("click", { product_id: product.id, track_name: product.name, source: "listing_card" });
      playTrack({
        id: product.id,
        title: product.name,
        genre: product.genre,
        subtitle: product.genre ? `${product.genre} · ${product.daw || ""}`.replace(/ · $/, "") : product.daw || "",
        audioUrl: product.audioUrl,
        coverUrl: product.image || null,
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isThisPlaying ? "Pause preview" : "Play preview"}
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: isThisPlaying
          ? accentColor
          : "rgba(0,0,0,0.7)",
        border: `2px solid ${accentColor}`,
        backdropFilter: "blur(6px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isThisPlaying
          ? `0 0 16px rgba(${accentRgba},0.6)`
          : `0 2px 12px rgba(0,0,0,0.5)`,
        transition: "all 0.15s",
        zIndex: 2,
        padding: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isThisPlaying ? "#000" : accentColor}>
        {isThisPlaying
          ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
          : <path d="M8 5v14l11-7z" />}
      </svg>
    </button>
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
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);
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
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
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

      {/* Product cover with mini play button overlay */}
      <div style={{ position: "relative", marginBottom: 18 }}>
        <Link
          to={`/shop/${product.slug}`}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width="1324"
            height="722"
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "1324/722",
              display: "block",
              borderRadius: 6,
            }}
          />
        </Link>
        {/* Mini audio play button — overlaid on image bottom-right */}
        {product.audioUrl && <MiniPlayButton product={product} accentColor={accentColor} accentRgba={accentRgba} />}
      </div>

      {/* Star rating */}
      {product.rating > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <StarRating rating={product.rating} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            {product.reviewCount} reviews
          </span>
        </div>
      )}

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
      <Link
        to={`/shop/${product.slug}`}
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
          color: accentColor,
          letterSpacing: "0.05em",
          marginBottom: 12,
          lineHeight: 1.3,
          overflowWrap: "break-word",
          wordBreak: "break-word",
          display: "block",
          textDecoration: "none",
        }}
      >
        {product.headline}
      </Link>

      {/* Short description */}
      <Link
        to={`/shop/${product.slug}`}
        style={{ ...body, fontSize: isMobile ? 12 : 13, marginBottom: 14, flexGrow: 1, display: "block", textDecoration: "none", color: "rgba(255,255,255,0.6)" }}
      >
        {product.shortDescription}
      </Link>

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
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                color: "rgba(255,255,255,0.65)",
                background: `rgba(${accentRgba},0.06)`,
                border: `1px solid rgba(${accentRgba},0.18)`,
                padding: "3px 9px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Mini audio preview restored on grid card (2026-05-27) — data shows
          1:36 avg scroll on /shop but only 4/24 click through to product page.
          Mini play button on image lets visitors hear before clicking. */}

      {/* Price */}
      <Link
        to={`/shop/${product.slug}`}
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 900,
          fontSize: isMobile ? 32 : 38,
          color: accentColor,
          marginBottom: 12,
          lineHeight: 1,
          display: "block",
          textDecoration: "none",
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
      </Link>

      {/* Add to Cart / In Cart button */}
      <button
        onClick={() => {
          if (inCart) {
            navigate("/shop/cart");
          } else {
            addToCart(product);
            trackAddToCart(product);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1500);
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: inCart
            ? "rgba(0,229,255,0.08)"
            : isPurple ? PURPLE : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
          color: inCart ? CYAN : "#000",
          border: inCart ? `1px solid ${CYAN}` : "none",
          borderRadius: 50,
          padding: isMobile ? "13px 20px" : "15px 28px",
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: inCart ? "none" : isPurple
            ? "0 0 24px rgba(187,134,252,0.4)"
            : "0 0 28px rgba(0,229,255,0.5)",
          marginTop: "auto",
          transition: "all 0.2s",
        }}
      >
        {inCart ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {justAdded ? "Added!" : "In Cart — View"}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
