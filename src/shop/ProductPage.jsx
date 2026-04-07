/**
 * ProductPage — Per-product detail page at /shop/:slug
 *
 * SEO-first design:
 * - Each product gets its own URL (slug-based) so it can rank independently
 * - Hidden H1 carries the most-targeted long-tail keyword
 * - Visible H1 is the marketing headline
 * - Page title + meta description set dynamically via useEffect
 * - Schema.org Product JSON-LD injected for rich Google snippets
 * - "Related products" grid for internal linking
 *
 * Reuses ProductCard for both the hero image (videoPlayer / album-art) and the related grid.
 */

import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  getProductBySlug,
  getOrderedProducts,
  getProductSpecs,
} from "./products.js";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

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
  fontSize: 15,
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.7,
};

const label = (color = CYAN) => ({
  fontFamily: "Barlow Condensed, sans-serif",
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

export default function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Set dynamic page title + meta description + canonical + JSON-LD
  useEffect(() => {
    if (!product) return;
    document.title = product.seoTitle || `${product.name} | Steven Angel`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && product.seoDescription) {
      meta.setAttribute("content", product.seoDescription);
    }
    // Update canonical URL to point to this product page
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", `https://steven-angel.com/shop/${product.slug}`);
    }
    // Inject Product JSON-LD for rich Google snippets
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
    // Cleanup on unmount
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
    // Unknown slug → redirect to /shop
    return <Navigate to="/shop" replace />;
  }

  const isPurple = product.badgeColor === "purple";
  const accentColor = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";
  const hasVideo = !!product.previewVideoUrl;
  const specs = getProductSpecs(product);

  // Up to 3 other products for the "related" grid
  const relatedProducts = getOrderedProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  // Phase 4 will replace this with PayPal flow
  const handleBuy = () => {
    alert(
      `Coming soon!\n\n${product.name} — $${product.price} ${product.currency}\n\nPayPal checkout will be available shortly.`
    );
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      {/* Hidden H1 — carries most-targeted long-tail SEO keyword */}
      <h1 style={visuallyHidden}>
        {product.seoTitle || `${product.name} — ${product.genre} Ableton Template by Steven Angel`}
      </h1>

      {/* ═══ Top Logo Bar ═══ */}
      <div style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}>
        <Link
          to="/"
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.1em",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
      </div>

      {/* ═══ Breadcrumb ═══ */}
      <nav
        aria-label="Breadcrumb"
        style={{
          padding: isMobile ? "20px 20px 0" : "24px 60px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            fontFamily: "DM Sans, sans-serif",
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
        {/* ═══ Hero — 2-column on desktop, stacked on mobile ═══ */}
        <section
          style={{
            padding: isMobile ? "30px 20px 40px" : "40px 60px 60px",
          }}
        >
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
            {/* Left: Visual (video player or album-art mockup) */}
            <div>
              {hasVideo ? (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    background: "#06060f",
                    borderRadius: 12,
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
                            opacity: 0.78,
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 18,
                          left: 18,
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: accentColor,
                          padding: "4px 12px",
                          border: `1px solid ${accentColor}`,
                          borderRadius: 12,
                          background: "rgba(0,0,0,0.5)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        ▶ Watch
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: `${accentColor}E6`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 0 40px rgba(${accentRgba},0.7)`,
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#000">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "20px 18px",
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 700,
                          fontSize: isMobile ? 13 : 15,
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
                // Album-art mockup (same logic as ProductCard)
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    background: "#06060f",
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isPurple
                        ? `radial-gradient(circle at 30% 20%, ${PURPLE}55 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${CYAN}33 0%, transparent 50%), linear-gradient(135deg, #0a0a20, #0d0418)`
                        : `radial-gradient(circle at 25% 25%, ${accentColor}55 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${PURPLE}22 0%, transparent 50%), linear-gradient(135deg, #08081a, #02020a)`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                      backgroundSize: "40px 40px",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      left: 18,
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: accentColor,
                      padding: "4px 12px",
                      border: `1px solid ${accentColor}`,
                      borderRadius: 12,
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {product.genre.split("/")[0].trim()}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 30,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 900,
                        fontSize: isMobile ? 36 : 56,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#fff",
                        lineHeight: 1,
                        marginBottom: 12,
                        textShadow: "0 4px 24px rgba(0,0,0,0.6)",
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{ width: 56, height: 2, background: accentColor, marginBottom: 14 }}
                    />
                    <div
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      By Steven Angel
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 18,
                      right: 18,
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {product.daw}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Title, price, buy button, description */}
            <div>
              {/* Badge (if any) */}
              {product.badge && (
                <div
                  style={{
                    display: "inline-block",
                    background: isPurple
                      ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})`
                      : `rgba(${accentRgba},0.15)`,
                    border: isPurple ? "none" : `1px solid ${accentColor}`,
                    color: isPurple ? "#000" : accentColor,
                    fontFamily: "Barlow Condensed, sans-serif",
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

              {/* Genre + DAW + BPM + Key spec line */}
              <div style={{ ...label(accentColor), marginBottom: 14 }}>{specs}</div>

              {/* Visible H2 — marketing headline */}
              <h2
                style={{
                  ...heading(isMobile ? 32 : 44),
                  marginBottom: 12,
                  marginTop: 0,
                }}
              >
                {product.name}
              </h2>

              {/* Subtitle / SEO headline */}
              <div
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 19,
                  letterSpacing: "0.04em",
                  color: accentColor,
                  marginBottom: 22,
                  lineHeight: 1.3,
                }}
              >
                {product.headline}
              </div>

              {/* Price + Buy CTA */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
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
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {product.currency} · ONE-TIME
                </div>
              </div>

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
                  fontFamily: "Barlow Condensed, sans-serif",
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
                Buy Now →
              </button>

              <div
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  marginBottom: 28,
                }}
              >
                Instant email delivery · Lifetime re-downloads · Royalty-free
              </div>

              {/* Description */}
              <p style={{ ...body, marginBottom: 26 }}>{product.description}</p>

              {/* Features list */}
              <div
                style={{
                  ...label(),
                  marginBottom: 12,
                }}
              >
                What You Get
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {product.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      ...body,
                      fontSize: 14,
                      paddingLeft: 24,
                      position: "relative",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 6,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#000">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* File size note */}
              <div
                style={{
                  marginTop: 22,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                📦 Download size: <span style={{ color: "#fff" }}>{product.fileSize}</span>
                {product.largeFileWarning && (
                  <div style={{ marginTop: 6, color: PURPLE }}>
                    ⚠ Large file — recommended on Wi-Fi
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Trust pills row ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 10,
            padding: isMobile ? "0 16px 36px" : "0 60px 50px",
          }}
        >
          {[
            "100% Royalty-Free",
            "Instant Email Delivery",
            "Lifetime Re-Downloads",
            "Real Released Project",
          ].map((text) => (
            <span
              key={text}
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "6px 14px",
                border: "1px solid rgba(0,229,255,0.2)",
                borderRadius: 20,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(0,229,255,0.04)",
              }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* ═══ Related Products ═══ */}
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
              {relatedProducts.map((p) => (
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
                    transition: "border-color 0.2s",
                  }}
                >
                  <div
                    style={{
                      ...label(p.badgeColor === "purple" ? PURPLE : CYAN),
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
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      color: p.badgeColor === "purple" ? PURPLE : CYAN,
                      letterSpacing: "0.04em",
                    }}
                  >
                    ${p.price} {p.currency}
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Link
                to="/shop"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  border: `1px solid ${CYAN}`,
                  borderRadius: 6,
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: CYAN,
                  textDecoration: "none",
                }}
              >
                ← Back to Shop
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer
        style={{
          padding: "28px 40px",
          background: "#02020a",
          borderTop: "1px solid #0d0d18",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          © 2026 Steven Angel ·{" "}
          <Link
            to="/"
            style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}
          >
            stevenangel.com
          </Link>
        </span>
      </footer>
    </div>
  );
}
