/**
 * FreeAfroLatinPopup — lead magnet popup on /shop.
 *
 * Trigger: 6 seconds after page load, OR scroll past 40% (whichever first).
 * Shows once per visitor (localStorage flag).
 *
 * Flow:
 *   visitor submits email → POST /shop/free-pack →
 *     backend adds to Brevo list 13 ("Free Afro Latin Pack")
 *     + sends Resend email containing the pack download link
 *   → popup shows "Sent! Check your inbox" + closes after 4s
 *
 * The pack itself lives at https://pack.steven-angel.com/Afro-Latin-house-sample-pack.zip
 * (Cloudflare R2 + custom domain). The user gets the URL via email, not here.
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

  // Show once per visitor; trigger after 6s or scroll past 40%
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const fire = () => {
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    };

    const timer = setTimeout(fire, 6000);
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
      // Auto-close after 4 seconds
      setTimeout(() => setVisible(false), 4000);
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
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.3s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #04040f 0%, #0a0a14 100%)",
          border: `1px solid ${CYAN}33`,
          borderRadius: 16,
          padding: isMobile ? 24 : 36,
          maxWidth: 480,
          width: "100%",
          position: "relative",
          boxShadow: `0 0 60px ${CYAN}22, 0 20px 60px rgba(0,0,0,0.6)`,
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
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 22,
            cursor: "pointer",
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {!submitted ? (
          <>
            <div
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.3em",
                color: CYAN,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Free — Limited
            </div>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 26 : 32,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
                margin: "0 0 4px",
                color: "#fff",
              }}
            >
              Free Afro Latin House
              <br />
              <span
                style={{
                  background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Sample Pack
              </span>
            </h2>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "8px 0 18px" }}>
              125 BPM · G minor · Royalty-free
            </div>

            {/* Mini audio player — master preview */}
            <audio
              controls
              preload="none"
              src={MASTER_PREVIEW_URL}
              style={{
                width: "100%",
                height: 40,
                marginBottom: 18,
                borderRadius: 8,
                background: "#000",
                filter: "invert(1) hue-rotate(180deg)", // makes default audio player cyan-ish on dark bg
              }}
            />

            {/* Stem breakdown */}
            <div
              style={{
                background: "rgba(0,229,255,0.04)",
                border: `1px solid ${CYAN}22`,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: CYAN,
                  marginBottom: 8,
                }}
              >
                12 Stems Inside
              </div>
              {STEMS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                    padding: "3px 0",
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{ color: CYAN, fontWeight: 600 }}>× {s.count}</span>
                </div>
              ))}
            </div>

            <form onSubmit={submit}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${error ? "#ff4444" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 15,
                  fontFamily: "inherit",
                  outline: "none",
                  marginBottom: error ? 6 : 14,
                  boxSizing: "border-box",
                }}
              />
              {error && (
                <div style={{ color: "#ff6666", fontSize: 12, marginBottom: 12 }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px 28px",
                  background: loading ? "#222" : "linear-gradient(135deg, #00E5FF, #00b8d4)",
                  color: loading ? "rgba(255,255,255,0.5)" : "#000",
                  border: "none",
                  borderRadius: 50, // pill — per Brand Kit
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: loading ? "wait" : "pointer",
                  boxShadow: loading ? "none" : "0 0 28px rgba(0,229,255,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {loading ? "Sending…" : "Email me the pack"}
              </button>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 12,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                You'll also get the occasional newsletter — unsubscribe any time.
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 16,
              }}
            >
              ✓
            </div>
            <h2
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 900,
                fontSize: 28,
                margin: "0 0 12px",
                color: "#fff",
                letterSpacing: "0.02em",
              }}
            >
              Check your inbox
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6 }}>
              I sent the download link to <strong style={{ color: CYAN }}>{email}</strong>.
              <br />
              If you don't see it in 1 minute, check your spam folder.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
