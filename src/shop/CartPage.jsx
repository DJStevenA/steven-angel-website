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
import CartCheckoutButton from "./CartCheckoutButton.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";

const CYAN = "#00E5FF";
const BG = "#080810";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  useAuth(); // ensure auth context is available even though we don't gate on it
  const navigate = useNavigate();

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
    preloadPayPalSdk();
  }, []);

  // Fire begin_checkout once when cart loads with items (analytics)
  useEffect(() => {
    if (cart.length > 0) {
      try { trackBeginCheckout({ id: "cart", name: "Cart", price: cartTotal, currency: "USD" }); } catch { /* analytics never blocks */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const subtotal = round2(cartTotal);
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  // Steven 2026-06-07 evening: PayPal Smart Buttons render inline on the cart.
  // No redirect to /shop/checkout — click PayPal, popup opens, payer email
  // comes from PayPal (cart-anon endpoint). Clear cart + go to thank-you on success.
  const productIds = cart.map((item) => item.id);

  const handleSuccess = () => {
    clearCart();
    navigate("/shop/thank-you");
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

            {/* PayPal Smart Buttons — instant cart checkout, no email gate.
                Steven 2026-06-07 evening: direct PayPal popup, payer email
                comes from PayPal after capture (cart-anon endpoint). */}
            <CartCheckoutButton
              productIds={productIds}
              couponCode={couponCode}
              onSuccess={handleSuccess}
            />

            {/* Check Out → /shop/checkout-v2 — full checkout with
                Apple Pay + Google Pay + card + Klarna + PayPal in one page.
                Steven 2026-06-07 night flow. */}
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem("shop_active_coupon", couponCode || ""); } catch { /* noop */ }
                navigate("/shop/checkout-v2");
              }}
              style={{
                width: "100%", padding: "16px 24px", marginTop: 12,
                background: CYAN, color: "#000",
                border: "none", borderRadius: 8,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: 15, letterSpacing: "0.18em",
                textTransform: "uppercase", cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,229,255,0.18)",
              }}
            >
              Check out — ${total.toFixed(2)}
            </button>

            {/* Trust signals — Steven 2026-06-07 evening */}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: "\u{1F512}", text: "Secure payment via PayPal" },
                { icon: "⚡", text: "Instant download after payment" },
                { icon: "∞", text: "Lifetime access — no subscription" },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                }}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
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
