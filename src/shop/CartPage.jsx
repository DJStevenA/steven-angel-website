/**
 * /shop/cart — on-brand cart.
 *
 * Steven 2026-06-09 (latest):
 *  - Clear Cart link below items
 *  - Primary CTA = big yellow PayPal Smart Button (CartCheckoutButton)
 *    with "Start with PayPal" eyebrow label above
 *  - Secondary CTA = big "Other Payment Options" button → /shop/checkout-v2
 *  - Bundle discount (15% off each when 3+ items in cart)
 *  - WELCOME15 is no longer auto-applied — coupon field stays for manual entry
 *  - Credibility row REMOVED 2026-06-09 (felt cluttered).
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

    // ── Prefetch checkout-v2 dependencies on idle ─────────────────────────
    // Steven 2026-06-09: mobile users see Airwallex Drop-in load slowly
    // because the SDK script (~250KB) + the iframe start downloading only
    // AFTER they click "Other Payment Options" or PayPal succeeds. By the
    // time they're on the cart page they're very likely to go to checkout
    // next, so we warm the cache here. Three pieces:
    //   1. Airwallex Elements SDK (~250KB JS)
    //   2. CheckoutV2Page bundle (the React route component)
    //   3. Pre-warm a HEAD request to api.airwallex.com (TLS handshake)
    // Wrapped in requestIdleCallback so it never competes with cart paint.
    const prefetchCheckoutDeps = () => {
      const head = document.head;
      // Airwallex Elements SDK
      if (!document.querySelector('link[data-prefetch="awx-sdk"]')) {
        const l = document.createElement("link");
        l.rel = "prefetch";
        l.as = "script";
        l.href = "https://checkout.airwallex.com/assets/elements.bundle.min.js";
        l.crossOrigin = "anonymous";
        l.setAttribute("data-prefetch", "awx-sdk");
        head.appendChild(l);
      }
      // CheckoutV2Page route bundle — Vite emits a CheckoutV2Page-<hash>.js
      // chunk; scrape its URL from existing <link rel="modulepreload"> tags
      // that Vite already wrote for other lazy routes (they all share the
      // same hashed filename pattern).
      try {
        const cv2 = Array.from(document.querySelectorAll('link[rel="modulepreload"]'))
          .map(el => el.href)
          .find(h => /CheckoutV2Page-[A-Za-z0-9_-]+\.js$/.test(h));
        // If not preloaded yet, manually trigger a fetch to warm the chunk.
        // (Vite normally only emits modulepreload for current route, not
        //  future navigations.)
        if (!cv2) {
          // Find any asset hash to construct the URL — easier approach:
          // dynamic import the route component. React will lazy-resolve.
          import(/* webpackChunkName: "checkout-v2" */ "./CheckoutV2Page.jsx").catch(() => {});
        }
      } catch { /* noop */ }
    };
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
    const cancelRic = window.cancelIdleCallback || clearTimeout;
    const handle = ric(prefetchCheckoutDeps, { timeout: 2000 });
    return () => { try { cancelRic(handle); } catch { /* noop */ } };
  }, []);

  // Fire begin_checkout once when cart loads with items (analytics)
  useEffect(() => {
    if (cart.length > 0) {
      try { trackBeginCheckout({ id: "cart", name: "Cart", price: cartTotal, currency: "USD" }); } catch { /* analytics never blocks */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bundle discount — Steven 2026-06-08 night: when cart has 3+ items,
  // auto-apply 15% off each item. Shown as strikethrough per-item price +
  // explicit "Bundle discount" line in totals. Does NOT stack with coupons
  // (we use whichever is larger — both currently 15%).
  const BUNDLE_THRESHOLD = 3;
  const BUNDLE_PERCENT = 15;
  const bundleActive = cart.length >= BUNDLE_THRESHOLD;
  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const couponPercent = coupon?.percentOff || 0;
  const effectivePercent = Math.max(bundleActive ? BUNDLE_PERCENT : 0, couponPercent);
  const subtotal = round2(cartTotal);
  const discount = round2(subtotal * (effectivePercent / 100));
  const total = round2(subtotal - discount);
  const discountLabel = bundleActive && effectivePercent === BUNDLE_PERCENT
    ? `Bundle discount (${BUNDLE_PERCENT}% — 3+ items)`
    : `Discount (${couponCode})`;

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
              {cart.map((item, i) => {
                const itemDiscounted = bundleActive
                  ? round2(item.price * (1 - BUNDLE_PERCENT / 100))
                  : item.price;
                return (
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
                    display: "flex", flexDirection: "column", alignItems: "flex-end",
                    whiteSpace: "nowrap", lineHeight: 1.1,
                  }}>
                    {bundleActive && (
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: isMobile ? 12 : 13,
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "line-through",
                        marginBottom: 2,
                      }}>
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                      fontSize: isMobile ? 20 : 24, color: bundleActive ? "#84ffac" : CYAN,
                    }}>
                      ${itemDiscounted.toFixed(2)}
                    </span>
                  </div>
                </div>
                );
              })}

              {/* Bundle nudge — appears 1 item shy of trigger to encourage adding */}
              {!bundleActive && cart.length === BUNDLE_THRESHOLD - 1 && (
                <div style={{
                  marginTop: 4, padding: "10px 14px",
                  background: "linear-gradient(90deg, rgba(132,255,172,0.10), rgba(0,229,255,0.08))",
                  border: "1px dashed rgba(132,255,172,0.45)", borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12.5,
                  color: "#a8ffc4", textAlign: "center",
                }}>
                  🎁 Add 1 more item to unlock <b>15% off everything</b>
                </div>
              )}
              {bundleActive && (
                <div style={{
                  marginTop: 4, padding: "8px 14px",
                  background: "rgba(132,255,172,0.08)",
                  border: "1px solid rgba(132,255,172,0.35)", borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12.5,
                  color: "#84ffac", textAlign: "center",
                }}>
                  ✓ Bundle discount active — 15% off each item
                </div>
              )}
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
                <>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: "rgba(255,255,255,0.55)", marginBottom: 6,
                  }}>
                    <span>Subtotal</span>
                    <span style={{ textDecoration: "line-through" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    color: bundleActive ? "#84ffac" : CYAN, marginBottom: 8,
                  }}>
                    <span>{discountLabel}</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                </>
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

            {/* ─── Secondary CTA — Other Payment Options (big button) ─── */}
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem("shop_active_coupon", couponCode || ""); } catch { /* noop */ }
                navigate("/shop/checkout-v2");
              }}
              style={{
                display: "block", width: "100%",
                padding: "14px 22px", marginTop: 14,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.28)",
                borderRadius: 8,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 14, letterSpacing: "0.18em",
                textTransform: "uppercase", color: "#fff", cursor: "pointer",
              }}
            >
              Other Payment Options
            </button>

            {/* Credibility row removed by Steven 2026-06-09 — felt cluttered. */}

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

// Payment method logo components removed 2026-06-09 — Steven cut the
// credibility row from the cart, so these are no longer referenced.
