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

const fireWhatsAppConversion = () => {
  if (window.gtag) {
    window.gtag("event", "contact", { event_category: "whatsapp", event_label: "lessons", value: 50, currency: "USD" });
  }
  if (window.clarity) window.clarity("event", "lessonWhatsAppClick");
};

/* ═══════════════════════════════════════════════════════════
   LessonModules — 3 expandable curriculum cards
   ═══════════════════════════════════════════════════════════ */
const MODULES = [
  {
    id: "production",
    icon: "🎹",
    title: "MODULE 1",
    subtitle: "PRODUCTION",
    hook: "Build tracks from scratch — the workflow that gets signed.",
    items: [
      "DAW fundamentals (Ableton focus)",
      "Sound design, arrangement & groove",
      "Genre-specific workflows — Afro House, Melodic, Indie Dance",
      "Hands-on: build a full track from scratch",
    ],
    clarityEvent: "module_expand_production",
  },
  {
    id: "mixing",
    icon: "🎚️",
    title: "MODULE 2",
    subtitle: "MIXING",
    hook: "Make your tracks sound pro — EQ, compression, space.",
    items: [
      "EQ, compression & saturation — the essentials",
      "Mix bus processing",
      "Spatial placement — reverb, delay, stereo field",
      "Reference-track mixing workflow",
    ],
    clarityEvent: "module_expand_mixing",
  },
  {
    id: "mastering",
    icon: "💿",
    title: "MODULE 3",
    subtitle: "MASTERING",
    hook: "Release-ready loudness for Beatport, Spotify & beyond.",
    items: [
      "Loudness, dynamics & stereo imaging",
      "Prepping for streaming platforms (Spotify, Beatport)",
      "Genre-specific mastering targets",
      "Self-mastering vs outsourcing — when to do what",
    ],
    clarityEvent: "module_expand_mastering",
  },
];

