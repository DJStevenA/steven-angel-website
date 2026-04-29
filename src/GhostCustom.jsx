/**
 * Custom Ghost Production landing page — /ghost/custom
 *
 * Dedicated landing for the bespoke (built-from-scratch) ghost production service.
 * Spec: claude marketing/briefs/2026-04-28/for_web/ghost_restructure_FINAL.md §2
 *
 * Brand voice (strictly enforced):
 *   ALLOWED proof points: Hugel, Claptone, MTGD, Moblack, Godeeva, Beatport Top 10
 *   FORBIDDEN: Hernan Cattaneo, Dole & Kom, ARTBAT (Mix & Mastering line — Red Line)
 *
 * Sections:
 *   Hero · Process (4 steps) · Pricing (3 rows) · Talk to Steven (WhatsApp + Inquiry)
 *   · Want a track today? (cross-promote /ghost) · Floating WhatsApp
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import TrackPlayer from "./components/TrackPlayer";
import InquiryForm from "./components/InquiryForm.jsx";
import { trackWhatsAppLead } from "./lib/analytics/events";
import { usePageView, useScrollDepth, useTimeOnPage } from "./lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const WHATSAPP_GREEN = "#1a7a42";

const WHATSAPP_URL =
  "https://wa.me/972523561353?text=Hi%20Steven%2C%20I'm%20interested%20in%20custom%20ghost%20production.";

/* JSON-LD Service schema — rendered once on mount */
const SERVICE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom Ghost Production",
  "serviceType": "Music Ghost Production",
  "description":
    "Custom-built original tracks produced from scratch to your vision. Demo-first workflow, 3 revisions, full delivery (stems, MIDI, masters, project file, 100% rights transfer, NDA).",
  "provider": {
    "@type": "Person",
    "name": "Steven Angel",
    "url": "https://steven-angel.com",
  },
  "areaServed": "Worldwide",
  "url": "https://steven-angel.com/ghost/custom",
  "priceRange": "$300-$1500",
  "offers": [
    {
      "@type": "Offer",
      "name": "Full Production",
      "price": "800",
      "priceCurrency": "USD",
    },
    {
      "@type": "Offer",
      "name": "Full Production + Vocals",
      "price": "1500",
      "priceCurrency": "USD",
    },
    {
      "@type": "Offer",
      "name": "Demo Finishing",
      "price": "300",
      "priceCurrency": "USD",
    },
  ],
};

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Brief",
    body:
      "You send me your idea and references. We can also have a Zoom to discuss before we start working.",
  },
  {
    n: "02",
    title: "90-Second Demo",
    body:
      "I make a 90-second demo of the idea. If you like it, we move on. If needed — I make a new demo until we get it right.",
  },
  {
    n: "03",
    title: "Full Track Production",
    body: "I send you back the full track mixed & mastered — 3 revisions included.",
  },
];

const PRICING_ROWS = [
  { name: "Full Production", price: "$800", note: null, link: null },
  { name: "Full Production + Vocals", price: "$1,500+", note: null, link: null },
  {
    name: "Demo Finishing",
    price: "$300",
    note: null,
    link: { href: "/ghost/finish-demo", label: "Dedicated page →" },
  },
];

/* Highlight badge data — appears prominently after hero */
const HIGHLIGHTS = [
  { label: "Delivery", value: "5-7 days" },
  { label: "Rights", value: "100% Transfer" },
  { label: "Contract", value: "NDA Included" },
];

