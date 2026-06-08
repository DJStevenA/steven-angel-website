/**
 * ProductPage — Per-product detail page at /shop/:slug
 *
 * SEO-first design:
 * - Each product gets its own URL (slug-based) so it can rank independently
 * - Hidden H1 carries the most-targeted long-tail keyword
 * - Visible H2 is the product name
 * - Page title + meta description set dynamically via useEffect
 * - Schema.org Product JSON-LD injected for rich Google snippets
 * - "Related products" grid for internal linking
 *
 * Visual: 2-column hero (visual + title/price/buy/description),
 * SEO tag pills, audio preview, related products. No emojis, no
 * features list, no file size, no Wi-Fi warnings.
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import {
  getProductBySlug,
  getOrderedProducts,
  getProductSpecs,
} from "./products.js";
import Nav from "../Nav.jsx";
import Footer from "../Footer.jsx";
import { useShopPlayer } from "./ShopPlayerContext.jsx";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import Waveform from "./Waveform.jsx";
import { trackViewItem, trackAddToCart, trackVideoPreview } from "../lib/analytics/events";
import { usePageView, useScrollDepth, useTimeOnPage } from "../lib/analytics/hooks";
import CartCheckoutButton from "./CartCheckoutButton.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

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
  fontSize: 15,
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.7,
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

const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* ─── SpecLine — single key:value row ─── */
function SpecLine({ label: lbl, value, accentRgba }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: `1px solid rgba(${accentRgba},0.08)`,
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {lbl}
      </span>
      <span
        style={{
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── SpecList — titled bullet list ─── */
function SpecList({ title, items, accentColor }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: accentColor,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
            paddingLeft: 14,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              color: accentColor,
              fontSize: 10,
              top: 2,
            }}
          >
            ▸
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { playTrack, pauseTrack, currentTrack, isPlaying, currentTime, duration, seek } = useShopPlayer();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Remarketing signals — pass product details for dynamic remarketing audiences
  usePageView(
    "shop_product",
    product
      ? { product_id: product.slug, product_name: product.name, product_price: product.price }
      : undefined
  );
  useScrollDepth("shop_product");
  useTimeOnPage("shop_product");

  // Clarity: track product page view
  useEffect(() => {
    if (!product || !window.clarity) return;
    window.clarity("event", "productView");
    window.clarity("set", "product", product.name);
    window.clarity("set", "productPrice", String(product.price));
  }, [product]);

  // GA4 view_item — once per product slug (StrictMode guard)
  const viewItemFiredFor = useRef(null);
  useEffect(() => {
    if (!product || viewItemFiredFor.current === product.id) return;
    viewItemFiredFor.current = product.id;
    trackViewItem(product);
  }, [product]);

  // Set dynamic page title + meta description + canonical + JSON-LD
  useEffect(() => {
    if (!product) return;
    document.title = product.seoTitle || `${product.name} | Steven Angel`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && product.seoDescription) {
      meta.setAttribute("content", product.seoDescription);
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", `https://steven-angel.com/shop/${product.slug}`);
    }
    const existing = document.getElementById("product-jsonld");
    if (existing) existing.remove();
    const ld = document.createElement("script");
    ld.id = "product-jsonld";
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify([
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: `${product.name} — ${product.headline}`,
        description: product.seoDescription || product.description,
        brand: { "@type": "Brand", name: "Steven Angel" },
        sku: product.id,
        image: typeof window !== "undefined" ? `${window.location.origin}/og-image.png` : undefined,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency,
          availability: "https://schema.org/InStock",
          url: typeof window !== "undefined" ? window.location.href : undefined,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://steven-angel.com" },
          { "@type": "ListItem", position: 2, name: "Shop", item: "https://steven-angel.com/shop" },
          { "@type": "ListItem", position: 3, name: product.name, item: `https://steven-angel.com/shop/${product.slug}` },
        ],
      },
    ]);
    document.head.appendChild(ld);
    return () => {
      const node = document.getElementById("product-jsonld");
      if (node) node.remove();
    };
  }, [product]);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const isPurple = product.badgeColor === "purple";
  const accentColor = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";
  const youtubeId = product.previewVideoYouTubeId || null;
  const hasVideo = !!product.previewVideoUrl || !!youtubeId;
  const videoThumb = product.previewVideoThumb
    || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null);
  const specs = getProductSpecs(product);

  const relatedProducts = getOrderedProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  // Video preview threshold tracking (Phase 2)
  const videoThresholds = useRef(new Set());
  const handleVideoPlay = () => {
    trackVideoPreview('play', { product_id: product.id, product_name: product.name, genre: product.genre });
  };
  const handleVideoTimeUpdate = (e) => {
    const { currentTime, duration } = e.target;
    if (!duration) return;
    const pct = currentTime / duration;
    const marks = [['25', 0.25], ['50', 0.5], ['75', 0.75]];
    for (const [label, threshold] of marks) {
      if (pct >= threshold && !videoThresholds.current.has(label)) {
        videoThresholds.current.add(label);
        trackVideoPreview(label, { product_id: product.id, product_name: product.name, genre: product.genre });
      }
    }
  };
  const handleVideoEnded = () => {
    if (!videoThresholds.current.has('complete')) {
      videoThresholds.current.add('complete');
      trackVideoPreview('complete', { product_id: product.id, product_name: product.name, genre: product.genre });
    }
    videoThresholds.current = new Set();
  };

  const nav = useNavigate();
  const { addToCart, isInCart, cartCount } = useCart();
  const { user, loading: authLoading } = useAuth();
  // Add-to-cart: STAY on the product page so the customer can keep browsing.
  // The nav cart icon (top-right) confirms what they have. No "In Cart"
  // disabled marker — Steven 2026-06-07 explicit removal.
  const handleAddToCart = () => {
    if (product && !isInCart(product.id)) {
      addToCart(product);
      trackAddToCart(product);
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.25); } }`}</style>
      {/* Hidden H1 — long-tail SEO keyword */}
      <h1 style={visuallyHidden}>
        {product.seoTitle ||
          `${product.name} — ${product.genre} Ableton Template by Steven Angel`}
      </h1>

      <Nav />

      {/* Breadcrumb + Cart icon — Steven 2026-06-07: cart icon needs to be
          visible on product pages too (same one ShopPage has in its nav). */}
      <nav
        aria-label="Breadcrumb"
        style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Link to="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <Link to="/shop" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
              Shop
            </Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "#fff" }}>{product.name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* Cart icon — same one ShopPage's top nav uses */}
            <Link
              to="/shop/cart"
              aria-label={`Cart (${cartCount} items)`}
              style={{
                position: "relative", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                width: 38, height: 38, borderRadius: 4,
                background: cartCount > 0 ? "rgba(0,229,255,0.08)" : "transparent",
                border: `1px solid ${cartCount > 0 ? CYAN : "rgba(255,255,255,0.15)"}`,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cartCount > 0 ? CYAN : "rgba(255,255,255,0.6)"} strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: CYAN, color: "#000",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: 11, minWidth: 18, height: 18,
                  borderRadius: 9, display: "flex",
                  alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Sign in / My Account — icon only */}
            {!authLoading && (
              <Link
                to={user ? "/shop/account" : "/shop/login"}
                aria-label={user ? "My account" : "Sign in"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38, height: 38, borderRadius: 4,
                  background: user ? "rgba(0,229,255,0.08)" : "transparent",
                  border: `1px solid ${user ? CYAN : "rgba(255,255,255,0.15)"}`,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={user ? CYAN : "rgba(255,255,255,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero — 2-column on desktop, stacked on mobile */}
        <section style={{ padding: isMobile ? "30px 20px 40px" : "40px 60px 60px" }}>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 32 : 56,
              alignItems: "start",
            }}
          >
            {/* Left: 3D box image + optional video below */}
            <div style={{ minWidth: 0 }}>
              {/* Always show 3D box render */}
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  borderRadius: 8,
                }}
              />

              {/* Video player below the box (if product has a preview video) */}
              {hasVideo && (
                <div
                  style={{
                    width: product.previewVideoAspect === "9/16" ? (isMobile ? "80%" : "60%") : "100%",
                    maxWidth: product.previewVideoAspect === "9/16" ? 340 : "none",
                    margin: product.previewVideoAspect === "9/16" ? "16px auto 0" : "16px 0 0",
                    aspectRatio: product.previewVideoAspect || "16/9",
                    background: "#06060f",
                    borderRadius: 10,
                    overflow: "hidden",
                    position: "relative",
                    border: `1px solid rgba(${accentRgba},0.3)`,
                    cursor: videoPlaying ? "default" : "pointer",
                  }}
                  onClick={() => !videoPlaying && setVideoPlaying(true)}
                >
                  {videoPlaying ? (
                    youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                        title={product.previewVideoCaption || product.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={handleVideoPlay}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                      />
                    ) : (
                      <video
                        src={product.previewVideoUrl}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        onPlay={handleVideoPlay}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleVideoEnded}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: product.previewVideoAspect === "9/16" ? "contain" : "cover",
                        }}
                      />
                    )
                  ) : (
                    <>
                      {videoThumb && (
                        <img
                          src={videoThumb}
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
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.8) 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 56,
                          height: 56,
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
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "14px 14px",
                          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                          fontWeight: 700,
                          fontSize: isMobile ? 11 : 13,
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
              )}
            </div>

            {/* Right: Title, price, buy button, description */}
            <div style={{ minWidth: 0 }}>
              {/* Badge */}
              {product.badge && (
                <div
                  style={{
                    display: "inline-block",
                    background: isPurple
                      ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})`
                      : `rgba(${accentRgba},0.15)`,
                    border: isPurple ? "none" : `1px solid ${accentColor}`,
                    color: isPurple ? "#000" : accentColor,
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    padding: "5px 14px",
                    borderRadius: 20,
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  {product.badge}
                </div>
              )}

              {/* Specs line */}
              <div style={{ ...label(accentColor), marginBottom: 14 }}>{specs}</div>

              {/* Visible H2 — product name */}
              <h2
                style={{
                  ...heading(isMobile ? 32 : 44),
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                {product.name}
              </h2>

              {/* Subtitle / headline */}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 19,
                  letterSpacing: "0.04em",
                  color: accentColor,
                  marginBottom: 22,
                  lineHeight: 1.3,
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {product.headline}
              </div>

              {/* Price + Add to Cart moved to bottom after specs */}

              {/* Unified preview player — Steven 2026-06-07: single row with
                  a small play/pause circle on the left and the waveform graphic
                  to its right. Replaces the separate "Play Preview" CTA pill
                  + standalone waveform card. */}
              {product.audioUrl && (() => {
                const isThisTrack = currentTrack?.id === product.id;
                const isLoop = typeof currentTrack?.id === "string"
                  && currentTrack?.id?.startsWith(`${product.id}__loop-`);
                const isActive = isThisTrack || isLoop;
                const isThisPlaying = isThisTrack && isPlaying;
                const activeUrl = isActive ? currentTrack.audioUrl : product.audioUrl;
                const progress = isActive && duration > 0 ? currentTime / duration : 0;
                const startProductPreview = () => playTrack({
                  id: product.id,
                  title: product.name,
                  subtitle: `${product.category || product.genre || "Afro House"} · Ableton Live 12`,
                  audioUrl: product.audioUrl,
                  coverUrl: product.image,
                });
                const handlePlayClick = (e) => {
                  e.stopPropagation();
                  if (isThisPlaying) pauseTrack();
                  else startProductPreview();
                };
                const handleWaveformClick = (e) => {
                  if (isActive && duration > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
                    const pct = Math.max(0, Math.min(1, x / rect.width));
                    seek(pct * duration);
                  } else {
                    startProductPreview();
                  }
                };
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: product.audioLoops?.length ? 14 : 18,
                      background: `linear-gradient(180deg, rgba(${accentRgba},0.10), rgba(${accentRgba},0.04))`,
                      border: `1px solid rgba(${accentRgba},${isActive ? 0.45 : 0.28})`,
                      borderRadius: 12,
                      padding: "10px 14px",
                      userSelect: "none",
                      boxShadow: isActive
                        ? `0 0 28px rgba(${accentRgba},0.28)`
                        : `0 0 16px rgba(${accentRgba},0.10)`,
                      transition: "box-shadow 200ms, border-color 200ms",
                    }}
                  >
                    {/* Play / Pause */}
                    <button
                      type="button"
                      onClick={handlePlayClick}
                      aria-label={isThisPlaying ? "Pause" : "Play preview"}
                      style={{
                        flexShrink: 0,
                        width: 44, height: 44, borderRadius: "50%",
                        background: isThisPlaying
                          ? `rgba(${accentRgba},0.12)`
                          : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        border: `1px solid ${accentColor}`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: isThisPlaying ? "none" : `0 0 16px rgba(${accentRgba},0.45)`,
                        transition: "all 0.15s",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isThisPlaying ? accentColor : "#000"}>
                        {isThisPlaying
                          ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                          : <path d="M8 5v14l11-7z" />
                        }
                      </svg>
                    </button>

                    {/* Waveform — click anywhere to seek/start */}
                    <div
                      onClick={handleWaveformClick}
                      role="slider"
                      aria-label={isActive ? "Seek" : "Play preview"}
                      aria-valuenow={Math.round(isActive ? currentTime : 0)}
                      aria-valuemin={0}
                      aria-valuemax={Math.round(isActive ? duration : 0)}
                      style={{
                        flex: 1, minWidth: 0,
                        position: "relative",
                        height: 48,
                        cursor: "pointer",
                        touchAction: "none",
                      }}
                    >
                      <Waveform
                        audioUrl={activeUrl}
                        progress={progress}
                        height={48}
                      />
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0, bottom: 0,
                            left: `${progress * 100}%`,
                            width: 2,
                            background: "#fff",
                            boxShadow: `0 0 8px ${accentColor}`,
                            pointerEvents: "none",
                            transition: "left 0.1s linear",
                          }}
                        />
                      )}
                    </div>

                  </div>
                );
              })()}

              {/* Description — right below preview player (Steven 2026-06-08) */}
              <Accordion title="Description" defaultOpen accentColor={accentColor} accentRgba={accentRgba}>
                <p style={{ ...body, margin: 0 }}>{product.description}</p>
              </Accordion>

              {/* Specs — collapsible accordion */}
              {product.specs && (
                <Accordion title="Specs" accentColor={accentColor} accentRgba={accentRgba}>
                <div style={{ marginTop: 0, padding: 0, background: "transparent", border: "none", borderRadius: 0 }}>
                  {product.specs.daw && <SpecLine label="DAW" value={product.specs.daw} accentRgba={accentRgba} />}
                  {product.specs.bpm && <SpecLine label="BPM" value={String(product.specs.bpm)} accentRgba={accentRgba} />}
                  {product.specs.key && <SpecLine label="Key" value={product.specs.key} accentRgba={accentRgba} />}
                  {product.specs.length && <SpecLine label="Length" value={product.specs.length} accentRgba={accentRgba} />}
                  {product.specs.channels && <SpecLine label="Channels" value={product.specs.channels} accentRgba={accentRgba} />}
                  {product.specs.whatYouGet && <SpecList title="What You Get" items={product.specs.whatYouGet} accentColor={accentColor} />}
                  {product.specs.lessons && (
                    <>
                      <SpecList title="Lesson Topics" items={product.specs.lessons} accentColor={accentColor} />
                      <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(0,229,255,0.06)", borderLeft: `3px solid ${accentColor}`, borderRadius: 4, fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                        ✓ All {product.specs.lessons.length} video lessons + project file + sample pack are downloadable from your Account immediately after purchase.
                      </div>
                    </>
                  )}
                  {product.specs.samplePack && <SpecList title="Sample Pack" items={product.specs.samplePack} accentColor={accentColor} />}
                  {product.specs.templates && <SpecList title="Templates Included" items={product.specs.templates} accentColor={accentColor} />}
                  {product.specs.includes && <SpecList title="Project Includes" items={product.specs.includes} accentColor={accentColor} />}
                  {product.specs.plugins && <SpecList title="Plugins Needed" items={product.specs.plugins} accentColor={accentColor} />}
                  {product.specs.notes && (
                    <div style={{ marginTop: 14 }}>
                      {product.specs.notes.map((note, i) => (
                        <div key={i} style={{ ...body, fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>* {note}</div>
                      ))}
                    </div>
                  )}
                </div>
                </Accordion>
              )}

              {/* Demo loops — compact 2+2+1 grid (Steven 2026-06-08) */}
              {product.audioLoops?.length > 0 && (
                <div style={{ marginBottom: 22, marginTop: 18 }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 700, fontSize: 11, letterSpacing: "0.22em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8,
                  }}>
                    Listen to {product.audioLoops.length} loops from the pack
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {product.audioLoops.map((loop, idx) => {
                      const loopId = `${product.id}__loop-${idx}`;
                      const isThisLoop = currentTrack?.id === loopId;
                      const isThisLoopPlaying = isThisLoop && isPlaying;
                      const isLastOdd = product.audioLoops.length % 2 === 1 && idx === product.audioLoops.length - 1;
                      return (
                        <button
                          key={loopId}
                          onClick={() => {
                            if (isThisLoopPlaying) pauseTrack();
                            else playTrack({ id: loopId, title: loop.title, subtitle: product.name, audioUrl: loop.audioUrl, coverUrl: product.image });
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 10px",
                            background: isThisLoopPlaying ? `rgba(${accentRgba},0.10)` : "rgba(255,255,255,0.02)",
                            border: `1px solid rgba(${accentRgba},${isThisLoopPlaying ? 0.3 : 0.08})`,
                            borderRadius: 8, color: "#fff",
                            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                            fontSize: 12, cursor: "pointer", textAlign: "left",
                            transition: "background 0.15s",
                            ...(isLastOdd ? { gridColumn: "1 / -1", justifySelf: "center", width: "calc(50% - 3px)" } : {}),
                          }}
                          aria-label={isThisLoopPlaying ? `Pause ${loop.title}` : `Play ${loop.title}`}
                        >
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 22, height: 22, borderRadius: "50%", background: accentColor, flexShrink: 0,
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="#000">
                              {isThisLoopPlaying
                                ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                                : <path d="M8 5v14l11-7z" />}
                            </svg>
                          </span>
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loop.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trust pills — Steven 2026-06-07 (matches ABT pattern) */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                <TrustPill text="100% Royalty Free" accentColor={accentColor} accentRgba={accentRgba} />
                <TrustPill text="Made In-House" accentColor={accentColor} accentRgba={accentRgba} />
                <TrustPill text="Instant Download" accentColor={accentColor} accentRgba={accentRgba} />
              </div>

              {/* ── Price + Add to Cart (below specs) ── */}
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid rgba(${accentRgba},0.15)` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 900, fontSize: isMobile ? 38 : 48,
                    color: accentColor, letterSpacing: "0.02em",
                  }}>
                    ${product.price}
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 600, fontSize: 13, letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.5)",
                  }}>
                    {product.currency} · ONE-TIME
                  </div>
                </div>

                {/* Buy stack — Steven 2026-06-07 Option A:
                    1. Add to Cart (cyan/purple per product) — same label both states
                    2. 🟡 PayPal — instant single-product checkout
                    3. ⚫ More Payment Options — card/Apple Pay/Google Pay on /shop/checkout */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    display: "block", width: "100%", padding: "16px 28px",
                    background: isPurple ? PURPLE : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                    border: "none", borderRadius: 8,
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 800, fontSize: 16, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#000", cursor: "pointer",
                    boxShadow: `0 0 28px rgba(${accentRgba},0.35)`, marginBottom: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" style={{ verticalAlign: "middle", marginRight: 8 }}>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  Add to Cart
                </button>

                {/* PayPal Smart Buttons — instant single-product buy.
                    Steven 2026-06-07: no email gate, no redirect — anon flow
                    pulls payer email from PayPal after capture. */}
                <div style={{ marginBottom: 10 }}>
                  <CartCheckoutButton
                    productIds={[product.id]}
                    couponCode={null}
                    onSuccess={() => nav("/shop/thank-you")}
                  />
                </div>

                {/* Other payment methods → checkout-v2 (Airwallex Drop-in +
                    Apple Pay + Google Pay + card + Klarna etc). Adds the
                    product to the cart on the way. Steven 2026-06-07 flow. */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isInCart(product.id)) addToCart(product);
                    nav("/shop/checkout-v2");
                  }}
                  style={{
                    display: "block", width: "100%", padding: "12px 22px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8,
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 700, fontSize: 13, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "#fff", cursor: "pointer",
                    marginBottom: 14,
                  }}
                >
                  Other payment methods
                </button>

                <div style={{
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center",
                }}>
                  Instant email delivery · Lifetime re-downloads · Royalty-free
                </div>

                {/* SEO tags — bottom of page (Steven 2026-06-08) */}
                {product.seoTags && product.seoTags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20, justifyContent: "center" }}>
                    {product.seoTags.map((tag) => (
                      <span key={tag} style={{
                        fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                        fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.5)",
                        background: `rgba(${accentRgba},0.04)`,
                        border: `1px solid rgba(${accentRgba},0.12)`,
                        padding: "4px 10px", borderRadius: 20,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        <section
          style={{
            padding: isMobile ? "40px 20px 60px" : "60px 60px 80px",
            background: BG_ALT,
            borderTop: "1px solid #0d0d18",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                ...heading(isMobile ? 24 : 32),
                textAlign: "center",
                marginBottom: 36,
              }}
            >
              More From The Shop
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: isMobile ? 18 : 22,
              }}
            >
              {relatedProducts.map((p) => {
                const pAccent = p.badgeColor === "purple" ? PURPLE : CYAN;
                return (
                  <Link
                    key={p.id}
                    to={`/shop/${p.slug}`}
                    style={{
                      display: "block",
                      background: BG,
                      padding: 18,
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                      color: "inherit",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        ...label(pAccent),
                        fontSize: 9,
                        marginBottom: 8,
                      }}
                    >
                      {p.genre}
                    </div>
                    <div
                      style={{
                        ...heading(20),
                        marginBottom: 6,
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        ...body,
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {p.shortDescription}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: pAccent,
                        letterSpacing: "0.04em",
                      }}
                    >
                      ${p.price} {p.currency}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Link
                to="/shop"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  border: `1px solid ${CYAN}`,
                  borderRadius: 6,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: CYAN,
                  textDecoration: "none",
                }}
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Checkout moved to dedicated /shop/checkout/:slug page */}
    </div>
  );
}

// ── Accordion ───────────────────────────────────────────────────────────────
// Lightweight reusable collapsible. Header has +/- icon, click to toggle.
// `defaultOpen` controls initial state. Steven 2026-06-07: replaces flat
// always-visible Description / Specs blocks per ABT reference.
function Accordion({ title, children, defaultOpen = false, accentColor = "#00E5FF", accentRgba = "0,229,255" }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{
      marginTop: 18,
      border: `1px solid rgba(${accentRgba},0.15)`,
      borderRadius: 10,
      background: "rgba(255,255,255,0.02)",
      overflow: "hidden",
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "flex", width: "100%", padding: "16px 20px",
          alignItems: "center", justifyContent: "space-between",
          background: "transparent", border: "none",
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 800, fontSize: 16, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "#fff", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{title}</span>
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: "transform 200ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", color: "rgba(255,255,255,0.85)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── TrustPill ────────────────────────────────────────────────────────────────
// Small badge for credibility signals (100% Royalty Free, Made In-House, etc).
// Steven 2026-06-07 — added to product page above the description (ABT pattern).
function TrustPill({ text, accentColor = "#00E5FF", accentRgba = "0,229,255" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 999,
      background: `rgba(${accentRgba},0.08)`,
      border: `1px solid rgba(${accentRgba},0.3)`,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, fontSize: 11, letterSpacing: "0.04em",
      color: accentColor,
      whiteSpace: "nowrap",
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {text}
    </span>
  );
}
