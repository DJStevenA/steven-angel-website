/**
 * FreeAfroLatinPopup — lead magnet popup on /shop.
 *
 * Trigger: 30 seconds after page load, OR scroll past 40% (whichever first).
 * Shows once per visitor (localStorage flag).
 *
 * Flow (Steven's spec 2026-05-20):
 *   visitor submits email → POST /shop/free-pack →
 *     backend adds to Brevo list 13 ("Free Afro Latin Pack")
 *     + sends the download link via Resend (transactional email)
 *   → popup confirms "Check your inbox" — no inline download fallback
 *
 * REQUIRES the Resend sending domain (mail.steven-angel.com) to be
 * verified at resend.com/domains. If not, the backend returns 502
 * and we show an error asking the user to reach out on WhatsApp.
 *
 * 12 stems · 125 BPM · G minor — matches Steven's spec.
 */
import React, { useState, useEffect, useRef } from "react";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const STORAGE_KEY = "shop_free_pack_popup_seen";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

// Audio preview lives on R2 — backend serves a signed URL at /shop/media/audio/*.
// File: afro-latin-master.mp3 (master WAV → 96 kbps MP3, ~250 KB).
// Until uploaded, the <audio> element will fail-silent; the rest of the popup still works.
const MASTER_PREVIEW_URL = `${BACKEND}/shop/media/audio/afro-latin-master.mp3`;

const STEMS = [
  { label: "Drum loops", count: 5 },
  { label: "One-shots (kick + perc)", count: 2 },
  { label: "Synths (bass + horn)", count: 2 },
  { label: "Vocal", count: 1 },
  { label: "FX", count: 2 },
];

export default function FreeAfroLatinPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const triggered = useRef(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Show once per visitor; trigger after 30s or scroll past 40%
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const fire = () => {
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    };

    const timer = setTimeout(fire, 30000);
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled > 0.4) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);

    // Analytics — GA4 event for tracking conversion of the magnet
    try {
      window.gtag?.("event", "free_pack_signup", {
        event_category: "lead_magnet",
        event_label: "afro_latin_free_pack",
      });
    } catch (_) {}

    try {
      const res = await fetch(`${BACKEND}/shop/free-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "1");
      // Auto-close 6 seconds after success so it doesn't linger
      setTimeout(() => setVisible(false), 6000);
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Free Afro Latin House Sample Pack"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        animation: "slideUp 0.3s ease",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #04040f 0%, #0a0a14 100%)",
          borderTop: `1px solid ${CYAN}33`,
          padding: isMobile ? "16px 16px" : "16px 32px",
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 12 : 20,
          boxShadow: `0 -4px 30px rgba(0,0,0,0.6)`,
          color: "#fff",
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
        }}
      >
        {/* Close X */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div style={{ flex: 1, paddingRight: isMobile ? 24 : 0 }}>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 900,
                  fontSize: isMobile ? 18 : 22,
                  letterSpacing: "0.02em",
                  lineHeight: 1.2,
                  margin: 0,
                color: "#fff",
              }}>
                Free Afro Latin House <span style={{ color: CYAN }}>Sample Pack</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                12 stems · 125 BPM · Royalty-free · Leave your email
              </div>
            </div>

            <form onSubmit={submit} style={{ display: "flex", gap: 8, flex: isMobile ? undefined : "0 0 auto", width: isMobile ? "100%" : "auto" }}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: isMobile ? "100%" : 220,
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${error ? "#ff4444" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: 6,
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  background: loading ? "#222" : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                  color: "#000",
                  border: "none",
                  borderRadius: 6,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  cursor: loading ? "wait" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "..." : "Get it free"}
              </button>
            </form>
            {error && <div style={{ color: "#ff6666", fontSize: 11, marginTop: 4 }}>{error}</div>}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: CYAN, fontSize: 22 }}>✓</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              Sent to <strong style={{ color: CYAN }}>{email}</strong> — check your inbox!
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
