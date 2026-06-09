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

    // ── Pre-warm checkout-v2 on idle ──────────────────────────────────────
    // Steven 2026-06-09: Drop-in feels slow even after prefetch. So we go
    // further: while the user is browsing the cart we
    //   (1) prefetch the Airwallex Elements SDK script
    //   (2) prefetch the CheckoutV2Page React chunk
    //   (3) PRE-CREATE the payment intent on the backend
    //   (4) ALSO inject the SDK <script> tag right away so init can happen
    // sessionStorage carries the warmed intent forward to checkout-v2 so
    // it doesn't re-call the backend on mount.
    let intentAbort = new AbortController();
    const prewarmCheckout = () => {
      const head = document.head;

      // (1) Airwallex Elements SDK — fetch
      if (!document.querySelector('link[data-prefetch="awx-sdk"]')) {
        const l = document.createElement("link");
        l.rel = "prefetch";
        l.as = "script";
        l.href = "https://checkout.airwallex.com/assets/elements.bundle.min.js";
        l.crossOrigin = "anonymous";
        l.setAttribute("data-prefetch", "awx-sdk");
        head.appendChild(l);
      }

      // (1b) ALSO inject the script tag itself — this way window.Airwallex
      // is ready by the time the user lands on checkout-v2. Idempotent: if
      // it's already on the page (e.g. user came back) we skip.
      if (!window.Airwallex && !document.querySelector('script[data-awx-script]')) {
        const s = document.createElement("script");
        s.src = "https://checkout.airwallex.com/assets/elements.bundle.min.js";
        s.async = true;
        s.setAttribute("data-awx-script", "1");
        document.body.appendChild(s);
      }

      // (2) CheckoutV2Page route chunk via dynamic import
      try {
        import("./CheckoutV2Page.jsx").catch(() => {});
      } catch { /* noop */ }

      // (3) Pre-create the Airwallex payment intent. Cache key includes the
      // exact cart contents + active coupon so a cart change invalidates it.
      try {
        if (cart.length === 0) return;
        const cacheKey = `awx_intent_${productIds.join(",")}_${couponCode || ""}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // 8-minute TTL — Airwallex intents expire after ~10min, leave buffer
          if (parsed && parsed.savedAt && (Date.now() - parsed.savedAt) < 8 * 60 * 1000) {
            return; // still fresh, no need to refetch
          }
        }
        fetch("https://ghost-backend-production-adb6.up.railway.app/shop/checkout/airwallex-cart-anon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds, couponCode: couponCode || null }),
          signal: intentAbort.signal,
        })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (!data) return;
            sessionStorage.setItem(cacheKey, JSON.stringify({ ...data, savedAt: Date.now() }));
          })
          .catch(() => { /* aborted or network — fall back to checkout-v2's own fetch */ });
      } catch { /* noop */ }
    };

    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
    const cancelRic = window.cancelIdleCallback || clearTimeout;
    const handle = ric(prewarmCheckout, { timeout: 2000 });
    return () => {
      try { cancelRic(handle); } catch { /* noop */ }
      try { intentAbort.abort(); } catch { /* noop */ }
    };
    // Re-run if cart contents or coupon changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(","), couponCode]);

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

              {/* Payment method logos — inline SVG so they NEVER 404.
                  Steven 2026-06-09: previous CDN-hosted versions (brandfolder)
                  returned 404 and showed broken images on the cart. */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, flexWrap: "wrap", marginBottom: 10,
              }}>
                <PayLogoVisa />
                <PayLogoMastercard />
                <PayLogoAmex />
                <PayLogoPayPal />
                <PayLogoApplePay />
                <PayLogoGooglePay />
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

// ── Payment method logos ────────────────────────────────────────────────────
// Inline SVG so they're zero-byte over the wire (bundled in JS) and can never
// 404 the way the previous CDN-hosted images did. Steven 2026-06-09.

const LOGO_BOX = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 24, padding: "0 6px", borderRadius: 3,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#fff",
  boxSizing: "border-box",
};

function PayLogoVisa() {
  return (
    <span style={LOGO_BOX} aria-label="Visa" title="Visa">
      <svg width="38" height="14" viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="13" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="14" fontStyle="italic" fill="#1A1F71" letterSpacing="0">VISA</text>
      </svg>
    </span>
  );
}

function PayLogoMastercard() {
  return (
    <span style={LOGO_BOX} aria-label="Mastercard" title="Mastercard">
      <svg width="32" height="20" viewBox="0 0 32 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="10" r="7" fill="#EB001B" />
        <circle cx="20" cy="10" r="7" fill="#F79E1B" />
        <path d="M16 4.8a7 7 0 010 10.4 7 7 0 010-10.4z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

function PayLogoAmex() {
  return (
    <span style={{ ...LOGO_BOX, background: "#016FD0" }} aria-label="American Express" title="American Express">
      <svg width="30" height="14" viewBox="0 0 40 14" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="11" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="11" fill="#fff" letterSpacing="0.5">AMEX</text>
      </svg>
    </span>
  );
}

function PayLogoPayPal() {
  return (
    <span style={LOGO_BOX} aria-label="PayPal" title="PayPal">
      <svg width="48" height="14" viewBox="0 0 60 16" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fontStyle="italic" fill="#003087">Pay</text>
        <text x="22" y="13" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fontStyle="italic" fill="#009CDE">Pal</text>
      </svg>
    </span>
  );
}

function PayLogoApplePay() {
  return (
    <span style={{ ...LOGO_BOX, background: "#000" }} aria-label="Apple Pay" title="Apple Pay">
      <svg width="42" height="16" viewBox="0 0 52 18" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        {/* Apple logo */}
        <path d="M8.4 3.2c.5-.6.8-1.4.7-2.2-.7 0-1.5.4-2 1-.5.5-.9 1.3-.7 2.1.7 0 1.5-.4 2-.9zm.6 1c-1.1-.1-2 .6-2.6.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.2-.3 5.4.9 7.2.6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1.1 0 1.4.6 2.3.5.9 0 1.6-.9 2.2-1.7.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.7-.9-1.2-2.1-1.4-2.7-1.4z" />
        {/* "Pay" text */}
        <text x="16" y="13" fontFamily="-apple-system, Helvetica Neue, sans-serif" fontWeight="600" fontSize="11" fill="#fff">Pay</text>
      </svg>
    </span>
  );
}

function PayLogoGooglePay() {
  return (
    <span style={LOGO_BOX} aria-label="Google Pay" title="Google Pay">
      <svg width="46" height="16" viewBox="0 0 60 18" xmlns="http://www.w3.org/2000/svg">
        {/* G */}
        <path d="M9.5 9c0-.5-.04-1-.13-1.46H5v2.76h2.55a2.18 2.18 0 01-.94 1.44v1.2h1.52A4.62 4.62 0 009.5 9z" fill="#4285F4" />
        <path d="M5 13.5c1.27 0 2.34-.42 3.13-1.14l-1.52-1.2c-.42.28-.96.45-1.6.45-1.24 0-2.28-.84-2.66-1.96H.78v1.24A4.7 4.7 0 005 13.5z" fill="#34A853" />
        <path d="M2.34 9.65a2.78 2.78 0 010-1.79V6.62H.78A4.65 4.65 0 00.3 8.75c0 .76.18 1.48.48 2.13l1.56-1.23z" fill="#FBBC04" />
        <path d="M5 5.9c.7 0 1.32.24 1.81.72L8.16 5.2A4.5 4.5 0 005 4 4.7 4.7 0 00.78 6.62l1.56 1.24A2.8 2.8 0 015 5.9z" fill="#EA4335" />
        {/* "Pay" */}
        <text x="14" y="12" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="11" fill="#5F6368">Pay</text>
      </svg>
    </span>
  );
}