function LessonModules({ isMobile }) {
  const [openModules, setOpenModules] = useState([]);

  const toggle = (id, clarityEvent) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    if (window.clarity) window.clarity("event", clarityEvent);
    if (window.gtag) window.gtag("event", clarityEvent);
  };

  return (
    <section id="curriculum" style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: CYAN, textAlign: "center", marginBottom: 10 }}>WHAT YOU LEARN</div>
        <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 40, textTransform: "uppercase", color: "#fff", textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
          THE <span style={{ color: CYAN }}>CURRICULUM</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: isMobile ? 14 : 20 }}>
          {MODULES.map(({ id, icon, title, subtitle, hook, items, clarityEvent }) => {
            const isOpen = openModules.includes(id);
            return (
              <div
                key={id}
                style={{ background: "#08081a", border: `1px solid ${isOpen ? CYAN : "rgba(255,255,255,0.08)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}
              >
                {/* Card header — always visible, tap to expand */}
                <button
                  onClick={() => toggle(id, clarityEvent)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: isMobile ? "24px 20px" : "28px 24px", textAlign: "left", display: "flex", flexDirection: "column", gap: 8, minHeight: 44 }}
                  aria-expanded={isOpen}
                >
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: CYAN }}>{title}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 22 : 24, textTransform: "uppercase", color: "#fff" }}>{subtitle}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{hook}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: CYAN, marginTop: 4 }}>
                    {isOpen ? "▲ Close" : "▼ What's Inside"}
                  </div>
                </button>

                {/* Expandable content */}
                {isOpen && (
                  <div style={{ padding: isMobile ? "0 20px 24px" : "0 24px 28px", borderTop: "1px solid rgba(0,229,255,0.1)" }}>
                    <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                      {items.map((item) => (
                        <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                          <span style={{ color: CYAN, flexShrink: 0, marginTop: 2 }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Lessons() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [formStatus, setFormStatus] = useState(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    if (window.clarity) window.clarity("event", "lessonPageVisit");
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>

      {/* ═══ Fixed WhatsApp Button ═══ */}
      <a
        href={WHATSAPP_LINK}
        onClick={fireWhatsAppConversion}
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

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={CALENDLY_INTRO} target="_blank" rel="noreferrer" onClick={fireIntroClick}
                style={{ ...outlineBtn(CYAN, SHADOW_CYAN), background: `linear-gradient(135deg,${CYAN},#00b8d4)`, color: "#000", fontSize: isMobile ? 12 : 14 }}>
                Book an Instruction Lesson — $30
              </a>
              <a href={CALENDLY_1HR} target="_blank" rel="noreferrer" onClick={fireCalendlyConversion}
                style={{ ...outlineBtn(PURPLE, SHADOW_PURPLE), fontSize: isMobile ? 12 : 14 }}>
                Book a Full Lesson — From $120
              </a>
            </div>
          </div>
        </section>

        {/* ═══ 2-CTA ROW ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "56px 60px", background: "#02020e", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 24 }}>

            {/* CTA 1 — Explore Curriculum (Primary) */}
            <div style={{ background: "linear-gradient(135deg, #04040f, #0a0a1a)", border: `2px solid ${CYAN}`, borderRadius: 14, padding: isMobile ? "28px 24px" : "36px 32px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 0 32px rgba(0,229,255,0.07)" }}>
              <div style={{ fontSize: 28 }}>📖</div>
              <div style={{ ...label(CYAN), fontSize: 10 }}>CURRICULUM</div>
              <div style={{ ...heading(isMobile ? 22 : 26), color: "#fff", lineHeight: 1.15 }}>EXPLORE<br />CURRICULUM</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, flex: 1 }}>See what you'll learn — Production, Mixing &amp; Mastering modules.</div>
              <button
                onClick={() => {
                  if (window.clarity) window.clarity("event", "cta_lessons_explore_click");
                  if (window.gtag) window.gtag("event", "cta_lessons_explore_click");
                  const el = document.getElementById("curriculum");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg,${CYAN},#00b8d4)`, color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", padding: "14px 24px", borderRadius: 6, border: "none", cursor: "pointer", marginTop: 8, minHeight: 44 }}
              >
                View Modules
              </button>
            </div>

            {/* CTA 2 — Book Instruction (Secondary) */}
            <div style={{ background: "#04040f", border: `1px solid rgba(187,134,252,0.25)`, borderRadius: 14, padding: isMobile ? "28px 24px" : "36px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 28 }}>📅</div>
              <div style={{ ...label(PURPLE), fontSize: 10 }}>DIRECT BOOKING</div>
              <div style={{ ...heading(isMobile ? 22 : 26), color: "#fff", lineHeight: 1.15 }}>BOOK<br />INSTRUCTION</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, flex: 1 }}>Skip ahead — talk to me directly. First lesson from $30.</div>
              <a
                href={CALENDLY_INTRO}
                target="_blank"
                rel="noreferrer"
                onClick={() => { if (window.clarity) window.clarity("event", "cta_lessons_book_click"); if (window.gtag) window.gtag("event", "cta_lessons_book_click"); fireIntroClick(); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${PURPLE}`, color: PURPLE, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 24px", borderRadius: 6, textDecoration: "none", marginTop: 8, minHeight: 44, background: "transparent" }}
              >
                Open Calendly
              </a>
            </div>

          </div>
        </section>

        {/* ═══ CURRICULUM — 3 MODULE CARDS ═══ */}
        <LessonModules isMobile={isMobile} />

        {/* ═══ ABOUT STEVEN ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "center" }}>
            <img
              src="/images/portrait.webp"
              alt="Steven Angel — Ableton Production Mentor"
              loading="lazy"
              width="800"
              height="903"
              style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 480 }}
            />
            <div>
              <div style={{ ...label(PURPLE), marginBottom: 10 }}>YOUR MENTOR</div>
              <div style={{ ...heading(isMobile ? 28 : 40), marginBottom: 16 }}>
                DJ, Producer &<br />
                <span style={{ color: CYAN }}>Audio Engineer</span>
              </div>
              <div style={{ ...body, marginBottom: 16 }}>
                I've been making music for over 20 years. Released on Moblack, MTGD, Godeeva and Sony.
                My tracks have been played by Hugel and Claptone at Pacha Ibiza.
              </div>
              <div style={{ ...body, marginBottom: 16 }}>
                I went from beginner producer to signing with major labels and I know exactly what the path looks like.
              </div>
              <div style={{ ...body }}>
                When I teach, I bring the same standards I apply to my own releases.
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
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 36 }}>
              Curriculum
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
              {[
                { title: "Module 1 — Software", desc: "Ableton interface, workflow, built-in plugins, arrangement basics. Working with MIDI/Audio, loops & one-shots. Genre-relevant sounds from lesson 1.", color: CYAN },
                { title: "Module 2 — Music Theory", desc: "How to write music in scale (on key), build chords, match bass to chords and melody. Take a small musical idea and turn it into a full-length arrangement.", color: CYAN },
                { title: "Module 3 — Styling, Sound Design, Mix & Mastering", desc: "Advanced drum programming, synth & bass layering, mix & mastering \u2014 this is the stage we make the track CRISP for the club!", color: CYAN },
                { title: "Full Journey (1+2+3)", desc: "Complete path from zero to release-ready. Best value.", color: PURPLE, badge: "BEST VALUE" },
              ].map(({ title, desc, color, badge }) => (
                <div key={title} style={{ background: BG, border: `1px solid ${badge ? PURPLE : "#141420"}`, borderTop: `2px solid ${color}`, borderRadius: 10, padding: isMobile ? "24px 18px" : "28px 24px", position: "relative" }}>
                  {badge && (
                    <div style={{ position: "absolute", top: -10, left: 20, background: `linear-gradient(90deg,${PURPLE},${CYAN})`, color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.25em", padding: "3px 10px", borderRadius: 20 }}>
                      {badge}
                    </div>
                  )}
                  <div style={{ ...heading(isMobile ? 16 : 20), marginBottom: 10, color }}>{title}</div>
                  <div style={{ ...body, fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.6)" }}>{desc}</div>
                </div>
              ))}
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

        {/* ═══ PACKAGES & PRICING ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
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
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 20 : 24, color: accent }}>
                    {price}
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
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" onClick={fireWhatsAppConversion}
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
