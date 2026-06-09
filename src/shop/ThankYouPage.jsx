/**
 * /shop/thank-you — post-payment: order summary + download links + password setup.
 *
 * Reads `shop_last_purchase` from localStorage (set by CheckoutV2Page / CartPage
 * after payment). Shows order receipt, download buttons, and password setup prompt
 * for guest users who don't have an account yet.
 *
 * Steven 2026-06-09.
 */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import { trackPurchase } from "../lib/analytics/events";
import { getOrderedProducts } from "./products.js";

const CYAN = "#00E5FF";
const BG = "#080810";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

export default function ThankYouPage() {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null); // { items, total, email }

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

  // Fetch download URLs + order data
  useEffect(() => {
    async function fetchDownloads() {
      try {
        const raw = localStorage.getItem("shop_last_purchase");
        if (!raw) { setLoading(false); return; }
        const parsed = JSON.parse(raw);
        const { token, productIds } = parsed;

        // Store order summary data for display
        if (parsed.items) {
          setOrderData({ items: parsed.items, total: parsed.total, email: parsed.email });
        }

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
          } catch { /* skip */ }
        }
        setDownloads(results);
        try { localStorage.removeItem("shop_last_purchase"); } catch {}
      } catch { /* noop */ }
      setLoading(false);
    }
    fetchDownloads();
  }, []);

  // Upsell — products not in current order
  const upsellProducts = (() => {
    if (!orderData?.items) return [];
    const purchasedNames = new Set(orderData.items.map(i => i.name));
    return getOrderedProducts()
      .filter(p => p.enabled && !purchasedNames.has(p.name) && p.id !== "test-1-dollar")
      .slice(0, 2);
  })();

  const isGuest = !user || (user && !user.password_hash) || orderData?.email;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ textAlign: "center", maxWidth: 520, width: "100%" }}>
        {/* Success icon */}
        <div style={{ fontSize: 56, color: CYAN, marginBottom: 14 }}>&#10003;</div>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 36, textTransform: "uppercase",
          letterSpacing: "0.04em", marginBottom: 6,
        }}>
          Payment Received
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          color: "rgba(255,255,255,0.5)", marginBottom: 24,
        }}>
          {dateStr}{orderData?.email ? ` · ${orderData.email}` : ""}
        </div>

        {/* ── Order Summary ── */}
        {orderData?.items && (
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "16px 20px", marginBottom: 20, textAlign: "left",
          }}>
            {orderData.items.map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0",
                borderBottom: i < orderData.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                  {item.name}
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: CYAN }}>
                  ${item.price?.toFixed?.(2) || item.price}
                </span>
              </div>
            ))}
            {orderData.total != null && (
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                paddingTop: 10, marginTop: 6, borderTop: "1px solid rgba(255,255,255,0.12)",
              }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total
                </span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, color: CYAN }}>
                  ${orderData.total?.toFixed?.(2) || orderData.total} USD
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Downloads ── */}
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
            Preparing your downloads...
          </div>
        ) : downloads.length > 0 ? (
          <div style={{ marginBottom: 24 }}>
            {downloads.map((dl) => (
              <a
                key={dl.productId}
                href={dl.downloadUrl}
                download={dl.filename || true}
                style={{
                  display: "block", width: "100%", padding: "14px 24px",
                  marginBottom: 8, background: CYAN, color: "#000",
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
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
              Links expire in 15 minutes · Re-download anytime from your account
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            color: "rgba(255,255,255,0.6)", marginBottom: 24, lineHeight: 1.6,
          }}>
            A download link was sent to your email.<br />
            You can also download from your account page.
          </div>
        )}

        {/* ── Password Setup Prompt (guest users) ── */}
        {isGuest && !user && (
          <div style={{
            background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)",
            borderRadius: 10, padding: "16px 20px", marginBottom: 24, textAlign: "left",
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 14, color: CYAN, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 6,
            }}>
              Set up your account
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 10 }}>
              We created an account with your email. Set a password to re-download your files anytime.
            </div>
            <Link to="/shop/forgot" style={{
              display: "inline-block", padding: "8px 18px",
              background: "rgba(0,229,255,0.12)", border: `1px solid ${CYAN}`,
              borderRadius: 6, color: CYAN, textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            }}>
              Set Password →
            </Link>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
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

        {/* ── Upsell — "You might also like" ── */}
        {upsellProducts.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)", marginBottom: 12, textAlign: "center",
            }}>
              You Might Also Like
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {upsellProducts.map(p => {
                const pAccent = p.badgeColor === "purple" ? "#BB86FC" : CYAN;
                return (
                  <Link key={p.id} to={`/shop/${p.slug}`} style={{
                    flex: "1 1 200px", display: "block", padding: 14,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10, textDecoration: "none", color: "inherit",
                  }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
                      color: pAccent, marginBottom: 6,
                    }}>
                      {p.genre}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                      fontSize: 16, textTransform: "uppercase", color: "#fff",
                      marginBottom: 4, lineHeight: 1.2,
                    }}>
                      {p.name}
                    </div>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                      fontSize: 18, color: pAccent,
                    }}>
                      ${p.price}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
