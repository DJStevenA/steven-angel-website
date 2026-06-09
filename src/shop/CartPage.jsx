/**
 * /shop/cart — on-brand cart with full credibility stack.
 *
 * Steven 2026-06-08 night:
 *  - Clear Cart link below items
 *  - Primary CTA = big yellow PayPal Smart Button (CartCheckoutButton)
 *    with "Start with PayPal" eyebrow label above
 *  - Secondary CTA = small "Other Payment Options" text link → /shop/checkout-v2
 *  - Credibility row: "Secure Payment via PayPal & Airwallex" + SSL +
 *    payment-method logo strip (Visa/MC/Amex/Apple Pay/Google Pay)
 *  - Removed "Lifetime access" trust line (kept Instant Download)
 *  - WELCOME15 is no longer auto-applied — coupon field stays for manual entry
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { trackBeginCheckout, trackAddToCart } from "../lib/analytics/events";
import CartCheckoutButton from "./CartCheckoutButton.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";
import { getOrderedProducts } from "./products.js";

const CYAN = "#00E5FF";
const BG = "#080810";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
  useAuth(); // ensure auth context is available even though we don't gate on it
  const navigate = useNavigate();

  // Coupon field — manual entry only (Steven 2026-06-08 night: no auto-apply).
  const [couponCode, setCouponCode] = useState("");
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

  const handleSuccess = (json) => {
    if (json?.token) {
      try { localStorage.setItem("shop_last_purchase", JSON.stringify({ token: json.token, productIds, items: cart.map(i => ({ name: i.name, price: i.price })), total, email: json.email })); } catch {}
    }
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

            {/* Clear cart — Steven 2026-06-08 night */}
            {cart.length > 1 && (
              <div style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove all items from cart?")) clearCart();
                  }}
                  style={{
                    background: "none", border: "none", padding: "4px 6px",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                    color: "rgba(255,255,255,0.4)", cursor: "pointer",
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}
                >
                  Clear cart
                </button>
              </div>
            )}

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

            {/* ─── Primary CTA — Start with PayPal ─── */}
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 11, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
              marginBottom: 8, textAlign: "center",
            }}>
              Start with PayPal
            </div>
            <CartCheckoutButton
              productIds={productIds}
              couponCode={couponCode}
              onSuccess={handleSuccess}
            />

            {/* ─── Secondary CTA — Other Payment Options ─── */}
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button
                type="button"
                onClick={() => {
                  try { localStorage.setItem("shop_active_coupon", couponCode || ""); } catch { /* noop */ }
                  navigate("/shop/checkout-v2");
                }}
                style={{
                  background: "none", border: "none", padding: "4px 6px",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                  color: "rgba(255,255,255,0.6)", cursor: "pointer",
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}
              >
                Other Payment Options &rarr;
              </button>
            </div>

            {/* ─── Credibility row ─── */}
            <div style={{
              marginTop: 22, padding: "16px 18px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
            }}>
              {/* SSL + processors line */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, flexWrap: "wrap",
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: "rgba(255,255,255,0.7)", marginBottom: 10,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secure Payment via PayPal &amp; Airwallex</span>
              </div>

              {/* Payment method logo strip */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, flexWrap: "wrap", marginBottom: 10,
              }}>
                <img src="https://cdn.brandfolder.io/KGT2DTA4/at/8vbr53cc46qd9hbv-visa.svg" alt="Visa" height="22" style={{ height: 22, borderRadius: 3 }} />
                <img src="https://cdn.brandfolder.io/KGT2DTA4/at/nbhf4m638kk6b9g4-mastercard.svg" alt="Mastercard" height="22" style={{ height: 22, borderRadius: 3 }} />
                <img src="https://cdn.brandfolder.io/KGT2DTA4/at/rh7krq4p-amex.svg" alt="Amex" height="22" style={{ height: 22, borderRadius: 3 }} />
                <img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" alt="PayPal" height="22" style={{ height: 22, borderRadius: 3 }} />
                <img src="https://developer.apple.com/assets/elements/icons/apple-pay/apple-pay.svg" alt="Apple Pay" height="22" style={{ height: 22, background: "#000", borderRadius: 3, padding: "2px 6px" }} />
                <img src="https://developers.google.com/static/pay/api/images/brand-guidelines/google-pay-mark.png" alt="Google Pay" height="22" style={{ height: 22, borderRadius: 3 }} />
              </div>

              {/* SSL/Encryption micro line */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 14, flexWrap: "wrap",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                color: "rgba(255,255,255,0.45)",
              }}>
                <span>🔒 256-bit SSL</span>
                <span>⚡ Instant download</span>
                <span>↺ 7-day refund</span>
              </div>
            </div>

            {/* ─── Upsell — "Complete Your Studio" ─── */}
            {(() => {
              const cartIds = new Set(cart.map(i => i.id));
              const suggestions = getOrderedProducts()
                .filter(p => p.enabled && !cartIds.has(p.id) && p.id !== "test-1-dollar")
                .slice(0, 3);
              if (suggestions.length === 0) return null;
              return (
                <div style={{ marginTop: 24 }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)", marginBottom: 12,
                  }}>
                    Complete Your Studio
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {suggestions.map(p => (
                      <div key={p.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 8,
                      }}>
                        <Link to={`/shop/${p.slug}`} style={{ flexShrink: 0 }}>
                          <img src={p.image} alt={p.name} width="52" height="52" style={{
                            width: 52, height: 52, objectFit: "cover", borderRadius: 6,
                            border: "1px solid rgba(255,255,255,0.08)",
                          }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={`/shop/${p.slug}`} style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                            fontSize: 13, textTransform: "uppercase", letterSpacing: "0.03em",
                            color: "#fff", textDecoration: "none", display: "block",
                          }}>
                            {p.name}
                          </Link>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {p.headline}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                            fontSize: 16, color: CYAN,
                          }}>
                            ${p.price}
                          </div>
                          <button
                            onClick={() => { addToCart(p); trackAddToCart(p); }}
                            style={{
                              background: "none", border: `1px solid ${CYAN}`, borderRadius: 4,
                              color: CYAN, fontFamily: "'DM Sans', sans-serif",
                              fontSize: 10, fontWeight: 600, padding: "3px 8px",
                              cursor: "pointer", marginTop: 2,
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

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
