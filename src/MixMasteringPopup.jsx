import React, { useState, useEffect, useRef } from "react";

/* ─── Color Constants ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG_CARD = "#04040f";

const STORAGE_KEY = "mix_mastering_newsletter_seen";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

/**
 * MixMasteringPopup
 * - Shows once per visitor (uses localStorage)
 * - Triggers after 30 seconds OR scroll past 50% page height (whichever first)
 * - Email + optional name form → POST to /mix-mastering/newsletter
 * - On success: reveals MIXMASTER50 coupon code
 * - Closes on X click, backdrop click, or successful submit
 */
export default function MixMasteringPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const trigger = () => {
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    };

    // Trigger after 30 seconds
    const timer = setTimeout(trigger, 30000);

    // Trigger on scroll past 50% page height
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.5) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND}/mix-mastering/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "mix_master_popup" }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => ({}));
      // Show coupon from response or fall back to hardcoded value
      setCoupon(data.coupon || "MIXMASTER50");
    } catch {
      // Graceful degradation — show coupon even if backend failed
      setCoupon("MIXMASTER50");
    }

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "newsletter_signup", { source: "mix_master_popup" });
    }

    setLoading(false);
    setSubmitted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  if (!visible) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "mmPopFadeIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes mmPopFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mmPopSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .mm-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(0,229,255,0.25);
          borderRadius: 8px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', 'DM Sans Fallback', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .mm-input:focus {
          border-color: rgba(0,229,255,0.6);
        }
        .mm-input::placeholder {
          color: rgba(255,255,255,0.35);
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: BG_CARD,
          border: "1px solid rgba(0,229,255,0.3)",
          borderRadius: 16,
          padding: isMobile ? "36px 24px 28px" : "48px 40px 36px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          position: "relative",
          boxShadow: `0 0 80px rgba(0,229,255,0.2), 0 0 200px rgba(187,134,252,0.12)`,
          animation: "mmPopSlideUp 0.4s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 24,
            cursor: "pointer",
            padding: 8,
            lineHeight: 1,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ×
        </button>

        {submitted ? (
          /* ── Success state ── */
          <>
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
              Your Code
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 24 : 30,
                textTransform: "uppercase",
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              You're in.{" "}
              <span style={{ color: CYAN }}>50% Off</span> Awaits.
            </div>

            {/* Coupon code box */}
            <div
              style={{
                background: "rgba(0,229,255,0.08)",
                border: `2px dashed ${CYAN}`,
                borderRadius: 10,
                padding: "22px 20px",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 30 : 38,
                letterSpacing: "0.3em",
                color: CYAN,
                marginBottom: 10,
              }}
            >
              {coupon}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 20,
              }}
            >
              Use this at checkout · Valid on your first mix or master
            </div>

            <button
              onClick={close}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                background: "linear-gradient(135deg, #00E5FF, #00b8d4)",
                color: "#000",
                border: "none",
                borderRadius: 50,
                padding: "15px 32px",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 28px rgba(0,229,255,0.45)",
              }}
            >
              See Packages →
            </button>
          </>
        ) : (
          /* ── Form state ── */
          <>
            {/* Top label */}
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
              Limited Offer
            </div>

            {/* Headline */}
            <div
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 28 : 36,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: "#fff",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              Get <span style={{ color: CYAN }}>50% Off</span>
              <br />
              Your First Mix or Master
            </div>

            {/* Subhead */}
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              Subscribe and we'll send you the discount code now.
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input
                className="mm-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: "#fff",
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <input
                className="mm-input"
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: "#fff",
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />

              {error && (
                <div style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: "#ff6b6b" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  background: "linear-gradient(135deg, #00E5FF, #00b8d4)",
                  color: "#000",
                  border: "none",
                  borderRadius: 50,
                  padding: "15px 32px",
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 0 28px rgba(0,229,255,0.45)",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Sending…" : "Get My 50% Off"}
              </button>
            </form>

            {/* GDPR consent */}
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 10,
                color: "rgba(255,255,255,0.35)",
                lineHeight: 1.5,
              }}
            >
              I agree to receive emails about Steven Angel's mix &amp; mastering services
            </div>
          </>
        )}
      </div>
    </div>
  );
}
