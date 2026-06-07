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
const SDK_URL = "https://static.airwallex.com/components/v1/loader.js";

// SDK is a singleton — cache the load promise across mounts so navigating
// back to /shop/cart doesn't reload the script.
let sdkPromise = null;
function loadAirwallexSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.AirwallexComponentsSDK) return resolve(window.AirwallexComponentsSDK);
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => {
      if (window.AirwallexComponentsSDK) resolve(window.AirwallexComponentsSDK);
      else reject(new Error("Airwallex SDK loaded but global missing"));
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
    // Don't auto-load if email isn't ready yet (avoids creating an
    // abandoned intent for a typo). Render the "Enter email" hint instead.
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

        // 3. Init (idempotent — Airwallex SDK handles re-init gracefully)
        await SDK.init({ env: "prod", enabledElements: ["payments"] });
        if (cancelled) return;

        // 4. Create Drop-in element
        const element = SDK.createElement("dropIn", {
          intent_id: data.intentId,
          client_secret: data.clientSecret,
          currency: data.currency || "USD",
          appearance: {
            mode: "dark",
            variables: {
              colorBrand: CYAN,
              colorBackground: "transparent",
              colorText: "#ffffff",
            },
          },
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

  return (
    <div>
      {!emailValid && (
        <div style={{
          padding: "12px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px dashed rgba(255,255,255,0.15)",
          borderRadius: 8,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
          textAlign: "center",
        }}>
          Enter your email above to pay with card / Apple Pay / Google Pay
        </div>
      )}

      {emailValid && status === "loading" && (
        <div style={{
          padding: "16px 0",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
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
