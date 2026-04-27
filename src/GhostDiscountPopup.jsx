import React, { useState, useEffect, useRef } from "react";

/* ─── Color Constants ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const STORAGE_KEY = "ghost_discount_popup_seen";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

const FALLBACK_COUPONS = [
  { code: "GHOST25", percentOff: 25, scope: "ghost", description: "25% off your first ghost track" },
];

/**
 * GhostDiscountPopup
 * - Shows once per visitor (uses localStorage)
 * - Triggers after 30 seconds OR scroll past 50% page height (whichever first)
 * - Email + optional name form → POST to /ghost/newsletter
 * - On success: reveals GHOST25 coupon card
 * - Graceful degradation if backend is down
 */
export default function GhostDiscountPopup() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [copied, setCopied] = useState(null); // index of copied coupon
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
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

    // 30s timer — not 2s, ghost page has higher purchase intent
    const timer = setTimeout(trigger, 30000);

    // Scroll past 50% page height
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

    try {
      const res = await fetch(`${BACKEND}/ghost/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source: "ghost_popup" }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      setCoupons(
        Array.isArray(data.coupons) && data.coupons.length > 0
          ? data.coupons
          : FALLBACK_COUPONS
      );
    } catch {
      // Graceful degradation — backend may be down but code still works
      setCoupons(FALLBACK_COUPONS);
    }

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "newsletter_signup", { source: "ghost_popup" });
    }

    setLoading(false);
    setSubmitted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const copyCode = async (code, idx) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore clipboard errors
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
        animation: "gdpFadeIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes gdpFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes gdpSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .gdp-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(0,229,255,0.25);
          border-radius: 8px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', 'DM Sans Fallback', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .gdp-input:focus {
          border-color: rgba(0,229,255,0.6);
        }
        .gdp-input::placeholder {
          color: rgba(255,255,255,0.35);
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #0a0a20, #0d0418)",
          border: `2px solid ${CYAN}`,
          borderRadius: 16,
          padding: isMobile ? "36px 24px 28px" : "48px 40px 36px",
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          position: "relative",
          boxShadow: `0 0 80px rgba(0,229,255,0.25), 0 0 200px rgba(187,134,252,0.15)`,
          animation: "gdpSlideUp 0.4s ease-out",
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
              Your Coupon
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
              You're In.{" "}
              <span style={{ color: CYAN }}>25% Off</span> Unlocked.
            </div>

            {/* Coupon cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {coupons.map((c, idx) => (
                <div key={c.code} style={{ textAlign: "left" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        background: CYAN,
                        color: "#000",
                        fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                        fontWeight: 900,
                        fontSize: 12,
                        letterSpacing: "0.1em",
                        padding: "3px 10px",
                        borderRadius: 50,
                      }}
                    >
                      {c.percentOff}% OFF
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Ghost Production
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(c.code, idx)}
                    style={{
                      display: "block",
                      width: "100%",
                      background: "rgba(0,229,255,0.08)",
                      border: `2px dashed ${CYAN}`,
                      borderRadius: 10,
                      padding: "18px 20px",
                      fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                      fontWeight: 900,
                      fontSize: isMobile ? 24 : 30,
                      letterSpacing: "0.3em",
                      color: CYAN,
                      cursor: "pointer",
                      marginBottom: 4,
                      transition: "background 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.08)")}
                  >
                    {c.code}
                  </button>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {c.description}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                        fontSize: 11,
                        color: copied === idx ? "#4CAF50" : "rgba(255,255,255,0.35)",
                        transition: "color 0.2s",
                        minWidth: 80,
                        textAlign: "right",
                      }}
                    >
                      {copied === idx ? "Copied!" : "Click to copy"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                close();
                // Scroll to ghost catalog tracks grid
                const grid =
                  document.querySelector('[data-ghost-catalog="true"]') ||
                  document.querySelector('[data-shop-grid="true"]') ||
                  document.getElementById("listen");
                if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                color: "#000",
                border: "none",
                borderRadius: 50,
                padding: "16px 32px",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 28px rgba(0,229,255,0.5)",
              }}
            >
              Browse Tracks →
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
              Exclusive Offer
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
              Get <span style={{ color: CYAN }}>25% Off</span>
              <br />
              Your First Ghost Track
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
              Sign up to unlock your discount
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}
            >
              <input
                className="gdp-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                className="gdp-input"
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
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
                {loading ? "Sending…" : "Get My Coupon"}
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
              I agree to receive marketing emails from Steven Angel
            </div>
          </>
        )}
      </div>
    </div>
  );
}
