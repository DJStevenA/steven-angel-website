/**
 * Mix & Mastering Service Page — /mix-mastering
 *
 * 4 service tiers, A/B audio comparisons, Artbat video, FAQ, contact.
 * Uses existing PayPal flow via /mix-mastering/checkout/create + capture.
 */
import React, { useState, useEffect, useRef } from "react";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import { Link } from "react-router-dom";
import { trackWhatsAppLead } from "./lib/analytics/events";
import { usePageView, useScrollDepth, useTimeOnPage } from "./lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const MEDIA_BASE = `${BACKEND}/shop/media/audio`;
const VIDEO_BASE = `${BACKEND}/shop/media/videos`;

/* Audio examples — already on R2 */
const EXAMPLES = [
  {
    id: "la-cantadora",
    title: "Dole & Kom — La Cantadora",
    label: "HMWL · Played by Artbat",
    premaster: `${MEDIA_BASE}/track-la-cantadora-premaster.mp3`,
    master: `${MEDIA_BASE}/track-la-cantadora-master.mp3`,
    video: `${VIDEO_BASE}/the-angels-artbat-la-cantadora.mp4`, // we'll upload this
  },
  {
    id: "hernan-cattaneo",
    title: "Mastered for Hernan Cattaneo",
    label: "Sudbeat",
    premaster: `${MEDIA_BASE}/track-hernan-cattaneo-premaster.mp3`,
    master: `${MEDIA_BASE}/track-hernan-cattaneo-master.mp3`,
  },
];

/* 4 service tiers — 4 equal cards (no hero per Steven) */
const PACKAGES = [
  {
    id: "mastering",
    name: "Mastering",
    price: 35,
    stems: "Stereo file",
    delivery: "3 days",
    revisions: 2,
    bullets: [
      "1 stereo bounce in",
      "Loud, club-ready master",
      "16-bit WAV + HQ MP3 320kbps",
      "2 revisions included",
    ],
  },
  {
    id: "stem-mastering",
    name: "Stem Mastering",
    price: 75,
    stems: "Up to 10 stems",
    delivery: "3 days",
    revisions: 2,
    bullets: [
      "Up to 10 stems in",
      "Balanced + mastered output",
      "16-bit WAV + HQ MP3 320kbps",
      "2 revisions included",
    ],
  },
  {
    id: "mix-master",
    name: "Mix + Master",
    price: 150,
    stems: "Up to 30 stems",
    delivery: "7 days",
    revisions: 2,
    bullets: [
      "Up to 30 stems in",
      "Full mix from scratch + master",
      "Premaster 24-bit WAV + 16-bit WAV + HQ MP3 320kbps",
      "2 revisions included",
    ],
  },
  {
    id: "mix-master-large",
    name: "Mix + Master (Large)",
    price: 250,
    stems: "30–100 stems",
    delivery: "7 days",
    revisions: 2,
    bullets: [
      "30 to 100 stems in",
      "Full mix + master for full productions",
      "Premaster 24-bit WAV + 16-bit WAV + HQ MP3 320kbps",
      "2 revisions included",
    ],
  },
];

const FAQS = [
  {
    q: "What stem format do you accept?",
    a: "WAV or AIFF, 24-bit preferred, named clearly (kick.wav, bass.wav, vocals.wav, etc.).",
  },
  {
    q: "What if my mix needs more than 2 revisions?",
    a: "Additional revisions are $25 each — quick to turn around.",
  },
  {
    q: "Can you fix a vocal that was recorded badly?",
    a: "Limited — major vocal issues need re-recording. WhatsApp before booking if you're unsure.",
  },
  {
    q: "What about copyright?",
    a: "All your IP. Steven is your engineer, not your publisher.",
  },
  {
    q: "Do you handle other genres outside electronic?",
    a: "Drop a message — case-by-case.",
  },
];

const BOOKING_WHATSAPP = "https://wa.me/972523561353?text=Hi%20Steven%2C%20I'm%20interested%20in%20mix%20%26%20mastering.";

