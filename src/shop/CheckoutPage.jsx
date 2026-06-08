/**
 * /shop/checkout/:slug — Dedicated checkout page (replaces the modal).
 *
 * Full page with:
 *   - Product name + cover image at top
 *   - "What you get" feature list
 *   - Guest email OR sign-in
 *   - Coupon input
 *   - Price breakdown
 *   - PayPal buttons (preloaded on page mount)
 *
 * The PayPal SDK starts loading as soon as the page mounts (not after
 * email entry), so buttons appear fast.
 */

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import CheckoutButton, { preloadPayPalSdk } from "./CheckoutButton.jsx";
import { getProductBySlug } from "./products.js";
import { trackBeginCheckout, trackViewItem } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

const COUPONS_CLIENT = {
  WELCOME15: { percentOff: 15 },
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

function computePricing(basePrice, couponCode) {
  if (!couponCode) return { base: round2(basePrice), discount: 0, final: round2(basePrice) };
  const coupon = COUPONS_CLIENT[couponCode.toUpperCase()];
  if (!coupon) return { base: round2(basePrice), discount: 0, final: round2(basePrice) };
  const discount = round2(basePrice * (coupon.percentOff / 100));
  return { base: round2(basePrice), discount, final: round2(basePrice - discount) };
}

export default function CheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const product = getProductBySlug(slug);

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("shop_discount_popup_seen") ? "WELCOME15" : "";
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Preload PayPal SDK immediately on mount
  useEffect(() => {
    preloadPayPalSdk();
  }, []);

  // Analytics
  useEffect(() => {
    if (!product) return;
    document.title = `Checkout — ${product.name} | Steven Angel`;
    trackViewItem(product);
    trackBeginCheckout(product);
    if (window.clarity) {
      window.clarity("event", "checkoutPageView");
      window.clarity("set", "checkoutProduct", product.name);
      window.clarity("upgrade", "checkout");
    }
  }, [product]);

  if (!product) {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 40 }}>
        <div style={{ fontSize: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>Product not found</div>
        <Link to="/shop" style={{ color: CYAN, textDecoration: "underline" }}>Back to Shop</Link>
      </div>
    );
  }

  const isPurple = product.badgeColor === "purple";
  const accent = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";
  const pricing = computePricing(product.price, couponCode);
  const emailValid = guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const showPaypal = user || emailValid;

  const handleSuccess = () => {
    setStatus("success");
    if (window.clarity) {
      window.clarity("event", "purchaseComplete");
      window.clarity("set", "conversion_type", "purchase_shop");
    }
  };

  if (status === "success") {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>&#10003;</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
            Thank You!
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 24 }}>
            Your purchase of <strong style={{ color: accent }}>{product.name}</strong> is confirmed.
            {user
              ? " Head to your account to download."
              : " Check your email for the download link and account setup."}
          </div>
          <Link
            to={user ? "/shop/account" : "/shop"}
            style={{
              display: "inline-block",
              padding: "14px 32px",
              background: accent,
              color: "#000",
              borderRadius: 50,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            {user ? "Go to My Account" : "Back to Shop"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 4vw, 48px)", height: 64,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link to="/" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", textDecoration: "none", color: "#fff" }}>
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
        <Link to={`/shop/${product.slug}`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
          &larr; Back to Product
        </Link>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 48 }}>

          {/* ── Left: Product Info ── */}
          <div>
            {/* Label */}
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              color: accent, marginBottom: 12,
            }}>
              Checkout
            </div>

            {/* Product image */}
            <img
              src={product.image}
              alt={product.name}
              width="1324"
              height="722"
              style={{ width: "100%", height: "auto", borderRadius: 10, marginBottom: 20, border: `1px solid ${accent}33` }}
            />

            {/* Product name */}
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: isMobile ? 28 : 34, textTransform: "uppercase",
              letterSpacing: "0.03em", lineHeight: 1.15, margin: "0 0 8px",
            }}>
              {product.name}
            </h1>

            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 24,
            }}>
              {product.headline}
            </div>

            {/* What you get */}
            {product.features && product.features.length > 0 && (
              <div style={{
                background: `rgba(${accentRgba},0.04)`,
                border: `1px solid rgba(${accentRgba},0.15)`,
                borderRadius: 10, padding: isMobile ? "16px 16px" : "20px 22px",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: accent, marginBottom: 12,
                }}>
                  What You Get
                </div>
                {product.features.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: "rgba(255,255,255,0.75)", lineHeight: 1.5, padding: "4px 0",
                  }}>
                    <span style={{ color: accent, fontSize: 14, marginTop: 1, flexShrink: 0 }}>&#10003;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Payment ── */}
          <div>
            <div style={{
              background: "linear-gradient(135deg, #0a0a20, #0d0418)",
              border: `1px solid rgba(${accentRgba},0.3)`,
              borderRadius: 14, padding: isMobile ? "24px 18px" : "32px 28px",
              position: "sticky", top: 80,
            }}>
              {/* Price */}
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                fontSize: 42, color: accent, lineHeight: 1, marginBottom: 4,
              }}>
                ${pricing.final.toFixed(2)}
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 6, fontWeight: 600 }}>USD</span>
              </div>
              {pricing.discount > 0 && (
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: accent, marginBottom: 16,
                }}>
                  <span style={{ textDecoration: "line-through", color: "rgba(255,255,255,0.4)", marginRight: 8 }}>
                    ${pricing.base.toFixed(2)}
                  </span>
                  {couponCode} applied
                </div>
              )}
              {pricing.discount === 0 && <div style={{ height: 16 }} />}

              {/* Auth state */}
              {authLoading && (
                <div style={{ padding: "20px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Loading...
                </div>
              )}

              {/* Logged in user */}
              {!authLoading && user && (
                <div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                    color: "rgba(255,255,255,0.5)", marginBottom: 16,
                  }}>
                    Signed in as <strong style={{ color: "rgba(255,255,255,0.8)" }}>{user.email}</strong>
                  </div>

                  {/* Coupon */}
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
                    placeholder="WELCOME15"
                    style={{
                      width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      letterSpacing: "0.1em", boxSizing: "border-box", marginBottom: 20, outline: "none",
                    }}
                  />

                  <CheckoutButton product={product} couponCode={couponCode} onSuccess={handleSuccess} />
                </div>
              )}

              {/* Not logged in — guest email */}
              {!authLoading && !user && (
                <div>
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    style={{
                      width: "100%", padding: "13px 14px", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      boxSizing: "border-box", marginBottom: 6, outline: "none",
                    }}
                  />
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                    color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.5,
                  }}>
                    After payment you'll get your download link + a link to set a password.
                  </div>

                  {/* Coupon */}
                  <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
                    placeholder="WELCOME15"
                    style={{
                      width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      letterSpacing: "0.1em", boxSizing: "border-box", marginBottom: 20, outline: "none",
                    }}
                  />

                  {/* PayPal buttons (show when email is valid) */}
                  {emailValid ? (
                    <CheckoutButton product={product} couponCode={couponCode} guestEmail={guestEmail} onSuccess={handleSuccess} />
                  ) : (
                    <div style={{
                      padding: "14px", textAlign: "center", background: "rgba(255,255,255,0.03)",
                      border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)",
                    }}>
                      Enter your email to continue to payment
                    </div>
                  )}

                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <Link to={`/shop/login?redirect=/shop/checkout/${slug}`} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                      color: "rgba(255,255,255,0.5)", textDecoration: "underline",
                    }}>
                      Already have an account? Sign in
                    </Link>
                  </div>
                </div>
              )}

              {/* Trust signals */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: "&#128274;", text: "Secure payment via PayPal" },
                  { icon: "&#9889;", text: "Instant download after payment" },
                  { icon: "&#8734;", text: "Lifetime access — re-download anytime" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                  }}>
                    <span dangerouslySetInnerHTML={{ __html: icon }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
