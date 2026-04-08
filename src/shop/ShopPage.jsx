import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrderedProducts } from "./products.js";
import ProductCard from "./ProductCard.jsx";
import DiscountPopup from "./DiscountPopup.jsx";
import { useAuth } from "./AuthContext.jsx";

/* ─── Color Constants (matches BRAND_GUIDE.md) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

/* ─── Style Helpers ─── */
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
  color: "rgba(255,255,255,0.6)",
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

export default function ShopPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const products = getOrderedProducts();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Phase 1: Buy button just shows alert. Phase 4 will integrate PayPal.
  const handleBuy = (product) => {
    alert(
      `Coming soon!\n\n${product.name} — $${product.price} ${product.currency}\n\nPayPal checkout will be available shortly.`
    );
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      {/* Welcome discount popup (shows once per visitor) */}
      <DiscountPopup />

      {/* Hidden H1 for SEO — long-tail keywords mixed in */}
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Afro House Ableton Templates, Melodic Techno Project Files & Online Masterclass — Hugel, Claptone, Keinemusik, Solomun & Artbat Style — Steven Angel Shop
      </h1>

      {/* Hidden H2 (also screen-reader only) — secondary keyword cluster */}
      <h2
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Premium Ableton Live project files download — Afro House, Melodic Techno, Tech House, Indie Dance — released on MTGD, Moblack, Godeeva
      </h2>

      {/* ═══ Top Logo Bar (with auth button) ═══ */}
      <div
        style={{
          padding: isMobile ? "20px 20px 0" : "24px 60px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <a
          href="/"
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
        </a>

        {/* Sign in / My Account button — hidden during initial auth load to avoid flicker */}
        {!authLoading && (
          <Link
            to={user ? "/shop/account" : "/shop/login"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: user ? "rgba(0,229,255,0.08)" : "transparent",
              border: `1px solid ${user ? CYAN : "rgba(255,255,255,0.2)"}`,
              color: user ? CYAN : "rgba(255,255,255,0.85)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 11 : 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: isMobile ? "7px 14px" : "9px 18px",
              borderRadius: 4,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {user ? (isMobile ? "Account" : "My Account") : "Sign In"}
          </Link>
        )}
      </div>

      <main>
        {/* ═══ Hero Section ═══ */}
        <section
          style={{
            padding: isMobile ? "50px 20px 30px" : "70px 60px 40px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ ...label(CYAN), marginBottom: 20 }}>SHOP</div>
            <div style={{ ...heading(isMobile ? 36 : 56), marginBottom: 16 }}>
              Ableton Templates &<br />
              <span style={{ color: CYAN }}>Afro House Masterclass</span>
            </div>
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 16 : 22,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.7)",
                marginBottom: 28,
              }}
            >
              Real Sessions From a Signed Artist · Instant Download
            </div>
            <div style={{ ...body, maxWidth: 640, margin: "0 auto" }}>
              Production templates and a video masterclass by{" "}
              <span style={{ color: CYAN, fontWeight: 600 }}>Steven Angel</span> — released on{" "}
              <span style={{ color: PURPLE, fontWeight: 600 }}>MTGD, Moblack, Godeeva, Sony</span>
              . The exact sessions used for tracks played by{" "}
              <span style={{ color: CYAN, fontWeight: 600 }}>Hugel, Claptone, and ARTBAT</span>.
            </div>
          </div>
        </section>

        {/* ═══ Shop-wide SEO category pills (keyword-rich, replaces generic trust pills) ═══ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
            padding: isMobile ? "0 16px 30px" : "0 60px 40px",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {[
            "Afro House Templates",
            "Melodic Techno Templates",
            "Ableton Live Projects",
            "Hugel Style",
            "Keinemusik Style",
            "Solomun Style",
            "Artbat Style",
            "Sample Packs",
            "Online Masterclass",
            "Royalty-Free",
          ].map((text) => (
            <span
              key={text}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 500,
                fontSize: 11,
                padding: "5px 12px",
                border: "1px solid rgba(0,229,255,0.18)",
                borderRadius: 20,
                color: "rgba(255,255,255,0.65)",
                background: "rgba(0,229,255,0.04)",
              }}
            >
              {text}
            </span>
          ))}
        </div>

        {/* ═══ Products Grid ═══ */}
        <section
          style={{
            padding: isMobile ? "0 16px 60px" : "0 60px 80px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }} data-shop-grid="true">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
                gap: isMobile ? 20 : 24,
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isMobile={isMobile}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ / Trust Section ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: BG_ALT,
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div
              style={{
                ...heading(isMobile ? 26 : 36),
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              How It Works
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: isMobile ? 20 : 32,
              }}
            >
              {[
                {
                  num: "1",
                  title: "Choose & Pay",
                  desc: "Pick your template or course. Pay securely with PayPal or credit card.",
                },
                {
                  num: "2",
                  title: "Instant Email",
                  desc: "Receive your private download link in your inbox within seconds.",
                },
                {
                  num: "3",
                  title: "Lifetime Access",
                  desc: "Create a free account to re-download anytime. No expiry, no limits.",
                },
              ].map((step) => (
                <div key={step.num} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: 20,
                      margin: "0 auto 16px",
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                      color: "#fff",
                    }}
                  >
                    {step.title}
                  </div>
                  <div style={{ ...body, fontSize: 13 }}>{step.desc}</div>
                </div>
              ))}
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
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 8,
          }}
        >
          Looking for ghost production?{" "}
          <a href="/ghost" style={{ color: CYAN, textDecoration: "none" }}>
            Visit the Ghost page
          </a>
        </div>
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          © 2026 Steven Angel ·{" "}
          <a href="/" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>
            stevenangel.com
          </a>
        </span>
      </footer>
    </div>
  );
}
