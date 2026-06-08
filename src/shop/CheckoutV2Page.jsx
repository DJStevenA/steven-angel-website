/**
 * /shop/checkout-v2 — unified checkout page (branch checkout-v2 only).
 *
 * BRANCH-ONLY: not linked from main. Lives on Netlify Deploy Preview.
 *
 * Layout (Steven 2026-06-07):
 *   ┌──────────────────────────────┬──────────────┐
 *   │ Express row (PayPal/Apple/G) │ Cart summary │
 *   │ Email                         │ Coupon       │
 *   │ ○ Card / wallets              │ Total        │
 *   │   └─ Airwallex Drop-in        │              │
 *   │ ○ PayPal                      │              │
 *   │   └─ PayPal Smart Button      │              │
 *   │ Billing address               │              │
 *   │ [Pay Now] (custom, black)     │              │
 *   └──────────────────────────────┴──────────────┘
 *
 * Design:
 *   - White bg, black text, system-ui font
 *   - No brand colors, no glow, no Barlow/DM Sans
 *
 * Payment routing:
 *   - When "Card / wallets" radio is selected → Airwallex Drop-in handles payment
 *     (its internal Pay button submits the chosen method)
 *   - When "PayPal" radio is selected → official PayPal Smart Button submits
 *     (per PayPal TOS — cannot replace their button with custom branding)
 *   - Bottom "Pay Now" button is the visual unifier but functionally triggers
 *     whichever section is active.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";
import { trackBeginCheckout, trackPurchase, trackAddPaymentInfo } from "../lib/analytics/events";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const AIRWALLEX_SDK_URL = "https://checkout.airwallex.com/assets/elements.bundle.min.js";

const COUPONS_CLIENT = { WELCOME15: { percentOff: 15 } };
const round2 = (n) => Math.round(n * 100) / 100;

// ── Airwallex SDK singleton loader ───────────────────────────────────────────
let awxSdkPromise = null;
function loadAirwallexSdk() {
  if (awxSdkPromise) return awxSdkPromise;
  awxSdkPromise = new Promise((resolve, reject) => {
    if (window.Airwallex) return resolve(window.Airwallex);
    const s = document.createElement("script");
    s.src = AIRWALLEX_SDK_URL;
    s.async = true;
    s.onload = () => {
      if (window.Airwallex) resolve(window.Airwallex);
      else reject(new Error("Airwallex SDK loaded but window.Airwallex is undefined"));
    };
    s.onerror = () => { awxSdkPromise = null; reject(new Error("Failed to load Airwallex SDK")); };
    document.body.appendChild(s);
  });
  return awxSdkPromise;
}

// ── Countries (minimum viable list — alphabetical by name) ──────────────────
const COUNTRIES = [
  ["US", "United States"], ["GB", "United Kingdom"], ["IL", "Israel"],
  ["DE", "Germany"], ["FR", "France"], ["IT", "Italy"], ["ES", "Spain"],
  ["NL", "Netherlands"], ["BE", "Belgium"], ["CH", "Switzerland"], ["AT", "Austria"],
  ["PL", "Poland"], ["SE", "Sweden"], ["NO", "Norway"], ["DK", "Denmark"], ["FI", "Finland"],
  ["IE", "Ireland"], ["PT", "Portugal"], ["GR", "Greece"], ["CZ", "Czechia"],
  ["RO", "Romania"], ["BG", "Bulgaria"], ["HU", "Hungary"], ["SK", "Slovakia"],
  ["SI", "Slovenia"], ["HR", "Croatia"], ["LT", "Lithuania"], ["LV", "Latvia"], ["EE", "Estonia"],
  ["CA", "Canada"], ["AU", "Australia"], ["NZ", "New Zealand"], ["JP", "Japan"], ["KR", "South Korea"],
  ["SG", "Singapore"], ["HK", "Hong Kong"], ["AE", "United Arab Emirates"], ["TR", "Türkiye"],
  ["MX", "Mexico"], ["BR", "Brazil"], ["AR", "Argentina"], ["CL", "Chile"], ["CO", "Colombia"],
  ["ZA", "South Africa"], ["NG", "Nigeria"], ["KE", "Kenya"], ["IN", "India"], ["TH", "Thailand"],
  ["VN", "Vietnam"], ["MY", "Malaysia"], ["ID", "Indonesia"], ["PH", "Philippines"], ["TW", "Taiwan"],
];

// ── Inputs (raw, unbranded) ─────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "system-ui, -apple-system, sans-serif",
  color: "#111",
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#374151",
  marginBottom: 4,
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const sectionTitle = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 13,
  fontWeight: 600,
  color: "#6b7280",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  margin: "0 0 12px",
};

// ── Page ────────────────────────────────────────────────────────────────────
export default function CheckoutV2Page() {
  const { cart, clearCart, cartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("shop_active_coupon") || "";
  });
  const [email, setEmail] = useState(user?.email || "");
  const [billingCountry, setBillingCountry] = useState("US");
  const [method, setMethod] = useState("card"); // 'card' (Airwallex) or 'paypal'
  const [payNowError, setPayNowError] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 980 : false
  );

  // Pricing
  const productIds = useMemo(() => cart.map((it) => it.id), [cart]);
  const subtotal = round2(cartTotal);
  const coupon = couponCode ? COUPONS_CLIENT[couponCode.toUpperCase()] : null;
  const discount = coupon ? round2(subtotal * (coupon.percentOff / 100)) : 0;
  const total = round2(subtotal - discount);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ── Refs for payment containers ────────────────────────────────────────────
  const expressPayPalRef = useRef(null);
  const expressApplePayRef = useRef(null);
  const expressGooglePayRef = useRef(null);
  const dropInContainerRef = useRef(null);
  const paypalContainerRef = useRef(null);

  const expressInstancesRef = useRef({});
  const dropInElementRef = useRef(null);
  const paypalInstanceRef = useRef(null);
  const intentRef = useRef(null);

  // ── Setup: scroll + title + analytics + body bg ────────────────────────────
  useEffect(() => {
    document.title = "Checkout v2 | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 980);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      try { trackBeginCheckout({ id: "cart", name: "Cart-v2", price: total, currency: "USD" }); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Empty-cart redirect
  useEffect(() => {
    if (cart.length === 0) {
      const t = setTimeout(() => navigate("/shop/cart"), 30);
      return () => clearTimeout(t);
    }
  }, [cart.length, navigate]);

  // ── Create Airwallex intent (anon — no email gate) ────────────────────────
  useEffect(() => {
    if (productIds.length === 0) return;
    let cancelled = false;
    async function createIntent() {
      try {
        const res = await fetch(`${BACKEND}/shop/checkout/airwallex-cart-anon`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds, couponCode: couponCode || null }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create Airwallex intent");
        if (cancelled) return;
        intentRef.current = data;
        mountAirwallexElements(data);
      } catch (err) {
        console.error("[checkout-v2] Airwallex intent failed:", err);
      }
    }
    createIntent();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(","), couponCode]);

  async function mountAirwallexElements(intent) {
    try {
      const Airwallex = await loadAirwallexSdk();
      await Airwallex.init({ env: "prod", enabledElements: ["payments"] });

      // Express buttons (Apple Pay, Google Pay) via Airwallex
      if (expressApplePayRef.current && !expressInstancesRef.current.applePay) {
        try {
          const ap = Airwallex.createElement("applePayButton", {
            intent_id: intent.intentId, client_secret: intent.clientSecret,
            countryCode: billingCountry || "US", style: { type: "buy", theme: "black", height: 44 },
          });
          ap.mount(expressApplePayRef.current);
          expressInstancesRef.current.applePay = ap;
        } catch (e) { console.error("[checkout-v2] Apple Pay init:", e); }
      }
      if (expressGooglePayRef.current && !expressInstancesRef.current.googlePay) {
        try {
          const gp = Airwallex.createElement("googlePayButton", {
            intent_id: intent.intentId, client_secret: intent.clientSecret,
            countryCode: billingCountry || "US",
            buttonType: "buy", buttonColor: "black", height: 44,
          });
          gp.mount(expressGooglePayRef.current);
          expressInstancesRef.current.googlePay = gp;
        } catch (e) { console.error("[checkout-v2] Google Pay init:", e); }
      }

      // Drop-in (main card / methods widget)
      if (dropInContainerRef.current && !dropInElementRef.current) {
        const dropIn = Airwallex.createElement("dropIn", {
          intent_id: intent.intentId,
          client_secret: intent.clientSecret,
          currency: intent.currency,
        });
        dropIn.mount(dropInContainerRef.current);
        dropInElementRef.current = dropIn;

        dropIn.on("success", (event) => {
          console.log("[checkout-v2] Airwallex success:", event);
          try { trackPurchase({ id: "cart-v2", name: "Cart-v2", price: total }, { transaction_id: intent.intentId, email }); } catch {}
          clearCart();
          navigate("/shop/thank-you");
        });
        dropIn.on("error", (ev) => {
          console.error("[checkout-v2] Airwallex element error:", ev);
        });
      }
    } catch (err) {
      console.error("[checkout-v2] Airwallex mount failed:", err);
    }
  }

  // ── Mount PayPal in PayPal section + Express row ──────────────────────────
  useEffect(() => {
    if (productIds.length === 0) return;
    let cancelled = false;
    async function setupPayPal() {
      const paypal = await preloadPayPalSdk();
      if (!paypal || cancelled) return;

      // Express row PayPal button (small)
      if (expressPayPalRef.current && !expressInstancesRef.current.paypal) {
        try {
          const ppExpress = paypal.Buttons({
            style: { layout: "horizontal", color: "gold", shape: "rect", label: "paypal", height: 44, tagline: false },
            createOrder: () => paypalCreateOrder(),
            onApprove: (data) => paypalOnApprove(data),
          });
          ppExpress.render(expressPayPalRef.current);
          expressInstancesRef.current.paypal = ppExpress;
        } catch (e) { console.error("[checkout-v2] Express PayPal:", e); }
      }

      // Main PayPal section
      if (paypalContainerRef.current && !paypalInstanceRef.current) {
        const ppMain = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 },
          createOrder: () => paypalCreateOrder(),
          onApprove: (data) => paypalOnApprove(data),
        });
        ppMain.render(paypalContainerRef.current);
        paypalInstanceRef.current = ppMain;
      }
    }
    setupPayPal();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(",")]);

  async function paypalCreateOrder() {
    const res = await fetch(`${BACKEND}/shop/checkout/cart-anon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds, couponCode: couponCode || null }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "PayPal order creation failed");
    return data.orderId;
  }
  async function paypalOnApprove(data) {
    try {
      try { trackAddPaymentInfo({ id: "cart-v2", name: "Cart-v2", price: total }); } catch {}
      const res = await fetch(`${BACKEND}/shop/checkout/cart-anon-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Capture failed");
      try { trackPurchase({ id: "cart-v2", name: "Cart-v2", price: total }, { transaction_id: data.orderID, email: json.email }); } catch {}
      clearCart();
      navigate("/shop/thank-you");
    } catch (err) {
      console.error("[checkout-v2] PayPal onApprove:", err);
    }
  }

  // ── Pay Now (Airwallex submit) ────────────────────────────────────────────
  // Email is validated AT THIS POINT (not before) per Steven's rule —
  // never gate UI behind email; only require it when the customer actually
  // tries to pay (we need it to send the download link).
  // The Airwallex Drop-in has its own internal Pay button; the SDK doesn't
  // expose a public submit() method, so the custom Pay Now scrolls to it
  // to direct the user's eye. (Upgrade path: Embedded Card Element which
  // does support custom submit.)
  const handlePayNow = () => {
    if (!emailValid) {
      setPayNowError("Email required — we send your download link there.");
      return;
    }
    setPayNowError(null);
    if (dropInContainerRef.current) {
      dropInContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#fff", color: "#111",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Top bar */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
      }}>
        <Link to="/" style={{ color: "#111", textDecoration: "none", fontWeight: 600, fontSize: 16 }}>
          Steven Angel
        </Link>
        <Link to="/shop/cart" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>
          ← Back to cart
        </Link>
      </header>

      <main style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "20px 16px 60px" : "40px 24px 80px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 380px",
        gap: isMobile ? 28 : 48,
        alignItems: "start",
      }}>
        {/* ═══ LEFT — checkout flow ═══ */}
        <div>
          {/* Express row */}
          <section style={{ marginBottom: 28 }}>
            <h3 style={sectionTitle}>Express checkout</h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: 10,
            }}>
              <div ref={expressPayPalRef} style={{ minHeight: 44 }} />
              <div ref={expressApplePayRef} style={{ minHeight: 44 }} />
              <div ref={expressGooglePayRef} style={{ minHeight: 44 }} />
            </div>
          </section>

          {/* Email */}
          <section style={{ marginBottom: 24 }}>
            <label style={labelStyle} htmlFor="cv2-email">Email</label>
            <input
              id="cv2-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              style={inputStyle}
              disabled={!!user}
            />
            {!user && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Already have an account?{" "}
                <Link to="/shop/login?redirect=/shop/checkout-v2" style={{ color: "#111", textDecoration: "underline" }}>
                  Sign in
                </Link>
              </div>
            )}
          </section>

          {/* Payment method selector */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={sectionTitle}>Payment</h3>

            {/* Card / wallets (Airwallex) */}
            <label
              htmlFor="cv2-method-card"
              style={{
                display: "block",
                border: method === "card" ? "1px solid #111" : "1px solid #d1d5db",
                borderRadius: 6,
                padding: "14px 16px",
                marginBottom: 10,
                cursor: "pointer",
                background: method === "card" ? "#fafafa" : "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  id="cv2-method-card"
                  type="radio"
                  name="cv2-method"
                  value="card"
                  checked={method === "card"}
                  onChange={() => setMethod("card")}
                />
                <span style={{ fontWeight: 500, fontSize: 14 }}>Credit card / Apple Pay / Google Pay / Klarna</span>
              </div>
              {method === "card" && (
                <div style={{ marginTop: 12 }}>
                  <div ref={dropInContainerRef} style={{ minHeight: 200 }} />
                </div>
              )}
            </label>

            {/* PayPal */}
            <label
              htmlFor="cv2-method-paypal"
              style={{
                display: "block",
                border: method === "paypal" ? "1px solid #111" : "1px solid #d1d5db",
                borderRadius: 6,
                padding: "14px 16px",
                cursor: "pointer",
                background: method === "paypal" ? "#fafafa" : "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  id="cv2-method-paypal"
                  type="radio"
                  name="cv2-method"
                  value="paypal"
                  checked={method === "paypal"}
                  onChange={() => setMethod("paypal")}
                />
                <span style={{ fontWeight: 500, fontSize: 14, flex: 1 }}>PayPal</span>
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"
                  alt="PayPal"
                  height="20"
                  style={{ height: 20, display: "block" }}
                />
              </div>
            </label>
          </section>

          {/* Country (needed for Apple Pay / Google Pay) */}
          <section style={{ marginBottom: 24 }}>
            <label style={labelStyle} htmlFor="cv2-country">Country</label>
            <select
              id="cv2-country"
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
              style={inputStyle}
            >
              {COUNTRIES.map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </section>

          {/* Bottom action — Pay Now (Airwallex) OR PayPal Smart Button.
              When PayPal radio is selected, the official PayPal button
              replaces our custom Pay Now in this same slot. */}
          <div style={{ position: "relative" }}>
            {/* PayPal Smart Button container (visible only when PayPal selected) */}
            <div
              ref={paypalContainerRef}
              style={{ display: method === "paypal" ? "block" : "none", minHeight: 48 }}
            />

            {/* Custom Pay Now (visible only when card method selected) */}
            {method === "card" && (
              <button
                type="button"
                onClick={handlePayNow}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: 15,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontWeight: 600,
                  color: "#fff",
                  background: "#111",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Pay Now
              </button>
            )}
          </div>

          {/* Email error — shown only when user tries to Pay without a valid email */}
          {payNowError && (
            <div style={{
              marginTop: 10, padding: "10px 14px",
              background: "#fff4f4", border: "1px solid #f5b5b5",
              borderRadius: 4, color: "#a01010", fontSize: 13,
            }}>
              {payNowError}
            </div>
          )}
        </div>

        {/* ═══ RIGHT — Cart summary + coupon ═══ */}
        <aside style={{
          background: "#fafafa",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 20,
          position: isMobile ? "static" : "sticky",
          top: 24,
        }}>
          <h3 style={{ ...sectionTitle, marginBottom: 16 }}>Your cart</h3>

          {cart.map((item) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid #e5e7eb",
            }}>
              <img src={item.image} alt={item.name} width="48" height="48"
                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, border: "1px solid #e5e7eb" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#111",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                ${item.price.toFixed(2)}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <label style={labelStyle} htmlFor="cv2-coupon">Coupon code</label>
            <input
              id="cv2-coupon"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.trim().toUpperCase())}
              placeholder="WELCOME15"
              style={inputStyle}
            />
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#111", marginBottom: 6 }}>
                <span>{couponCode}</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginTop: 10, fontSize: 18, fontWeight: 700, color: "#111",
            }}>
              <span>Total</span>
              <span>${total.toFixed(2)} <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>USD</span></span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
