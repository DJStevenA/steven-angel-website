/**
 * /shop/checkout — PayPal-only checkout, dark theme matching steven-angel.com.
 *
 * Email + official PayPal Smart Buttons. That's it.
 *
 * Two entry points:
 *   - /shop/checkout                — full cart from /shop/cart
 *   - /shop/checkout?product=<slug> — single product buy
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { getProductBySlug } from "./products.js";
import CartCheckoutButton from "./CartCheckoutButton.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";

const CYAN = "#00E5FF";
const BG = "#080810";
const CARD_BG = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.1)";
const TEXT = "#fff";
const TEXT_MUTED = "rgba(255,255,255,0.5)";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };

function round2(n) { return Math.round(n * 100) / 100; }

export default function CartCheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const singleSlug = params.get("product");
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
  const [status, setStatus] = useState("idle");
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
    preloadPayPalSdk();
  }, []);

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

  const handleSuccess = () => {
    setStatus("success");
    if (!singleProduct) clearCart();
    navigate("/shop/thank-you");
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 4vw, 48px)", height: 64,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link to="/" style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: 20, letterSpacing: "0.1em", textDecoration: "none", color: "#fff",
        }}>
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
        <Link to={singleProduct ? `/shop/${singleProduct.slug}` : "/shop/cart"} style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
          fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)", textDecoration: "none",
        }}>
          &larr; Back
        </Link>
      </nav>

      <main style={{
        maxWidth: 900, margin: "0 auto",
        padding: isMobile ? "32px 16px 80px" : "48px 24px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 32 : 48,
        alignItems: "start",
      }}>
        {/* LEFT — Order summary */}
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
            color: CYAN, marginBottom: 20,
          }}>
            Checkout
          </div>

          {items.map((item) => (
            <div key={item.id} style={{
              display: "flex", gap: 14, padding: "14px 0",
              borderBottom: `1px solid ${BORDER}`, alignItems: "center",
            }}>
              <img src={item.image} alt={item.name} width="60" height="60" style={{
                width: 60, height: 60, objectFit: "cover", borderRadius: 8,
                border: `1px solid rgba(0,229,255,0.2)`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 16, textTransform: "uppercase", letterSpacing: "0.03em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {item.name}
                </div>
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 18, color: CYAN,
              }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
              placeholder="Discount code"
              style={{
                flex: 1, padding: "10px 12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`, borderRadius: 6,
                color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                letterSpacing: "0.1em", boxSizing: "border-box", outline: "none",
              }}
            />
          </div>

          {/* Totals */}
          <div style={{ marginTop: 20, borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
            {discount > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: TEXT_MUTED, marginBottom: 6 }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: CYAN, marginBottom: 6 }}>
                  <span>{couponCode}</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginTop: discount > 0 ? 10 : 0,
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Total</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: CYAN }}>
                ${total.toFixed(2)}
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 6, fontWeight: 600 }}>USD</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Email + PayPal */}
        <div style={{
          background: "linear-gradient(135deg, #0a0a20, #0d0418)",
          border: "1px solid rgba(0,229,255,0.15)",
          borderRadius: 14,
          padding: isMobile ? "24px 18px" : "32px 28px",
          position: isMobile ? "static" : "sticky", top: 80,
        }}>
          {!authLoading && user && (
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.5)", marginBottom: 20,
            }}>
              Signed in as <strong style={{ color: "rgba(255,255,255,0.8)" }}>{user.email}</strong>
            </div>
          )}

          {/* PayPal — no email required, anon checkout gets email from PayPal */}
          <CartCheckoutButton
            productIds={productIds}
            couponCode={couponCode}
            onSuccess={handleSuccess}
          />

          {/* Trust signals */}
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "\u{1F512}", text: "Secure payment via PayPal" },
              { icon: "\u26A1", text: "Instant download after payment" },
              { icon: "\u221E", text: "Lifetime access" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                color: "rgba(255,255,255,0.45)",
              }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {!user && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link to="/shop/login?redirect=/shop/checkout" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: "rgba(255,255,255,0.5)", textDecoration: "underline",
              }}>
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
