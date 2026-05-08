/**
 * MashupCreditsPage.jsx — Credit pack purchase page
 *
 * Loads pack data from GET /mashup/pricing (public, no auth).
 * Renders three cards with PayPal checkout wired up per the existing
 * CheckoutButton pattern.
 *
 * The middle pack (index 1 from the pricing API — 25 credits) gets a
 * "Best Value" badge.
 *
 * Auth: supports both logged-in and guest-start flows, exactly like
 * CheckoutButton.jsx does. If the user is not logged in we show a
 * guest email field; if they are logged in we skip it.
 *
 * After a successful capture: redirects to /tools/mashup.
 *
 * No emoji anywhere.
 */

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../shop/AuthContext.jsx";
import { getMashupPricing } from "./lib/api.js";
import styles from "./styles.module.css";

// PayPal SDK is cached module-level (same pattern as CheckoutButton.jsx)
const sdkCache = new Map();

function loadPayPalSdk(clientId, mode) {
  const cacheKey = `${clientId}-${mode}`;
  if (sdkCache.has(cacheKey)) return sdkCache.get(cacheKey);

  const promise = new Promise((resolve, reject) => {
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
      sdkCache.delete(cacheKey);
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.body.appendChild(script);
  });

  sdkCache.set(cacheKey, promise);
  return promise;
}

// ─── PackCheckoutButton — mirrors CheckoutButton.jsx for credits ───

