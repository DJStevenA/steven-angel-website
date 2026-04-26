/**
 * Lessons Page — /lessons
 *
 * Landing page for Google Ads campaign targeting international music producers.
 * English only. Conversion-optimized: Instruction Lesson $30, Full Lesson $120+.
 */

import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import TrackPlayer from "./components/TrackPlayer";
import { trackWhatsAppLead } from "./lib/analytics/events";
import { useScrollDepth, useTimeOnPage } from "./lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const SHADOW_CYAN = "0 0 24px rgba(0,229,255,0.35)";
const SHADOW_PURPLE = "0 0 24px rgba(187,134,252,0.35)";
const WHATSAPP_LINK = "https://wa.me/972523561353?text=Hi%20Steven%2C%20I%E2%80%99m%20interested%20in%20Ableton%20lessons";

const heading = (sz) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 900,
  fontSize: sz,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.15,
});

const body = {
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.7,
};

const label = (c = CYAN) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: c,
});

const outlineBtn = (color, shadow) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  padding: "14px 32px",
  borderRadius: 6,
  border: `2px solid ${color}`,
  color,
  background: "transparent",
  cursor: "pointer",
  textDecoration: "none",
  boxShadow: shadow || "none",
});

const visuallyHidden = {
  position: "absolute", width: "1px", height: "1px", padding: 0,
  margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap", border: 0,
};

/* Lazy YouTube embed */
function LazyYouTube({ id, title }) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title={title || "Video"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
    />
  );
}

/* Calendly links */
const CALENDLY_INTRO = "https://calendly.com/dj-steven-angel/1hr-production-lesson-mentoring-prepaid-clone";
const CALENDLY_1HR = "https://calendly.com/dj-steven-angel/3hr-production-lesson-mentoring-prepaid-clone";
const CALENDLY_3HR = "https://calendly.com/dj-steven-angel/3hrproduction-lesson-mentoring-prepaid-clone";
const CALENDLY_6HR = "https://calendly.com/dj-steven-angel/3hr-production-lesson-mentoring-prepaid-clone-1";

const fireCalendlyConversion = () => {
  if (window.gtag) {
    window.gtag("event", "book_appointment", { event_category: "calendly", event_label: "lessons", value: 120, currency: "USD" });
  }
  if (window.clarity) window.clarity("event", "lessonCalendlyClick");
};

const fireIntroClick = () => {
  if (window.gtag) {
    window.gtag("event", "sign_up", { event_category: "lessons", event_label: "free_trial_$30", value: 30, currency: "USD" });
  }
  if (window.clarity) window.clarity("event", "lessonStudioSessionClick");
};

const fireFloatingWhatsAppClick = () => {
  trackWhatsAppLead("PL", "lessons_floating");
  if (window.clarity) window.clarity("event", "lessonWhatsAppClick");
};

const fireContactWhatsAppClick = () => {
  trackWhatsAppLead("PL", "lessons_contact");
  if (window.clarity) window.clarity("event", "lessonWhatsAppClick");
};

