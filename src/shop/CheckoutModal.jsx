/**
 * CheckoutModal — full-screen checkout overlay
 *
 * Opens when user clicks "Buy Now" on a product page. Handles:
 *   - Not-logged-in state (CTA to login/signup)
 *   - Logged-in state (coupon input + PayPal Smart Buttons)
 *   - Success state (redirects to /shop/account)
 *
 * Coupon auto-applies WELCOME15 if the visitor has seen the welcome popup
 * (`localStorage.shop_discount_popup_seen`) — otherwise the field is empty.
 *
 * Props:
 *   product   — product object from products.js
 *   onClose   — callback when user closes the modal
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import CheckoutButton from "./CheckoutButton.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

// Pricing preview — must match backend COUPONS table
const COUPONS_CLIENT = {
  WELCOME15: { percentOff: 15 },
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

function computePricingPreview(basePrice, couponCode) {
  if (!couponCode) {
    return { base: round2(basePrice), discount: 0, final: round2(basePrice) };
  }
  const coupon = COUPONS_CLIENT[couponCode.toUpperCase()];
  if (!coupon) {
    return { base: round2(basePrice), discount: 0, final: round2(basePrice) };
  }
  const discount = round2(basePrice * (coupon.percentOff / 100));
  return { base: round2(basePrice), discount, final: round2(basePrice - discount) };
}

export default function CheckoutModal({ product, onClose }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    // Auto-fill WELCOME15 if visitor saw the welcome popup
    return localStorage.getItem("shop_discount_popup_seen") ? "WELCOME15" : "";
  });
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSuccess = (purchase) => {
    setStatus("success");
    // Small delay so user sees "Payment successful!" then redirect
    setTimeout(() => {
      navigate("/shop/account");
    }, 1800);
  };

  const handleError = (msg) => {
    setErrorMsg(msg);
  };

  const pricing = computePricingPreview(product.price, couponCode);
  const isPurple = product.badgeColor === "purple";
  const accentColor = isPurple ? PURPLE : CYAN;
  const accentRgba = isPurple ? "187,134,252" : "0,229,255";

  const backdropClick = (e) => {
    if (e.target === e.currentTarget && status !== "success") onClose();
  };

  // ── Success state ──
  if (status === "success") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.9)",
          backdropFilter: "blur(8px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0a0a20, #0d0418)",
            border: `2px solid ${CYAN}`,
            borderRadius: 16,
            padding: isMobile ? "40px 28px" : "56px 48px",
            maxWidth: 460,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 0 80px rgba(0,229,255,0.3)",
          }}
        >
          <div
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 14,
            }}
          >
            Payment Successful
          </div>
          <div
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? 30 : 38,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#fff",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Thank You!
          </div>
          <div
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 15,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Your purchase of <strong style={{ color: "#fff" }}>{product.name}</strong> is confirmed.
            <br />
            Redirecting to your account…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={backdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a20, #0d0418)",
          border: `2px solid ${accentColor}`,
          borderRadius: 16,
          padding: isMobile ? "32px 22px 26px" : "44px 40px 36px",
          maxWidth: 480,
          width: "100%",
          position: "relative",
          boxShadow: `0 0 80px rgba(${accentRgba},0.25)`,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 26,
            cursor: "pointer",
            padding: 8,
            lineHeight: 1,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ×
        </button>

        {/* Header label */}
        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: accentColor,
            marginBottom: 10,
          }}
        >
          Checkout
        </div>

        {/* Product name */}
        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 24 : 28,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: 6,
          }}
        >
          {product.name}
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.5,
            marginBottom: 22,
          }}
        >
          {product.headline}
        </div>

        {/* ─── Not logged in ─── */}
        {!authLoading && !user && (
          <div>
            <div
              style={{
                padding: 20,
                border: `1px solid rgba(${accentRgba},0.3)`,
                borderRadius: 10,
                background: `rgba(${accentRgba},0.05)`,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#fff",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Sign in to continue
              </div>
              <div
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                }}
              >
                Your account lets you re-download your purchases anytime.
                No credit card info stored — payment is via PayPal.
              </div>
            </div>
            <Link
              to={`/shop/login?redirect=/shop/${product.slug}`}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 20px",
                background: accentColor,
                color: "#000",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: "center",
                textDecoration: "none",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              Sign In
            </Link>
            <Link
              to={`/shop/signup?redirect=/shop/${product.slug}`}
              style={{
                display: "block",
                width: "100%",
                padding: "14px 20px",
                background: "transparent",
                color: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                textAlign: "center",
                textDecoration: "none",
                borderRadius: 8,
              }}
            >
              Create Account
            </Link>
          </div>
        )}

        {/* ─── Loading auth ─── */}
        {authLoading && (
          <div
            style={{
              padding: "20px 0",
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Loading…
          </div>
        )}

        {/* ─── Logged in ─── */}
        {!authLoading && user && (
          <div>
            {/* Coupon input */}
            <label
              style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 6,
              }}
            >
              Coupon Code (Optional)
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
              placeholder="WELCOME15"
              autoComplete="off"
              spellCheck={false}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "#06060f",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#fff",
                letterSpacing: "0.1em",
                boxSizing: "border-box",
                marginBottom: 18,
              }}
            />

            {/* Price breakdown */}
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 6,
                }}
              >
                <span>Subtotal</span>
                <span>${pricing.base.toFixed(2)}</span>
              </div>
              {pricing.discount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 13,
                    color: accentColor,
                    marginBottom: 6,
                  }}
                >
                  <span>Discount ({couponCode.toUpperCase()})</span>
                  <span>−${pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  paddingTop: 8,
                  marginTop: 6,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Total</span>
                <span style={{ fontSize: 22, color: accentColor, fontWeight: 900 }}>
                  ${pricing.final.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* PayPal Smart Buttons */}
            <CheckoutButton
              product={product}
              couponCode={couponCode}
              onSuccess={handleSuccess}
              onError={handleError}
            />

            {errorMsg && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "rgba(255,80,80,0.08)",
                  border: "1px solid rgba(255,80,80,0.4)",
                  borderRadius: 6,
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  color: "#ff8080",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div
              style={{
                marginTop: 16,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Secure payment via PayPal · No credit card stored
              <br />
              Instant access via your account
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
