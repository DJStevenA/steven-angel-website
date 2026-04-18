/**
 * ContractModal — Ghost track purchase flow
 *
 * Step 1: Contract (NDA + exclusivity agreement) → user types name + checks box
 * Step 2: PayPal Smart Buttons (after backend signs the contract)
 * Step 3: Success (download link + redirect to account)
 */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const API_BASE = "https://ghost-backend-production-adb6.up.railway.app";
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const sdkCache = new Map();
function loadPayPalSdk(clientId, mode) {
  const cacheKey = `${clientId}-${mode}`;
  if (sdkCache.has(cacheKey)) return sdkCache.get(cacheKey);
  const promise = new Promise((resolve, reject) => {
    if (window.paypal && window.__paypalLoadedClientId === cacheKey) return resolve(window.paypal);
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&disable-funding=credit,card`;
    script.async = true;
    script.onload = () => window.paypal ? (window.__paypalLoadedClientId = cacheKey, resolve(window.paypal)) : reject(new Error("PayPal SDK undefined"));
    script.onerror = () => { sdkCache.delete(cacheKey); reject(new Error("Failed to load PayPal SDK")); };
    document.body.appendChild(script);
  });
  sdkCache.set(cacheKey, promise);
  return promise;
}

export default function ContractModal({ track, onClose }) {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("contract"); // contract | paypal | success
  const [legalName, setLegalName] = useState(user?.name || "");
  const [agreed, setAgreed] = useState(false);
  const [signingError, setSigningError] = useState(null);
  const [signing, setSigning] = useState(false);
  const [contractSignedAt, setContractSignedAt] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [paypalError, setPaypalError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const paypalRef = useRef(null);
  const paypalRendered = useRef(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && step !== "success") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  // Render PayPal buttons when step becomes "paypal"
  useEffect(() => {
    if (step !== "paypal" || !paypalRef.current || paypalRendered.current) return;
    paypalRendered.current = true;

    async function renderPayPal() {
      try {
        const configRes = await fetch(`${API_BASE}/shop/config`);
        const config = await configRes.json();
        const paypal = await loadPayPalSdk(config.paypalClientId, config.paypalMode);
        if (!paypalRef.current) return;

        paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
          createOrder: async () => {
            const res = await fetch(`${API_BASE}/ghost/checkout/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ trackId: track.id, contractSignedAt }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create order");
            return data.orderId;
          },
          onApprove: async (data) => {
            try {
              const res = await fetch(`${API_BASE}/ghost/checkout/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const result = await res.json();
              if (!res.ok) throw new Error(result.error || "Capture failed");
              setDownloadUrl(result.downloadUrl);
              setStep("success");
              if (window.clarity) window.clarity("event", "ghostTrackPurchased");
              if (window.gtag) window.gtag("event", "purchase", { currency: "USD", value: track.price_usd, items: [{ id: track.id, name: track.name }] });
            } catch (err) {
              setPaypalError(err.message);
            }
          },
          onError: (err) => {
            setPaypalError("Payment failed. Please try again.");
            console.error("[ghost] PayPal error:", err);
          },
        }).render(paypalRef.current);
      } catch (err) {
        setPaypalError("Could not load payment. Please refresh and try again.");
        console.error("[ghost] PayPal load error:", err);
      }
    }

    renderPayPal();
  }, [step, token, track, contractSignedAt]);

  const handleSign = async () => {
    if (!legalName.trim() || !agreed) return;
    setSigning(true);
    setSigningError(null);
    try {
      const res = await fetch(`${API_BASE}/ghost/contract/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trackId: track.id, legalName: legalName.trim(), agreed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign contract");
      setContractSignedAt(data.contractSignedAt);
      setStep("paypal");
    } catch (err) {
      setSigningError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const backdropClick = (e) => {
    if (e.target === e.currentTarget && step !== "success") onClose();
  };

  // ── Success ──
  if (step === "success") {
    return (
      <div style={backdropStyle}>
        <div style={{ ...modalStyle(CYAN), textAlign: "center", padding: isMobile ? "40px 24px" : "56px 48px" }}>
          <div style={smallLabel(CYAN)}>Purchase Complete</div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 32 : 44, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", margin: "12px 0 16px", lineHeight: 1.1 }}>
            It's Yours.
          </div>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 28 }}>
            <strong style={{ color: "#fff" }}>{track.name}</strong> has been removed from our catalog.
            <br />This track will never be sold again.
            <br /><br />
            A download link has been sent to your email.
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", padding: "14px 32px", background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`, color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 15, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", borderRadius: 8, marginBottom: 16 }}
            >
              Download Now
            </a>
          )}
          <div>
            <button
              onClick={() => navigate("/shop/account")}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}
            >
              Go to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={backdropClick} style={backdropStyle}>
      <div style={{ ...modalStyle(CYAN), maxHeight: "90vh", overflowY: "auto" }}>
        {/* Close */}
        {step !== "success" && (
          <button onClick={onClose} aria-label="Close" style={closeBtn}>×</button>
        )}

        {/* Header */}
        <div style={smallLabel(CYAN)}>
          {step === "contract" ? "Before You Purchase" : "Complete Payment"}
        </div>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 22 : 28, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>
          {track.name}
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: CYAN, marginBottom: 20 }}>
          €{track.price_eur} — Exclusive · Sold Once
        </div>

        {/* Not logged in */}
        {!authLoading && !user && (
          <div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 20, padding: "14px 16px", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, background: "rgba(0,229,255,0.04)" }}>
              Sign in to your account to purchase. Your account lets you re-download your track at any time.
            </div>
            <Link to="/shop/login?redirect=/shop?tab=ghost" style={btnPrimary(CYAN)}>Sign In</Link>
            <Link to="/shop/signup?redirect=/shop?tab=ghost" style={{ ...btnPrimary(CYAN), background: "transparent", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)", marginTop: 10 }}>Create Account</Link>
          </div>
        )}

        {/* Contract Step */}
        {!authLoading && user && step === "contract" && (
          <div>
            {/* What you receive */}
            <div style={{ padding: "14px 16px", background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 8, marginBottom: 18 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: CYAN, marginBottom: 10 }}>
                What You Receive
              </div>
              {[
                "WAV Master (full quality, release-ready)",
                "Extended Mix + Radio Edit (where included)",
                "100% Full Copyright Transfer to You",
                "NDA — This track will never appear under Steven Angel's name",
                "Sold exclusively — never resold to anyone else",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 6, lineHeight: 1.5 }}>
                  <span style={{ color: CYAN, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* NDA notice */}
            <div style={{ padding: "12px 16px", background: "rgba(187,134,252,0.04)", border: "1px solid rgba(187,134,252,0.2)", borderRadius: 8, marginBottom: 18, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
              <strong style={{ color: PURPLE }}>Exclusivity Agreement:</strong> Once purchased, this track is permanently removed from this catalog and will not be sold, licensed, or credited to Steven Angel in any form.
            </div>

            {/* Legal name */}
            <label style={{ display: "block", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
              Your Legal Name (for the agreement)
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Full Legal Name"
              style={{ width: "100%", padding: "12px 14px", background: "#06060f", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#fff", boxSizing: "border-box", marginBottom: 14 }}
            />

            {/* Checkbox */}
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 3, accentColor: CYAN, width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                I have read and agree to the exclusivity terms above. I understand this track will be removed from the catalog after my purchase and will not be resold.
              </span>
            </label>

            {signingError && (
              <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 6, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ff8080" }}>
                {signingError}
              </div>
            )}

            <button
              onClick={handleSign}
              disabled={!legalName.trim() || !agreed || signing}
              style={{
                ...btnPrimary(CYAN),
                opacity: (!legalName.trim() || !agreed || signing) ? 0.4 : 1,
                cursor: (!legalName.trim() || !agreed || signing) ? "not-allowed" : "pointer",
              }}
            >
              {signing ? "Processing…" : "I Agree & Continue to Payment"}
            </button>
          </div>
        )}

        {/* PayPal Step */}
        {!authLoading && user && step === "paypal" && (
          <div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 14, textAlign: "center" }}>
              Agreement signed. Complete your payment below.
            </div>
            <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Total</span>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 24, color: CYAN }}>€{track.price_eur}</span>
            </div>
            <div ref={paypalRef} />
            {paypalError && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.4)", borderRadius: 6, fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ff8080" }}>
                {paypalError}
              </div>
            )}
            <div style={{ marginTop: 14, fontFamily: "DM Sans, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              Secure payment via PayPal · No card data stored
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const backdropStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
  backdropFilter: "blur(8px)", zIndex: 10000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};

const modalStyle = (accent) => ({
  background: "linear-gradient(135deg, #0a0a20, #0d0418)",
  border: `2px solid ${accent}`,
  borderRadius: 16, padding: "36px 32px 32px",
  maxWidth: 480, width: "100%", position: "relative",
  boxShadow: "0 0 80px rgba(0,229,255,0.2)",
});

const closeBtn = {
  position: "absolute", top: 12, right: 12,
  background: "transparent", border: "none",
  color: "rgba(255,255,255,0.5)", fontSize: 26, cursor: "pointer", padding: 8, lineHeight: 1,
};

const smallLabel = (color) => ({
  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11,
  letterSpacing: "0.3em", textTransform: "uppercase", color, marginBottom: 8,
});

const btnPrimary = (accent) => ({
  display: "block", width: "100%", padding: "14px 20px",
  background: `linear-gradient(135deg, ${accent}, #00b8d4)`,
  color: "#000", fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 800, fontSize: 14, letterSpacing: "0.15em",
  textTransform: "uppercase", textAlign: "center",
  textDecoration: "none", borderRadius: 8, border: "none", cursor: "pointer",
});
