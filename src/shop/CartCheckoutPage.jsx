/**
 * /shop/checkout — Steven 2026-06-07 Option A.
 *
 * Page on OUR domain (steven-angel.com/shop/checkout), styled like ABT /
 * Shopify checkout: white background, professional, centered logo. The CARD
 * INPUTS inside come from Airwallex Embedded Elements (their styling for
 * those specific fields). PayPal is offered as a second payment method.
 *
 * Two entry points:
 *   - /shop/checkout                — full cart from /shop/cart
 *   - /shop/checkout?product=<slug> — single product from a "More Payment
 *                                     Options" button on the product page
 *   - /shop/checkout?product=<slug>&express=paypal — same, but PayPal pre-
 *                                     selected (from product-page PayPal btn)
 *
 * Required fields (per Steven 2026-06-07):
 *   - Email (for download delivery + receipt). Nothing else.
 *
 * Express checkout block at the top: PayPal → G Pay → Apple Pay big buttons.
 * Order summary in the right column. Footer with refund/privacy/terms.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { getProductBySlug } from "./products.js";
import CartCheckoutButton from "./CartCheckoutButton.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";
import AirwallexCheckoutCard, { preloadAirwallexSdk } from "./AirwallexCheckoutCard.jsx";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartCheckoutPage() {
  const { cart, clearCart, cartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Resolve "items" — either ?product=<slug> single buy, or the full cart.
  const singleSlug = params.get("product");
  const expressIntent = params.get("express"); // "paypal" or null
  const singleProduct = useMemo(() => {
    if (!singleSlug) return null;
    return getProductBySlug(singleSlug) || null;
  }, [singleSlug]);

  const items = useMemo(() => {
    if (singleProduct) return [{
      id: singleProduct.id,
      slug: singleProduct.slug,
      name: singleProduct.name,
      price: singleProduct.price,
      image: singleProduct.image,
    }];
    return cart;
  }, [singleProduct, cart]);

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("shop_active_coupon") || "";
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(
    expressIntent === "paypal" ? "paypal" : "card"
  );
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

  // Empty cart + no single product → send back to /shop/cart.
  useEffect(() => {
    if (status === "idle" && items.length === 0) {
      const t = setTimeout(() => navigate("/shop/cart"), 30);
      return () => clearTimeout(t);
    }
  }, [items.length, status, navigate]);

  const productIds = useMemo(() => items.map((it) => it.id), [items]);

  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const subtotal = round2(items.reduce((sum, it) => sum + it.price, 0));
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  const emailValid = !!user || (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail));

  const handleSuccess = () => {
    setStatus("success");
    if (!singleProduct) clearCart();
    navigate("/shop/thank-you");
  };

  /* ── styles (light theme, Shopify-ish) ───────────────────────────────────── */
  const PAGE_BG = "#f4f5f7";
  const CARD_BG = "#ffffff";
  const TEXT = "#1a1f2e";
  const TEXT_MUTED = "#6b7280";
  const BORDER = "#e5e7eb";
  const ACCENT = "#1a1f2e";

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
        <Link to={singleProduct ? `/shop/${singleProduct.slug}` : "/shop/cart"} style={{
          position: "absolute", right: 24,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: TEXT_MUTED, textDecoration: "none",
        }}>
          &larr; Back
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
        {/* LEFT — Form */}
        <section>
          {/* Express checkout block — PayPal → G Pay → Apple Pay (per Steven). */}
          <div style={sectionLabel}>Express checkout</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 10, marginBottom: 18,
          }}>
            <button
              onClick={() => setPaymentMethod("paypal")}
              style={{
                padding: "14px 16px", background: "#ffc439",
                color: "#0a2540", border: "none", borderRadius: 6,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fontSize: 15, letterSpacing: "0.01em",
                cursor: "pointer",
              }}
            >
              <span style={{ fontStyle: "italic", fontWeight: 800 }}>Pay</span>
              <span style={{ fontStyle: "italic", fontWeight: 800, color: "#1a3a6e" }}>Pal</span>
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              style={{
                padding: "14px 16px", background: "#000",
                color: "#fff", border: "none", borderRadius: 6,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
                cursor: "pointer",
              }}
            >
              G Pay
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              style={{
                padding: "14px 16px", background: "#000",
                color: "#fff", border: "none", borderRadius: 6,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 800 }}>&#63743;</span> Pay
            </button>
          </div>

          {/* OR separator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "8px 0 20px",
          }}>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 11,
              color: TEXT_MUTED, letterSpacing: "0.16em", textTransform: "uppercase",
            }}>or</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          {/* Contact — ONLY email */}
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
                Your download link will be sent to this email.
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

          {/* Payment section — radio cards (Credit Card / PayPal) */}
          <div style={{ ...sectionLabel, marginTop: 28 }}>Payment</div>
          <div style={{ ...subtleNote, marginBottom: 16 }}>
            All transactions are secure and encrypted.
          </div>

          {/* Credit Card radio + form */}
          <div
            onClick={() => setPaymentMethod("card")}
            style={{
              background: CARD_BG,
              border: `1px solid ${paymentMethod === "card" ? "#16a34a" : BORDER}`,
              borderRadius: 8, marginBottom: 12, cursor: "pointer",
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: 16,
              background: paymentMethod === "card" ? "#f0fdf4" : CARD_BG,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RadioDot selected={paymentMethod === "card"} />
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                  Credit / Debit Card · Apple Pay · Google Pay
                </span>
              </div>
              <CardLogosRow />
            </div>
            {paymentMethod === "card" && (
              <div style={{ padding: 16, borderTop: `1px solid ${BORDER}` }}>
                <AirwallexCheckoutCard
                  productIds={productIds}
                  couponCode={couponCode}
                  guestEmail={!user ? guestEmail : undefined}
                  onSuccess={handleSuccess}
                  onError={setErrorMsg}
                />
              </div>
            )}
          </div>

          {/* PayPal radio */}
          <div
            onClick={() => setPaymentMethod("paypal")}
            style={{
              background: CARD_BG,
              border: `1px solid ${paymentMethod === "paypal" ? "#16a34a" : BORDER}`,
              borderRadius: 8, marginBottom: 16, cursor: "pointer",
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: 16,
              background: paymentMethod === "paypal" ? "#f0fdf4" : CARD_BG,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RadioDot selected={paymentMethod === "paypal"} />
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>
                  PayPal
                </span>
              </div>
              <span style={{
                fontStyle: "italic", fontWeight: 800, color: "#0a2540", fontSize: 18,
              }}>
                Pay<span style={{ color: "#1a3a6e" }}>Pal</span>
              </span>
            </div>
            {paymentMethod === "paypal" && emailValid && (
              <div style={{ padding: 16, borderTop: `1px solid ${BORDER}` }}>
                <CartCheckoutButton
                  productIds={productIds}
                  couponCode={couponCode}
                  guestEmail={!user ? guestEmail : undefined}
                  onSuccess={handleSuccess}
                  onError={setErrorMsg}
                />
              </div>
            )}
            {paymentMethod === "paypal" && !emailValid && (
              <div style={{
                padding: 16, borderTop: `1px solid ${BORDER}`,
                fontSize: 13, color: TEXT_MUTED, textAlign: "center",
              }}>
                Enter your email above to enable PayPal.
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

        {/* RIGHT — Order summary (sticky) */}
        <aside style={{
          background: CARD_BG, border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: 24,
          position: isMobile ? "static" : "sticky", top: 24,
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
            color: TEXT_MUTED, marginBottom: 14,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Order summary
          </div>

          {items.map((item) => (
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
                }}>1</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: TEXT,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.name}
                </div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 600, color: TEXT, whiteSpace: "nowrap",
              }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
              placeholder="Discount code"
              style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, flex: 1 }}
            />
            <button
              type="button"
              disabled
              style={{
                padding: "10px 16px", background: "transparent",
                border: `1px solid ${BORDER}`, borderRadius: 6,
                color: TEXT_MUTED, fontWeight: 600, fontSize: 13,
                cursor: "default",
              }}
            >
              Apply
            </button>
          </div>

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

function RadioDot({ selected }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 18, height: 18, borderRadius: "50%",
      border: `2px solid ${selected ? "#16a34a" : "#cbd5e1"}`,
      background: "#fff", flexShrink: 0,
    }}>
      {selected && (
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#16a34a",
        }} />
      )}
    </span>
  );
}

function CardLogosRow() {
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
