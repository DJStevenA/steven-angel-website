/**
 * /shop/thank-you — landing page after Airwallex Payment Link completion.
 *
 * Airwallex sends the customer here with query params after a payment. The
 * webhook (POST /airwallex/webhook on the backend) is the source of truth
 * for marking purchases paid — we don't trust this URL alone. This page
 * just clears the cart, fires GA4 purchase, and shows a friendly success
 * message. Steven 2026-06-07.
 */
import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { trackPurchase } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const BG = "#080810";

export default function ThankYouPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [params] = useSearchParams();

  useEffect(() => {
    document.title = "Thank you | Steven Angel Shop";
  }, []);

  useEffect(() => {
    // Fire purchase analytics + clear local cart so the user doesn't see
    // the items again on their next visit.
    try {
      trackPurchase(
        { id: "cart", name: "Cart", price: 0 },
        { transaction_id: params.get("intent_id") || params.get("link_id") || undefined, email: user?.email }
      );
      if (window.clarity) {
        window.clarity("event", "purchaseComplete");
        window.clarity("set", "conversion_type", "purchase_cart_airwallex_link");
      }
    } catch { /* analytics never blocks */ }
    clearCart();
    // Clear coupon state too so the next session starts clean.
    try { localStorage.removeItem("shop_active_coupon"); } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: 64, color: CYAN, marginBottom: 18 }}>&#10003;</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 40, textTransform: "uppercase",
          letterSpacing: "0.04em", marginBottom: 14,
        }}>
          Payment Received
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          color: "rgba(255,255,255,0.72)", lineHeight: 1.6, marginBottom: 28,
        }}>
          Your purchase is confirmed.
          {user
            ? " Head to your account to download your files."
            : " Check your email — your download link is on its way."}
        </div>
        <Link to={user ? "/shop/account" : "/shop"} style={{
          display: "inline-block", padding: "14px 32px", background: CYAN, color: "#000",
          borderRadius: 50, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
        }}>
          {user ? "Go to my account" : "Back to shop"}
        </Link>
      </div>
    </div>
  );
}