/* ─────────────────────────────────────────────
   Curriculum module data
───────────────────────────────────────────── */
const MODULES = [
  {
    num: 1,
    title: "Module 1 — Software",
    desc: "Ableton interface, workflow, built-in plugins, arrangement basics. Working with MIDI/Audio, loops & one-shots. Genre-relevant sounds from lesson 1.",
    points: [
      ["Working with MIDI", "Timing, playing, drawing notes — how to turn an idea into sound"],
      ["Working with Audio", "Recording, cutting, warping — working with real audio files"],
      ["Pattern, Grid & Quantize", "The foundation of every groove — how to lock things in tight"],
      ["One Shots & Loops", "The difference, when to use each, and how to stay organised"],
      ["Ableton Built-in Plugins", "Simpler, Sampler, Drum Rack, Wavetable — what each tool does"],
      ["External Plugins", "Splice, Serum, FabFilter, Waves — connecting, managing, updating"],
      ["Correct Saving Workflow", "Folders, Collect All and Save — never lose a project again"],
      ["Export", "WAV, MP3, Stems — correct export for every platform"],
    ],
    color: CYAN,
  },
  {
    num: 2,
    title: "Module 2 — Music Theory",
    desc: "How to write music in scale (on key), build chords, match bass to chords and melody. Take a small musical idea and turn it into a full-length arrangement.",
    points: [
      ["Note Names", "Do Re Mi and the English system — a foundation every producer needs"],
      ["Scales & Chords", "Major, Minor, Modes — how to build harmony that works on the dancefloor"],
      ["Melodies, Harmonies & Counterpoint", "Adding a layer that connects without clashing"],
      ["Stretching a Short Melodic Idea into a Full Arrangement", "From 4 bars to a complete track — variation and development techniques"],
      ["Matching Melody to Chords & Bass", "How to make all three layers sit naturally together"],
      ["Chord Progressions That Feel Right", "What works, what doesn't, and why"],
    ],
    color: CYAN,
  },
  {
    num: 3,
    title: "Module 3 — Styling, Sound Design, Mix & Mastering",
    desc: "Advanced drum programming, synth & bass layering, mix & mastering — this is the stage we make the track CRISP for the club!",
    points: [
      ["Drum Sound Design", "Selecting kicks, snares and hi-hats by genre — the right palette for your sound"],
      ["Drum Layering", "Transient shaping, layering techniques — why your kick isn't punching yet"],
      ["Synth Layering", "Building rich, wide sounds layer by layer"],
      ["Mix", "EQ, compressor, depth — every channel in its place, no clashing frequencies"],
      ["Advanced Processing", "Saturation, Sidechain, Stereo Width, Mid/Side — the tricks that change everything"],
      ["Club-Ready Sound", "Making a track sound big and loud on any system, in any room"],
      ["Mastering", "Loudness, Limiting, Reference Tracks — Beatport & Spotify ready"],
    ],
    color: CYAN,
  },
];

