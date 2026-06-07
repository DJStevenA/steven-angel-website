/**
 * /shop/checkout — the Shopify-style polished checkout page.
 *
 * Per Steven 2026-06-07 (with ABT/Shopify reference screenshots): cart stays
 * dark + on-brand and only shows items + total. This page is the OTHER mode:
 * white, standard, professional — the customer-trust moment. Logo top-center,
 * 2-column layout, Airwallex Drop-in for card + Apple Pay + Google Pay, and
 * PayPal alongside, with the order summary on the right.
 *
 * Flow:
 *   1. Cart page redirects here with items already in CartContext.
 *   2. Coupon comes from localStorage (set by /shop/cart's Check out button).
 *   3. Email is the one input we ask for (everything else is handled by
 *      the Airwallex Drop-in / PayPal).
 *   4. On successful Airwallex payment_intent.succeeded → server marks paid
 *      via webhook → frontend onSuccess clears cart + redirects to /shop/account.
 *
 * Why not a true Airwallex Hosted redirect: Steven asked for the page to LOOK
 * external/professional. Building it ON our domain with white styling +
 * Drop-in inside achieves the same trust signal without losing the 5-15%
 * conversion drop a true external redirect creates. Same outcome, better
 * numbers.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import CartCheckoutButton from "./CartCheckoutButton.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";
import AirwallexCheckoutCard, { preloadAirwallexSdk } from "./AirwallexCheckoutCard.jsx";

const CYAN = "#00E5FF";
const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartCheckoutPage() {
  const { cart, clearCart, cartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("shop_active_coupon") || "";
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | success
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 980 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 980);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    document.title = "Checkout | Steven Angel Shop";
    preloadAirwallexSdk();
    preloadPayPalSdk();
  }, []);

  // If user lands on /shop/checkout with empty cart, send them back.
  useEffect(() => {
    if (status === "idle" && cart.length === 0) {
      const t = setTimeout(() => navigate("/shop/cart"), 30);
      return () => clearTimeout(t);
    }
  }, [cart.length, status, navigate]);

  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const subtotal = round2(cartTotal);
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  const emailValid = !!user || (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail));

  const handleSuccess = () => {
    setStatus("success");
    clearCart();
  };

  /* ── styles (light theme, Shopify-ish) ───────────────────────────────────── */
  const PAGE_BG = "#f4f5f7";
  const CARD_BG = "#ffffff";
  const TEXT = "#1a1f2e";
  const TEXT_MUTED = "#6b7280";
  const BORDER = "#e5e7eb";
  const ACCENT = "#1a1f2e"; // black-ish accent for primary CTA on light bg

  const sectionLabel = {
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    color: TEXT,
    margin: "0 0 14px",
  };
  const subtleNote = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 14,
  };
  const inputStyle = {
    width: "100%",
    padding: "14px 14px",
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    color: TEXT,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
  };

  /* ── Success screen ───────────────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div style={{ background: PAGE_BG, minHeight: "100vh", color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 460, background: CARD_BG, padding: "48px 32px", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 56, color: "#10b981", marginBottom: 16 }}>&#10003;</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: 28, marginBottom: 12,
          }}>
            Payment successful
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: TEXT_MUTED, lineHeight: 1.6, marginBottom: 28 }}>
            Your purchase is confirmed.
            {user ? " Head to your account to download your files." : " Check your email for the download link."}
          </div>
          <Link to={user ? "/shop/account" : "/shop"} style={{
            display: "inline-block", padding: "14px 32px", background: ACCENT, color: "#fff",
            borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            fontSize: 14, textDecoration: "none",
          }}>
            {user ? "Go to my account" : "Back to shop"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: PAGE_BG, minHeight: "100vh", color: TEXT, fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      {/* Header — white, logo centered, professional */}
      <header style={{
        background: CARD_BG,
        borderBottom: `1px solid ${BORDER}`,
        padding: "20px 24px",
        display: "flex", justifyContent: "center", alignItems: "center",
        position: "relative",
      }}>
        <Link to="/shop" style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 22, letterSpacing: "0.12em",
          textDecoration: "none", color: TEXT,
        }}>
          STEVEN ANGEL
        </Link>
        <Link to="/shop/cart" style={{
          position: "absolute", right: 24,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: TEXT_MUTED, textDecoration: "none",
        }}>
          &larr; Back to cart
        </Link>
      </header>

      <main style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "24px 16px 80px" : "40px 24px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.4fr) minmax(320px, 1fr)",
        gap: isMobile ? 32 : 48,
        alignItems: "start",
      }}>
        {/* LEFT: Form */}
        <section>
          {/* Contact */}
          <div style={sectionLabel}>Contact</div>
          {!user ? (
            <>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                style={{
                  ...inputStyle,
                  borderColor: !emailValid && guestEmail ? "#ef4444" : BORDER,
                  marginBottom: 8,
                }}
              />
              <div style={subtleNote}>
                Your download link + account setup will be sent to this email.
              </div>
            </>
          ) : (
            <div style={{
              padding: "14px 16px", background: "#f0f9ff",
              border: `1px solid #bae6fd`, borderRadius: 6,
              fontSize: 13, color: "#075985", marginBottom: 20,
            }}>
              Signed in as <strong>{user.email}</strong>
            </div>
          )}

          {/* Payment */}
          <div style={{ ...sectionLabel, marginTop: 28 }}>Payment</div>
          <div style={{ ...subtleNote, marginBottom: 16 }}>
            All transactions are secure and encrypted.
          </div>

          {/* Airwallex Drop-in (card + Apple Pay + Google Pay) */}
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: 16, marginBottom: 14,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>Credit card · Apple Pay · Google Pay</span>
              <CardLogosRow />
            </div>
            <AirwallexCheckoutCard
              productIds={cart.map((it) => it.id)}
              couponCode={couponCode}
              guestEmail={!user ? guestEmail : undefined}
              onSuccess={handleSuccess}
              onError={setErrorMsg}
            />
          </div>

          {/* PayPal */}
          <div style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: 16, marginBottom: 16,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12,
            }}>
              PayPal
            </div>
            <div style={{
              opacity: emailValid ? 1 : 0.55,
              pointerEvents: emailValid ? "auto" : "none",
              transition: "opacity 200ms",
            }}>
              <CartCheckoutButton
                productIds={cart.map((it) => it.id)}
                couponCode={couponCode}
                guestEmail={emailValid && !user ? guestEmail : undefined}
                onSuccess={handleSuccess}
                onError={setErrorMsg}
              />
            </div>
            {!emailValid && (
              <div style={{ marginTop: 8, fontSize: 12, color: TEXT_MUTED, textAlign: "center" }}>
                Enter your email above to enable PayPal
              </div>
            )}
          </div>

          {errorMsg && (
            <div style={{
              marginTop: 8, padding: "12px 14px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 6, fontSize: 13, color: "#991b1b",
            }}>
              {errorMsg}
            </div>
          )}

          {!user && (
            <div style={{ marginTop: 18, fontSize: 13, color: TEXT_MUTED, textAlign: "center" }}>
              Already have an account?{" "}
              <Link to="/shop/login?redirect=/shop/checkout" style={{ color: TEXT, textDecoration: "underline" }}>
                Sign in
              </Link>
            </div>
          )}
        </section>

        {/* RIGHT: Order summary (sticky) */}
        <aside style={{
          background: CARD_BG, border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: 24,
          position: isMobile ? "static" : "sticky", top: 24,
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: TEXT_MUTED, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Order summary
          </div>

          {cart.map((item) => (
            <div key={item.id} style={{
              display: "flex", gap: 12, padding: "10px 0",
              borderBottom: `1px solid ${BORDER}`, alignItems: "center",
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img src={item.image} alt={item.name} width="56" height="56" style={{
                  width: 56, height: 56, objectFit: "cover", borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                }} />
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: "#1a1f2e", color: "#fff",
                  borderRadius: 999, padding: "2px 7px",
                  fontSize: 11, fontWeight: 600,
                  minWidth: 18, textAlign: "center",
                }}>
                  1
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, whiteSpace: "nowrap" }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}

          {/* Discount input */}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
              placeholder="Discount code"
              style={{
                ...inputStyle,
                padding: "10px 12px", fontSize: 13, flex: 1,
              }}
            />
            <button
              type="button"
              onClick={() => { /* coupon is applied live as user types — button is purely visual to match Shopify */ }}
              style={{
                padding: "10px 16px", background: "transparent",
                border: `1px solid ${BORDER}`, borderRadius: 6,
                color: TEXT_MUTED, fontWeight: 600, fontSize: 13,
                cursor: "default",
              }}
              disabled
            >
              Apply
            </button>
          </div>

          {/* Totals */}
          <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: TEXT_MUTED, marginBottom: 8 }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#16a34a", marginBottom: 8 }}>
                <span>Discount ({couponCode})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}`,
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>
                <span style={{ fontSize: 13, color: TEXT_MUTED, marginRight: 6 }}>USD</span>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer — minimal */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "20px 24px",
        textAlign: "center",
        fontSize: 12, color: TEXT_MUTED,
      }}>
        <Link to="/refund" style={{ color: TEXT_MUTED, textDecoration: "underline", marginRight: 14 }}>Refund policy</Link>
        <Link to="/privacy" style={{ color: TEXT_MUTED, textDecoration: "underline", marginRight: 14 }}>Privacy</Link>
        <Link to="/terms" style={{ color: TEXT_MUTED, textDecoration: "underline" }}>Terms</Link>
      </footer>
    </div>
  );
}

function CardLogosRow() {
  // Small text-only logos so we don't pull a logo asset bundle. White
  // checkout context — gray boxes with bold text read as "branded enough"
  // and avoid trademark friction.
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {["VISA", "MC", "AMEX"].map((l) => (
        <span key={l} style={{
          padding: "2px 6px", borderRadius: 3,
          background: "#f3f4f6", border: "1px solid #e5e7eb",
          fontSize: 10, fontWeight: 700, color: "#374151",
          letterSpacing: "0.05em",
        }}>{l}</span>
      ))}
    </div>
  );
}
