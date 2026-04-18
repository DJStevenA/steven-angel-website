import React, { useState, useEffect, Fragment } from "react";
import Nav from "./Nav.jsx";

/* ─── Google Ads conversion helper ─── */
const fireWhatsAppConversion = () => {
  if (window.gtag) {
    window.gtag('event', 'conversion', { 'send_to': 'AW-999991173/b8BYCIHTmJIcEIXP6twD', 'value': 300.0, 'currency': 'USD' });
    window.gtag('event', 'contact', { event_category: 'whatsapp', event_label: 'ghost_page' });
  }
};

/* ─── Color Constants ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

/* ─── External Links ─── */
const WHATSAPP_LINK =
  "https://wa.me/972523561353?text=Hi%20Steven%2C%20I'm%20interested%20in%20ghost%20production.%20Here's%20my%20reference%20track%3A%20";

/* ─── Shadow Colors ─── */
const SHADOW_CYAN = "rgba(0,229,255,0.4)";
const SHADOW_PURPLE = "rgba(187,134,252,0.4)";
const SHADOW_GREEN = "rgba(37,211,102,0.4)";

/* ─── Package Prices ─── */
const PRICES = {
  demo: "$300",
  full: "$800",
  vocal: "$1,500",
};

/* ─── FAQ Data ─── */
const FAQ_DATA = [
  [
    "Will my name stay anonymous?",
    "100%. I sign an NDA before starting. Your name appears as the sole artist — mine appears nowhere.",
  ],
  [
    "What genres do you specialize in?",
    "Afro House, Afro Latin House, and Indie Dance — the sounds currently dominating Beatport and club sets.",
  ],
  [
    "How do I send you my reference track?",
    "Simply WhatsApp me or fill the form below with a reference track link (YouTube, Spotify, SoundCloud). I'll reply within 24 hours.",
  ],
  [
    "What do I receive with the track?",
    "Mastered WAV, unmastered WAV, stems, MIDI files, and a signed NDA + copyright transfer document.",
  ],
  [
    "Can I request revisions?",
    "Yes — 2 revisions are included in all packages. Unlimited revisions available in premium packages.",
  ],
  [
    "How long does it take?",
    "Demo Finishing: 3–5 business days. Full Production: 7 business days.",
  ],
  [
    "Do you work with any label or release platform?",
    "Yes. Tracks are delivered release-ready for Beatport, Spotify, Apple Music, and all major platforms.",
  ],
  [
    "Are you also available for production lessons?",
    "Yes — I offer 1-on-1 online lessons for producers at all levels. Visit the full site to learn more.",
  ],
  [
    "Do you offer afro house ghost production services?",
    "Yes — I specialize exclusively in Afro House ghost production, Afro Latin House and Indie Dance. Every track is built to the same standard as my MTGD and Moblack releases.",
  ],
  [
    "Can I get a Hugel or Moblack style track?",
    "Absolutely. I have releases on MTGD (Hugel's label) and Moblack, and my tracks have been played by Hugel and Claptone. I know these sounds inside out.",
  ],
  [
    "Do you finish demos in Maccabi House or Indie Dance style?",
    "Yes — Indie Dance and Maccabi House style production is one of my specialties. I can finish your demo or build a full track from scratch.",
  ],
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { quote: "He's the GOAT.", author: "Producer", location: "Canada" },
  {
    quote: "Pleasure to work with that guy, very talented!!",
    author: "DJ",
    location: "France",
  },
  { quote: "Perfect — recommended.", author: "Artist", location: "Indonesia" },
  {
    quote: "Quick delivery, always helps out even last minute.",
    author: "Producer",
    location: "Canada",
  },
  {
    quote: "Thank you so much for this amazing work.",
    author: "DJ",
    location: "Switzerland",
  },
  { quote: "Fast delivery \u{1F44C}\u{1F3FB}", author: "Artist", location: "Indonesia" },
];