/* ─────────────────────────────────────────────
   Module Detail Modal
───────────────────────────────────────────── */
function ModuleModal({ module, onClose }) {
  // Close on Escape key
  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#04040f",
          border: `1px solid ${module.color}33`,
          borderTop: `3px solid ${module.color}`,
          borderRadius: 12,
          padding: "32px 28px",
          maxWidth: 560,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: `0 0 60px ${module.color}22`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)", fontSize: 22, lineHeight: 1,
            padding: "4px 8px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title */}
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, textTransform: "uppercase", letterSpacing: "0.04em", color: module.color, marginBottom: 20, paddingRight: 32, lineHeight: 1.2 }}>
          {module.title}
        </div>

        {/* Points */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {module.points.map(([label, detail]) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ color: module.color, fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>›</span>
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", color: "#fff", textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginTop: 2 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #141420" }}>
          <a
            href="#pricing"
            onClick={onClose}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#000", background: `linear-gradient(135deg,${CYAN},#00b8d4)`,
              padding: "12px 24px", borderRadius: 6, textDecoration: "none",
            }}
          >
            Book a Lesson →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Lessons() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [formStatus, setFormStatus] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Remarketing signals
  useScrollDepth("lessons");
  useTimeOnPage("lessons");

  useEffect(() => {
    if (window.clarity) window.clarity("event", "lessonPageVisit");
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>

      {/* ═══ Fixed WhatsApp Button ═══ */}
      <a
        href={WHATSAPP_LINK}
        onClick={fireFloatingWhatsAppClick}
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1a7a42",
          color: "#fff",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 11 : 13,
          letterSpacing: "0.15em",
          padding: "10px 20px",
          borderRadius: 50,
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(37,211,102,0.5)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.61.61l6.163-1.529A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.214-3.724.924.942-3.626-.234-.373A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12c0 5.421-4.398 9.818-9.818 9.818z" />
        </svg>
        WhatsApp
      </a>

      <Nav />

      <main>
        {/* ═══ HERO ═══ */}
        <section style={{ padding: isMobile ? "60px 20px 50px" : "100px 60px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <img
            src="/images/dj-hero-ghost.webp"
            alt="Steven Angel — Ableton Production Mentor"
            fetchPriority="high"
            width="800"
            height="1200"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)" }} />

          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <h1 style={visuallyHidden}>Ableton Lessons by a Moblack & MTGD Artist — Online 1-on-1 Mentorship</h1>

            <div style={{ ...heading(isMobile ? 32 : 60), marginBottom: 16 }}>
              Ableton Lessons by a
              <br />
              <span style={{ color: CYAN }}>Moblack & MTGD Producer</span>
            </div>

            <div style={{ ...body, fontSize: isMobile ? 16 : 19, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
              Learn Afro House, Latin House, Tech House & Indie Dance Production — 1-on-1 Online Mentorship
            </div>

            <div style={{ ...body, fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: 36 }}>
              Hugel & Claptone play my releases and I've had releases on Sony, Moblack & Godeeva. Now I'll teach you the workflow that got me there.
            </div>

            {/* CTA Cards */}
            <div style={{ display: "flex", flexWrap: "nowrap", gap: isMobile ? 8 : 16, marginTop: isMobile ? 8 : 16, textAlign: "left" }}>
              {[
                { title: "EXPLORE CURRICULUM", sub: "See what you'll learn across 3 production modules", btn: "View Modules", scroll: "curriculum", premium: true },
                { title: "BOOK INSTRUCTION LESSON", sub: "Skip ahead — talk to me directly, $30 intro session", btn: "Book A Lesson", scroll: "pricing", premium: false },
              ].map((card, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => { e.preventDefault(); const el = document.getElementById(card.scroll); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: isMobile ? "14px 12px 12px" : "24px 24px 20px",
                    background: card.premium ? "linear-gradient(135deg, #0a0a20, #0d0418)" : BG,
                    border: card.premium ? `2px solid ${CYAN}` : "1px solid #141420",
                    borderRadius: 10,
                    boxShadow: card.premium ? "0 0 40px rgba(0,229,255,0.12)" : "none",
                    textDecoration: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: isMobile ? 12 : 16, textTransform: "uppercase", letterSpacing: "0.03em", color: card.premium ? CYAN : "#fff", lineHeight: 1.2 }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: isMobile ? 10 : 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.4, flex: 1 }}>
                    {card.sub}
                  </div>
                  <div style={{ marginTop: isMobile ? 6 : 12, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 13, letterSpacing: "0.15em", textTransform: "uppercase", color: card.premium ? CYAN : "rgba(255,255,255,0.6)" }}>
                    {card.btn} <span style={{ fontSize: isMobile ? 12 : 15 }}>→</span>
                  </div>
                </a>
              ))}
            </div>

            {/* ── Listen CTA ── */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a
                href="#listen"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: CYAN,
                  textDecoration: "none",
                  opacity: 0.85,
                  transition: "opacity 0.2s, text-decoration 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.textDecoration = "none"; }}
              >
                Listen To My Work →
              </a>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT STEVEN ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
            <img
              src="/images/portrait.webp"
              alt="Steven Angel — Afro House DJ and Producer"
              loading="lazy"
              width="800"
              height="903"
              style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 520 }}
            />
            <div>
              <div style={{ ...label(PURPLE), marginBottom: 10 }}>ABOUT ME</div>
              <div style={{ ...heading(isMobile ? 28 : 40), marginBottom: 20 }}>
                DJ, Producer &<br />
                <span style={{ color: CYAN }}>Audio Engineer</span>
              </div>
              <div style={{ ...body, marginBottom: 16, color: "rgba(255,255,255,0.75)" }}>
                20+ years in electronic music. I produce, DJ, teach and master — all at label standard.
              </div>

              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 8, marginTop: 20 }}>RELEASED ON</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Moblack Records · MTGD · Godeeva · Sony Music · Sony / Orianna · Redolent
              </div>

              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 8 }}>2 BEATPORT TOP 10 TRACKS</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Jungle Walk — Godeeva · Fuego En Tus Ojos — Sony / Orianna
              </div>

              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 8 }}>DJS SUPPORTING MY MUSIC</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Hugel · Claptone · ARTBAT · Hernan Cattaneo · Francis Mercier · Pauza · MESTIZA · DJ Chus · Joeski
              </div>

              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 8 }}>PERFORMED AT</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Pacha Ibiza · Pacha Barcelona · Zamna Festival · Canary Islands · USA · Latin America · Europe
              </div>

              <div style={{ ...label(CYAN), fontSize: 10, marginBottom: 8, marginTop: 16 }}>THE ANGELS DUO</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                Part of the Afro / Latin House duo{" "}
                <a href="https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz" target="_blank" rel="noreferrer" style={{ color: CYAN, textDecoration: "none" }}>The Angels</a>
                {" "}— 15M+ streams ·{" "}
                <a href="https://www.beatport.com/artist/the-angels-il/913642" target="_blank" rel="noreferrer" style={{ color: CYAN, textDecoration: "none" }}>Beatport</a>
              </div>

              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginTop: 4 }}>
                I teach what I know. I produce what you hear.
              </div>
            </div>
          </div>
        </section>

        {/* ═══ THIS IS FOR YOU IF ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 36 }}>
              This Is For You If...
            </h2>
            {[
              "You are stuck watching YouTube without a real system",
              "You can make something but it does not sound professional",
              "You cannot finish a track",
              "You want to learn the genre you love, not generic music theory",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: CYAN, fontWeight: 700, fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>&#10003;</span>
                <span style={{ ...body, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.8)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ THE DIFFERENCE ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 24 : 40), textAlign: "center", marginBottom: 36 }}>
              YouTube vs <span style={{ color: CYAN }}>1-on-1 with Steven</span>
            </h2>
            {(() => {
              const rows = [
                { yt: "Fragmented knowledge", sa: "A complete system from start to finish" },
                { yt: "Generic content", sa: "Tailored to your genre and level" },
                { yt: "No feedback", sa: "Weekly feedback on your actual work" },
                { yt: "You watch", sa: "You build \u2014 from lesson 1" },
              ];
              const cellPad = isMobile ? "14px 12px" : "18px 24px";
              const textStyle = { fontFamily: "DM Sans, sans-serif", fontSize: isMobile ? 12 : 14, lineHeight: 1.4 };
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 10, overflow: "hidden", border: "1px solid #141420" }}>
                  <div style={{ background: "#04040f", padding: cellPad, borderBottom: "1px solid #141420" }}>
                    <div style={{ ...label("rgba(255,255,255,0.5)") }}>YouTube</div>
                  </div>
                  <div style={{ background: "#020208", padding: cellPad, borderBottom: "1px solid #141420", borderLeft: "1px solid #141420" }}>
                    <div style={{ ...label(CYAN) }}>1-on-1 with Steven</div>
                  </div>
                  {rows.map((row, idx) => (
                    <Fragment key={idx}>
                      <div style={{ background: "#04040f", padding: cellPad, borderBottom: idx < rows.length - 1 ? "1px solid #141420" : "none", display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: "rgba(255,60,60,0.6)", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>&#10007;</span>
                        <span style={{ ...textStyle, color: "rgba(255,255,255,0.5)" }}>{row.yt}</span>
                      </div>
                      <div style={{ background: "#020208", padding: cellPad, borderBottom: idx < rows.length - 1 ? "1px solid #141420" : "none", borderLeft: "1px solid #141420", display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: CYAN, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>&#10003;</span>
                        <span style={{ ...textStyle, color: "rgba(255,255,255,0.8)" }}>{row.sa}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>

        {/* ═══ CURRICULUM ═══ */}
        {activeModule && <ModuleModal module={activeModule} onClose={() => setActiveModule(null)} />}

        <section id="curriculum" style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 36 }}>
              Curriculum
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>

              {/* Modules 1–3 — whole card is clickable, arrow in corner signals expand */}
              {MODULES.map((mod) => (
                <div
                  key={mod.title}
                  onClick={() => setActiveModule(mod)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveModule(mod); }}
                  style={{ background: BG, border: "1px solid #141420", borderTop: `2px solid ${mod.color}`, borderRadius: 10, padding: isMobile ? "24px 18px" : "28px 24px", position: "relative", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${mod.color}66`; e.currentTarget.style.boxShadow = `0 0 20px ${mod.color}18`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#141420"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Expand arrow — top-right corner */}
                  <span style={{ position: "absolute", top: 14, right: 16, color: `${mod.color}99`, fontSize: 18, lineHeight: 1, pointerEvents: "none" }}>⌄</span>
                  <div style={{ ...heading(isMobile ? 16 : 20), marginBottom: 10, color: mod.color, paddingRight: 24 }}>{mod.title}</div>
                  <div style={{ ...body, fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.6)" }}>{mod.desc}</div>
                </div>
              ))}

              {/* Full Journey card — no modal */}
              <div style={{ background: BG, border: `1px solid ${PURPLE}`, borderTop: `2px solid ${PURPLE}`, borderRadius: 10, padding: isMobile ? "24px 18px" : "28px 24px", position: "relative" }}>
                <div style={{ position: "absolute", top: -10, left: 20, background: `linear-gradient(90deg,${PURPLE},${CYAN})`, color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.25em", padding: "3px 10px", borderRadius: 20 }}>
                  BEST VALUE
                </div>
                <div style={{ ...heading(isMobile ? 16 : 20), marginBottom: 10, color: PURPLE }}>Full Journey (1+2+3)</div>
                <div style={{ ...body, fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.6)" }}>Complete path from zero to release-ready. Best value.</div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══ FREE SAMPLE LESSONS ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ ...label(CYAN), marginBottom: 16, textAlign: "center" }}>FREE SAMPLE LESSONS</div>
            <h2 style={{ ...heading(isMobile ? 24 : 36), textAlign: "center", marginBottom: 32 }}>
              Watch Before You <span style={{ color: CYAN }}>Book</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
              {["SFzJhU6ZMOs", "1MULJiBzwdU", "-cV_T6vixvo"].map((id) => (
                <div key={id} style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,229,255,0.1)" }}>
                  <LazyYouTube id={id} title="Steven Angel Free Lesson" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STUDENT TESTIMONIALS ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 12 }}>
              Student <span style={{ color: CYAN }}>Wins</span>
            </h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 40, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              What producers say after learning with me.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
              {[
                { name: "Marco R.", country: "Italy", text: "In 3 months with Steven I went from bedroom beats to getting signed. His cut-the-fat method changed everything.", topic: "Afro House" },
                { name: "DJ Kobi", country: "Israel", text: "The way Steven breaks down Ableton completely changed how I work. My workflow is 3x faster now.", topic: "Melodic Techno" },
                { name: "Sarah M.", country: "UK", text: "After 6 lessons my tracks finally sound like they belong on a major label. Life changing.", topic: "Deep House" },
                { name: "Niko V.", country: "Germany", text: "Steven identifies exactly what's missing from a track. Best investment in my music career.", topic: "Tech House" },
                { name: "Pedro L.", country: "Spain", text: "Released my first track on a label 4 months after starting lessons. Couldn't have done it without Steven's guidance.", topic: "Afro Latin" },
                { name: "Avi S.", country: "Israel", text: "Focused lessons, real feedback, zero fluff. Every session I walk away with something I can apply immediately.", topic: "Indie Dance" },
              ].map(({ name, country, text, topic }) => (
                <div key={name} style={{
                  background: "#04040f",
                  border: "1px solid #141420",
                  borderTop: `2px solid ${CYAN}`,
                  borderRadius: 10,
                  padding: isMobile ? "24px 20px" : "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  <div style={{ ...body, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                    "{text}"
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.05em" }}>
                        {name}
                      </div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {country}
                      </div>
                    </div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      {topic}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...body, textAlign: "center", marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
              (Testimonials shown are representative — real student quotes will replace these soon.)
            </div>
          </div>
        </section>

        {/* ═══ LISTEN TO MY WORK ═══ */}
        <TrackPlayer />

        {/* ═══ PACKAGES & PRICING ═══ */}
        <section id="pricing" style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), marginBottom: 12 }}>
              Pricing
            </h2>
            <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: 32 }}>
              I take a limited number of students each month.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {[
                { name: "Instruction Lesson (intro)", price: "$30", detail: "30 min", url: CALENDLY_INTRO, onClick: fireIntroClick, accent: CYAN, highlight: false },
                { name: "Single Lesson", price: "$120", detail: "1 hour", url: CALENDLY_1HR, onClick: fireCalendlyConversion, accent: CYAN, highlight: false },
                { name: "3 Lessons", price: "$320", detail: "Best for getting started seriously", url: CALENDLY_3HR, onClick: fireCalendlyConversion, accent: PURPLE, highlight: true },
                { name: "6 Lessons", price: "$580", detail: "Full module — real progress", url: CALENDLY_6HR, onClick: fireCalendlyConversion, accent: PURPLE, highlight: false },
              ].map(({ name, price, detail, url, onClick, accent, highlight }) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" onClick={onClick}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: isMobile ? "16px 16px" : "18px 24px",
                    background: highlight ? "linear-gradient(135deg,#0a0a20,#0d0418)" : BG,
                    borderRadius: 8,
                    border: highlight ? `2px solid ${PURPLE}` : "1px solid #141420",
                    textDecoration: "none", color: "inherit",
                    boxShadow: highlight ? "0 0 30px rgba(187,134,252,0.1)" : "none",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ ...body, fontSize: isMobile ? 14 : 16, color: "#fff", fontWeight: 500 }}>{name}</div>
                    <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{detail}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 20 : 24, color: accent }}>
                      {price}
                    </div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, opacity: 0.55, marginTop: 3 }}>
                      TO BOOK →
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CONTACT / BOOKING ═══ */}
        <section style={{ padding: isMobile ? "40px 20px 50px" : "60px 60px 70px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 12 }}>
              Ready to <span style={{ color: CYAN }}>Start?</span>
            </h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 32 }}>
              Choose an option below or send me a message.
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
              <a href={CALENDLY_INTRO} target="_blank" rel="noreferrer" onClick={fireIntroClick}
                style={{ ...outlineBtn(CYAN, SHADOW_CYAN), background: `linear-gradient(135deg,${CYAN},#00b8d4)`, color: "#000" }}>
                Book an Instruction Lesson — $30
              </a>
              <a href={CALENDLY_1HR} target="_blank" rel="noreferrer" onClick={fireCalendlyConversion}
                style={outlineBtn(PURPLE, SHADOW_PURPLE)}>
                Book a Full Lesson — From $120
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 40, alignItems: "start" }}>
              {/* Contact form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const data = Object.fromEntries(new FormData(form));
                  data.source = "lessons-page";
                  fetch("https://ghost-backend-production-adb6.up.railway.app/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.success) {
                        setFormStatus("sent");
                        form.reset();
                        if (window.clarity) {
                          window.clarity("event", "lessonFormSubmit");
                          window.clarity("set", "conversion_type", "lead_lessons_contact");
                          window.clarity("set", "product", "lessons_contact");
                          window.clarity("set", "value", "80");
                        }
                        if (window.gtag) window.gtag("event", "generate_lead", { event_category: "form", event_label: "lessons_contact", value: 80, currency: "USD" });
                      } else {
                        setFormStatus("error");
                      }
                    })
                    .catch(() => setFormStatus("error"));
                }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  ["Your name", "name", "text", true],
                  ["Your email", "email", "email", true],
                ].map(([placeholder, name, type, req]) => (
                  <input key={name} name={name} type={type} placeholder={placeholder} required={req}
                    style={{ background: "#08080f", border: "1px solid #1a1a2e", borderRadius: 6, padding: "14px 16px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }} />
                ))}
                <textarea name="message" placeholder="Tell me about your goals" rows={4}
                  style={{ background: "#08080f", border: "1px solid #1a1a2e", borderRadius: 6, padding: "14px 16px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", resize: "vertical" }} />
                <button type="submit" style={{ ...outlineBtn(CYAN, SHADOW_CYAN), justifyContent: "center", fontSize: 15, width: "100%" }}>
                  Send Message
                </button>
                {formStatus === "sent" && <div style={{ color: "#4CAF50", fontSize: 13, textAlign: "center" }}>Message sent! I'll get back to you within 24 hours.</div>}
                {formStatus === "error" && <div style={{ color: "#ff6b6b", fontSize: 13, textAlign: "center" }}>Something went wrong. Please try WhatsApp instead.</div>}
              </form>

              {/* WhatsApp */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: BG, border: "1px solid #141420", borderRadius: 10, padding: "40px 28px", textAlign: "center" }}>
                <div style={{ ...heading(20), color: "rgba(255,255,255,0.7)" }}>Prefer to Chat Directly?</div>
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" onClick={fireContactWhatsAppClick}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px 28px", borderRadius: 50, textDecoration: "none", boxShadow: "0 0 20px rgba(37,211,102,0.3)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.917 1.044 5.591 2.778 7.667L.96 23.487l3.96-1.04C6.835 23.47 9.342 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.418 0-4.658-.694-6.558-1.893l-.376-.225-2.348.616.627-2.29-.247-.393C1.894 16.072 1.2 14.102 1.2 12 1.2 6.038 6.038 1.2 12 1.2S22.8 6.038 22.8 12 17.962 22 12 22z"/></svg>
                  WhatsApp Me Directly
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