export default function GhostCustom() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [formOpen, setFormOpen] = useState(false);

  /* Resize listener */
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* Remarketing */
  usePageView("ghost_custom");
  useScrollDepth("ghost_custom");
  useTimeOnPage("ghost_custom");

  /* ── Brand style helpers (mirrors TheAngels.jsx) ── */
  const heading = (size) => ({
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1.1,
    letterSpacing: "0.04em",
    fontSize: size,
  });
  const body = {
    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
    fontWeight: 400,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
  };
  const label = (color) => ({
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: color || CYAN,
  });

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
      <Nav />

      {/* JSON-LD Service schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }}
      />

      {/* ═══ HERO — homepage style with STEVEN ANGEL brand ═══ */}
      <section style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden", padding: isMobile ? "80px 16px 60px" : "120px 24px 80px" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img
            src="/images/dj-hero.webp"
            alt="Steven Angel — Afro House DJ and Producer"
            fetchPriority="high"
            width="1920"
            height="1080"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,1) 100%)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 820 }}>
          <div style={{ ...label(CYAN), marginBottom: 20 }}>Ghost Production</div>

          <div style={{ ...heading("clamp(56px,9vw,120px)"), marginBottom: 12, letterSpacing: "0.06em", background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            STEVEN ANGEL
          </div>

          <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`, margin: "0 auto 20px" }} />

          <h1 style={{ ...heading(isMobile ? 24 : 36), marginBottom: 14, color: "#fff", lineHeight: 1.15 }}>
            Custom Ghost Production
          </h1>

          <div style={{ ...body, fontSize: isMobile ? 15 : 18, maxWidth: 600, margin: "0 auto 14px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em" }}>
            A track built to your exact vision
          </div>

          <div style={{ ...body, fontSize: isMobile ? 13 : 14, maxWidth: 600, margin: "0 auto", color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginBottom: 26 }}>
            Hugel &amp; Claptone played my work · 5-7 day delivery · 100% rights · NDA included
          </div>

          <div
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 12 : 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: isMobile ? "8px 12px" : "10px 18px",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Released on</span>
            <span>MTGD</span>
            <span style={{ color: CYAN }}>·</span>
            <span>Moblack</span>
            <span style={{ color: CYAN }}>·</span>
            <span>Godeeva</span>
            <span style={{ color: CYAN }}>·</span>
            <span>Sony</span>
          </div>
        </div>
      </section>

      {/* ═══ Highlight badges — Delivery / Rights / NDA ═══ */}
      <section style={{ padding: isMobile ? "0 16px 40px" : "0 24px 60px", background: "#000", position: "relative", zIndex: 5 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? 8 : 16 }}>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} style={{
              background: "transparent",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 10,
              padding: isMobile ? "14px 8px" : "20px 16px",
              textAlign: "center",
            }}>
              <div style={{ ...label(CYAN), fontSize: isMobile ? 9 : 11, marginBottom: 6 }}>{h.label}</div>
              <div style={{ ...heading(isMobile ? 15 : 22), color: "#fff", letterSpacing: "0.02em" }}>{h.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Track Player — let visitors hear the work ═══ */}
      <TrackPlayer />

      {/* ═══ THE PROCESS ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#04040f",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
            <div style={{ ...label(CYAN), marginBottom: 14 }}>How It Works</div>
            <h2
              style={{
                ...heading(isMobile ? 30 : 44),
                color: "#fff",
                marginBottom: 12,
              }}
            >
              The Process
            </h2>
            <p
              style={{
                ...body,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              Demo-first. You hear it before you commit to the full track.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: isMobile ? 16 : 24,
            }}
          >
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.n}
                style={{
                  background: "#04040f",
                  border: "1px solid #141420",
                  borderRadius: 10,
                  padding: isMobile ? "24px 20px" : "32px 28px",
                  position: "relative",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
              >
                <div
                  style={{
                    ...heading(isMobile ? 36 : 44),
                    color: CYAN,
                    marginBottom: 12,
                    opacity: 0.85,
                  }}
                >
                  {step.n}
                </div>
                <h3
                  style={{
                    ...heading(isMobile ? 18 : 22),
                    color: "#fff",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    ...body,
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#080810",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ ...label(PURPLE), marginBottom: 14, color: PURPLE }}>
              Pricing
            </div>
            <h2
              style={{
                ...heading(isMobile ? 30 : 44),
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Straight Numbers
            </h2>
            <p style={{ ...body, maxWidth: 520, margin: "0 auto" }}>
              No marketplaces, no middlemen — you talk to me directly.
            </p>
          </div>

          <div
            style={{
              background: "#04040f",
              border: "1px solid #141420",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {PRICING_ROWS.map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 6 : 16,
                  padding: isMobile ? "22px 20px" : "26px 32px",
                  borderTop:
                    i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      ...heading(isMobile ? 20 : 24),
                      color: "#fff",
                      marginBottom: row.note ? 6 : 0,
                    }}
                  >
                    {row.name}
                  </div>
                  {row.note && (
                    <div
                      style={{
                        ...body,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        margin: 0,
                      }}
                    >
                      {row.note}{" "}
                      {row.link && (
                        <a
                          href={row.link.href}
                          style={{
                            color: CYAN,
                            textDecoration: "none",
                            borderBottom: `1px solid ${CYAN}55`,
                          }}
                        >
                          {row.link.label}
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    ...heading(isMobile ? 26 : 32),
                    color: CYAN,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.price}
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              ...body,
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            All packages include 100% rights transfer and NDA.
          </p>
        </div>
      </section>

      {/* ═══ TALK TO STEVEN ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 60%)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(CYAN), marginBottom: 14 }}>Get Started</div>
          <h2
            style={{
              ...heading(isMobile ? 32 : 44),
              color: "#fff",
              marginBottom: 14,
            }}
          >
            Talk to Steven
          </h2>
          <p style={{ ...body, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
            Send your references and I'll come back with a clear timeline and a 90-second demo plan.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {/* WhatsApp filled button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead("ghost_custom", "ghost_custom_talk_section")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: WHATSAPP_GREEN,
                color: "#fff",
                fontFamily:
                  "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "16px 32px",
                borderRadius: 50,
                textDecoration: "none",
                boxShadow: "0 0 32px rgba(37,211,102,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? 360 : "none",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(37,211,102,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 32px rgba(37,211,102,0.4)";
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z" />
              </svg>
              Message on WhatsApp
            </a>

            {/* Cyan outline — opens InquiryForm */}
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: `2px solid ${CYAN}`,
                color: CYAN,
                fontFamily:
                  "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "14px 32px",
                borderRadius: 50,
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(0,229,255,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? 360 : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 32px rgba(0,229,255,0.6)";
                e.currentTarget.style.background = "rgba(0,229,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(0,229,255,0.4)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Or leave details
            </button>
          </div>
        </div>
      </section>

      {/* ═══ WANT A TRACK TODAY? — cross-promote /ghost ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "#04040f",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              background: "#080810",
              border: `1px solid ${CYAN}33`,
              borderRadius: 10,
              padding: isMobile ? "32px 24px" : "44px 40px",
              textAlign: "center",
              boxShadow: "0 0 40px rgba(0,229,255,0.06)",
            }}
          >
            <div style={{ ...label(CYAN), marginBottom: 14 }}>
              Want a track today?
            </div>
            <h3
              style={{
                ...heading(isMobile ? 26 : 34),
                color: "#fff",
                marginBottom: 14,
              }}
            >
              Browse Ready-Made Tracks
            </h3>
            <p
              style={{
                ...body,
                marginBottom: 28,
                maxWidth: 480,
                margin: "0 auto 28px",
              }}
            >
              15 finished tracks, signed and ready to release. Hear them now, exclusive rights, instant delivery.
            </p>
            <a
              href="/ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(135deg, #00E5FF, #00b8d4)",
                color: "#000",
                fontFamily:
                  "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "16px 36px",
                borderRadius: 50,
                textDecoration: "none",
                boxShadow: "0 0 28px rgba(0,229,255,0.5)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 36px rgba(0,229,255,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 28px rgba(0,229,255,0.5)";
              }}
            >
              Browse 15 ready-made tracks →
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* ═══ Inquiry form modal ═══ */}
      <InquiryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        source="/ghost/custom"
        productLine="ghost_custom"
        autoMessage="Hi I'm interested in custom ghost production"
      />

      {/* ═══ Floating WhatsApp button ═══ */}
      <a
        href={WHATSAPP_URL}
        onClick={() => {
          trackWhatsAppLead("ghost_custom", "ghost_custom_floating");
        }}
        target="_blank"
        rel="noreferrer"
        aria-label="Message Steven on WhatsApp"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: WHATSAPP_GREEN,
          color: "#fff",
          fontFamily:
            "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 11 : 13,
          letterSpacing: "0.15em",
          padding: "10px 20px",
          borderRadius: 50,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}