/* ─── Audio Samples ─── */
const AUDIO_SAMPLES = [
  {
    tracks: [
      { file: "/audio/maria-maria.mp3", title: "Maria Maria" },
      { file: "/audio/afro-house-i-like-it.mp3", title: "I Like It" },
      { file: "/audio/newa-afro-house.mp3", title: "Nawe" },
    ],
    label: "Afro House",
  },
  {
    tracks: [
      { file: "/audio/tequila.mp3", title: "Tequila" },
      { file: "/audio/la-chingada.mp3", title: "La Chingada" },
      {
        file: "/audio/body-dancin-remix.mp3",
        title: "Body Dancin' (Afro Remix)",
      },
    ],
    label: "Afro Latin House",
  },
  {
    tracks: [
      { file: "/audio/nipate-moyo.mp3", title: "Nipate Moyo" },
      { file: "/audio/mandala-remix.mp3", title: "Mandala (Remix)" },
    ],
    label: "Afro Tech",
  },
  {
    tracks: [
      { file: "/audio/disko-spalvov.mp3", title: "Disko Spalvov" },
      { file: "/audio/sagapo.mp3", title: "Sagapo" },
    ],
    label: "Balkan House",
  },
  {
    tracks: [
      { file: "/audio/indie-dance-disco-vibe.mp3", title: "Disco Vibe" },
      { file: "/audio/indie-dance-hard.mp3", title: "Indie Dance Hard" },
    ],
    label: "Indie Dance",
  },
  {
    file: "/audio/body-moving.mp3",
    title: "Body Moving",
    label: "Tech House",
  },
];

/* ─── Video Showcases ─── */
const VIDEO_SHOWCASES = [
  {
    src: "/videos/hugel-claptone-ibiza.mp4",
    thumb: "/images/pacha-ibiza-thumb.webp",
    caption: 'My Track "El Barrio" — Played by Hugel & Claptone at Pacha Ibiza',
  },
  {
    src: "/videos/pacha-barcelona.mp4",
    thumb: "/videos/pacha-barcelona-thumb.webp",
    caption: 'Hugel playing my track "Dale Sentido" at Pacha Barcelona',
  },
  {
    src: "/videos/zamna-festival.mp4",
    thumb: "/videos/zamna-festival-thumb.webp",
    caption: 'Hugel playing my track "Dale Sentido" at Zamna Festival',
  },
  {
    src: "/videos/artbat-ghost.mp4",
    thumb: "/videos/artbat-ghost-thumb.webp",
    caption: "La Cantadora — Mastered by Steven Angel · Played by ARTBAT",
  },
];

/* ════════════════════════════════════════════════════════
   VideoPlayer Component
   ════════════════════════════════════════════════════════ */
function VideoPlayer({ src, yt, caption, thumb }) {
  const [playing, setPlaying] = useState(false);

  const wrapperStyle = {
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "#02020a",
    cursor: "pointer",
  };

  const fillStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  const playButton = (
    <div
      style={{
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "rgba(0,229,255,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );

  const captionEl = (
    <div
      style={{
        fontFamily: "DM Sans, sans-serif",
        fontSize: 12,
        color: "rgba(0,229,255,0.7)",
        marginTop: 8,
        textAlign: "center",
      }}
    >
      {caption}
    </div>
  );

  /* YouTube embed */
  if (yt) {
    return (
      <div>
        <div style={wrapperStyle}>
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${yt}?autoplay=1`}
              title="video"
              allowFullScreen
              allow="autoplay"
              style={{ ...fillStyle, border: "none" }}
            />
          ) : (
            <div
              onClick={() => setPlaying(true)}
              style={{
                ...fillStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={thumb || `https://img.youtube.com/vi/${yt}/hqdefault.jpg`}
                alt={caption}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.7,
                }}
              />
              {playButton}
            </div>
          )}
        </div>
        {captionEl}
      </div>
    );
  }

  /* Self-hosted video */
  return (
    <div>
      <div style={wrapperStyle}>
        {playing ? (
          <video
            src={src}
            controls
            autoPlay
            playsInline
            preload="metadata"
            style={{ ...fillStyle, objectFit: "cover" }}
          />
        ) : (
          <div
            onClick={() => setPlaying(true)}
            style={{
              ...fillStyle,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#06060f",
            }}
          >
            {thumb && (
              <img
                src={thumb}
                alt={caption}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.7,
                  position: "absolute",
                }}
              />
            )}
            {playButton}
          </div>
        )}
      </div>
      {captionEl}
    </div>
  );
}

/* ─── WhatsApp SVG Icon ─── */
const WhatsAppIcon = ({ size = 16, fill = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.61.61l6.163-1.529A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.214-3.724.924.942-3.626-.234-.373A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12c0 5.421-4.398 9.818-9.818 9.818z" />
  </svg>
);

/* ─── Style Helpers ─── */
const heading = (fontSize) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 900,
  fontSize,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.1,
});

const body = {
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.7,
};

const label = (color = CYAN) => ({
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color,
});

const outlineBtn = (color, shadow) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "transparent",
  border: "2px solid " + color,
  color,
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  padding: "14px 32px",
  borderRadius: 50,
  textDecoration: "none",
  boxShadow: "0 0 24px " + shadow,
  cursor: "pointer",
});

