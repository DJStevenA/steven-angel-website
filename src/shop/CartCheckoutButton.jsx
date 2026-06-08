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
// SDK loading delegates to the shared preloadPayPalSdk() in CheckoutButton.jsx
// — a single shared promise prevents double-loading and the "zoid has deleted
// all components" race condition that occurred when two components both tried
// to load the SDK in parallel.

export default function CartCheckoutButton({ productIds, couponCode, guestEmail, onSuccess, onError }) {
  const { token } = useAuth();
  const containerRef = useRef(null);
  const couponRef = useRef(couponCode);
  const guestEmailRef = useRef(guestEmail);
  const guestTokenRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { couponRef.current = couponCode; }, [couponCode]);
  // Keep guestEmail current in createOrder closure without forcing a button
  // re-render on every keystroke. CartPage may pass guestEmail as undefined
  // until the email is valid (renders dimmed PayPal then), so we accept
  // late-binding here.
  useEffect(() => { guestEmailRef.current = guestEmail; }, [guestEmail]);

  useEffect(() => {
    let cancelled = false;
    let buttonsInstance = null;

    async function setup() {
      try {
        setLoading(true);

        // Single shared loader — guards against double-load / zoid mismatch.
        const paypal = await preloadPayPalSdk();
        if (!paypal) throw new Error("PayPal not configured");
        if (cancelled || !containerRef.current) return;

        buttonsInstance = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 },

          createOrder: async () => {
            try {
              const currentEmail = guestEmailRef.current;
              const hasEmail = !!currentEmail;
              const hasToken = !!token;
              // Three paths: logged in → cart-create, has email → cart-guest, neither → cart-anon
              const endpoint = hasToken ? "/shop/checkout/cart-create"
                : hasEmail ? "/shop/checkout/cart-guest"
                : "/shop/checkout/cart-anon";
              const headers = { "Content-Type": "application/json" };
              if (hasToken) headers.Authorization = `Bearer ${token}`;
              const body = hasEmail
                ? { productIds, email: currentEmail, couponCode: couponRef.current || null }
                : { productIds, couponCode: couponRef.current || null };
              const res = await fetch(`${BACKEND}${endpoint}`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to create order");
              if (hasEmail && data.token) guestTokenRef.current = data.token;
              // Track if this was an anon order (no email, no login)
              if (!hasToken && !hasEmail) guestTokenRef.current = "__anon__";
              return data.orderId;
            } catch (err) {
              console.error("[cart-checkout] createOrder failed:", err);
              throw err;
            }
          },

          onApprove: async (data) => {
            try {
              trackAddPaymentInfo({ id: "cart", name: "Cart", price: 0 });
              const isAnon = guestTokenRef.current === "__anon__";
              // Anon orders use a different capture endpoint that gets email from PayPal
              if (isAnon) {
                const res = await fetch(`${BACKEND}/shop/checkout/cart-anon-capture`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || "Failed to capture payment");
                if (window.clarity) {
                  window.clarity("event", "purchaseComplete");
                  window.clarity("set", "conversion_type", "purchase_cart_anon");
                }
                trackPurchase({ id: "cart", name: "Cart", price: 0 }, { transaction_id: data.orderID, email: json.email });
                if (onSuccess) onSuccess(json);
                return;
              }
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
              trackPurchase({ id: "cart", name: "Cart", price: 0 }, { transaction_id: data.orderID, email: guestEmailRef.current });
              if (onSuccess) onSuccess(json);
            } catch (err) {
              console.error("[cart-checkout] capture failed:", err);
            }
          },

          onError: (err) => {
            // Silent — never surface PayPal SDK errors to the customer.
            // Includes benign 'window is closed' when user closes the popup.
            console.error("[cart-checkout] paypal SDK error:", err);
          },
        });

        if (!cancelled && containerRef.current) {
          await buttonsInstance.render(containerRef.current);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[cart-checkout] setup failed:", err);
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
    </div>
  );
}
