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
import { useParams, Link, Navigate } from "react-router-dom";
import {
  getProductBySlug,
  getOrderedProducts,
  getProductSpecs,
} from "./products.js";
import CheckoutModal from "./CheckoutModal.jsx";
import Nav from "../Nav.jsx";
import Footer from "../Footer.jsx";
import { useShopPlayer } from "./ShopPlayerContext.jsx";
import { trackViewItem, trackAddToCart, trackVideoPreview } from "../lib/analytics/events";
import { usePageView, useScrollDepth, useTimeOnPage } from "../lib/analytics/hooks";

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
  const { playTrack, pauseTrack, currentTrack, isPlaying } = useShopPlayer();
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
    ld.textContent = JSON.stringify({
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
    });
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

  const handleBuy = () => {
    trackAddToCart(product);
    setCheckoutOpen(true);
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      {/* Hidden H1 — long-tail SEO keyword */}
      <h1 style={visuallyHidden}>
        {product.seoTitle ||
          `${product.name} — ${product.genre} Ableton Template by Steven Angel`}
      </h1>

      <Nav />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
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

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 22,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 900,
                    fontSize: isMobile ? 38 : 48,
                    color: accentColor,
                    letterSpacing: "0.02em",
                  }}
                >
                  ${product.price}
                </div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {product.currency} · ONE-TIME
                </div>
              </div>

              {/* Buy button */}
              <button
                onClick={handleBuy}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px 28px",
                  background: isPurple
                    ? PURPLE
                    : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#000",
                  cursor: "pointer",
                  boxShadow: `0 0 28px rgba(${accentRgba},0.35)`,
                  marginBottom: 14,
                }}
              >
                Buy Now
              </button>

              <div
                style={{
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  marginBottom: 22,
                }}
              >
                Instant email delivery · Lifetime re-downloads · Royalty-free
              </div>

              {/* Audio preview — plays through the sticky player */}
              {product.audioUrl && (() => {
                const isThisTrack = currentTrack?.id === product.id;
                const isThisPlaying = isThisTrack && isPlaying;
                return (
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        pauseTrack();
                      } else {
                        playTrack({
                          id: product.id,
                          title: product.name,
                          subtitle: `${product.category || product.genre || "Afro House"} · Ableton Live 12`,
                          audioUrl: product.audioUrl,
                          coverUrl: product.image,
                        });
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      width: "100%",
                      padding: "12px 18px",
                      background: "transparent",
                      border: `1px solid rgba(${accentRgba},0.45)`,
                      borderRadius: 6,
                      fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: accentColor,
                      cursor: "pointer",
                      marginBottom: 18,
                    }}
                    aria-label={isThisPlaying ? "Pause track preview" : "Play track preview"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={accentColor}>
                      {isThisPlaying
                        ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                        : <path d="M8 5v14l11-7z" />
                      }
                    </svg>
                    {isThisPlaying ? "Pause Preview" : "Play Track Preview"}
                  </button>
                );
              })()}

              {/* SEO tags pills (replaces generic trust pills) */}
              {product.seoTags && product.seoTags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {product.seoTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.7)",
                        background: `rgba(${accentRgba},0.06)`,
                        border: `1px solid rgba(${accentRgba},0.2)`,
                        padding: "5px 12px",
                        borderRadius: 20,
                        cursor: "default",
                        pointerEvents: "none",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p style={{ ...body, marginBottom: 0 }}>{product.description}</p>

              {/* Specs */}
              {product.specs && (
                <div
                  style={{
                    marginTop: 28,
                    padding: "20px 22px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid rgba(${accentRgba},0.15)`,
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      ...heading(isMobile ? 16 : 18),
                      marginBottom: 16,
                      color: accentColor,
                    }}
                  >
                    Specs
                  </div>

                  {/* DAW / BPM / Key / Length / Channels — single-line items */}
                  {product.specs.daw && (
                    <SpecLine label="DAW" value={product.specs.daw} accentRgba={accentRgba} />
                  )}
                  {product.specs.bpm && (
                    <SpecLine label="BPM" value={String(product.specs.bpm)} accentRgba={accentRgba} />
                  )}
                  {product.specs.key && (
                    <SpecLine label="Key" value={product.specs.key} accentRgba={accentRgba} />
                  )}
                  {product.specs.length && (
                    <SpecLine label="Length" value={product.specs.length} accentRgba={accentRgba} />
                  )}
                  {product.specs.channels && (
                    <SpecLine label="Channels" value={product.specs.channels} accentRgba={accentRgba} />
                  )}

                  {/* List sections */}
                  {product.specs.whatYouGet && (
                    <SpecList title="What You Get" items={product.specs.whatYouGet} accentColor={accentColor} />
                  )}
                  {product.specs.lessons && (
                    <SpecList title="Lesson Topics" items={product.specs.lessons} accentColor={accentColor} />
                  )}
                  {product.specs.samplePack && (
                    <SpecList title="Sample Pack" items={product.specs.samplePack} accentColor={accentColor} />
                  )}
                  {product.specs.templates && (
                    <SpecList title="Templates Included" items={product.specs.templates} accentColor={accentColor} />
                  )}
                  {product.specs.includes && (
                    <SpecList title="Project Includes" items={product.specs.includes} accentColor={accentColor} />
                  )}
                  {product.specs.plugins && (
                    <SpecList title="Plugins Needed" items={product.specs.plugins} accentColor={accentColor} />
                  )}
                  {product.specs.notes && (
                    <div style={{ marginTop: 14 }}>
                      {product.specs.notes.map((note, i) => (
                        <div
                          key={i}
                          style={{
                            ...body,
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "rgba(255,255,255,0.5)",
                            marginBottom: 4,
                          }}
                        >
                          * {note}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

      {/* Checkout Modal — opens when user clicks Buy Now */}
      {checkoutOpen && (
        <CheckoutModal
          product={product}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