function PackCheckoutButton({ pack, guestEmail, apiBase, token, onSuccess, onError }) {
  const containerRef = useRef(null);
  const guestTokenRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let buttonsInstance = null;

    async function setup() {
      try {
        setLoading(true);
        setError(null);

        const configRes = await fetch(`${apiBase}/shop/config`);
        if (!configRes.ok) throw new Error("Failed to load shop config");
        const config = await configRes.json();
        if (!config.paypalClientId) throw new Error("PayPal is not configured on the server");

        const paypal = await loadPayPalSdk(config.paypalClientId, config.paypalMode);
        if (cancelled || !containerRef.current) return;

        buttonsInstance = paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48 },

          createOrder: async () => {
            try {
              const isGuest = !token && !!guestEmail;
              const endpoint = isGuest
                ? "/credits/checkout/guest-start"
                : "/credits/checkout/create";
              const headers = { "Content-Type": "application/json" };
              if (!isGuest && token) headers.Authorization = `Bearer ${token}`;
              const body = isGuest
                ? { packId: pack.id, email: guestEmail }
                : { packId: pack.id };

              const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to create order");
              if (isGuest && data.token) guestTokenRef.current = data.token;
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
              const captureToken = guestTokenRef.current || token;
              const res = await fetch(`${apiBase}/credits/checkout/capture`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${captureToken}`,
                },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || "Failed to capture payment");
              if (onSuccess) onSuccess(json);
            } catch (err) {
              const msg = err.message || "Payment capture failed";
              setError(msg);
              if (onError) onError(msg);
            }
          },

          onCancel: () => {},

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
        if (cancelled) return;
        setError(err.message || "Failed to initialize checkout");
        setLoading(false);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (buttonsInstance && typeof buttonsInstance.close === "function") {
        try { buttonsInstance.close(); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack.id, token, apiBase, guestEmail]);

  return (
    <div>
      {loading && (
        <div style={{
          padding: "12px 0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
        }}>
          Loading checkout...
        </div>
      )}
      <div ref={containerRef} />
      {error && (
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
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────

export default function MashupCreditsPage() {
  const { token, user, loading: authLoading, apiBase } = useAuth();
  const navigate = useNavigate();

  const [packs, setPacks] = useState([]);
  const [renderCost, setRenderCost] = useState(6);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState(null);

  const [guestEmail, setGuestEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);

  // Load pricing on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getMashupPricing(apiBase);
        if (!cancelled) {
          setPacks(data.packs || []);
          setRenderCost(data.renderCost || 6);
        }
      } catch (err) {
        if (!cancelled) setPricingError(err.message || "Could not load pricing");
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apiBase]);

  function handleSuccess(json) {
    const newBalance = json.balance;
    setSuccessMsg(
      newBalance != null
        ? `Purchase complete. New balance: ${newBalance} credits.`
        : "Purchase complete."
    );
    // Redirect after a short delay so user sees the confirmation
    setTimeout(() => navigate("/tools/mashup"), 2000);
  }

  function handleError(msg) {
    // error is shown inline by PackCheckoutButton; nothing extra needed here
  }

  const isGuest = !authLoading && !token;

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>

        {/* ─── Top bar ─── */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Link to="/" className={styles.wordmark}>
              STEVEN ANGEL <span className={styles.wordmarkAccent}>TOOLS</span>
            </Link>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link to="/tools/mashup">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#00E5FF" }}>
                  MASHUP
                </span>
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>Credits</span>
            </nav>
          </div>
          <div className={styles.topBarRight}>
            {token && user?.email && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {user.email}
              </span>
            )}
            {!authLoading && !token && (
              <Link to="/shop/login?return=/tools/mashup/credits" className={styles.btnOutline}
                style={{ padding: "8px 20px", fontSize: 12 }}>
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* ─── Heading ─── */}
        <div className={styles.panel}>
          <span className={styles.placeholderLabel}>Mashup Generator</span>
          <h1 className={styles.placeholderHeading}>
            Buy <span>Credits</span>
          </h1>
          <p className={styles.panelBody}>
            {renderCost} credits per mashup render. Credits never expire.
          </p>
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: 10,
            padding: "16px 24px",
            marginBottom: 24,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "#00E5FF",
          }}>
            {successMsg} Redirecting...
          </div>
        )}

        {/* Guest email field — only show if not logged in */}
        {isGuest && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span className={styles.panelNum}>1</span>
              Your email
            </h2>
            <p className={styles.panelBody} style={{ marginBottom: 16 }}>
              Enter your email to receive your credits. No account required.
            </p>
            <input
              type="email"
              placeholder="your@email.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              style={{
                background: "#08080f",
                border: "1px solid #1a1a2e",
                borderRadius: 6,
                padding: "14px 16px",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                width: "100%",
                maxWidth: 360,
                outline: "none",
              }}
              autoComplete="email"
            />
          </div>
        )}

        {/* ─── Pack cards ─── */}
        {pricingLoading && (
          <p className={styles.loadingText} style={{ margin: "24px 0" }}>
            Loading pricing...
          </p>
        )}

        {pricingError && (
          <p className={styles.errorText} style={{ margin: "24px 0" }}>
            {pricingError}
          </p>
        )}

        {!pricingLoading && packs.length > 0 && (
          <div className={styles.cardsGrid}>
            {packs.map((pack, idx) => {
              const isFeatured = idx === 1; // middle pack = best value
              // Disable checkout for guests who haven't entered email yet
              const checkoutBlocked = isGuest && !guestEmail.includes("@");

              return (
                <div
                  key={pack.id}
                  className={[styles.packCard, isFeatured ? styles.packCardFeatured : ""].join(" ")}
                >
                  {isFeatured && (
                    <span className={styles.bestValueBadge}>Best Value</span>
                  )}

                  <div>
                    <div className={styles.packName}>{pack.name || pack.id}</div>
                    <div className={styles.packCredits} style={{ marginTop: 6 }}>
                      <span>{pack.credits}</span> credits
                      {" "}&middot; <span>{pack.renders}</span>{" "}
                      {pack.renders === 1 ? "mashup" : "mashups"}
                    </div>
                  </div>

                  <div className={styles.packPrice}>
                    <sub>$</sub>{pack.priceUsd}
                  </div>

                  <div className={styles.packCardFooter}>
                    {checkoutBlocked ? (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.35)",
                        textAlign: "center",
                        padding: "12px 0",
                      }}>
                        Enter your email above to checkout
                      </p>
                    ) : (
                      <PackCheckoutButton
                        pack={pack}
                        guestEmail={isGuest ? guestEmail : null}
                        apiBase={apiBase}
                        token={token}
                        onSuccess={handleSuccess}
                        onError={handleError}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back link */}
        <div className={styles.mt32} style={{ textAlign: "center" }}>
          <Link to="/tools/mashup" className={styles.btnLink}>
            Back to Mashup Generator
          </Link>
        </div>

      </div>
    </div>
  );
}
