/**
 * InquiryForm — universal lead-capture modal.
 *
 * Drop-in replacement for the various Calendly entry-point CTAs across the site.
 * User enters Name + Email; the page they came from determines an auto-message
 * that's shown to them ("When you submit, this message goes to Steven: …").
 * On submit:
 *   1. POST /api/inquiry on ghost-backend (Resend email + Brevo subscribe + CRM push)
 *   2. Fire GA4 lead_form_submit event + Google Ads conversion (if label is set)
 *   3. Show thank-you state with a WhatsApp deep-funnel option
 *
 * Brand tokens follow BRAND_GUIDE.md exactly.
 */
import React, { useState, useEffect, useRef } from "react";
import { trackLeadFormSubmit } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const BG = "#04040f";
const BG_INPUT = "#08080f";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const WHATSAPP_URL = "https://wa.me/972523561353";

export default function InquiryForm({
  open,
  onClose,
  source,         // e.g. "/ghost/custom"
  productLine,    // e.g. "ghost_custom"
  autoMessage,    // e.g. "Hi I'm interested in custom ghost production"
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errMsg, setErrMsg] = useState("");
  const cardRef = useRef(null);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Reset status when modal re-opens for a new submission
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setErrMsg("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!name.trim() || !email.includes("@")) {
      setErrMsg("Name and a valid email are required.");
      return;
    }
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch(`${BACKEND}/api/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source,
          productLine,
          autoMessage,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      trackLeadFormSubmit(productLine, source);
      setStatus("sent");
      setName("");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrMsg(err.message || "Something went wrong. Try WhatsApp instead.");
    }
  };

  /* ── Style tokens (BRAND_GUIDE.md) ── */
  const headingFont = "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif";
  const bodyFont = "'DM Sans', 'DM Sans Fallback', sans-serif";

  const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  };
  const card = {
    background: BG,
    border: "1px solid #141420",
    borderRadius: 12,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 460,
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(0,229,255,0.08)",
    color: "#fff",
    fontFamily: bodyFont,
  };
  const closeBtn = {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };
  const label = {
    fontFamily: headingFont,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: CYAN,
    marginBottom: 8,
  };
  const heading = {
    fontFamily: headingFont,
    fontWeight: 900,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fff",
    fontSize: 28,
    lineHeight: 1.1,
    marginBottom: 8,
  };
  const subText = {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    marginBottom: 22,
  };
  const input = {
    width: "100%",
    background: BG_INPUT,
    border: "1px solid #1a1a2e",
    borderRadius: 6,
    padding: "14px 16px",
    color: "#fff",
    fontFamily: bodyFont,
    fontSize: 14,
    outline: "none",
    marginBottom: 12,
  };
  const messagePreview = {
    background: "rgba(0,229,255,0.05)",
    border: "1px solid rgba(0,229,255,0.2)",
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 18,
  };
  const messagePreviewLabel = {
    fontFamily: headingFont,
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)",
    marginBottom: 6,
  };
  const ctaPrimary = {
    width: "100%",
    background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
    color: "#000",
    fontFamily: headingFont,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    padding: "14px 24px",
    border: "none",
    borderRadius: 50,
    cursor: status === "sending" ? "default" : "pointer",
    boxShadow: "0 0 28px rgba(0,229,255,0.5)",
    opacity: status === "sending" ? 0.7 : 1,
  };
  const errStyle = {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  };
  const successWrap = {
    textAlign: "center",
    paddingTop: 8,
  };
  const checkCircle = {
    width: 60,
    height: 60,
    borderRadius: 30,
    background: "rgba(0,229,255,0.12)",
    border: `2px solid ${CYAN}`,
    color: CYAN,
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    lineHeight: 1,
  };
  const whatsappBtn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#1a7a42",
    color: "#fff",
    fontFamily: headingFont,
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    padding: "12px 28px",
    borderRadius: 50,
    textDecoration: "none",
    marginTop: 14,
  };

  return (
    <div
      style={backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-title"
    >
      <div ref={cardRef} style={card}>
        <button type="button" aria-label="Close" onClick={onClose} style={closeBtn}>×</button>

        {status !== "sent" ? (
          <>
            <div style={label}>Talk to Steven</div>
            <h3 id="inquiry-title" style={heading}>Leave Your Details</h3>
            <p style={subText}>I'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={status === "sending"}
                style={input}
                autoComplete="name"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "sending"}
                style={input}
                autoComplete="email"
              />

              {/* Auto-message preview removed per Steven 2026-04-29 — autoMessage
                  still travels in the POST body to /api/inquiry; just not shown
                  to the user upfront so the form feels lighter / less wordy. */}

              <button type="submit" style={ctaPrimary} disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send →"}
              </button>

              {status === "error" && <div style={errStyle}>{errMsg}</div>}
            </form>
          </>
        ) : (
          <div style={successWrap}>
            <div style={checkCircle}>✓</div>
            <h3 style={{ ...heading, fontSize: 24, marginBottom: 8 }}>Sent.</h3>
            <p style={{ ...subText, marginBottom: 0 }}>
              Steven will reply within 24 hours.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              style={whatsappBtn}
              onClick={() => onClose?.()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.917 1.044 5.591 2.778 7.667L.96 23.487l3.96-1.04C6.835 23.47 9.342 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.418 0-4.658-.694-6.558-1.893l-.376-.225-2.348.616.627-2.29-.247-.393C1.894 16.072 1.2 14.102 1.2 12 1.2 6.038 6.038 1.2 12 1.2S22.8 6.038 22.8 12 17.962 22 12 22z" />
              </svg>
              Want to chat now? WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
