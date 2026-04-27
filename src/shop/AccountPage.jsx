/**
 * AccountPage — /shop/account
 *
 * Protected page (requires login).
 * Shows:
 *   - Welcome banner with user name/email
 *   - List of past purchases (paid + pending)
 *   - "Re-download" button per paid product (will hit /shop/download/:productId in Phase 5)
 *   - Sign out button
 *
 * Redirects to /shop/login if not logged in.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { getProductById } from "./products.js";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

export default function AccountPage() {
  const { user, loading, token, logout, apiBase } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState(null);
  const [purchasesError, setPurchasesError] = useState("");
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "My Account | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !user) {
      navigate("/shop/login?redirect=/shop/account", { replace: true });
    }
  }, [loading, user, navigate]);

  // Fetch purchases
  const fetchPurchases = useCallback(async () => {
    if (!token) return;
    setPurchasesLoading(true);
    setPurchasesError("");
    try {
      const res = await fetch(`${apiBase}/shop/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load purchases");
      setPurchases(data.purchases || []);
    } catch (err) {
      setPurchasesError(err.message || "Failed to load purchases");
    } finally {
      setPurchasesLoading(false);
    }
  }, [token, apiBase]);

  useEffect(() => {
    if (user && token) fetchPurchases();
  }, [user, token, fetchPurchases]);

  const handleLogout = () => {
    logout();
    navigate("/shop", { replace: true });
  };

  const handleDownload = async (purchase) => {
    setDownloadingId(purchase.id);
    setDownloadError("");
    try {
      const res = await fetch(
        `${apiBase}/shop/download/${encodeURIComponent(purchase.product_id)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get download link");
      }
      if (!data.downloadUrl) {
        throw new Error("Server returned no download URL");
      }
      // Navigate in a new tab so the user stays on the account page
      window.open(data.downloadUrl, "_blank", "noopener");
    } catch (err) {
      setDownloadError(
        `${purchase.product_name}: ${err.message || "Download failed"}`
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // Loading state
  if (loading || !user) {
    return (
      <div
        style={{
          background: BG,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Logo Bar */}
      <div
        style={{
          padding: isMobile ? "20px 20px 0" : "24px 60px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.1em",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>

        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "8px 16px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <main
        style={{
          flexGrow: 1,
          padding: isMobile ? "30px 20px 60px" : "50px 60px 80px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Welcome banner */}
          <div
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 12,
            }}
          >
            My Account
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? 32 : 44,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1.1,
              margin: "0 0 12px",
            }}
          >
            {user.name ? `Welcome, ${user.name}` : "Welcome Back"}
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 40,
            }}
          >
            Signed in as <span style={{ color: "#fff" }}>{user.email}</span>
          </p>

          {/* Purchases section */}
          <div
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              marginBottom: 14,
            }}
          >
            My Downloads
          </div>

          {purchasesLoading && (
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                padding: "20px 0",
              }}
            >
              Loading your purchases...
            </div>
          )}

          {purchasesError && (
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 13,
                color: "#ff6b6b",
                padding: "12px 16px",
                background: "rgba(255,107,107,0.08)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: 6,
                marginBottom: 20,
              }}
            >
              {purchasesError}
            </div>
          )}

          {downloadError && (
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 13,
                color: "#ff6b6b",
                padding: "12px 16px",
                background: "rgba(255,107,107,0.08)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: 6,
                marginBottom: 20,
              }}
            >
              {downloadError}
            </div>
          )}

          {purchases && purchases.length === 0 && !purchasesLoading && (
            <div
              style={{
                background: BG_ALT,
                border: "1px solid #141420",
                borderRadius: 10,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  margin: "0 0 18px",
                  lineHeight: 1.6,
                }}
              >
                You haven't purchased anything yet.
                <br />
                Browse the shop to find your next Ableton template or masterclass.
              </p>
              <Link
                to="/shop"
                style={{
                  display: "inline-block",
                  background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                  color: "#000",
                  textDecoration: "none",
                  padding: "12px 24px",
                  borderRadius: 6,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Browse Shop
              </Link>
            </div>
          )}

          {purchases && purchases.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {purchases.map((p) => {
                const product = getProductById(p.product_id);
                const isPaid = p.status === "paid";
                const accent = product?.badgeColor === "purple" ? PURPLE : CYAN;
                const accentRgba = product?.badgeColor === "purple" ? "187,134,252" : "0,229,255";
                return (
                  <div
                    key={p.id}
                    style={{
                      background: BG_ALT,
                      border: "1px solid #141420",
                      borderLeft: `3px solid ${accent}`,
                      borderRadius: 8,
                      padding: isMobile ? "16px 18px" : "18px 22px",
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: isMobile ? 14 : 16,
                    }}
                  >
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                          fontWeight: 800,
                          fontSize: 17,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {p.product_name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        ${p.amount_usd.toFixed(2)} USD ·{" "}
                        <span
                          style={{
                            color: isPaid ? "#4CAF50" : "#ffa726",
                            textTransform: "uppercase",
                            fontWeight: 600,
                          }}
                        >
                          {p.status}
                        </span>
                        {p.paid_at && (
                          <>
                            {" · "}
                            {new Date(p.paid_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </>
                        )}
                      </div>
                    </div>

                    {isPaid ? (
                      <button
                        onClick={() => handleDownload(p)}
                        disabled={downloadingId === p.id}
                        style={{
                          background: `linear-gradient(135deg, ${accent}, ${
                            product?.badgeColor === "purple" ? "#9c5bff" : "#00b8d4"
                          })`,
                          color: "#000",
                          border: "none",
                          borderRadius: 6,
                          padding: "10px 22px",
                          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                          fontWeight: 800,
                          fontSize: 12,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          cursor: downloadingId === p.id ? "wait" : "pointer",
                          boxShadow: `0 0 20px rgba(${accentRgba},0.35)`,
                          whiteSpace: "nowrap",
                          alignSelf: isMobile ? "stretch" : "center",
                          opacity: downloadingId === p.id ? 0.6 : 1,
                        }}
                      >
                        {downloadingId === p.id ? "Loading…" : "Download"}
                      </button>
                    ) : (
                      <span
                        style={{
                          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          fontStyle: "italic",
                          alignSelf: isMobile ? "stretch" : "center",
                        }}
                      >
                        Awaiting payment
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Back to shop link */}
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <Link
              to="/shop"
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
              }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