/* ════════════════════════════════════════════════════════
   GhostPage — Main Page Component
   ════════════════════════════════════════════════════════ */
function GhostPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openFaq, setOpenFaq] = useState(null);
  const [howItWorksPackage, setHowItWorksPackage] = useState(null);

  const openHowItWorks = (pkg) => {
    setHowItWorksPackage(pkg);
    if (window.clarity) { window.clarity("event", "ghostPackageView"); window.clarity("set", "ghostPackage", pkg); }
  };

  /* ── Responsive listener ── */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Clarity: track ghost page visit */
  useEffect(() => {
    if (window.clarity) window.clarity("event", "ghostPageVisit");
  }, []);

  /* SEO: page title, meta description, and canonical URL are handled
     globally by the <PageTitle /> component in main.jsx (based on route). */
  useEffect(() => {
    const existing = document.getElementById("ghost-service-jsonld");
    if (existing) existing.remove();

    const ld = document.createElement("script");
    ld.id = "ghost-service-jsonld";
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Afro House, Tech House & Indie Dance Ghost Production",
      serviceType: "Ghost Production Service",
      description:
        "Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included.",
      provider: {
        "@type": "Person",
        name: "Steven Angel",
        url: "https://steven-angel.com/",
        sameAs: [
          "https://steven-angel.com/",
          "https://steven-angel.com/ghost",
        ],
      },
      areaServed: "Worldwide",
      url: "https://steven-angel.com/ghost",
      offers: {
        "@type": "Offer",
        price: "300",
        priceCurrency: "USD",
        url: "https://steven-angel.com/ghost",
        availability: "https://schema.org/InStock",
      },
    });

    document.head.appendChild(ld);

    return () => {
      const node = document.getElementById("ghost-service-jsonld");
      if (node) node.remove();
    };
  }, []);

  /* FAQPage schema — 11 FAQ items for Google rich results */
  useEffect(() => {
    const existing = document.getElementById("ghost-faq-jsonld");
    if (existing) existing.remove();
    const ld = document.createElement("script");
    ld.id = "ghost-faq-jsonld";
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_DATA.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
    document.head.appendChild(ld);
    return () => {
      const node = document.getElementById("ghost-faq-jsonld");
      if (node) node.remove();
    };
  }, []);

  /* ────────────────────────────────────────────────────
     Render
     ──────────────────────────────────────────────────── */
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      {/* ═══ "How It Works" Modal ═══ */}
      {howItWorksPackage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#07070f",
              border: "1px solid #1a1a2e",
              borderRadius: 14,
              padding: "40px 36px",
              maxWidth: 480,
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: 24,
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              HOW IT WORKS
            </div>

            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobile ? 11 : 13,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 32,
              }}
            >
              Package:{" "}
              <span
                style={{
                  color: howItWorksPackage === "full" ? PURPLE : CYAN,
                }}
              >
                {howItWorksPackage === "demo"
                  ? "Demo Finishing"
                  : "Full Production"}{" "}
                &mdash; {PRICES[howItWorksPackage]}
              </span>
            </div>

            {[
              {
                n: "1",
                title: "Sign the Agreement",
                desc: "Review and sign the NDA + copyright transfer contract. Both you and Steven are signed.",
              },
              {
                n: "2",
                title: "Complete Payment",
                desc: `Pay ${PRICES[howItWorksPackage]} via PayPal (secure checkout). A signed PDF copy of the contract is sent to your email immediately.`,
              },
              {
                n: "3",
                title: "Upload Your Files",
                desc: "After signing, you'll get a private Dropbox upload link \u2014 by email and on-screen. Drop your reference tracks, demo, or notes there.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                style={{ display: "flex", gap: 16, marginBottom: 24 }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      howItWorksPackage === "full" ? PURPLE : CYAN,
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {n}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: isMobile ? 11 : 13,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setHowItWorksPackage(null);
                window.location.href = `/sign?package=${howItWorksPackage}`;
              }}
              style={{
                width: "100%",
                background:
                  howItWorksPackage === "full" ? PURPLE : CYAN,
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "16px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: "0.1em",
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              LET'S GO &mdash; SIGN & PAY &rarr;
            </button>

            <button
              onClick={() => setHowItWorksPackage(null)}
              style={{
                width: "100%",
                background: "none",
                border: "1px solid #1a1a2e",
                color: "rgba(255,255,255,0.6)",
                borderRadius: 8,
                padding: "12px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobile ? 11 : 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Hidden <title> for SEO */}
      <title>
        Ghost Producer &middot; Hugel & MoBlack Style &middot; Afro House &
        Indie Dance | Steven Angel
      </title>

      {/* ═══ Fixed WhatsApp Button ═══ */}
      <a
        href={WHATSAPP_LINK}
        onClick={() => { fireWhatsAppConversion(); if (window.clarity) window.clarity("event", "ghostWhatsAppClick"); }}
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
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
        <WhatsAppIcon size={16} />
        WhatsApp
      </a>

      <Nav />

      <main>
        {/* ═══ Hero Section ═══ */}
        <section
          style={{
            padding: isMobile ? "50px 20px 60px" : "60px 60px 70px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src="/images/dj-hero-ghost.webp"
            alt="Steven Angel — Afro House Ghost Producer Tel Aviv"
            fetchPriority="high"
            width="800"
            height="1200"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 30%",
            }}
          />
          {/* Dark overlay replaces CSS filter (filter blocks LCP by 200-400ms) */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)" }} />

          <div
            style={{
              maxWidth: 820,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                ...label("rgba(255,255,255,0.6)"),
                marginBottom: 20,
              }}
            >
              GHOST PRODUCTION
            </div>

            {/* Hidden H1 for SEO (visually hidden, screen-reader accessible) */}
            <h1 style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}>
              Afro House Ghost Producer — Signed MTGD & Moblack Artist
            </h1>

            {/* Main hero headline */}
            <div role="heading" aria-level="2" style={{ ...heading(isMobile ? 32 : 64), marginBottom: 16, background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Last Night Hugel & Claptone Played My Track.
              <br />
              Want Yours To Be Next?
            </div>

            {/* Sub-headline */}
            <div style={{ ...heading(isMobile ? 18 : 28), marginBottom: 12, color: "#fff" }}>
              Ghost Production for DJs & Artists Who Take Their Sound Seriously
            </div>

            <h2
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 20 : 28,
                letterSpacing: "0.1em",
                color: CYAN,
                marginBottom: 20,
              }}
            >
            </h2>

            {/* Specializing line */}
            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobile ? 12 : 14,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.08em",
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Specializing in: Afro House &middot; Afro Latin House &middot; Tech House &middot; Indie Dance
              <br />
              Release-Ready Tracks, Label Standard
            </div>

            {/* Tagline above CTA */}
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 18 : 24,
                letterSpacing: "0.1em",
                color: CYAN,
                marginBottom: 20,
              }}
            >
              Your Vision. My Sound.
            </div>

            {/* Primary CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <a
                href="/shop?tab=ghost"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg,#BB86FC,#9b59d4)",
                  color: "#000",
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
                  fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase",
                  padding: "16px 32px", borderRadius: 50, border: "none",
                  cursor: "pointer", textDecoration: "none",
                  boxShadow: "0 0 24px rgba(187,134,252,0.45)",
                }}
              >
                Buy Ready Made Track
              </a>
              <button
                onClick={() => { const el = document.getElementById("process"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent",
                  color: CYAN,
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800,
                  fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase",
                  padding: "15px 32px", borderRadius: 50,
                  border: `2px solid ${CYAN}`,
                  cursor: "pointer",
                }}
              >
                Order Custom Track
              </button>
            </div>

          </div>
        </section>

        {/* ═══ About Steven ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: BG,
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 48,
              alignItems: "center",
            }}
          >
            <img
              src="/images/portrait.webp"
              alt="Steven Angel"
              loading="lazy"
              width="800"
              height="903"
              style={{
                width: "100%",
                borderRadius: 12,
                objectFit: "cover",
                maxHeight: 480,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />

            <div>
              <div style={{ ...label(CYAN), marginBottom: 16 }}>
                ABOUT STEVEN
              </div>
              <div
                style={{
                  ...heading(isMobile ? 28 : 40),
                  marginBottom: 24,
                }}
              >
                DJ, Producer &<br />
                <span style={{ color: CYAN }}>Audio Engineer</span>
              </div>
              <div style={{ ...body, marginBottom: 16 }}>
                20+ years in electronic music. Signed to top labels, charted on
                Beatport, and played by the biggest names in the game.
              </div>
              <div style={{ ...body, marginBottom: 20 }}>
                Also one half of{" "}
                <a
                  href="https://ra.co/dj/theangels"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: CYAN,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  The Angels
                </a>
                {" "}&mdash; Hit #1 on iTunes Israel, 2 Beatport Top 10 releases,
                performed across the USA, Latin America & Europe. Find us on{" "}
                <a
                  href="https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: CYAN,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Spotify
                </a>{" "}
                and{" "}
                <a
                  href="https://www.beatport.com/artist/the-angels-il/913642"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: CYAN,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Beatport
                </a>
                .
              </div>
              <div style={{ ...body }}>
                When I produce for you, I bring the same standards I use for my own releases.
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Stats Bar ═══ */}
        <div
          style={{
            background: "#04040f",
            borderTop: "1px solid #0d0d18",
            borderBottom: "1px solid #0d0d18",
            padding: "28px 48px",
          }}
        >
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            {/* Key numbers */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 24,
                marginBottom: 20,
              }}
            >
              {[
                ["20+", "Years Experience"],
                ["100M+", "Streams & Views"],
                ["Top 10 \u00D72", "Beatport Charts"],
              ].map(([stat, desc]) => (
                <div key={stat} style={{ textAlign: "center" }}>
                  <div style={{ ...heading(isMobile ? 26 : 32), color: CYAN }}>{stat}</div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: isMobile ? 12 : 13,
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 6,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Signed To */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 14,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div
                style={{
                  ...label("rgba(255,255,255,0.25)"),
                  marginRight: 8,
                  alignSelf: "center",
                }}
              >
                SIGNED TO
              </div>
              {[
                "MTGD (Hugel's label)",
                "Moblack",
                "Godeeva",
                "Sony",
                "Ultra",
                "Armada",
              ].map((name) => (
                <span
                  key={name}
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    padding: "3px 10px",
                    border: "1px solid rgba(187,134,252,0.25)",
                    borderRadius: 20,
                    color: PURPLE,
                    background: "rgba(187,134,252,0.04)",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Supported By */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 14,
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div
                style={{
                  ...label("rgba(255,255,255,0.25)"),
                  marginRight: 8,
                  alignSelf: "center",
                }}
              >
                SUPPORTED BY
              </div>
              {[
                "Hugel",
                "Claptone",
                "ARTBAT",
                "Hernan Cattaneo",
                "Roger Sanchez",
              ].map((name) => (
                <span
                  key={name}
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    padding: "5px 14px",
                    border: "1px solid rgba(0,229,255,0.2)",
                    borderRadius: 20,
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(0,229,255,0.04)",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>

            {/* Beatport Top 10 */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 14,
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div
                style={{
                  ...label("rgba(255,255,255,0.25)"),
                  marginRight: 8,
                  alignSelf: "center",
                }}
              >
                BEATPORT TOP 10
              </div>
              {[
                "Jungle Walk (Godeeva)",
                "Ojos en Tus Ojos (Moblack)",
              ].map((track) => (
                <span
                  key={track}
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    padding: "3px 12px",
                    border: "1px solid rgba(187,134,252,0.25)",
                    borderRadius: 20,
                    color: PURPLE,
                    background: "rgba(187,134,252,0.04)",
                  }}
                >
                  {track}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Video Showcases ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 16px" : "60px 60px",
            background: "#04040f",
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div
              style={{
                ...heading(isMobile ? 26 : 40),
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Your Track &mdash; Played on the Biggest Stages
            </div>
            <div style={{ ...body, textAlign: "center", marginBottom: 32 }}>
              Last night Hugel & Claptone played my track. Want your track to be next?
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: isMobile ? 10 : 20,
              }}
            >
              {VIDEO_SHOWCASES.map(({ src, yt, caption, thumb }, idx) => (
                <VideoPlayer
                  key={idx}
                  src={src}
                  yt={yt}
                  caption={caption}
                  thumb={thumb}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Hernan Cattaneo Section ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: "#04040f",
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ ...label(CYAN), marginBottom: 16 }}>INDUSTRY RECOGNITION</div>
            <div style={{ ...heading(isMobile ? 22 : 32), marginBottom: 32 }}>
              When <span style={{ color: CYAN }}>Hernan Cattaneo</span> Emails You Back
            </div>
            <img
              src="/images/hernan-email.webp"
              alt="Hernan Cattaneo email praising Steven Angel mastering work"
              loading="lazy"
              width="655"
              height="210"
              style={{
                width: "100%",
                maxWidth: 560,
                height: "auto",
                display: "block",
                margin: "0 auto",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 0 40px rgba(0,229,255,0.08)",
              }}
            />
            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobile ? 11 : 13,
                color: "rgba(255,255,255,0.5)",
                marginTop: 12,
                fontStyle: "italic",
              }}
            >
              Hernan Cattaneo &mdash; Legendary DJ & Producer, on Steven Angel's mastering work
            </div>
          </div>
        </section>

        {/* ═══ This Is For You If ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 36 }}>
              This Is For You If...
            </h2>
            {[
              "You want a track that cooks the dance floor",
              "You want a track that sounds ready for a label release",
              "You have a vision but not the time or skills to finish it",
              "You\u2019re serious about your music career and need results",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: CYAN, fontWeight: 700, fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>&#10003;</span>
                <span style={{ ...body, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.8)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ What You Get ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 36 }}>
              What You <span style={{ color: CYAN }}>Get</span>
            </h2>
            {[
              "Original & Exclusive Track",
              "Professionally Mixed & Mastered to hit in the club",
              "Full arrangement \u2014 Extended Mix + Radio Edit",
              "Stems + MIDI files",
              "16-bit WAV Master + 24-bit Pre-Master",
              "5\u20137 business day delivery",
              "100% of the rights are yours",
              "NDA included on every project",
              "Work directly with me \u2014 not an agency or platform",
              "Every project has potential to be signed on my label",
            ].map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ color: CYAN, fontWeight: 700, fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>&#10003;</span>
                <span style={{ ...body, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.8)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ The Process ═══ */}
        <section id="process" style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 12 }}>
              The <span style={{ color: CYAN }}>Process</span>
            </h2>
            <div style={{ ...body, textAlign: "center", fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>
              Simple, Direct, And Built To Achieve Full Understanding of Your Needs
            </div>
            {[
              { n: "1", text: "You send me your idea and references. We can also have a Zoom to discuss before we start working." },
              { n: "2", text: "I make a 90-second demo of the idea. If you like it, we move on. If needed \u2014 I make a new demo until we get it right." },
              { n: "3", text: "I move on to make the full track \u2014 3 revisions included." },
              { n: "4", text: "Delivery: label-ready track, stems, MIDI, 16-bit WAV." },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: "flex", gap: 16, marginBottom: 22, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", border: `2px solid ${CYAN}`, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, color: CYAN,
                }}>{n}</div>
                <span style={{ ...body, fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.8)", paddingTop: 6 }}>{text}</span>
              </div>
            ))}

            {/* Refund guarantee */}
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <div style={{ ...body, fontSize: isMobile ? 14 : 15, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
                Not happy after multiple demos? Full refund. No questions asked.
              </div>
              <div style={{ ...body, fontSize: isMobile ? 12 : 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                (That's never happened — but the guarantee stands.)
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Pricing (plain text) ═══ */}
        <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG, borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), marginBottom: 36 }}>
              Pricing
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#04040f", borderRadius: 8, border: "1px solid #141420" }}>
                <span style={{ ...body, fontSize: 16, color: "#fff", fontWeight: 500 }}>Demo Finishing</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, color: CYAN }}>from $300</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#04040f", borderRadius: 8, border: "1px solid #141420" }}>
                <span style={{ ...body, fontSize: 16, color: "#fff", fontWeight: 500 }}>Full Track Production</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, color: CYAN }}>from $800</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", background: "#04040f", borderRadius: 8, border: "1px solid #141420" }}>
                <span style={{ ...body, fontSize: 16, color: "#fff", fontWeight: 500 }}>Add-on: Vocal Production</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, color: CYAN }}>from $1,500</span>
              </div>
            </div>
            <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginBottom: 28 }}>
              I take a limited number of projects each month.
            </div>
            <button
              onClick={() => { window.open("https://calendly.com/dj-steven-angel/15-min-zoom", "_blank"); if (window.gtag) window.gtag("event", "conversion", { send_to: "AW-999991173/LFPzCO2VyJQBEIXP6twD", value: 300.0, currency: "USD" }); if (window.clarity) window.clarity("event", "ghostCalendlyClick"); }}
              style={{
                ...outlineBtn(CYAN, SHADOW_CYAN),
                display: "inline-flex",
                justifyContent: "center",
                padding: "14px 40px",
                fontSize: 14,
                letterSpacing: "0.2em",
              }}
            >
              Book a Free Consultation
            </button>
          </div>
        </section>

        {/* ═══ Audio Samples ═══ */}
        <section
          id="audio-samples"
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: BG,
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div
              style={{
                ...heading(isMobile ? 24 : 36),
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              This Is the Standard
              <br />
              <span style={{ color: CYAN }}>
                Your Track Will Be Built To
              </span>
            </div>
            <div style={{ ...body, textAlign: "center", marginBottom: 40 }}>
              Original releases on MTGD, Moblack, Godeeva and more.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(3,1fr)",
                gap: 16,
              }}
            >
              {AUDIO_SAMPLES.map((sample) => {
                const sampleLabel = sample.label;
                const hasAudio = sample.tracks ? true : !!sample.file;

                return (
                  <div
                    key={sampleLabel}
                    style={{
                      background: "#04040f",
                      border: "1px solid #141420",
                      borderTop:
                        "2px solid " +
                        (hasAudio
                          ? PURPLE
                          : "rgba(255,255,255,0.08)"),
                      borderRadius: 8,
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        color: hasAudio
                          ? PURPLE
                          : "rgba(255,255,255,0.25)",
                        marginBottom: 4,
                      }}
                    >
                      {sampleLabel}
                    </div>

                    {sample.tracks
                      ? sample.tracks.map(({ file, title }) => (
                          <div key={title} style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                ...heading(15),
                                color: "rgba(255,255,255,0.85)",
                                marginBottom: 6,
                              }}
                            >
                              {title}
                            </div>
                            <audio
                              controls
                              preload="none"
                              style={{
                                width: "100%",
                                accentColor: CYAN,
                              }}
                              onPlay={(ev) => {
                                document
                                  .querySelectorAll("audio")
                                  .forEach((a) => {
                                    if (a !== ev.target) a.pause();
                                  });
                                if (window.clarity) { window.clarity("event", "ghostAudioPlay"); window.clarity("set", "audioTrack", title); }
                                if (window.gtag) window.gtag("event", "select_content", { event_category: "audio", event_label: title });
                              }}
                            >
                              <source src={file} type="audio/mpeg" />
                            </audio>
                          </div>
                        ))
                      : sample.file
                      ? (
                          <>
                            <div
                              style={{
                                ...heading(15),
                                color: "rgba(255,255,255,0.85)",
                                marginBottom: 12,
                              }}
                            >
                              {sample.title}
                            </div>
                            <audio
                              controls
                              preload="none"
                              style={{
                                width: "100%",
                                accentColor: CYAN,
                              }}
                              onPlay={(ev) => {
                                document
                                  .querySelectorAll("audio")
                                  .forEach((a) => {
                                    if (a !== ev.target) a.pause();
                                  });
                                if (window.clarity) { window.clarity("event", "ghostAudioPlay"); window.clarity("set", "audioTrack", sample.title || "unknown"); }
                                if (window.gtag) window.gtag("event", "select_content", { event_category: "audio", event_label: sample.title || "unknown" });
                              }}
                            >
                              <source
                                src={sample.file}
                                type="audio/mpeg"
                              />
                            </audio>
                          </>
                        )
                      : (
                          <>
                            <div
                              style={{
                                ...heading(15),
                                color: "rgba(255,255,255,0.5)",
                                marginBottom: 12,
                              }}
                            >
                              {sample.title}
                            </div>
                            <div
                              style={{
                                fontFamily: "DM Sans, sans-serif",
                                fontSize: 11,
                                color: "rgba(255,255,255,0.6)",
                                fontStyle: "italic",
                              }}
                            >
                              Sample coming soon
                            </div>
                          </>
                        )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ Testimonials ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: "#04040f",
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2
              style={{
                ...heading(isMobile ? 28 : 40),
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              What Clients Say
            </h2>
            <div
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              All clients remain anonymous by default &mdash; NDA on every
              project.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 24,
              }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: BG,
                    border: "1px solid #141420",
                    borderRadius: 10,
                    padding: "28px 24px",
                  }}
                >
                  <div
                    style={{
                      color: CYAN,
                      fontSize: 28,
                      lineHeight: 1,
                      marginBottom: 12,
                    }}
                  >
                    &ldquo;
                  </div>
                  <div
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1.7,
                      marginBottom: 20,
                    }}
                  >
                    {t.quote}
                  </div>
                  <div
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: isMobile ? 11 : 13,
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    &mdash; {t.author}, {t.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ Section ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px" : "60px 60px",
            background: BG,
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h2
              style={{
                ...heading(isMobile ? 28 : 40),
                textAlign: "center",
                marginBottom: 40,
              }}
            >
              Frequently Asked Questions
            </h2>

            {FAQ_DATA.map(([question, answer], idx) => (
              <div
                key={idx}
                style={{
                  borderBottom: "1px solid #141420",
                  marginBottom: 0,
                }}
              >
                <button
                  onClick={() => { setOpenFaq(openFaq === idx ? null : idx); if (window.clarity && openFaq !== idx) window.clarity("event", "ghostFaqOpen"); }}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "20px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      letterSpacing: "0.04em",
                      color: openFaq === idx ? CYAN : "#fff",
                    }}
                  >
                    {question}
                  </span>
                  <span
                    style={{
                      color: CYAN,
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {openFaq === idx ? "\u2212" : "+"}
                  </span>
                </button>

                {openFaq === idx && (
                  <div style={{ ...body, fontSize: 14, paddingBottom: 20 }}>
                    {answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Contact / CTA Section ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px 50px" : "60px 60px 70px",
            background: "#04040f",
            borderTop: "1px solid #0d0d0d",
          }}
        >
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div
              style={{
                ...heading(isMobile ? 28 : 44),
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              Ready to Start?
              <br />
              <span style={{ color: CYAN }}>
                Send Me Your Reference Track.
              </span>
            </div>
            <div style={{ ...body, textAlign: "center", marginBottom: 48 }}>
              I'll get back to you within 24 hours with a price and timeline.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 40,
                alignItems: "start",
              }}
            >
              {/* Netlify Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const data = Object.fromEntries(new FormData(form));
                  data.source = "ghost-page";
                  fetch("https://ghost-backend-production-adb6.up.railway.app/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.success) {
                        alert("Message sent! I'll get back to you within 24 hours.");
                        form.reset();
                        if (window.clarity) window.clarity("event", "ghostFormSubmit");
                        if (window.gtag) {
                          window.gtag('event', 'conversion', {
                            'send_to': 'AW-999991173',
                            'value': 300,
                            'currency': 'USD',
                            'event_category': 'lead',
                            'event_label': 'ghost_page_contact_form',
                          });
                          window.gtag('event', 'generate_lead', { event_category: 'form', event_label: 'ghost_contact' });
                        }
                      } else {
                        alert("Something went wrong. Please try WhatsApp instead.");
                      }
                    })
                    .catch(() => alert("Something went wrong. Please try WhatsApp instead."));
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <input
                  type="hidden"
                  name="form-name"
                  value="ghost-contact"
                />

                {[
                  ["Your name", "name", "text", true],
                  ["Your email", "email", "email", true],
                ].map(([placeholder, name, type, isRequired]) => (
                  <input
                    key={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    required={isRequired}
                    style={{
                      background: "#08080f",
                      border: "1px solid #1a1a2e",
                      borderRadius: 6,
                      padding: "14px 16px",
                      color: "#fff",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                ))}

                <textarea
                  name="message"
                  placeholder="Tell me about your track"
                  rows={4}
                  style={{
                    background: "#08080f",
                    border: "1px solid #1a1a2e",
                    borderRadius: 6,
                    padding: "14px 16px",
                    color: "#fff",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    ...outlineBtn(CYAN, SHADOW_CYAN),
                    justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  Send Your Idea
                </button>
              </form>

              {/* Direct chat CTA */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  background: BG,
                  border: "1px solid #141420",
                  borderRadius: 10,
                  padding: "40px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    ...heading(20),
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Prefer to Chat Directly?
                </div>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  onClick={fireWhatsAppConversion}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#1a7a42",
                    color: "#fff",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    letterSpacing: "0.15em",
                    padding: "16px 32px",
                    borderRadius: 50,
                    textDecoration: "none",
                    boxShadow: "0 0 32px " + SHADOW_GREEN,
                  }}
                >
                  <WhatsAppIcon size={20} />
                  WhatsApp Me Directly &rarr;
                </a>

                <div
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  NDA signed on all projects. Full copyright transfer.
                  <br />
                  Reply within 24 hours.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ Footer ═══ */}
      <footer
        style={{
          padding: "28px 40px",
          background: "#02020a",
          borderTop: "1px solid #0d0d18",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: isMobile ? 11 : 13,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 8,
          }}
        >
          Looking for Ableton templates or courses?{" "}
          <a
            href="/shop"
            style={{ color: CYAN, textDecoration: "underline" }}
          >
            Visit the Shop &rarr;
          </a>
        </div>
        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 6,
          }}
        >
          Afro House Ghost Producer | MTGD &middot; Moblack &middot; Godeeva |
          Worldwide
        </div>
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          &copy; 2026 Steven Angel &middot;{" "}
          <a
            href="/"
            style={{
              color: "rgba(255,255,255,0.8)",
              textDecoration: "underline",
            }}
          >
            stevenangel.com
          </a>
        </span>
      </footer>
    </div>
  );
}

export default GhostPage;
