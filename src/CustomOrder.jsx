/**
 * /custom-order — HIDDEN order page.
 *
 * NOT linked from anywhere on the public site. Steven sends the URL
 * directly to customers who want to order.
 *
 * noindex/nofollow + excluded from prerender + nav.
 *
 * Sections:
 *   Header · Process (3 steps verbatim from GhostCustom) · Pricing (3 rows
 *   with Order Now → /sign?package=<X>) · What happens after you order.
 *
 * The 3 Order Now buttons all link to the EXISTING /sign?package=X flow,
 * which fires the existing backend pipeline:
 *   POST /sign-first → generate PDF (NDA) + create Dropbox folder + send
 *   emails + create PayPal order → redirect to PayPal for payment.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#04040f";

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
    body:
      "I send you back the full track mixed & mastered — 3 revisions included.",
  },
];

const PACKAGES = [
  {
    pkg: "demo",
    name: "Demo Finishing",
    price: "$300",
    detail:
      "You send me your demo. I finish, mix, and master it. Stems + Mastered WAV + MP3 + PreMaster delivered.",
  },
  {
    pkg: "full",
    name: "Full Production",
    price: "$800",
    detail:
      "Built from scratch to your brief. Extended Edit + Radio Edit (Mastered WAV + MP3) + PreMaster + Stems + MIDI files.",
  },
  {
    pkg: "vocal",
    name: "Full Production with Vocal",
    price: "$1,500",
    detail:
      "Full track with original vocal. Extended + Radio Edit + Stems + MIDI files. Vocal cleared for commercial release.",
  },
];

export default function CustomOrder() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "Custom Ghost Production — Order";

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow, noarchive, nosnippet";
    document.head.appendChild(robots);

    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      robots.remove();
    };
  }, []);

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
    color: "rgba(255,255,255,0.65)",
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

  return (
    <div style={{ background: BG, color: "#fff", minHeight: "100vh" }}>
      {/* ═══ Top bar — minimal, just logo + back to site ═══ */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "18px 20px" : "22px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: "0.1em",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
        <Link
          to="/"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
          }}
        >
          steven-angel.com
        </Link>
      </header>

      {/* ═══ Header section ═══ */}
      <section
        style={{
          padding: isMobile ? "48px 20px 32px" : "72px 32px 48px",
          textAlign: "center",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <div style={{ ...label(CYAN), marginBottom: 16 }}>
          Custom Ghost Production · Order
        </div>
        <h1
          style={{
            ...heading(isMobile ? 36 : 56),
            background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 16,
          }}
        >
          Build Your Track
        </h1>
        <p
          style={{
            ...body,
            fontSize: isMobile ? 15 : 17,
            color: "rgba(255,255,255,0.75)",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          Pick a package below to start. You'll sign the NDA, upload your
          references to a private Dropbox folder, and complete payment via
          PayPal.
        </p>
      </section>

      {/* ═══ Process ═══ */}
      <section
        style={{
          padding: isMobile ? "32px 20px" : "48px 32px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>How It Works</div>
          <h2 style={{ ...heading(isMobile ? 26 : 34), color: "#fff" }}>
            The Process
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 14 : 20,
          }}
        >
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.n}
              style={{
                background: "#07070f",
                border: "1px solid #141420",
                borderRadius: 10,
                padding: isMobile ? "22px 18px" : "28px 24px",
              }}
            >
              <div
                style={{
                  ...heading(isMobile ? 32 : 40),
                  color: CYAN,
                  marginBottom: 10,
                  opacity: 0.85,
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  ...heading(isMobile ? 18 : 22),
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h3>
              <p style={{ ...body, fontSize: 14, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Pricing — 3 packages with Order Now ═══ */}
      <section
        style={{
          padding: isMobile ? "32px 20px 16px" : "56px 32px 24px",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>Pricing</div>
          <h2 style={{ ...heading(isMobile ? 26 : 34), color: "#fff" }}>
            Choose Your Package
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? 14 : 18,
          }}
        >
          {PACKAGES.map((p) => (
            <div
              key={p.pkg}
              style={{
                background: "#07070f",
                border: `1px solid ${p.pkg === "full" ? CYAN : "#141420"}`,
                borderRadius: 12,
                padding: isMobile ? "24px 20px" : "32px 26px",
                display: "flex",
                flexDirection: "column",
                boxShadow:
                  p.pkg === "full" ? `0 0 32px rgba(0,229,255,0.12)` : "none",
              }}
            >
              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 10 }}>
                {p.pkg === "full" ? "Most Popular" : "Package"}
              </div>
              <h3
                style={{
                  ...heading(isMobile ? 22 : 26),
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                {p.name}
              </h3>
              <div
                style={{
                  ...heading(isMobile ? 36 : 44),
                  color: CYAN,
                  letterSpacing: "0.02em",
                  marginBottom: 14,
                }}
              >
                {p.price}
              </div>
              <p
                style={{
                  ...body,
                  fontSize: 13,
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                {p.detail}
              </p>
              <Link
                to={`/sign?package=${p.pkg}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 22px",
                  background: CYAN,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 14,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: `0 0 24px rgba(0,229,255,0.25)`,
                }}
              >
                Order Now →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ What happens after you click Order Now ═══ */}
      <section
        style={{
          padding: isMobile ? "32px 20px 64px" : "48px 32px 96px",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#07070f",
            border: "1px solid #141420",
            borderRadius: 12,
            padding: isMobile ? "28px 22px" : "40px 36px",
          }}
        >
          <div style={{ ...label(CYAN), marginBottom: 14 }}>
            What Happens After You Click
          </div>
          <h2
            style={{
              ...heading(isMobile ? 22 : 28),
              color: "#fff",
              marginBottom: 20,
            }}
          >
            3 Steps
          </h2>

          {[
            {
              n: "1.",
              title: "Sign the NDA",
              body:
                "You'll be taken to the Ghost Production Agreement page — 11 clauses covering confidentiality, 100% copyright transfer, exclusivity, deliverables, and revisions. You sign with your name and email.",
            },
            {
              n: "2.",
              title: "Private Dropbox folder + emails",
              body:
                "I automatically create a private Dropbox folder for your project. You get an email with the signed NDA (PDF) and a direct upload link to your folder for your references / vocal / demo files.",
            },
            {
              n: "3.",
              title: "Pay via PayPal",
              body:
                "After signing you're redirected to PayPal. Once payment goes through, I start on your brief and reach out within 24 hours to begin step 1 of the process.",
            },
          ].map((item) => (
            <div
              key={item.n}
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 18,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  ...heading(isMobile ? 18 : 22),
                  color: CYAN,
                  flexShrink: 0,
                  minWidth: 24,
                }}
              >
                {item.n}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? 15 : 17,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    ...body,
                    fontSize: 13,
                  }}
                >
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
