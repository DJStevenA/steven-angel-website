/**
 * /links — Linktree-style landing page for Instagram bio.
 *
 * Single column, mobile-first. All cards land on the same domain so the page
 * also captures SEO juice from any IG traffic. Each card fires a GA4
 * `select_item` event with the destination path so we can see in analytics
 * which offers convert best from social.
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "./lib/analytics/gtag";
import { usePageView, useTimeOnPage } from "./lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

const heading = (size) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 900,
  fontSize: size,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.1,
  margin: 0,
});
const body = {
  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.5,
  margin: 0,
};
const eyebrow = {
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: CYAN,
};

const SERVICES = [
  {
    eyebrow: "Premium · From €39",
    title: "Ghost Production",
    desc: "Ready-made Afro House, Tech House & Indie Dance tracks. NDA included.",
    to: "/ghost",
    accent: PURPLE,
    featured: true,
  },
  {
    eyebrow: "From $35",
    title: "Mix & Mastering",
    desc: "Trusted by Hernan Cattaneo & Dole & Kom. 3-day turnaround.",
    to: "/mix-mastering",
    accent: CYAN,
    featured: true,
  },
  {
    eyebrow: "Custom · From $300",
    title: "Demo Finishing",
    desc: "Send a demo, get a label-ready track in 3-5 days.",
    to: "/ghost/finish-demo",
    accent: CYAN,
  },
  {
    eyebrow: "1-on-1 · From $30",
    title: "Ableton Lessons",
    desc: "Production / mix / mastering — coaching from a Moblack & MTGD artist.",
    to: "/lessons",
    accent: CYAN,
  },
  {
    eyebrow: "Templates · $29",
    title: "Jungle Walk Masterclass",
    desc: "Full breakdown of a Beatport Top 10 track. 5 video lessons + project.",
    to: "/shop/afro-house-masterclass-ableton-live-tutorial-jungle-walk",
    accent: PURPLE,
  },
  {
    eyebrow: "All Products · From $19.99",
    title: "Templates & Masterclass",
    desc: "Ableton Live project files + the full Jungle Walk course.",
    to: "/shop",
    accent: CYAN,
  },
  {
    eyebrow: "Blog",
    title: "THE LAB — Production Notes",
    desc: "Mix, mastering, and the small decisions that separate hobbyist tracks from label releases.",
    to: "/blog",
    accent: CYAN,
  },
  {
    eyebrow: "EPK · Duo",
    title: "The Angels",
    desc: "Afro / Latin House duo from Tel Aviv. 15M+ streams, Beatport Top 10.",
    to: "/the-angels",
    accent: PURPLE,
  },
];

const SOCIAL = [
  { label: "Spotify", href: "https://open.spotify.com/artist/0iIeBNFROKZcDP6yY5tezG", external: true },
  { label: "Beatport", href: "https://www.beatport.com/artist/the-angels-il/1180776", external: true },
  { label: "TikTok", href: "https://www.tiktok.com/@theangels_ofc", external: true },
  { label: "Instagram", href: "https://www.instagram.com/theangels_tlv/", external: true },
];

function trackLinkClick(targetPath, label) {
  try {
    trackEvent("select_item", {
      item_list_id: "links_bio",
      item_list_name: "Linktree (IG bio)",
      items: [{ item_id: targetPath, item_name: label }],
    });
  } catch (_) {}
}

export default function Links() {
  usePageView("links_bio");
  useTimeOnPage("links_bio");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        backgroundImage: `radial-gradient(circle at 30% 0%, ${CYAN}11 0%, transparent 50%), radial-gradient(circle at 70% 100%, ${PURPLE}11 0%, transparent 50%)`,
        backgroundAttachment: "fixed",
        color: "#fff",
        padding: isMobile ? "28px 16px 48px" : "48px 24px 80px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: isMobile ? 12 : 14,
        }}
      >
        {/* HERO — name + tagline */}
        <header
          style={{
            textAlign: "center",
            marginBottom: isMobile ? 8 : 16,
            padding: isMobile ? "12px 0 20px" : "20px 0 28px",
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? 28 : 36,
              letterSpacing: "0.02em",
              lineHeight: 1.05,
              marginBottom: 8,
            }}
          >
            <span style={{ color: "#fff" }}>STEVEN </span>
            <span
              style={{
                background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ANGEL
            </span>
          </div>
          <div
            style={{
              ...body,
              fontSize: isMobile ? 13 : 14,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 4,
            }}
          >
            Beatport Top 10 producer · Tel Aviv
          </div>
          <div
            style={{
              ...body,
              fontSize: isMobile ? 12 : 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Released on Godeeva · MTGD · Moblack · Sony · Ultra · Armada
          </div>
        </header>

        {/* SERVICE LINKS */}
        {SERVICES.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            onClick={() => trackLinkClick(s.to, s.title)}
            style={{
              display: "block",
              background: BG_ALT,
              border: `1px solid ${s.accent}33`,
              borderRadius: 14,
              padding: isMobile ? "14px 16px" : "18px 20px",
              textDecoration: "none",
              color: "inherit",
              position: "relative",
              transition: "border-color 0.2s, transform 0.15s, box-shadow 0.2s",
              boxShadow: s.featured ? `0 0 24px ${s.accent}22` : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${s.accent}88`;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 0 28px ${s.accent}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${s.accent}33`;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = s.featured ? `0 0 24px ${s.accent}22` : "none";
            }}
          >
            <div
              style={{
                ...eyebrow,
                color: s.accent,
                fontSize: isMobile ? 10 : 11,
                marginBottom: 4,
              }}
            >
              {s.eyebrow}
            </div>
            <div
              style={{
                ...heading(isMobile ? 18 : 22),
                marginBottom: 4,
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                ...body,
                fontSize: isMobile ? 12 : 13,
                color: "rgba(255,255,255,0.5)",
                paddingRight: 24,
              }}
            >
              {s.desc}
            </div>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: isMobile ? 14 : 18,
                top: "50%",
                transform: "translateY(-50%)",
                color: s.accent,
                fontSize: isMobile ? 18 : 22,
                fontWeight: 700,
              }}
            >
              →
            </span>
          </Link>
        ))}

        {/* WhatsApp — special CTA, on-domain anchor to scroll to TalkToSteven */}
        <Link
          to="/ghost#contact"
          onClick={() => trackLinkClick("/ghost#contact", "WhatsApp Steven")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "#1a7a42",
            color: "#fff",
            border: "1px solid #1a7a42",
            borderRadius: 14,
            padding: isMobile ? "14px 16px" : "16px 20px",
            textDecoration: "none",
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 700,
            fontSize: isMobile ? 15 : 17,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            boxShadow: "0 0 28px rgba(26,122,66,0.4)",
            marginTop: isMobile ? 4 : 8,
          }}
        >
          <span style={{ fontSize: isMobile ? 18 : 20 }}>💬</span>
          Talk to Steven on WhatsApp
        </Link>

        {/* SOCIAL ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? 10 : 16,
            marginTop: isMobile ? 16 : 24,
            flexWrap: "wrap",
          }}
        >
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLinkClick(s.href, s.label)}
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 11 : 12,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                padding: isMobile ? "8px 12px" : "10px 14px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = CYAN;
                e.currentTarget.style.borderColor = `${CYAN}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* FOOTER — tiny brand line */}
        <div
          style={{
            textAlign: "center",
            marginTop: isMobile ? 28 : 36,
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.05em",
          }}
        >
          steven-angel.com
        </div>
      </main>
    </div>
  );
}
