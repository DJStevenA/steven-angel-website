/**
 * The Angels EPK Page — /the-angels
 *
 * Electronic Press Kit for Steven Angel's duo "The Angels".
 * Single-page, 5 sections: Hero, Bio, Live, Newsletter, Contact.
 */
import React, { useState, useEffect } from "react";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import { usePageView, useScrollDepth, useTimeOnPage } from "./lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const VIDEO_BASE = `${BACKEND}/shop/media/videos`;
const SPAZIO_MIAMI_VIDEO = `${VIDEO_BASE}/the-angels-spazio-miami.mp4`;
const CANARY_YOUTUBE_ID = "sPArmZafsX8";

const SPOTIFY_URL = "https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz";
const YOUTUBE_URL = "https://www.youtube.com/@theangels3994";
const BEATPORT_URL = "https://www.beatport.com/artist/the-angels-il/913642";
const BOOKING_EMAIL = "theangelsbooking@stevenangel.co.il";

function LazyYouTube({ id, title }) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
    />
  );
}

export default function TheAngels() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [newsletterStatus, setNewsletterStatus] = useState(null); // null | "sending" | "ok" | "error"

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Remarketing signals
  usePageView("the-angels");
  useScrollDepth("the-angels");
  useTimeOnPage("the-angels");

  /* ── style helpers ── */
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
    lineHeight: 1.8,
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

  /* ── newsletter submit ── */
  const handleNewsletter = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    if (!email) return;

    setNewsletterStatus("sending");
    try {
      const res = await fetch(`${BACKEND}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "The Angels Newsletter Subscriber",
          email,
          message: "Newsletter subscription from /the-angels",
          source: "the-angels-newsletter",
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error("send failed");
      setNewsletterStatus("ok");
      form.reset();
      if (window.gtag) {
        window.gtag("event", "generate_lead", {
          event_category: "newsletter",
          event_label: "the-angels",
        });
      }
    } catch {
      setNewsletterStatus("error");
    }
  };

  /* ── streaming button factory ── */
  const StreamingButton = ({ name, url, color, hoverColor }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (window.gtag) window.gtag("event", "select_content", {
          event_category: "the-angels-streaming",
          event_label: name,
          content_type: "external_link",
        });
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "14px 24px" : "16px 32px",
        background: `linear-gradient(135deg, ${color}, ${hoverColor})`,
        color: "#000",
        borderRadius: 8,
        textDecoration: "none",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 800,
        fontSize: isMobile ? 13 : 14,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: `0 4px 16px ${color}40`,
        minWidth: isMobile ? 110 : 130,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 4px 16px ${color}40`;
      }}
    >
      {name}
    </a>
  );

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
      <Nav />

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: isMobile ? "auto" : "92vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "60px 24px 80px" : "80px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background photo */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/the-angels-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }} />
        {/* Dark gradient overlay so text stays readable */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%), radial-gradient(circle at 50% 30%, rgba(0,229,255,0.12) 0%, transparent 60%)",
          zIndex: 1,
        }} />
        <div style={{ textAlign: "center", maxWidth: 720, width: "100%", position: "relative", zIndex: 2 }}>
          <img
            src="/the-angels-logo.png"
            alt="The Angels logo"
            width={isMobile ? 180 : 240}
            height={isMobile ? 180 : 240}
            fetchpriority="high"
            style={{
              display: "block",
              margin: "0 auto 32px",
              filter: "drop-shadow(0 0 32px rgba(0,229,255,0.25))",
            }}
          />
          <h1 style={{
            ...heading(isMobile ? 56 : 88),
            background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 16,
          }}>
            The Angels
          </h1>
          <div style={{ ...label(PURPLE), marginBottom: 40 }}>
            Afro · Latin House · Tribal
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <StreamingButton name="Spotify" url={SPOTIFY_URL} color="#1DB954" hoverColor="#1ed760" />
            <StreamingButton name="YouTube" url={YOUTUBE_URL} color="#ff0000" hoverColor="#ff4444" />
            <StreamingButton name="Beatport" url={BEATPORT_URL} color="#A0FF1A" hoverColor="#80df15" />
          </div>
        </div>
      </section>

      {/* ═══ BIO ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px" : "100px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 380px) 1fr",
            gap: isMobile ? 32 : 56,
            alignItems: "start",
          }}>
            {/* Portrait — left col on desktop, top on mobile */}
            <div>
              <img
                src="/the-angels-portrait.jpg"
                alt="The Angels live"
                loading="lazy"
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  objectFit: "cover",
                  borderRadius: 12,
                  border: `1px solid ${CYAN}33`,
                  display: "block",
                  maxWidth: isMobile ? 280 : "100%",
                  margin: isMobile ? "0 auto" : "0",
                }}
              />
            </div>

            {/* Bio text + stats — right col on desktop, below on mobile */}
            <div>
              <div style={{ ...label(CYAN), marginBottom: 16 }}>About</div>
              <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 24, textAlign: isMobile ? "center" : "left" }}>
                10M+ Streams. Beatport Top 10. Played Worldwide.
              </h2>
              <p style={{ ...body, fontSize: isMobile ? 15 : 16, textAlign: isMobile ? "center" : "left" }}>
                Producers of the hit "Chama Cha Trumpeta" (with Idd Aziz), heavily supported by HUGEL, Claptone, Sofi Tukker, Curol, Dj Chus and many more. Over 10 million streams across various platforms — including 7 million on Spotify with 50K monthly listeners. Constantly featured on Beatport's Afro House Top 10 charts, with collaborations and remixes alongside Floyd Lavine, Pipi Ciez, PAUZA, Band & Dos. Performances at ADE, Boho Miami, Somewhere Nowhere (NY), Spazio (WP), Bonbonniere (Tulum) and Nomad (Lisbon).
              </p>

              {/* Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: isMobile ? 16 : 24,
                marginTop: 36,
                paddingTop: 28,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { num: "10M+", label: "Streams" },
                  { num: "50K", label: "Monthly" },
                  { num: "25K", label: "Fans" },
                ].map(({ num, label: lbl }) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div style={{ ...heading(isMobile ? 26 : 36), color: CYAN, marginBottom: 4 }}>{num}</div>
                    <div style={{ ...label(), fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supporters + Labels strips — full width below the 2-col block */}
          <div style={{ marginTop: 56, textAlign: "center" }}>
            <div style={{ ...label(PURPLE), marginBottom: 12 }}>Supported by</div>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 12 : 20,
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: isMobile ? 14 : 16, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
            }}>
              <span>Hugel</span>
              <span style={{ color: CYAN }}>·</span>
              <span>Claptone</span>
              <span style={{ color: CYAN }}>·</span>
              <span>Sofi Tukker</span>
              <span style={{ color: CYAN }}>·</span>
              <span>Dj Chus</span>
              <span style={{ color: CYAN }}>·</span>
              <span>Curol</span>
            </div>
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{ ...label(PURPLE), marginBottom: 12 }}>Released on</div>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 12 : 20,
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: isMobile ? 14 : 16, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
            }}>
              <span>Godeeva</span>
              <span style={{ color: PURPLE }}>·</span>
              <span>MTGD</span>
              <span style={{ color: PURPLE }}>·</span>
              <span>Moblack</span>
              <span style={{ color: PURPLE }}>·</span>
              <span>Sony</span>
              <span style={{ color: PURPLE }}>·</span>
              <span>Redolent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LIVE ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px" : "100px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ ...label(CYAN), marginBottom: 12 }}>Live</div>
            <h2 style={{ ...heading(isMobile ? 32 : 44), color: "#fff" }}>
              On Stage
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr",
            gap: isMobile ? 32 : 48,
            alignItems: "start",
          }}>
            {/* SPAZIOO Miami — vertical self-hosted video */}
            <div>
              <div style={{
                position: "relative",
                aspectRatio: "9/16",
                borderRadius: 12,
                overflow: "hidden",
                background: "#0a0a14",
                border: `1px solid ${CYAN}33`,
                maxWidth: isMobile ? 320 : "100%",
                margin: "0 auto",
              }}>
                <video
                  src={SPAZIO_MIAMI_VIDEO}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <div style={{ ...label(CYAN), marginBottom: 4 }}>Spazio</div>
                <div style={{ ...heading(20), color: "#fff" }}>West Palm Beach, USA</div>
              </div>
            </div>

            {/* Canary Islands — YouTube embed */}
            <div>
              <div style={{
                position: "relative",
                aspectRatio: "16/9",
                borderRadius: 12,
                overflow: "hidden",
                background: "#0a0a14",
                border: `1px solid ${PURPLE}33`,
              }}>
                <LazyYouTube id={CANARY_YOUTUBE_ID} title="The Angels — Live Set Canary Islands" />
              </div>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <div style={{ ...label(PURPLE), marginBottom: 4 }}>Live Set</div>
                <div style={{ ...heading(20), color: "#fff" }}>Canary Islands</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px" : "100px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "radial-gradient(circle at 50% 50%, rgba(187,134,252,0.06) 0%, transparent 60%)",
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(PURPLE), marginBottom: 12 }}>Stay Tuned</div>
          <h2 style={{ ...heading(isMobile ? 28 : 36), color: "#fff", marginBottom: 14 }}>
            Get Updates First
          </h2>
          <p style={{ ...body, marginBottom: 28 }}>
            New releases, tour dates, and exclusive previews — straight to your inbox.
          </p>

          <form onSubmit={handleNewsletter} style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 10,
            maxWidth: 480,
            margin: "0 auto",
          }}>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              style={{
                flex: 1,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 15,
                fontFamily: "DM Sans, sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = CYAN}
              onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <button
              type="submit"
              disabled={newsletterStatus === "sending"}
              style={{
                padding: "14px 28px",
                background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: newsletterStatus === "sending" ? "wait" : "pointer",
                opacity: newsletterStatus === "sending" ? 0.6 : 1,
                whiteSpace: "nowrap",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => { if (newsletterStatus !== "sending") e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              {newsletterStatus === "sending" ? "..." : "Subscribe"}
            </button>
          </form>

          {newsletterStatus === "ok" && (
            <div style={{ ...body, color: CYAN, marginTop: 16, fontSize: 14 }}>
              ✓ Subscribed. We'll be in touch.
            </div>
          )}
          {newsletterStatus === "error" && (
            <div style={{ ...body, color: "#ff6b6b", marginTop: 16, fontSize: 14 }}>
              Something went wrong. Please try again.
            </div>
          )}
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px 80px" : "100px 48px 120px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>Booking</div>
          <h2 style={{ ...heading(isMobile ? 32 : 44), color: "#fff", marginBottom: 16 }}>
            Let's Talk
          </h2>
          <p style={{ ...body, marginBottom: 32 }}>
            For booking inquiries, collaborations and management.
          </p>

          <a
            href={`mailto:${BOOKING_EMAIL}`}
            onClick={() => {
              if (window.gtag) window.gtag("event", "generate_lead", {
                event_category: "the-angels-contact",
                event_label: "email",
              });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: isMobile ? "16px 28px" : "18px 36px",
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
              color: "#000",
              borderRadius: 8,
              textDecoration: "none",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? 14 : 16,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: `0 4px 24px ${CYAN}33`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 32px ${CYAN}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 24px ${CYAN}33`;
            }}
          >
            Email Booking →
          </a>

          <div style={{ ...body, marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            {BOOKING_EMAIL}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