/* ── A/B audio comparison player ── */
function ABComparison({ example, isMobile }) {
  const [mode, setMode] = useState("master"); // 'premaster' | 'master'
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // Switch source while keeping playback time in sync
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.currentTime;
    a.src = mode === "master" ? example.master : example.premaster;
    a.currentTime = t || 0;
    if (playing) a.play().catch(() => setPlaying(false));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => {});
    setPlaying(!playing);
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
  };

  return (
    <div style={{
      background: "#04040f",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: isMobile ? 16 : 20,
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
        fontSize: isMobile ? 18 : 22, textTransform: "uppercase",
        letterSpacing: "0.04em", color: "#fff", marginBottom: 4,
      }}>
        {example.title}
      </div>
      <div style={{
        fontFamily: "DM Sans, sans-serif", fontSize: 12,
        color: "rgba(255,255,255,0.5)", marginBottom: 16,
      }}>
        {example.label}
      </div>

      <audio ref={audioRef} preload="metadata" onTimeUpdate={onTime} onEnded={() => setPlaying(false)} />

      {/* Play + progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
            border: "none", cursor: "pointer", color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, flexShrink: 0,
          }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <div style={{
          flex: 1, height: 4, background: "rgba(255,255,255,0.1)",
          borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
            transition: "width 0.1s linear",
          }} />
        </div>
      </div>

      {/* A/B toggle */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
        background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 8,
      }}>
        {[
          { id: "premaster", label: "Pre-Master" },
          { id: "master", label: "Mastered" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setMode(opt.id)}
            style={{
              padding: "10px 12px",
              background: mode === opt.id ? `linear-gradient(135deg, ${CYAN}, ${PURPLE})` : "transparent",
              color: mode === opt.id ? "#000" : "rgba(255,255,255,0.7)",
              border: "none", borderRadius: 6,
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function MixMastering() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [openFaq, setOpenFaq] = useState(null);
  const [bookingState, setBookingState] = useState({}); // { [pkgId]: 'loading' | 'error' }

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Remarketing
  usePageView("mix-mastering");
  useScrollDepth("mix-mastering");
  useTimeOnPage("mix-mastering");

  /* style helpers */
  const heading = (size) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1,
    letterSpacing: "0.02em",
    fontSize: size,
  });
  const body = {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 400,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
  };
  const label = (color) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: color || CYAN,
  });

  /* PayPal checkout */
  const handleBook = async (pkg) => {
    setBookingState((s) => ({ ...s, [pkg.id]: "loading" }));
    if (window.gtag) {
      window.gtag("event", "begin_checkout", {
        event_category: "mix-mastering",
        event_label: pkg.id,
        value: pkg.price,
        currency: "USD",
        items: [{ item_id: pkg.id, item_name: pkg.name, item_category: "mix-mastering", price: pkg.price, quantity: 1 }],
      });
    }
    try {
      const res = await fetch(`${BACKEND}/mix-mastering/checkout/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No PayPal URL returned");
      }
    } catch {
      setBookingState((s) => ({ ...s, [pkg.id]: "error" }));
    }
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
      <Nav />

      {/* ═══ HERO (matching Lessons / site standard) ═══ */}
      <section style={{ padding: isMobile ? "60px 20px 50px" : "100px 60px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <img
          src="/images/dj-hero.webp"
          alt="Steven Angel — Mix & Mastering Engineer"
          fetchpriority="high"
          width="800"
          height="1200"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ ...heading(isMobile ? 32 : 60), marginBottom: 16 }}>
            Get Your Track
            <br />
            <span style={{ color: CYAN }}>Club Ready</span>
          </h1>

          <div style={{ ...body, fontSize: isMobile ? 16 : 19, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
            Mix &amp; Mastering for Afro House, Melodic Techno &amp; Electronic — Mastered to Label Standard
          </div>

          <div style={{ ...body, fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: 36 }}>
            Hernan Cattaneo and Dole &amp; Kom trust me with their masters. From $35 with a 3-day turnaround.
          </div>

          {/* CTA Cards (Lessons-style) */}
          <div style={{ display: "flex", flexWrap: "nowrap", gap: isMobile ? 8 : 16, marginTop: isMobile ? 8 : 16, textAlign: "left" }}>
            {[
              { title: "SEE PACKAGES", sub: "From $35 mastering · Mix + Master from $150 · 4 tiers", btn: "View Pricing", scroll: "pricing", premium: true },
              { title: "TALK ON WHATSAPP", sub: "Not sure which package fits? Quick reply — usually 5 min", btn: "Message Steven", whatsapp: true, premium: false },
            ].map((card, i) => {
              const baseStyle = {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: isMobile ? "14px 12px 12px" : "24px 24px 20px",
                background: card.premium ? "linear-gradient(135deg, #0a0a20, #0d0418)" : "#000",
                border: card.premium ? `2px solid ${CYAN}` : "1px solid #141420",
                borderRadius: 10,
                boxShadow: card.premium ? "0 0 40px rgba(0,229,255,0.12)" : "none",
                textDecoration: "none",
                color: "#fff",
                cursor: "pointer",
              };
              const handle = (e) => {
                if (card.scroll) {
                  e.preventDefault();
                  const el = document.getElementById(card.scroll);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else if (card.whatsapp) {
                  trackWhatsAppLead("MM", "mix_master_hero");
                }
              };
              const inner = (
                <>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: isMobile ? 12 : 16, textTransform: "uppercase", letterSpacing: "0.03em", color: card.premium ? CYAN : "#fff", lineHeight: 1.2 }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: isMobile ? 10 : 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.4, flex: 1 }}>
                    {card.sub}
                  </div>
                  <div style={{ marginTop: isMobile ? 6 : 12, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 10 : 13, letterSpacing: "0.15em", textTransform: "uppercase", color: card.premium ? CYAN : "rgba(255,255,255,0.6)" }}>
                    {card.btn} <span style={{ fontSize: isMobile ? 12 : 15 }}>→</span>
                  </div>
                </>
              );
              return card.whatsapp ? (
                <a key={i} href={BOOKING_WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={handle} style={baseStyle}>{inner}</a>
              ) : (
                <a key={i} href="#" onClick={handle} style={baseStyle}>{inner}</a>
              );
            })}
          </div>

          {/* Listen CTA */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <a
              href="#examples"
              onClick={(e) => { e.preventDefault(); document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" }); }}
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: CYAN,
                textDecoration: "none",
                opacity: 0.85,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.textDecoration = "none"; }}
            >
              Hear Before / After →
            </a>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ ...label(CYAN), marginBottom: 12 }}>Packages</div>
            <h2 style={{ ...heading(isMobile ? 32 : 44), color: "#fff", marginBottom: 12 }}>Pick What You Need</h2>
            <p style={{ ...body, maxWidth: 560, margin: "0 auto" }}>
              All packages deliver a 16-bit WAV master + 320kbps MP3, with 2 revisions included.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
            gap: isMobile ? 16 : 20,
          }}>
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  padding: isMobile ? "24px 20px" : "28px 24px",
                  background: "linear-gradient(180deg, #0a0a14, #04040f)",
                  border: `1px solid rgba(0,229,255,0.18)`,
                  borderRadius: 14,
                  display: "flex", flexDirection: "column",
                  position: "relative",
                  transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = `${CYAN}55`;
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,229,255,0.12)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(0,229,255,0.18)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ ...heading(22), color: "#fff", marginBottom: 8 }}>{pkg.name}</div>
                <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
                  {pkg.stems} · {pkg.delivery}
                </div>

                <div style={{
                  ...heading(isMobile ? 36 : 44),
                  color: CYAN,
                  marginBottom: 16,
                  letterSpacing: "0.01em",
                }}>
                  ${pkg.price}
                </div>

                <ul style={{
                  listStyle: "none", padding: 0, margin: "0 0 20px",
                  display: "flex", flexDirection: "column", gap: 8, flex: 1,
                }}>
                  {pkg.bullets.map((b, i) => (
                    <li key={i} style={{
                      ...body, fontSize: 13, paddingLeft: 18, position: "relative",
                      color: "rgba(255,255,255,0.8)",
                    }}>
                      <span style={{ position: "absolute", left: 0, color: CYAN }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBook(pkg)}
                  disabled={bookingState[pkg.id] === "loading"}
                  style={{
                    padding: "12px 18px",
                    background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                    color: "#000", border: "none", borderRadius: 8,
                    fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
                    fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase",
                    cursor: bookingState[pkg.id] === "loading" ? "wait" : "pointer",
                    opacity: bookingState[pkg.id] === "loading" ? 0.6 : 1,
                  }}
                >
                  {bookingState[pkg.id] === "loading" ? "..." : `Book — $${pkg.price}`}
                </button>
                {bookingState[pkg.id] === "error" && (
                  <div style={{ ...body, color: "#ff6b6b", fontSize: 12, marginTop: 8, textAlign: "center" }}>
                    Couldn't start checkout. Try again or message on WhatsApp.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ ...body, fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 28 }}>
            Up-front payment via secure checkout. Files delivered within turnaround time once received. Need more than 100 stems?{" "}
            <a href={BOOKING_WHATSAPP} target="_blank" rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead("MM", "mix_master_pricing_overflow")}
              style={{ color: CYAN, textDecoration: "underline" }}>
              Contact Steven
            </a>.
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ ...label(PURPLE), marginBottom: 12 }}>How It Works</div>
            <h2 style={{ ...heading(isMobile ? 28 : 36), color: "#fff" }}>3 Simple Steps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {[
              { n: "1", t: "Pick & Pay", d: "Choose a package and pay through PayPal." },
              { n: "2", t: "Upload Tracks", d: "Send your stems + a reference. Drop a link or upload directly." },
              { n: "3", t: "Receive Masters", d: "Get your 16-bit WAV + 320kbps MP3 within 3–7 days." },
            ].map((s) => (
              <div key={s.n} style={{
                padding: 20, background: "#04040f",
                border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12,
              }}>
                <div style={{
                  ...heading(40), color: CYAN, marginBottom: 8,
                  background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {s.n}
                </div>
                <div style={{ ...heading(20), color: "#fff", marginBottom: 8 }}>{s.t}</div>
                <div style={{ ...body, color: "rgba(255,255,255,0.7)" }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HERNAN CATTANEO EMAIL ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>Played By</div>
          <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 8 }}>Hernan Cattaneo</h2>
          <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>
            Sudbeat · Argentina · Legendary progressive house DJ
          </div>
          <img
            src="/images/hernan-email.webp"
            alt="Email from Hernan Cattaneo"
            loading="lazy"
            style={{
              width: "100%", maxWidth: 640, height: "auto",
              borderRadius: 12,
              border: `1px solid ${CYAN}33`,
              display: "block", margin: "0 auto",
              boxShadow: `0 0 40px rgba(0,229,255,0.1)`,
            }}
          />
        </div>
      </section>

      {/* ═══ ARTBAT VIDEO ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ ...label(PURPLE), marginBottom: 12 }}>Played By</div>
            <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 8 }}>
              Artbat Drops "La Cantadora"
            </h2>
            <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              The Dole &amp; Kom track Steven mastered, played live by Artbat.
            </div>
          </div>
          <div style={{
            position: "relative",
            aspectRatio: isMobile ? "9/16" : "16/9",
            borderRadius: 16,
            overflow: "hidden",
            background: "#0a0a14",
            border: `1px solid ${PURPLE}33`,
            maxWidth: isMobile ? "100%" : 880,
            margin: "0 auto",
            boxShadow: `0 0 60px rgba(187,134,252,0.18)`,
          }}>
            {!isMobile && (
              <video
                src={`${VIDEO_BASE}/the-angels-artbat-la-cantadora.mp4`}
                autoPlay muted loop playsInline preload="metadata"
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  filter: "blur(40px) brightness(0.5)",
                  transform: "scale(1.25)",
                  pointerEvents: "none",
                }}
              />
            )}
            <video
              src={`${VIDEO_BASE}/the-angels-artbat-la-cantadora.mp4`}
              autoPlay muted loop playsInline controls preload="metadata"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: isMobile ? "cover" : "contain",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* ═══ A/B PLAYER ═══ */}
      <section id="examples" style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ ...label(CYAN), marginBottom: 12 }}>Hear It Yourself</div>
            <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 12 }}>Before / After</h2>
            <p style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Toggle between the pre-master and the final master on real client tracks.
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 20 : 24,
          }}>
            {EXAMPLES.map((ex) => (
              <ABComparison key={ex.id} example={ex} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ ...label(CYAN), marginBottom: 12 }}>FAQ</div>
            <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff" }}>Common Questions</h2>
          </div>
          {FAQS.map((f, i) => (
            <div key={i} style={{
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", padding: "20px 0", background: "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  color: "#fff", fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700, fontSize: isMobile ? 16 : 18,
                  letterSpacing: "0.02em",
                }}
              >
                <span>{f.q}</span>
                <span style={{ color: CYAN, fontSize: 20, marginLeft: 16, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ ...body, paddingBottom: 20, color: "rgba(255,255,255,0.7)" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section style={{ padding: isMobile ? "60px 24px 80px" : "100px 48px 120px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(PURPLE), marginBottom: 12 }}>Have a Question?</div>
          <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 18 }}>
            Talk to Steven First
          </h2>
          <p style={{ ...body, marginBottom: 28 }}>
            Not sure which package fits your track? Drop a quick message — usually a 5-minute reply.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a
              href={BOOKING_WHATSAPP}
              target="_blank" rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead("MM", "mix_master_contact")}
              style={{
                padding: "14px 28px", background: "#1a7a42", color: "#fff",
                borderRadius: 8, textDecoration: "none",
                fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
                fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase",
              }}
            >
              WhatsApp →
            </a>
            <a
              href="mailto:hello@steven-angel.com"
              style={{
                padding: "14px 28px", background: "transparent", color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 8,
                textDecoration: "none", fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase",
              }}
            >
              Email →
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CROSS-PROMOTE ═══ */}
      <section style={{ padding: isMobile ? "40px 24px" : "60px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...body, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Want to release your own track?{" "}
            <Link to="/ghost" style={{ color: CYAN, textDecoration: "underline" }}>Try Ghost Production</Link>
            {" · "}
            Learning to produce?{" "}
            <Link to="/shop" style={{ color: CYAN, textDecoration: "underline" }}>See Templates &amp; Lessons</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
