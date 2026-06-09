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

  const expressInstancesRef = useRef({});
  const dropInElementRef = useRef(null);
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
          // Steven 2026-06-09: Airwallex SDK was logging
          // "please check the required options of google pay button element"
          // because we were missing currency + amount + buttonType structure.
          // sizeMode change Steven 2026-06-09 (later that day): "fill" was
          // rendering Google's "accepted cards" indicator strip INSIDE the
          // button (Visa/MC/Amex tiles visible on the right). "static" with
          // an explicit buttonSizeMode + plain buttonType gives a clean
          // "G Pay" pill that matches the Apple Pay button visually.
          const gp = Airwallex.createElement("googlePayButton", {
            intent_id: intent.intentId,
            client_secret: intent.clientSecret,
            currency: intent.currency || "USD",
            amount: intent.amount,
            countryCode: billingCountry || "US",
            origin: window.location.origin,
            button: {
              buttonType: "plain",
              buttonColor: "black",
              buttonSizeMode: "fill",
              height: 44,
            },
          });
          gp.mount(expressGooglePayRef.current);
          expressInstancesRef.current.googlePay = gp;
        } catch (e) { console.error("[checkout-v2] Google Pay init:", e); }
      }

      // Drop-in — Steven 2026-06-09: configured for CARD ONLY.
      // Apple Pay / Google Pay / PayPal live in the Express row above.
      // The `methods: ['card']` config tells the Drop-in to render only
      // the card form, suppressing the internal wallet/Klarna buttons.
      if (dropInContainerRef.current && !dropInElementRef.current) {
        const dropIn = Airwallex.createElement("dropIn", {
          intent_id: intent.intentId,
          client_secret: intent.clientSecret,
          currency: intent.currency,
          methods: ["card"],
        });
        dropIn.mount(dropInContainerRef.current);
        dropInElementRef.current = dropIn;

        dropIn.on("success", async (event) => {
          console.log("[checkout-v2] Airwallex success:", event);
          // Try to get email from: (1) form field, (2) Airwallex event, (3) logged-in user
          const buyerEmail = email
            || event?.detail?.paymentIntent?.latest_payment_attempt?.payment_method?.billing?.email
            || user?.email
            || "";
          try { trackPurchase({ id: "cart-v2", name: "Cart-v2", price: total }, { transaction_id: intent.intentId, email: buyerEmail }); } catch {}
          // Confirm delivery — create purchase rows + send download email
          if (buyerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
            try {
              const confirmRes = await fetch(`${BACKEND}/shop/checkout/confirm-delivery`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: buyerEmail,
                  productIds,
                  couponCode: couponCode || null,
                  orderId: `awx_${intent.intentId}`,
                  provider: "airwallex",
                }),
              });
              if (confirmRes.ok) {
                const confirmData = await confirmRes.json().catch(() => ({}));
                if (confirmData.token) {
                  try { localStorage.setItem("shop_last_purchase", JSON.stringify({ token: confirmData.token, productIds, items: cart.map(i => ({ name: i.name, price: i.price })), total, email: buyerEmail })); } catch {}
                }
              }
            } catch (e) { console.error("[checkout-v2] confirm-delivery:", e); }
          } else {
            console.warn("[checkout-v2] No valid email — skipping confirm-delivery. Payment succeeded but no email delivery.");
          }
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

  // ── Mount PayPal Smart Button in the Express row only ────────────────────
  // Steven 2026-06-09: PayPal lives ONLY in the Express row at the top.
  // Removed the standalone PayPal radio section below the card form.
  useEffect(() => {
    if (productIds.length === 0) return;
    let cancelled = false;
    async function setupPayPal() {
      const paypal = await preloadPayPalSdk();
      if (!paypal || cancelled) return;

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
      if (json.token) {
        try { localStorage.setItem("shop_last_purchase", JSON.stringify({ token: json.token, productIds, items: cart.map(i => ({ name: i.name, price: i.price })), total, email: json.email })); } catch {}
      }
      clearCart();
      navigate("/shop/thank-you");
    } catch (err) {
      console.error("[checkout-v2] PayPal onApprove:", err);
    }
  }

  // ── Pay Now (Airwallex submit) ────────────────────────────────────────────
  // handlePayNow removed 2026-06-09 — no more custom black Pay Now button.
  // The Airwallex Drop-in has its own purple Pay button which is the sole
  // submit path for the card form. Express row wallets (PayPal/AP/GP) each
  // have their own submit baked in.

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

          {/* Email + Country side-by-side — Steven 2026-06-09 placement:
              Country sits next to Email so the customer fills both at once.
              On mobile they stack. */}
          <section style={{ marginBottom: 24 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
              gap: 12,
            }}>
              <div>
                <label style={labelStyle} htmlFor="cv2-email">
                  Email <span style={{ color: "#ef4444" }}>*</span>
                  <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: 6 }}>— we send your download here</span>
                </label>
                <input
                  id="cv2-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{
                    ...inputStyle,
                    border: !emailValid && email.length > 0 ? "1px solid #ef4444" : inputStyle.border,
                  }}
                  disabled={!!user}
                />
              </div>
              <div>
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
              </div>
            </div>
            {!emailValid && email.length > 0 && (
              <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Please enter a valid email address</div>
            )}
            {!user && emailValid && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Already have an account?{" "}
                <Link to="/shop/login?redirect=/shop/checkout-v2" style={{ color: "#111", textDecoration: "underline" }}>
                  Sign in
                </Link>
              </div>
            )}
          </section>

          {/* Credit Card — single section, no radio toggle.
              Steven 2026-06-09: PayPal, Apple Pay, Google Pay are all in the
              Express row above. This section is ONLY credit card. The
              Airwallex Drop-in handles the card form + its own submit
              button. No black "Pay Now" — that was confusing duplicate.
              Wallets-inside-Drop-in (AP/GP/Klarna) are removed via the
              `applepay: { disabled: true }` etc. config in mountAirwallexElements. */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={sectionTitle}>Credit Card</h3>
            <div ref={dropInContainerRef} style={{ minHeight: 220, position: "relative", border: "1px solid #e5e7eb", borderRadius: 6, padding: 0 }}>
              {/* Skeleton — visible until Airwallex Drop-in iframe replaces
                  the inner DOM. Drop-in mount replaces children of the
                  container, so this disappears automatically. */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", gap: 10,
                padding: 14,
                pointerEvents: "none",
              }}>
                <style>{`@keyframes cv2Pulse{0%{opacity:.55}50%{opacity:.85}100%{opacity:.55}}`}</style>
                <div style={{ animation: "cv2Pulse 1.4s ease-in-out infinite", height: 38, background: "#f3f4f6", borderRadius: 4 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ animation: "cv2Pulse 1.4s ease-in-out infinite", height: 38, flex: 1, background: "#f3f4f6", borderRadius: 4 }} />
                  <div style={{ animation: "cv2Pulse 1.4s ease-in-out infinite", height: 38, width: 110, background: "#f3f4f6", borderRadius: 4 }} />
                </div>
                <div style={{ animation: "cv2Pulse 1.4s ease-in-out infinite", height: 38, background: "#f3f4f6", borderRadius: 4 }} />
                <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, color: "#9ca3af", fontFamily: "system-ui, sans-serif" }}>
                  Loading secure payment form…
                </div>
              </div>
            </div>
          </section>

          {/* Country was here — moved up next to Email by Steven 2026-06-09. */}

          {/* payNowError display removed — no more custom Pay Now button.
              Airwallex Drop-in's own Pay button handles errors internally. */}

          {/* Trust signals — inline with payment (Baymard: +18% completion) */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 16, flexWrap: "wrap", marginTop: 16,
            fontSize: 12, color: "#6b7280", fontFamily: "system-ui, sans-serif",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              256-bit SSL
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Instant download
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              7-day refund
            </span>
          </div>
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
              placeholder="Coupon code"
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
