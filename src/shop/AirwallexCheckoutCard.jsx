/**
 * AirwallexCheckoutCard — Drop-in Element checkout for the cart.
 *
 * Mounts the Airwallex Components SDK Drop-in inside a card. Drop-in shows
 * card form + Apple Pay + Google Pay automatically (subject to wallet
 * availability + Airwallex dashboard config).
 *
 * Backend creates the PaymentIntent server-side (POST /shop/checkout/
 * airwallex-create or airwallex-guest) and returns intent_id + client_secret.
 * The Drop-in confirms the payment. The payment_intent.succeeded webhook on
 * the server is the source of truth for marking the purchase paid; this
 * component just clears the cart + fires GA4 + calls onSuccess once the
 * SDK signals success.
 *
 * Props:
 *   productIds   — string[] cart product IDs
 *   couponCode   — current coupon string (may be empty)
 *   guestEmail   — guest email (omitted when logged in)
 *   onSuccess    — called after Drop-in fires `success`
 *   onError      — called with an error string when anything fails
 *
 * Loading order:
 *   1. Component mounts → checks email valid → POSTs to backend
 *   2. Receives intentId + clientSecret → loads Airwallex SDK from CDN
 *   3. Calls init({ env: 'prod', enabledElements: ['payments'] })
 *   4. createElement('dropIn', {...}) and mount into our container
 *   5. Customer pays → SDK fires `onSuccess` → we clear cart + report success
 */

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { trackAddPaymentInfo, trackPurchase } from "../lib/analytics/events";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
// Airwallex SDK CDN. The newer `static.airwallex.com/components/v1/loader.js`
// returns 404 — that path doesn't exist. The Embedded Elements bundle does,
// is UMD, and exposes `window.Airwallex` with the same createElement('dropIn', …)
// API we need. Verified live 2026-06-07.
const SDK_URL = "https://checkout.airwallex.com/assets/elements.bundle.min.js";

// SDK is a singleton — cache the load promise across mounts so navigating
// back to /shop/cart doesn't reload the script.
let sdkPromise = null;
function loadAirwallexSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.Airwallex) return resolve(window.Airwallex);
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => {
      if (window.Airwallex) resolve(window.Airwallex);
      else reject(new Error("Airwallex SDK loaded but window.Airwallex is undefined"));
    };
    s.onerror = () => { sdkPromise = null; reject(new Error("Failed to load Airwallex SDK")); };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

const CYAN = "#00E5FF";

