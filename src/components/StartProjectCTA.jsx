/**
 * StartProjectCTA — the "Let's Start Your Project" button and its popup.
 *
 * Lifted out of the homepage hero (App.jsx) so every service page carries the
 * same single main call to action, built once. The homepage now uses this too.
 *
 * One thing to keep right: `whatsappText`. The WhatsApp bot routes a lead by the
 * WORDS of that first message (lead_routes.js in drop-whatsapp-bot). Each page
 * therefore passes the sentence it already sent before this button existed, so
 * a lead from /lessons still lands on DROP and one from /ghost still lands on
 * production. Never change it to a generic line without checking the bot's routes.
 */
import React, { useEffect, useRef, useState } from "react";
import { trackWhatsAppLead } from "../lib/analytics/events";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const ZOOM_URL = "https://calendly.com/dj-steven-angel/15-min-zoom";
const WHATSAPP_NUMBER = "972523561353";
const DISPLAY = "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif";
const BODY = "'DM Sans', 'DM Sans Fallback', sans-serif";

/**
 * @param {string} props.whatsappText  the first WhatsApp message, routed by the bot
 * @param {string} props.productLine   analytics product line (GP / PL / MM / SH ...)
 * @param {string} props.eventPrefix   Clarity event prefix, e.g. "homepageHero", "ghostHero"
 * @param {string} props.label         GA4 source label base, e.g. "homepage_hero" -> "homepage_hero_popup"
 * @param {string} [props.zoomUrl]     Calendly link for the free intro call
 * @param {string} [props.subtitle]    the small line under the button
 * @param {number} [props.marginTop]   space above the button
 * @param {number} [props.marginBottom] space below the button and its subtitle
 */
export default function StartProjectCTA({
  whatsappText,
  productLine,
  eventPrefix,
  label,
  zoomUrl = ZOOM_URL,
  subtitle = "Free intro · No commitment",
  marginTop,
  marginBottom = 0,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // While open: lock page scroll, Escape closes, focus stays inside the dialog,
  // and focus goes back to the button that opened it (WCAG 2.4.3, IS 5568).
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const clarity = (suffix) => { if (window.clarity) window.clarity("event", `${eventPrefix}${suffix}`); };

  return (
    <>
      <div style={{ marginTop: marginTop ?? (isMobile ? 32 : 48), marginBottom, textAlign: "center" }}>
        <button
          ref={triggerRef}
          onClick={() => { setOpen(true); clarity("StartProjectClick"); }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: isMobile ? "16px 30px" : "20px 44px",
            background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
            border: "none",
            borderRadius: 10,
            color: "#000",
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: isMobile ? 17 : 22,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 0 40px rgba(0,229,255,0.32), 0 0 80px rgba(187,134,252,0.2)",
          }}
        >
          Let's Start Your Project
          <span style={{ display: "inline-flex", width: 26, height: 26, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </button>
        {subtitle && (
          <div style={{ marginTop: 14, fontFamily: DISPLAY, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.62)" }}>
            {subtitle}
          </div>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${eventPrefix}-popup-title`}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            ref={dialogRef}
            style={{
              background: "linear-gradient(135deg, #0d0d20, #100418)",
              border: "1px solid rgba(0,229,255,0.28)",
              borderRadius: 16,
              padding: "36px 32px 32px",
              maxWidth: 460,
              width: "100%",
              position: "relative",
              boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,255,0.08)",
            }}
          >
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "absolute", top: 14, right: 14,
                width: 32, height: 32, borderRadius: 8,
                background: "none", border: "none",
                color: "rgba(255,255,255,0.5)", fontSize: 22, lineHeight: 1, cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h3 id={`${eventPrefix}-popup-title`} style={{ fontFamily: DISPLAY, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, letterSpacing: "0.02em", fontSize: 24, marginBottom: 10 }}>
              Let's talk
            </h3>
            <div style={{ fontFamily: BODY, lineHeight: 1.8, color: "rgba(255,255,255,0.58)", fontSize: 14, marginBottom: 24 }}>
              Pick the way you'd rather start.<br />Free 20-minute intro, no commitment.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={zoomUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (window.gtag) window.gtag("event", "book_appointment", { event_category: "calendly", event_label: `${label}_popup` });
                  clarity("ZoomClick");
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px",
                  background: "rgba(0,229,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.25)",
                  borderRadius: 10,
                  textDecoration: "none", color: "#fff",
                }}
              >
                <span style={{ display: "inline-flex", width: 40, height: 40, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "rgba(0,229,255,0.12)", color: CYAN, flexShrink: 0 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, textTransform: "uppercase" }}>Book a Zoom call</div>
                  <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>20 min · Pick a time that suits you</div>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </a>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent(whatsappText)}
                target="_blank"
                rel="noreferrer"
                onClick={() => { trackWhatsAppLead(productLine, `${label}_popup`); clarity("WhatsAppClick"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 18px",
                  background: "rgba(37,211,102,0.06)",
                  border: "1px solid rgba(37,211,102,0.25)",
                  borderRadius: 10,
                  textDecoration: "none", color: "#fff",
                }}
              >
                <span style={{ display: "inline-flex", width: 40, height: 40, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "rgba(37,211,102,0.14)", color: "#25D366", flexShrink: 0 }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.61.61l6.163-1.529A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.214-3.724.924.942-3.626-.234-.373A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12c0 5.421-4.398 9.818-9.818 9.818z" />
                  </svg>
                </span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, textTransform: "uppercase" }}>Message on WhatsApp</div>
                  <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Fastest · I usually reply within an hour</div>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </a>
            </div>

            <div style={{ textAlign: "center", marginTop: 20, fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.62)" }}>
              100% confidential · No sales pitch
            </div>
          </div>
        </div>
      )}
    </>
  );
}
