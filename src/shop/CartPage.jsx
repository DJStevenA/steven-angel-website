/**
 * /shop/cart — Cart + Checkout page.
 *
 * Shows all items in the cart with remove buttons, coupon input,
 * price breakdown, and PayPal payment. Guest email or sign-in.
 * PayPal SDK preloads on mount so buttons appear fast.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import CheckoutButton, { preloadPayPalSdk } from "./CheckoutButton.jsx";
import { getProductById } from "./products.js";
import { trackBeginCheckout } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartPage() {
  const { cart, removeFromCart, clearCart, cartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("shop_discount_popup_seen") ? "WELCOME15" : "";
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);
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

  // Compute pricing
  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const subtotal = round2(cartTotal);
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  const emailValid = guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const canPay = cart.length > 0 && (user || emailValid);

  const handleSuccess = () => {
    setStatus("success");
    clearCart();
  };

  // Success screen
  if (status === "success") {
    return (
      <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 56, color: CYAN, marginBottom: 16 }}>&#10003;</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 36, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12, color: "#fff" }}>
            Thank You!
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 24 }}>
            Your purchase is confirmed.
            {user ? " Head to your account to download." : " Check your email for the download link."}
          </div>
          <Link to={user ? "/shop/account" : "/shop"} style={{
            display: "inline-block", padding: "14px 32px", background: CYAN, color: "#000",
            borderRadius: 50, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
          }}>
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
        <Link to="/shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
          &larr; Continue Shopping
        </Link>
      </nav>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "32px 16px 80px" : "48px 24px 80px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 32 : 40 }}>
            {/* Left: Cart items */}
            <div>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: "flex", gap: 16, padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  alignItems: "center",
                }}>
                  <Link to={`/shop/${item.slug}`} style={{ flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} width="120" height="66" style={{
                      width: isMobile ? 80 : 120, height: "auto", borderRadius: 6,
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
                    {item.headline && (
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

              <Link to="/shop" style={{
                display: "inline-block", marginTop: 20,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: CYAN, textDecoration: "none",
              }}>
                &larr; Add more items
              </Link>
            </div>

            {/* Right: Payment */}
            <div>
              <div style={{
                background: "linear-gradient(135deg, #0a0a20, #0d0418)",
                border: "1px solid rgba(0,229,255,0.2)",
                borderRadius: 14, padding: isMobile ? "24px 18px" : "28px 24px",
                position: "sticky", top: 80,
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: CYAN, marginBottom: 16,
                }}>
                  Order Summary
                </div>

                {/* Line items */}
                {cart.map((item) => (
                  <div key={item.id} style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: "rgba(255,255,255,0.6)", marginBottom: 6,
                  }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>{item.name}</span>
                    <span style={{ flexShrink: 0 }}>${item.price.toFixed(2)}</span>
                  </div>
                ))}

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "12px 0", paddingTop: 12 }}>
                  {discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: CYAN, marginBottom: 6 }}>
                      <span>Discount ({couponCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: CYAN }}>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6, marginTop: 16 }}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
                  placeholder="WELCOME15"
                  style={{
                    width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                    color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    letterSpacing: "0.1em", boxSizing: "border-box", marginBottom: 18, outline: "none",
                  }}
                />

                {/* Auth / Payment */}
                {authLoading && (
                  <div style={{ padding: "16px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    Loading...
                  </div>
                )}

                {!authLoading && user && (
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
                      Signed in as <strong style={{ color: "rgba(255,255,255,0.8)" }}>{user.email}</strong>
                    </div>
                    {/* PayPal for each item (backend handles one product per order) */}
                    {cart.map((item) => {
                      const fullProduct = getProductById(item.id);
                      return fullProduct ? (
                        <div key={item.id} style={{ marginBottom: 8 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                            Pay for: {item.name} (${item.price})
                          </div>
                          <CheckoutButton product={fullProduct} couponCode={couponCode} onSuccess={handleSuccess} onError={setErrorMsg} />
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {!authLoading && !user && (
                  <div>
                    <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                      style={{
                        width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
                        color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                        boxSizing: "border-box", marginBottom: 4, outline: "none",
                      }}
                    />
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16, lineHeight: 1.5 }}>
                      After payment you'll get your download + a link to set a password.
                    </div>

                    {emailValid ? (
                      cart.map((item) => {
                        const fullProduct = getProductById(item.id);
                        return fullProduct ? (
                          <div key={item.id} style={{ marginBottom: 8 }}>
                            {cart.length > 1 && (
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                                Pay for: {item.name} (${item.price})
                              </div>
                            )}
                            <CheckoutButton product={fullProduct} couponCode={couponCode} guestEmail={guestEmail} onSuccess={handleSuccess} onError={setErrorMsg} />
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div style={{
                        padding: "14px", textAlign: "center", background: "rgba(255,255,255,0.03)",
                        border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8,
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)",
                      }}>
                        Enter your email to see payment options
                      </div>
                    )}

                    <div style={{ textAlign: "center", marginTop: 14 }}>
                      <Link to="/shop/login?redirect=/shop/cart" style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                        color: "rgba(255,255,255,0.5)", textDecoration: "underline",
                      }}>
                        Already have an account? Sign in
                      </Link>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div style={{
                    marginTop: 12, padding: "10px 14px",
                    background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)",
                    borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ff8080",
                  }}>
                    {errorMsg}
                  </div>
                )}

                {/* Trust */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { icon: "\u{1F512}", text: "Secure payment via PayPal" },
                    { icon: "\u26A1", text: "Instant download after payment" },
                    { icon: "\u221E", text: "Lifetime access" },
                  ].map(({ icon, text }) => (
                    <div key={text} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                    }}>
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
