/**
 * /shop/thank-you — post-payment landing with instant download links.
 *
 * Reads `shop_last_purchase` from localStorage (set by CheckoutV2Page after
 * Airwallex or PayPal success). Uses the JWT + productIds to fetch signed
 * R2 download URLs from the backend. Shows download buttons inline so the
 * customer never has to leave or check their email.
 *
 * Steven 2026-06-09: "after payment, thank-you page must have download links."
 */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { trackPurchase } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const BG = "#080810";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

export default function ThankYouPage() {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Thank you | Steven Angel Shop";
  }, []);

  // Analytics + clear cart
  useEffect(() => {
    try {
      trackPurchase(
        { id: "cart", name: "Cart", price: 0 },
        { transaction_id: params.get("intent_id") || params.get("link_id") || undefined, email: user?.email }
      );
      if (window.clarity) {
        window.clarity("event", "purchaseComplete");
        window.clarity("set", "conversion_type", "purchase");
      }
    } catch { /* analytics never blocks */ }
    clearCart();
    try { localStorage.removeItem("shop_active_coupon"); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch download URLs for purchased products
  useEffect(() => {
    async function fetchDownloads() {
      try {
        const raw = localStorage.getItem("shop_last_purchase");
        if (!raw) { setLoading(false); return; }
        const { token, productIds } = JSON.parse(raw);
        if (!token || !productIds?.length) { setLoading(false); return; }

        const results = [];
        for (const pid of productIds) {
          try {
            const res = await fetch(`${BACKEND}/shop/download/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              results.push({ productId: pid, ...data });
            }
          } catch { /* skip failed products */ }
        }
        setDownloads(results);
        // Clean up — one-time use
        try { localStorage.removeItem("shop_last_purchase"); } catch {}
      } catch { /* noop */ }
      setLoading(false);
    }
    fetchDownloads();
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
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
          Your purchase is confirmed. A download link was also sent to your email.
        </div>

        {/* Download links */}
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}>
            Preparing your downloads...
          </div>
        ) : downloads.length > 0 ? (
          <div style={{ marginBottom: 28 }}>
            {downloads.map((dl) => (
              <a
                key={dl.productId}
                href={dl.downloadUrl}
                download={dl.filename || true}
                style={{
                  display: "block", width: "100%", padding: "14px 24px",
                  marginBottom: 10, background: CYAN, color: "#000",
                  borderRadius: 8, textDecoration: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: 15, letterSpacing: "0.1em",
                  textTransform: "uppercase", textAlign: "center",
                  boxShadow: "0 4px 16px rgba(0,229,255,0.25)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" style={{ verticalAlign: "middle", marginRight: 8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download {dl.filename || dl.productId}
              </a>
            ))}
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
              Links expire in 15 minutes. You can always re-download from your account.
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: "rgba(255,255,255,0.5)", marginBottom: 24,
          }}>
            Check your email for your download link, or go to your account to download.
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/shop/account" style={{
            display: "inline-block", padding: "14px 32px", background: CYAN, color: "#000",
            borderRadius: 50, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
          }}>
            My Account
          </Link>
          <Link to="/shop" style={{
            display: "inline-block", padding: "14px 32px",
            background: "transparent", color: CYAN,
            border: `1px solid ${CYAN}`, borderRadius: 50,
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
          }}>
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
