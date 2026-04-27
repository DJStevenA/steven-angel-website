/**
 * The Angels EPK Page — /the-angels
 *
 * Electronic Press Kit for Steven Angel's duo "The Angels".
 * Single-page: Hero, Bio, Set (Miami), Two Videos, Instagram, Newsletter, Contact.
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
const SUPPORTERS_VIDEO = `${VIDEO_BASE}/the-angels-supporters.mp4`;
const CANARY_YOUTUBE_ID = "sPArmZafsX8";

const SPOTIFY_URL = "https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz";
const YOUTUBE_URL = "https://www.youtube.com/@theangels3994";
const BEATPORT_URL = "https://www.beatport.com/artist/the-angels-il/913642";
const INSTAGRAM_URL = "https://www.instagram.com/theangels_tlv/";
const INSTAGRAM_HANDLE = "theangels_tlv";
const BOOKING_EMAIL = "theangelsbooking@stevenangel.co.il";

/* ── Inline brand SVG icons (Simple Icons paths) ── */
const SpotifyIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.94-.601-.12-.42.18-.84.6-.94 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.282 1.122zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);
const YouTubeIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
const BeatportIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.429 17.055a7.114 7.114 0 0 1-.794 3.246 6.917 6.917 0 0 1-2.181 2.492 6.698 6.698 0 0 1-3.063 1.163 6.653 6.653 0 0 1-3.239-.434 6.796 6.796 0 0 1-2.668-1.932 7.03 7.03 0 0 1-1.481-2.983 7.124 7.124 0 0 1 .049-3.345 7.015 7.015 0 0 1 1.566-2.937l-4.626 4.73-2.421-2.479 5.201-5.265a3.791 3.791 0 0 0 1.066-2.675V0h3.41v6.613a7.172 7.172 0 0 1-.519 2.794 7.02 7.02 0 0 1-1.559 2.353l-.153.156a6.768 6.768 0 0 1 3.49-1.725 6.687 6.687 0 0 1 3.845.5 6.873 6.873 0 0 1 2.959 2.564 7.118 7.118 0 0 1 1.118 3.8Zm-3.089 0a3.89 3.89 0 0 0-.611-2.133 3.752 3.752 0 0 0-1.666-1.424 3.65 3.65 0 0 0-2.158-.233 3.704 3.704 0 0 0-1.92 1.037 3.852 3.852 0 0 0-1.031 1.955 3.908 3.908 0 0 0 .205 2.213c.282.7.76 1.299 1.374 1.721a3.672 3.672 0 0 0 2.076.647 3.637 3.637 0 0 0 2.635-1.096c.347-.351.622-.77.81-1.231.188-.461.285-.956.286-1.456Z"/>
  </svg>
);
const InstagramIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

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
  const [newsletterStatus, setNewsletterStatus] = useState(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Inject Instagram embed script for any <blockquote class="instagram-media"> on page
  useEffect(() => {
    const existing = document.querySelector('script[src="//www.instagram.com/embed.js"]');
    if (existing) {
      if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
      return;
    }
    const s = document.createElement("script");
    s.src = "//www.instagram.com/embed.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Remarketing
  usePageView("the-angels");
  useScrollDepth("the-angels");
  useTimeOnPage("the-angels");

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

  /* newsletter submit */
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
      if (window.gtag) window.gtag("event", "generate_lead", { event_category: "newsletter", event_label: "the-angels" });
    } catch {
      setNewsletterStatus("error");
    }
  };

  /* uniform brand-style streaming button */
  const StreamingButton = ({ name, url, Icon }) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      title={name}
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
        width: isMobile ? 64 : 72,
        height: isMobile ? 64 : 72,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.18)",
        color: "#fff",
        borderRadius: 16,
        textDecoration: "none",
        transition: "transform 0.15s, background 0.15s, border-color 0.15s, box-shadow 0.15s",
        backdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.background = `linear-gradient(135deg, ${CYAN}, ${PURPLE})`;
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = `0 8px 24px ${CYAN}44`;
        e.currentTarget.style.color = "#000";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.color = "#fff";
      }}
    >
      <Icon size={isMobile ? 26 : 30} />
    </a>
  );

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
      <Nav />

      {/* ═══ HERO — logo + buttons only ═══ */}
      <section style={{
        minHeight: isMobile ? "auto" : "92vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "60px 24px 80px" : "80px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/the-angels-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.95) 100%)",
          zIndex: 1,
        }} />
        <div style={{ textAlign: "center", maxWidth: 720, width: "100%", position: "relative", zIndex: 2 }}>
          <img
            src="/the-angels-logo.png"
            alt="The Angels"
            width={isMobile ? 280 : 480}
            height={isMobile ? 280 : 480}
            fetchpriority="high"
            style={{
              display: "block",
              margin: "0 auto 56px",
              maxWidth: "90%",
              height: "auto",
              filter: "drop-shadow(0 0 40px rgba(0,229,255,0.35))",
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 12 : 18, justifyContent: "center" }}>
            <StreamingButton name="Spotify" url={SPOTIFY_URL} Icon={SpotifyIcon} />
            <StreamingButton name="YouTube" url={YOUTUBE_URL} Icon={YouTubeIcon} />
            <StreamingButton name="Beatport" url={BEATPORT_URL} Icon={BeatportIcon} />
            <StreamingButton name="Instagram" url={INSTAGRAM_URL} Icon={InstagramIcon} />
          </div>
        </div>
      </section>

      {/* ═══ BIO ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 380px) 1fr",
            gap: isMobile ? 32 : 56,
            alignItems: "start",
          }}>
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
            <div>
              <div style={{ ...label(CYAN), marginBottom: 16 }}>About</div>
              <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 24, textAlign: isMobile ? "center" : "left" }}>
                15M+ Streams. Beatport Top 10. Played Worldwide.
              </h2>
              <p style={{ ...body, fontSize: isMobile ? 15 : 16, textAlign: isMobile ? "center" : "left" }}>
                Producers of the hit "Chama Cha Trumpeta" (with Idd Aziz), heavily supported by HUGEL, Claptone, Sofi Tukker, Curol, Dj Chus and many more. Over 15 million streams across various platforms — including 7 million on Spotify with 50K monthly listeners. Constantly featured on Beatport's Afro House Top 10 charts, with collaborations and remixes alongside Floyd Lavine, Pipi Ciez, PAUZA, Band & Dos. Performances at ADE, Boho Miami, Somewhere Nowhere (NY), Spazio (WP), Bonbonniere (Tulum) and Nomad (Lisbon).
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: isMobile ? 16 : 24,
                marginTop: 36,
                paddingTop: 28,
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}>
                {[
                  { num: "15M+", label: "Streams" },
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

          <div style={{ marginTop: 56, textAlign: "center" }}>
            <div style={{ ...label(PURPLE), marginBottom: 12 }}>Supported by</div>
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 12 : 20,
              fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
              fontSize: isMobile ? 14 : 16, letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
            }}>
              <span>Hugel</span><span style={{ color: CYAN }}>·</span>
              <span>Claptone</span><span style={{ color: CYAN }}>·</span>
              <span>Sofi Tukker</span><span style={{ color: CYAN }}>·</span>
              <span>Dj Chus</span><span style={{ color: CYAN }}>·</span>
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
              <span>Godeeva</span><span style={{ color: PURPLE }}>·</span>
              <span>MTGD</span><span style={{ color: PURPLE }}>·</span>
              <span>Moblack</span><span style={{ color: PURPLE }}>·</span>
              <span>Sony</span><span style={{ color: PURPLE }}>·</span>
              <span>Redolent</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SET — Spazio Miami, single prominent video ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 24 : 36 }}>
            <div style={{ ...label(CYAN), marginBottom: 12 }}>Featured Set</div>
            <h2 style={{ ...heading(isMobile ? 32 : 44), color: "#fff", marginBottom: 8 }}>
              Spazio · West Palm Beach
            </h2>
            <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>USA</div>
          </div>
          <div style={{
            position: "relative",
            aspectRatio: "9/16",
            borderRadius: 16,
            overflow: "hidden",
            background: "#0a0a14",
            border: `1px solid ${CYAN}33`,
            maxWidth: isMobile ? "100%" : 420,
            margin: "0 auto",
            boxShadow: `0 0 60px ${CYAN}22`,
          }}>
            <video
              src={SPAZIO_MIAMI_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ═══ TWO VIDEOS — Canary + Supporters ═══ */}
      <section style={{ padding: isMobile ? "60px 24px" : "100px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 32 : 32,
          }}>
            {/* Canary Islands — YouTube */}
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
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <div style={{ ...label(PURPLE), marginBottom: 4 }}>Live Set</div>
                <div style={{ ...heading(20), color: "#fff" }}>Canary Islands</div>
              </div>
            </div>

            {/* Supporters reel */}
            <div>
              <div style={{
                position: "relative",
                aspectRatio: "16/9",
                borderRadius: 12,
                overflow: "hidden",
                background: "#0a0a14",
                border: `1px solid ${CYAN}33`,
              }}>
                <video
                  src={SUPPORTERS_VIDEO}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ textAlign: "center", marginTop: 14 }}>
                <div style={{ ...label(CYAN), marginBottom: 4 }}>Played by</div>
                <div style={{ ...heading(20), color: "#fff" }}>The Industry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INSTAGRAM ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px" : "100px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "radial-gradient(circle at 50% 50%, rgba(187,134,252,0.05) 0%, transparent 60%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(PURPLE), marginBottom: 12 }}>Instagram</div>
          <h2 style={{ ...heading(isMobile ? 30 : 40), color: "#fff", marginBottom: 8 }}>
            @{INSTAGRAM_HANDLE}
          </h2>
          <p style={{ ...body, marginBottom: 36 }}>
            Behind the scenes, new releases and live moments.
          </p>

          {/* Instagram profile iframe — uses Instagram's official embed via blockquote+embed.js
              for individual posts. For a profile-feed widget we recommend Behold.so or
              SnapWidget once Steven sets up an account. As an immediate display we render
              a 4-photo grid linking to the profile. */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? 8 : 12,
            marginBottom: 32,
          }}>
            {[
              "/the-angels-vibe.jpg",
              "/the-angels-portrait.jpg",
              "/the-angels-hero.jpg",
              "/the-angels-vibe.jpg",
            ].map((src, i) => (
              <a
                key={i}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on Instagram"
                style={{
                  position: "relative",
                  aspectRatio: "1/1",
                  borderRadius: 8,
                  overflow: "hidden",
                  display: "block",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <img src={src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, rgba(0,229,255,0) 0%, rgba(187,134,252,0.4) 100%)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                >
                  <InstagramIcon size={32} />
                </div>
              </a>
            ))}
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { if (window.gtag) window.gtag("event", "select_content", { event_category: "the-angels-streaming", event_label: "Instagram", content_type: "external_link" }); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: isMobile ? "14px 24px" : "16px 32px",
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
              color: "#000",
              borderRadius: 8,
              textDecoration: "none",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: isMobile ? 13 : 14,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: `0 4px 16px ${PURPLE}44`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${PURPLE}66`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${PURPLE}44`; }}
          >
            <InstagramIcon size={18} />
            Follow on Instagram
          </a>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section style={{
        padding: isMobile ? "60px 24px" : "100px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 60%)",
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>Stay Tuned</div>
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
              }}
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
      <section style={{ padding: isMobile ? "60px 24px 80px" : "100px 48px 120px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
            onClick={() => { if (window.gtag) window.gtag("event", "generate_lead", { event_category: "the-angels-contact", event_label: "email" }); }}
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
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${CYAN}55`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${CYAN}33`; }}
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
