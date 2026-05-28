/**
 * CartCheckoutButton — single PayPal button for the entire cart.
 *
 * Uses /shop/checkout/cart-create (logged in) or /shop/checkout/cart-guest
 * to create ONE PayPal order for all items combined.
 */

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { preloadPayPalSdk } from "./CheckoutButton.jsx";
import { trackAddPaymentInfo, trackPurchase } from "../lib/analytics/events";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const sdkCache = new Map();

function loadPayPalSdk(clientId, mode) {
  const cacheKey = `${clientId}-${mode}`;
  if (sdkCache.has(cacheKey)) return sdkCache.get(cacheKey);
  const promise = new Promise((resolve, reject) => {
    if (window.paypal && window.__paypalLoadedClientId === cacheKey) return resolve(window.paypal);
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&disable-funding=credit,card`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) { window.__paypalLoadedClientId = cacheKey; resolve(window.paypal); }
      else reject(new Error("PayPal SDK loaded but window.paypal is undefined"));
    };
    script.onerror = () => { sdkCache.delete(cacheKey); reject(new Error("Failed to load PayPal SDK")); };
    document.body.appendChild(script);
  });
  sdkCache.set(cacheKey, promise);
  return promise;
}

export default function CartCheckoutButton({ productIds, couponCode, guestEmail, onSuccess, onError }) {
  const { token } = useAuth();
  const containerRef = useRef(null);
  const couponRef = useRef(couponCode);
  const guestTokenRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { couponRef.current = couponCode; }, [couponCode]);

  useEffect(() => {
    let cancelled = false;
    let buttonsInstance = null;

    async function setup() {
      try {
        setLoading(true);
        setError(null);

        const configRes = await fetch(`${BACKEND}/shop/config`);
        if (!configRes.ok) throw new Error("Failed to load shop config");
        const config = await configRes.json();
        if (!config.paypalClientId) throw new Error("PayPal not configured");

        const paypal = await loadPayPalSdk(config.paypalClientId, config.paypalMode);
        if (cancelled || !containerRef.current) return;

        buttonsInstance = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 },

          createOrder: async () => {
            try {
              const isGuest = !!guestEmail;
              const endpoint = isGuest ? "/shop/checkout/cart-guest" : "/shop/checkout/cart-create";
              const headers = { "Content-Type": "application/json" };
              if (!isGuest && token) headers.Authorization = `Bearer ${token}`;
              const body = isGuest
                ? { productIds, email: guestEmail, couponCode: couponRef.current || null }
                : { productIds, couponCode: couponRef.current || null };
              const res = await fetch(`${BACKEND}${endpoint}`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to create order");
              if (isGuest && data.token) guestTokenRef.current = data.token;
              return data.orderId;
            } catch (err) {
              setError(err.message);
              if (onError) onError(err.message);
              throw err;
            }
          },

          onApprove: async (data) => {
            try {
              trackAddPaymentInfo({ id: "cart", name: "Cart", price: 0 });
              const captureToken = guestTokenRef.current || token;
              const res = await fetch(`${BACKEND}/shop/checkout/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${captureToken}` },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || "Failed to capture payment");
              if (window.clarity) {
                window.clarity("event", "purchaseComplete");
                window.clarity("set", "conversion_type", "purchase_cart");
              }
              trackPurchase({ id: "cart", name: "Cart", price: 0 }, { transaction_id: data.orderID, email: guestEmail });
              if (onSuccess) onSuccess(json);
            } catch (err) {
              setError(err.message);
              if (onError) onError(err.message);
            }
          },

          onError: (err) => {
            const msg = typeof err === "string" ? err : err?.message || "PayPal error";
            setError(msg);
            if (onError) onError(msg);
          },
        });

        if (!cancelled && containerRef.current) {
          await buttonsInstance.render(containerRef.current);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to initialize checkout");
          setLoading(false);
        }
      }
    }

    if (productIds.length > 0) setup();

    return () => {
      cancelled = true;
      if (buttonsInstance?.close) try { buttonsInstance.close(); } catch {}
    };
  }, [productIds.join(","), token]);

  return (
    <div>
      {loading && (
        <div style={{ padding: "12px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
          Loading PayPal...
        </div>
      )}
      <div ref={containerRef} />
      {error && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ff8080" }}>
          {error}
        </div>
      )}
    </div>
  );
}
