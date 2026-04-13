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

// Module-level cache so the SDK is loaded at most once per client ID
const sdkCache = new Map();

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

export default function CheckoutButton({ product, couponCode, onSuccess, onError }) {
  const { token, apiBase } = useAuth();
  const containerRef = useRef(null);
  const couponRef = useRef(couponCode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              const res = await fetch(`${apiBase}/shop/checkout/create`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  productId: product.id,
                  couponCode: couponRef.current || null,
                }),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Failed to create order");
              }
              return data.orderId;
            } catch (err) {
              const msg = err.message || "Failed to create order";
              setError(msg);
              if (onError) onError(msg);
              throw err;
            }
          },

          onApprove: async (data) => {
            try {
              const res = await fetch(`${apiBase}/shop/checkout/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
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
              }
              if (onSuccess) onSuccess(json.purchase);
            } catch (err) {
              const msg = err.message || "Payment capture failed";
              setError(msg);
              if (onError) onError(msg);
            }
          },

          onCancel: () => {
            // User closed the PayPal popup — not an error, just reset loading
          },

          onError: (err) => {
            console.error("[paypal] button error:", err);
            const msg =
              typeof err === "string"
                ? err
                : err?.message || "PayPal encountered an error";
            setError(msg);
            if (onError) onError(msg);
          },
        });

        if (!cancelled && containerRef.current) {
          await buttonsInstance.render(containerRef.current);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[checkout] setup error:", err);
        setError(err.message || "Failed to initialize checkout");
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
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
          }}
        >
          Loading PayPal…
        </div>
      )}
      <div ref={containerRef} />
      {error && (
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
          {error}
        </div>
      )}
    </div>
  );
}