export default function AirwallexCheckoutCard({
  productIds,
  couponCode,
  guestEmail,
  onSuccess,
  onError,
  theme = "light", // "light" matches the white /shop/checkout page; "dark" for legacy dark surfaces.
}) {
  const { token, user } = useAuth();
  const containerRef = useRef(null);
  const elementRef = useRef(null);
  const guestTokenRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState(null);

  // Email is mandatory for guest. Logged-in users get it from auth.
  const emailValid = !!user || (guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail));

  useEffect(() => {
    // Guard: backend airwallex-guest requires a valid email to create the
    // pending guest user. Don't fire the API call until we have one. (For
    // logged-in users, we always proceed.) Steven 2026-06-07: we used to
    // also gate the visual rendering on email — that left a confusing
    // empty placeholder. Now we render a STATIC preview immediately and
    // only swap to the live Drop-in once email is valid.
    if (!emailValid || productIds.length === 0) return;
    let cancelled = false;

    async function setup() {
      setStatus("loading");
      setErrorMsg(null);
      try {
        // 1. Ask backend to create the intent
        const isGuest = !user;
        const endpoint = isGuest ? "/shop/checkout/airwallex-guest" : "/shop/checkout/airwallex-create";
        const headers = { "Content-Type": "application/json" };
        if (!isGuest && token) headers.Authorization = `Bearer ${token}`;
        const body = isGuest
          ? { productIds, email: guestEmail, couponCode: couponCode || null }
          : { productIds, couponCode: couponCode || null };

        const r = await fetch(`${BACKEND}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || `Backend ${r.status}`);
        if (isGuest && data.token) guestTokenRef.current = data.token;

        if (cancelled) return;

        // 2. Load SDK
        const SDK = await loadAirwallexSdk();
        if (cancelled) return;

        // 3. Init (idempotent — Airwallex Embedded Elements .init is sync).
        try {
          SDK.init({ env: "prod", origin: window.location.origin });
        } catch (e) {
          // Re-init throws on subsequent mounts — that's fine.
          if (!String(e).includes("already")) throw e;
        }
        if (cancelled) return;

        // 4. Create Drop-in element with the requested theme
        const appearance = theme === "dark"
          ? {
              mode: "dark",
              variables: {
                colorBrand: CYAN,
                colorBackground: "transparent",
                colorText: "#ffffff",
              },
            }
          : {
              mode: "light",
              variables: {
                colorBrand: "#1a1f2e",
                colorBackground: "#ffffff",
                colorText: "#1a1f2e",
              },
            };
        const element = SDK.createElement("dropIn", {
          intent_id: data.intentId,
          client_secret: data.clientSecret,
          currency: data.currency || "USD",
          appearance,
        });
        elementRef.current = element;

        if (!containerRef.current || cancelled) return;
        element.mount(containerRef.current);

        // 5. Listen for success / error
        element.on("success", (ev) => {
          if (cancelled) return;
          try {
            trackAddPaymentInfo({ id: "cart", name: "Cart", price: 0 });
            trackPurchase(
              { id: "cart", name: "Cart", price: 0 },
              {
                transaction_id: data.intentId,
                email: guestEmail || user?.email,
              }
            );
            if (window.clarity) {
              window.clarity("event", "purchaseComplete");
              window.clarity("set", "conversion_type", "purchase_cart_airwallex");
            }
          } catch (e) { /* analytics never blocks success */ }
          if (onSuccess) onSuccess({ intentId: data.intentId, provider: "airwallex" });
        });
        element.on("error", (ev) => {
          const m = ev?.error?.message || "Payment failed";
          setStatus("error");
          setErrorMsg(m);
          if (onError) onError(m);
        });

        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err.message);
        if (onError) onError(err.message);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (elementRef.current?.unmount) {
        try { elementRef.current.unmount(); } catch { /* noop */ }
      }
      elementRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(","), couponCode, guestEmail, !!user, token]);

  const isDark = theme === "dark";
  const placeholderStyle = isDark
    ? { background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }
    : { background: "#f9fafb", border: "1px dashed #d1d5db", color: "#6b7280" };
  const loadingColor = isDark ? "rgba(255,255,255,0.5)" : "#6b7280";

  const isDarkPreview = isDark;
  const previewBg = isDarkPreview ? "rgba(255,255,255,0.03)" : "#fafbfc";
  const previewBorder = isDarkPreview ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb";
  const previewText = isDarkPreview ? "rgba(255,255,255,0.85)" : "#1a1f2e";
  const previewMuted = isDarkPreview ? "rgba(255,255,255,0.5)" : "#6b7280";

  return (
    <div>
      {/* If no email yet, show a STATIC visual preview of what's coming so
          customers see the available methods immediately (Shopify-style).
          The real Drop-in mounts once email is valid. Steven 2026-06-07. */}
      {!emailValid && (
        <div style={{
          padding: 14,
          background: previewBg,
          border: previewBorder,
          borderRadius: 8,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {/* Card row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingBottom: 12, borderBottom: previewBorder,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CircleIcon dark={isDarkPreview} />
              <div style={{ fontSize: 13, fontWeight: 600, color: previewText }}>
                Credit / Debit Card
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["VISA", "MC", "AMEX"].map((l) => (
                <span key={l} style={{
                  padding: "2px 6px", borderRadius: 3,
                  background: isDarkPreview ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  border: isDarkPreview ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
                  fontSize: 9, fontWeight: 700,
                  color: isDarkPreview ? "rgba(255,255,255,0.8)" : "#374151",
                  letterSpacing: "0.05em",
                }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Apple Pay row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: previewBorder,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CircleIcon dark={isDarkPreview} />
              <div style={{ fontSize: 13, fontWeight: 600, color: previewText }}>
                Apple Pay
              </div>
            </div>
          </div>

          {/* Google Pay row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CircleIcon dark={isDarkPreview} />
              <div style={{ fontSize: 13, fontWeight: 600, color: previewText }}>
                Google Pay
              </div>
            </div>
          </div>

          {/* Hint */}
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: previewBorder,
            fontSize: 11, color: previewMuted, textAlign: "center",
          }}>
            Enter your email above so we can send your download
          </div>
        </div>
      )}

      {emailValid && status === "loading" && (
        <div style={{
          padding: "16px 0",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: loadingColor,
        }}>
          Loading secure payment form…
        </div>
      )}

      <div ref={containerRef} style={{ minHeight: emailValid ? 60 : 0 }} />

      {errorMsg && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          background: "rgba(255,80,80,0.08)",
          border: "1px solid rgba(255,80,80,0.4)",
          borderRadius: 6,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#ff8080",
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

/** Preload the Airwallex SDK script (kept exported so CartPage can warm
 * the cache before the user types their email). Same pattern as
 * preloadPayPalSdk. */
export function preloadAirwallexSdk() {
  try { loadAirwallexSdk(); } catch { /* noop */ }
}

function CircleIcon({ dark }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: "50%",
      background: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
      border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #d1d5db",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: dark ? "rgba(255,255,255,0.3)" : "#9ca3af",
      }} />
    </div>
  );
}
