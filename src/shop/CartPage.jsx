/**
 * /shop/cart — minimal on-brand cart drawer/page.
 *
 * Per Steven 2026-06-07: this page ONLY shows items + coupon + total + the
 * "Check out" CTA. All payment forms, trust signals, and credibility lines
 * live on /shop/checkout (white, Shopify-style) — kept off the cart so the
 * cart stays on-brand dark and focused.
 *
 * Auto-applies WELCOME15 for first-time visitors (cookie-based via the
 * `shop_cart_visited` flag + the existing discount-popup flag).
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { trackBeginCheckout } from "../lib/analytics/events";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const CYAN = "#00E5FF";
const BG = "#080810";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartPage() {
  const { cart, removeFromCart, cartTotal } = useCart();
  const { user, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [checkoutStatus, setCheckoutStatus] = useState("idle"); // idle | redirecting | needs-email | error
  const [guestEmail, setGuestEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState(null);

  // Auto-apply WELCOME15 for first-time visitors. Survives reload via
  // localStorage. Steven 2026-06-07 — biggest single conversion lever
  // per the Marketing brief.
  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    const popupSeen = localStorage.getItem("shop_discount_popup_seen");
    const cartFirstVisit = !localStorage.getItem("shop_cart_visited");
    if (popupSeen || cartFirstVisit) {
      try { localStorage.setItem("shop_cart_visited", "1"); } catch { /* noop */ }
      return "WELCOME15";
    }
    return "";
  });
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    document.title = "Cart | Steven Angel Shop";
  }, []);

  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const subtotal = round2(cartTotal);
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  // Steven 2026-06-07: redirect straight to Airwallex Payment Link — their
  // hosted page, their design, all payment methods. No more /shop/checkout
  // (kept as fallback route but no longer the primary entry point).
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const emailValid = !!user || (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail));
    if (!emailValid) {
      setCheckoutStatus("needs-email");
      return;
    }

    setCheckoutStatus("redirecting");
    setCheckoutError(null);
    try { trackBeginCheckout({ id: "cart", name: "Cart", price: total, currency: "USD" }); } catch { /* analytics never blocks */ }

    try {
      const headers = { "Content-Type": "application/json" };
      if (user && token) headers.Authorization = `Bearer ${token}`;
      const body = {
        productIds: cart.map((it) => it.id),
        couponCode: couponCode || null,
      };
      if (!user) body.email = guestEmail;

      const res = await fetch(`${BACKEND}/shop/checkout/airwallex-link`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Checkout failed (${res.status})`);
      }
      // Hand off to Airwallex's hosted page.
      window.location.href = data.url;
    } catch (err) {
      setCheckoutStatus("error");
      setCheckoutError(err.message);
    }
  };

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
        <Link to="/shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
          &larr; Continue Shopping
        </Link>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 24px 80px" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: isMobile ? 32 : 42, textTransform: "uppercase",
          letterSpacing: "0.04em", marginBottom: 32, lineHeight: 1.1,
        }}>
          Your <span style={{ color: CYAN }}>Cart</span>
          {cart.length > 0 && (
            <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", marginLeft: 12, fontWeight: 600 }}>
              ({cart.length} {cart.length === 1 ? "item" : "items"})
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
              Your cart is empty
            </div>
            <Link to="/shop" style={{
              display: "inline-block", padding: "14px 32px", background: CYAN, color: "#000",
              borderRadius: 50, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
            }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={{
              background: "linear-gradient(135deg, #0a0a20, #0d0418)",
              border: "1px solid rgba(0,229,255,0.18)",
              borderRadius: 14,
              padding: isMobile ? "12px 16px" : "16px 24px",
              marginBottom: 20,
            }}>
              {cart.map((item, i) => (
                <div key={item.id} style={{
                  display: "flex", gap: 16, padding: "16px 0",
                  borderBottom: i < cart.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  alignItems: "center",
                }}>
                  <Link to={`/shop/${item.slug}`} style={{ flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} width="120" height="66" style={{
                      width: isMobile ? 72 : 100, height: "auto", borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/shop/${item.slug}`} style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: isMobile ? 15 : 17, textTransform: "uppercase",
                      letterSpacing: "0.03em", color: "#fff", textDecoration: "none",
                      display: "block", marginBottom: 4,
                    }}>
                      {item.name}
                    </Link>
                    {item.headline && !isMobile && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
                        {item.headline}
                      </div>
                    )}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "none", border: "none", color: "rgba(255,255,255,0.35)",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 11, cursor: "pointer",
                        padding: 0, textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                    fontSize: isMobile ? 20 : 24, color: CYAN, whiteSpace: "nowrap",
                  }}>
                    ${item.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon — minimal */}
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
                placeholder="Enter coupon code"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                  color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  letterSpacing: "0.05em", boxSizing: "border-box", outline: "none",
                }}
              />
            </div>

            {/* Totals */}
            <div style={{
              padding: "16px 0", marginBottom: 24,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}>
              {discount > 0 && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  color: CYAN, marginBottom: 8,
                }}>
                  <span>Discount ({couponCode})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
              }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 16, color: "rgba(255,255,255,0.85)",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 36, color: CYAN,
                }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Guest email — only when no logged-in user and we're about to redirect.
                Steven 2026-06-07: Airwallex's hosted page collects card details
                etc, but we still need an email for download delivery + receipt. */}
            {!user && (
              <div style={{ marginBottom: 12 }}>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => { setGuestEmail(e.target.value); if (checkoutStatus === "needs-email") setCheckoutStatus("idle"); }}
                  placeholder="Email for download link"
                  autoComplete="email"
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${checkoutStatus === "needs-email" ? "rgba(255,80,80,0.6)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 8,
                    color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    boxSizing: "border-box", outline: "none",
                  }}
                />
                {checkoutStatus === "needs-email" && (
                  <div style={{ marginTop: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ff8080" }}>
                    Please enter a valid email so we can send your download.
                  </div>
                )}
              </div>
            )}

            {/* CTA — redirects to Airwallex's hosted page */}
            <button
              onClick={handleCheckout}
              disabled={authLoading || checkoutStatus === "redirecting"}
              style={{
                width: "100%", padding: "18px 24px",
                background: CYAN, color: "#000",
                border: "none", borderRadius: 8,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 16, letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: (authLoading || checkoutStatus === "redirecting") ? "default" : "pointer",
                opacity: (authLoading || checkoutStatus === "redirecting") ? 0.6 : 1,
                transition: "transform 120ms, box-shadow 120ms",
                boxShadow: "0 8px 24px rgba(0,229,255,0.18)",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {checkoutStatus === "redirecting"
                ? "Redirecting to secure checkout…"
                : `Check out — $${total.toFixed(2)}`}
            </button>

            {checkoutError && (
              <div style={{
                marginTop: 12, padding: "10px 14px",
                background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)",
                borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#ff8080",
              }}>
                {checkoutError}
              </div>
            )}

            <div style={{
              marginTop: 12, textAlign: "center",
              fontFamily: "'DM Sans', sans-serif", fontSize: 11,
              color: "rgba(255,255,255,0.45)",
            }}>
              Secure checkout hosted by Airwallex — Card · Apple Pay · Google Pay · PayPal
            </div>

            <Link to="/shop" style={{
              display: "block", textAlign: "center", marginTop: 18,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              color: "rgba(255,255,255,0.5)", textDecoration: "none",
            }}>
              &larr; Add more items
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
