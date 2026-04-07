import React, { useState, useEffect } from "react";

/* ─── Color Constants ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const COUPON_CODE = "WELCOME15";
const DISCOUNT_PERCENT = 15;
const STORAGE_KEY = "shop_discount_popup_seen";
const SHOW_AFTER_MS = 2000; // wait 2 seconds before showing — less intrusive

/**
 * DiscountPopup
 * - Shows once per visitor (uses localStorage)
 * - Shows after 2-second delay (not immediately, less aggressive)
 * - Closes on X click, code copy, or backdrop click
 * - 15% off coupon: WELCOME15
 */
export default function DiscountPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    // Don't show if already seen
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback: select the text
      console.warn("Clipboard write failed:", err);
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
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
          animation: "slideUp 0.4s ease-out",
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

        {/* Top label */}
        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: CYAN,
            marginBottom: 12,
          }}
        >
          Welcome Offer
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 32 : 40,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 14,
          }}
        >
          Get <span style={{ color: CYAN }}>{DISCOUNT_PERCENT}% Off</span>
          <br />
          Your First Order
        </div>

        {/* Subtext */}
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Real Ableton templates and a masterclass from a signed artist.
          <br />
          Use this code at checkout:
        </div>

        {/* Coupon code box */}
        <button
          onClick={copyCode}
          style={{
            display: "block",
            width: "100%",
            background: "rgba(0,229,255,0.08)",
            border: `2px dashed ${CYAN}`,
            borderRadius: 10,
            padding: "18px 20px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 24 : 28,
            letterSpacing: "0.3em",
            color: CYAN,
            cursor: "pointer",
            marginBottom: 8,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,255,0.08)")}
        >
          {COUPON_CODE}
        </button>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            color: copied ? "#4CAF50" : "rgba(255,255,255,0.4)",
            marginBottom: 24,
            minHeight: 16,
            transition: "color 0.2s",
          }}
        >
          {copied ? "Copied to clipboard" : "Click to copy"}
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            close();
            // Smooth scroll to products
            const grid = document.querySelector('[data-shop-grid="true"]');
            if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
            color: "#000",
            border: "none",
            borderRadius: 50,
            padding: "16px 32px",
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 0 28px rgba(0,229,255,0.5)",
          }}
        >
          Browse the Shop
        </button>

        {/* Tiny disclaimer */}
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            marginTop: 16,
          }}
        >
          Valid on first purchase · One use per customer
        </div>
      </div>
    </div>
  );
}
