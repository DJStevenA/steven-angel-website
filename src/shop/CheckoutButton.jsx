/**
 * CheckoutButton — PayPal Smart Buttons wrapper for the shop
 *
 * Loads the PayPal JS SDK lazily (only when this component mounts) and
 * renders PayPal Smart Buttons. Client ID is fetched from the backend
 * (/shop/config) so we don't need to rebuild the frontend when Railway
 * env vars change.
 *
 * Flow:
 *   1. Fetch client ID from /shop/config
 *   2. Load PayPal SDK via <script> (cached per clientId)
 *   3. Render PayPal Buttons
 *   4. On click → createOrder → POST /shop/checkout/create → return orderId
 *   5. User pays in PayPal popup
 *   6. onApprove → POST /shop/checkout/capture → call onSuccess(purchase)
 *
 * Props:
 *   product       — { id, name, price } object from products.js
 *   couponCode    — optional coupon string (e.g. "WELCOME15")
 *   onSuccess     — callback(purchase) after capture succeeds
 *   onError       — callback(errorMessage) for user-facing errors
 */

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { trackAddPaymentInfo, trackPurchase } from "../lib/analytics/events";

// Module-level cache so the SDK is loaded at most once per client ID
const sdkCache = new Map();
let _preloadPromise = null;

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

function loadPayPalSdk(clientId, mode) {
  const cacheKey = `${clientId}-${mode}`;
  if (sdkCache.has(cacheKey)) return sdkCache.get(cacheKey);

  const promise = new Promise((resolve, reject) => {
    // If already loaded with the same client ID, skip
    if (window.paypal && window.__paypalLoadedClientId === cacheKey) {
      return resolve(window.paypal);
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId
    )}&currency=USD&intent=capture&disable-funding=credit,card`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.__paypalLoadedClientId = cacheKey;
        resolve(window.paypal);
      } else {
        reject(new Error("PayPal SDK loaded but window.paypal is undefined"));
      }
    };
    script.onerror = () => {
      sdkCache.delete(cacheKey); // allow retry
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.body.appendChild(script);
  });

  sdkCache.set(cacheKey, promise);
  return promise;
}

/**
 * Preload the PayPal SDK as early as possible. Single shared Promise guards
 * against double-loading — fixes the "zoid has deleted all components" error
 * that occurred when two components both tried to load the SDK in parallel
 * (e.g. preload from useEffect + CartCheckoutButton's own loader).
 *
 * Returns the loaded `window.paypal` (or null if config/load fails).
 * Callers MUST await the return — don't add their own <script> tag.
 */
export function preloadPayPalSdk() {
  if (_preloadPromise) return _preloadPromise;
  _preloadPromise = (async () => {
    try {
      const res = await fetch(`${BACKEND}/shop/config`);
      if (!res.ok) return null;
      const config = await res.json();
      if (!config.paypalClientId) return null;
      return await loadPayPalSdk(config.paypalClientId, config.paypalMode);
    } catch {
      // Reset so a future call can retry
      _preloadPromise = null;
      return null;
    }
  })();
  return _preloadPromise;
}

export default function CheckoutButton({ product, couponCode, guestEmail, onSuccess, onError }) {
  const { token, apiBase } = useAuth();
  const containerRef = useRef(null);
  const couponRef = useRef(couponCode);
  // When running in guest mode, we get a short-lived JWT from /checkout/guest-start
  // and use it for the /checkout/capture call. Stored in a ref so it survives
  // between createOrder and onApprove.
  const guestTokenRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Keep couponRef in sync so createOrder always sees the latest code
  useEffect(() => {
    couponRef.current = couponCode;
  }, [couponCode]);

  useEffect(() => {
    let cancelled = false;
    let buttonsInstance = null;

    async function setup() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch PayPal config from backend
        const configRes = await fetch(`${apiBase}/shop/config`);
        if (!configRes.ok) {
          throw new Error("Failed to load shop config");
        }
        const config = await configRes.json();
        if (!config.paypalClientId) {
          throw new Error("PayPal is not configured on the server");
        }

        // 2. Load PayPal SDK
        const paypal = await loadPayPalSdk(config.paypalClientId, config.paypalMode);
        if (cancelled || !containerRef.current) return;

        // 3. Render PayPal Buttons
        buttonsInstance = paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          },

          createOrder: async () => {
            try {
              const isGuest = !!guestEmail;
              const endpoint = isGuest ? "/shop/checkout/guest-start" : "/shop/checkout/create";
              const headers = { "Content-Type": "application/json" };
              if (!isGuest && token) headers.Authorization = `Bearer ${token}`;
              const body = isGuest
                ? { productId: product.id, email: guestEmail, couponCode: couponRef.current || null }
                : { productId: product.id, couponCode: couponRef.current || null };
              const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Failed to create order");
              }
              if (isGuest && data.token) guestTokenRef.current = data.token;
              return data.orderId;
            } catch (err) {
              console.error("[checkout] createOrder failed:", err);
              throw err;
            }
          },

          onApprove: async (data) => {
            try {
              // GA4: add_payment_info fires at moment user approves payment in PayPal
              if (product) trackAddPaymentInfo(product);
              // Use the guest JWT (from /checkout/guest-start) if in guest mode,
              // otherwise use the logged-in user's token.
              const captureToken = guestTokenRef.current || token;
              const res = await fetch(`${apiBase}/shop/checkout/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${captureToken}`,
                },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const json = await res.json();
              if (!res.ok) {
                throw new Error(json.error || "Failed to capture payment");
              }
              // Clarity: track successful purchase
              if (window.clarity) {
                window.clarity("event", "purchaseComplete");
                window.clarity("set", "purchaseProduct", product?.name || "unknown");
                window.clarity("set", "conversion_type", "purchase_shop");
                window.clarity("set", "product", product?.name || "unknown");
                window.clarity("set", "value", String(product?.price || 0));
              }
              // Pass guestEmail (set on the parent guest-checkout flow) so Google can
              // match this purchase to the ad-clicker via Enhanced Conversions.
              // For logged-in users, guestEmail is undefined — Smart Bidding still
              // gets the purchase signal, just without the email-hash match boost.
              if (product) trackPurchase(product, { transaction_id: data.orderID, email: guestEmail });
              if (onSuccess) onSuccess(json.purchase);
            } catch (err) {
              console.error("[checkout] capture failed:", err);
            }
          },

          onCancel: () => {
            // User closed the PayPal popup — silent.
          },

          onError: (err) => {
            // Silent — never surface PayPal SDK errors to the customer.
            // Includes benign 'window is closed' when user closes the popup.
            console.error("[checkout] paypal SDK error:", err);
          },
        });

        if (!cancelled && containerRef.current) {
          await buttonsInstance.render(containerRef.current);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[checkout] setup error:", err);
        setLoading(false);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (buttonsInstance && typeof buttonsInstance.close === "function") {
        try {
          buttonsInstance.close();
        } catch (e) {
          // ignore — component unmounting
        }
      }
    };
    // Only re-run if the product ID changes, token changes, or apiBase changes.
    // couponCode changes are handled via couponRef so we don't need to re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, token, apiBase]);

  return (
    <div>
      {loading && (
        <div
          style={{
            padding: "12px 0",
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
          }}
        >
          Loading PayPal…
        </div>
      )}
      <div ref={containerRef} />
    </div>
  );
}
