/**
 * Ghost Finish Demo Page — /ghost/finish-demo
 *
 * "Demo Finishing — Co Production" landing page for producers who already
 * have a demo and want it taken label-ready (3–5 day turnaround).
 *
 * Positioned alongside /ghost (ready-made tracks) and /ghost/custom
 * (from-scratch ghost production). Single fixed entry price ($300 starting),
 * lead capture via WhatsApp + InquiryForm modal.
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

const BG = "#080810";
const BG_ALT = "#04040f";
const BG_DARK = "#02020a";

const WHATSAPP_URL =
  "https://wa.me/972523561353?text=Hi%20Steven%2C%20I'm%20interested%20in%20finishing%20my%20demo.";

/* Inline WhatsApp glyph — matches the rest of the site (MixMastering.jsx) */
const WhatsAppGlyph = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z" />
  </svg>
);

export default function GhostFinishDemo() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Remarketing
  usePageView("ghost-finish-demo");
  useScrollDepth("ghost-finish-demo");
  useTimeOnPage("ghost-finish-demo");

  /* ── style helpers (mirrors TheAngels.jsx) ── */
  const heading = (size) => ({
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1.1,
    letterSpacing: "0.04em",
    fontSize: size,
    color: "#fff",
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
    fontSize: 11,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: color || CYAN,
  });

  /* ── Schema.org Service ── */
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Demo Finishing — Ghost Production",
    serviceType: "Demo Finishing — Ghost Production",
    provider: {
      "@type": "Person",
      name: "Steven Angel",
      url: "https://steven-angel.com",
    },
    areaServed: "Worldwide",
    description:
      "Take your unfinished demo from rough idea to label-ready: full mix, master, stems, MIDI, project file, radio + extended versions, 100% rights transfer, NDA included. 3-5 day turnaround.",
    offers: {
      "@type": "Offer",
      price: "300",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "300",
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
      },
    },
    priceRange: "$300+",
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
      <Nav />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
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
            Demo Finishing — Co Production
          </h1>

          <div style={{ ...body, fontSize: isMobile ? 15 : 18, maxWidth: 600, margin: "0 auto 14px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em" }}>
            Let's get your track label ready
          </div>

          <div style={{ ...body, fontSize: isMobile ? 13 : 14, maxWidth: 600, margin: "0 auto", color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginBottom: 26 }}>
            3-5 day delivery · 100% rights · NDA included
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
        <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? 8 : 16 }}>
          {[
            { label: "Delivery", value: "3-5 days" },
            { label: "Rights", value: "100% Transfer" },
            { label: "Contract", value: "NDA Included" },
          ].map((h, i) => (
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

      {/* ═══ THE PROCESS — 4 numbered steps ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 60 }}>
            <div style={{ ...label(CYAN), marginBottom: 14 }}>How It Works</div>
            <h2 style={{ ...heading(isMobile ? 30 : 44) }}>The Process</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: isMobile ? 18 : 24,
            }}
          >
            {[
              {
                n: "01",
                title: "Brief",
                lead: "I listen and break it down",
                body:
                  "You send me your demo, I give you feedback as what needs to be done to get it release ready, we can also have a zoom to discuss.",
              },
              {
                n: "02",
                title: "Full Track Production",
                lead: null,
                body:
                  "I send you back the full track mixed & mastered — 3 revisions included.",
              },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  background: BG_ALT,
                  border: "1px solid #141420",
                  borderRadius: 10,
                  padding: "28px 24px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    ...heading(isMobile ? 36 : 44),
                    color: CYAN,
                    lineHeight: 1,
                    marginBottom: 4,
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    ...heading(isMobile ? 18 : 22),
                    letterSpacing: "0.04em",
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </div>
                {step.lead && (
                  <div style={{ ...label(CYAN), fontSize: 11, marginBottom: 6, color: CYAN }}>
                    {step.lead}
                  </div>
                )}
                <p style={{ ...body, fontSize: 14, marginTop: 2 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING — single row ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: BG_ALT,
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ ...label(CYAN), marginBottom: 14 }}>Pricing</div>
            <h2 style={{ ...heading(isMobile ? 30 : 44) }}>One Track. One Price.</h2>
          </div>

          <div
            style={{
              background: BG,
              border: `1px solid ${CYAN}33`,
              borderRadius: 12,
              padding: isMobile ? "32px 24px" : "40px 36px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: isMobile ? 18 : 32,
              boxShadow: `0 0 40px ${CYAN}14`,
            }}
          >
            <div style={{ textAlign: isMobile ? "center" : "left", flex: 1 }}>
              <div
                style={{
                  ...heading(isMobile ? 26 : 32),
                  marginBottom: 6,
                }}
              >
                Demo Finishing
              </div>
              <div
                style={{
                  ...body,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Starting price.
              </div>
            </div>
            <div
              style={{
                ...heading(isMobile ? 48 : 64),
                color: CYAN,
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              $300
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TALK TO STEVEN ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: BG,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ ...label(CYAN), marginBottom: 14 }}>Get In Touch</div>
          <h2 style={{ ...heading(isMobile ? 30 : 44), marginBottom: 16 }}>
            Talk to Steven
          </h2>
          <p style={{ ...body, marginBottom: isMobile ? 28 : 36 }}>
            Drop me a message — I personally reply to every demo. Released on MTGD,
            Moblack and Godeeva, with Beatport Top 10 placements alongside Hugel and
            Claptone supports.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 14 : 18,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                trackWhatsAppLead("ghost_finish_demo", "ghost_finish_demo_talk_to_steven")
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                background: WHATSAPP_GREEN,
                color: "#fff",
                fontFamily:
                  "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "16px 32px",
                borderRadius: 50,
                textDecoration: "none",
                boxShadow: "0 0 32px rgba(37,211,102,0.4)",
                width: isMobile ? "100%" : "auto",
                minWidth: isMobile ? 0 : 240,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 36px rgba(37,211,102,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 32px rgba(37,211,102,0.4)";
              }}
            >
              <WhatsAppGlyph size={20} />
              Message on WhatsApp
            </a>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
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
                width: isMobile ? "100%" : "auto",
                minWidth: isMobile ? 0 : 240,
                transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.background = "rgba(0,229,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Or Leave Details
            </button>
          </div>
        </div>
      </section>

      {/* ═══ OTHER OPTIONS — cross-promote ═══ */}
      <section
        style={{
          padding: isMobile ? "60px 24px" : "100px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: BG_DARK,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ ...label(PURPLE), marginBottom: 14, color: PURPLE }}>
              Other Options
            </div>
            <h2 style={{ ...heading(isMobile ? 26 : 36) }}>Not Quite What You Need?</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 16 : 24,
            }}
          >
            <a
              href="/ghost"
              style={{
                background: BG_ALT,
                border: "1px solid #141420",
                borderRadius: 10,
                padding: "28px 24px",
                textDecoration: "none",
                color: "#fff",
                display: "block",
                transition:
                  "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = `${CYAN}55`;
                e.currentTarget.style.boxShadow = `0 6px 28px ${CYAN}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#141420";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ ...label(CYAN), marginBottom: 10 }}>Ghost Catalog</div>
              <div
                style={{
                  ...heading(isMobile ? 20 : 24),
                  marginBottom: 8,
                  letterSpacing: "0.03em",
                }}
              >
                Browse 15 ready-made tracks →
              </div>
              <p style={{ ...body, fontSize: 14, marginTop: 6 }}>
                Pre-produced, mixed and mastered tracks ready for your label.
                Listen, pick, deliver.
              </p>
            </a>

            <a
              href="/ghost/custom"
              style={{
                background: BG_ALT,
                border: "1px solid #141420",
                borderRadius: 10,
                padding: "28px 24px",
                textDecoration: "none",
                color: "#fff",
                display: "block",
                transition:
                  "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = `${PURPLE}55`;
                e.currentTarget.style.boxShadow = `0 6px 28px ${PURPLE}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#141420";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ ...label(PURPLE), marginBottom: 10, color: PURPLE }}>
                Custom Build
              </div>
              <div
                style={{
                  ...heading(isMobile ? 20 : 24),
                  marginBottom: 8,
                  letterSpacing: "0.03em",
                }}
              >
                Custom production from scratch →
              </div>
              <p style={{ ...body, fontSize: 14, marginTop: 6 }}>
                Built around your reference, vision and vocal. Full Steven Angel
                production from the ground up.
              </p>
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* ═══ Inquiry Form Modal ═══ */}
      <InquiryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        source="/ghost/finish-demo"
        productLine="ghost_finish_demo"
        autoMessage="Hi I'm interested in finishing my demo"
      />

      {/* ═══ Floating WhatsApp ═══ */}
      <a
        href={WHATSAPP_URL}
        onClick={() =>
          trackWhatsAppLead("ghost_finish_demo", "ghost_finish_demo_floating")
        }
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
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 11 : 13,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          padding: "10px 20px",
          borderRadius: 50,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
        }}
      >
        <WhatsAppGlyph size={18} />
        WhatsApp
      </a>
    </div>
  );
}
