import { useEffect, useState } from "react";
import TrackPlayer from "./components/TrackPlayer";
import { Link } from "react-router-dom";

/* ── Lazy YouTube embed component ── */
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

export default function App() {
  const cyan = "#00E5FF";
  const purple = "#BB86FC";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
    color: "rgba(255,255,255,0.58)",
    fontSize: 15,
  };

  const label = (color) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: color || cyan,
  });

  /* ── data ── */
  const testimonials = [
    { n: "Marco R.", f: "Italy",   t: "In 3 months with Steven I went from bedroom beats to getting signed. His cut-the-fat method changed everything.", g: "Afro House" },
    { n: "DJ Kobi",  f: "Israel",  t: "The way Steven breaks down Ableton completely changed how I work. My workflow is 3x faster now.", g: "Melodic Techno" },
    { n: "Sarah M.", f: "UK",      t: "After 6 lessons my tracks finally sound like they belong on a major label. Life changing.", g: "Deep House" },
    { n: "Niko V.",  f: "Germany", t: "Steven identifies exactly what's missing from a track. Best investment in my music career.", g: "Tech House" },
    { n: "Pedro L.", f: "Spain",   t: "Released my first track on a label 4 months after starting lessons. Couldn't have done it without Steven's guidance.", g: "Afro Latin" },
    { n: "Avi S.",   f: "Israel",  t: "Focused lessons, real feedback, zero fluff. Every session I walk away with something I can apply immediately.", g: "Indie Dance" },
  ];

  /* ═══════════════════════  RENDER  ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, padding: "0 48px", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => { if (window.history.length > 2) { window.history.back(); } else { window.location.href = '/'; } }}
            aria-label="Go back"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: cyan, fontSize: 15, lineHeight: 1, opacity: 0.8, transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
          >
            ←
          </button>
          <Link to="/" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1, textDecoration: "none", color: "#fff" }}>
            STEVEN <span style={{ color: cyan }}>ANGEL</span>
          </Link>
        </div>
        <div style={{ display: isMobile ? "none" : "flex", gap: 32, alignItems: "center" }}>
          {[
            { label: "Ghost", to: "/ghost" },
            { label: "Lessons", to: "/lessons" },
            { label: "Shop", to: "/shop" },
          ].map(({ label: lbl, to }) => (
            <Link key={lbl} to={to} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", lineHeight: 1 }}>
              {lbl}
            </Link>
          ))}
        </div>
      </nav>

      <main>

        {/* ══════ 1. HERO ══════ */}
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
            <div style={{ ...label(), marginBottom: 20 }}>DJ · Producer · Ableton Mentor</div>

            <h1 style={{ ...heading("clamp(56px,9vw,120px)"), marginBottom: 12, letterSpacing: "0.06em", background: `linear-gradient(90deg, ${cyan}, ${purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              STEVEN ANGEL
            </h1>

            <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${cyan}, ${purple})`, margin: "0 auto 20px" }} />

            <h2 style={{ ...heading(isMobile ? 20 : 28), marginBottom: 12, color: "#fff", lineHeight: 1.15 }}>
              Ghost Production, Ableton Lessons & Pro Music Tools
            </h2>

            <div style={{ ...body, fontSize: isMobile ? 14 : 17, maxWidth: 600, margin: "0 auto 14px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em" }}>
              Afro House · Tech House · Indie Dance Production
            </div>

            <div style={{ ...body, fontSize: isMobile ? 13 : 15, maxWidth: 520, margin: "0 auto", color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
              Played by Hugel & Claptone at Pacha Ibiza
            </div>

            {/* ── Hero CTA Cards ── */}
            <div style={{
              display: "flex",
              flexWrap: "nowrap",
              gap: isMobile ? 8 : 16,
              marginTop: isMobile ? 32 : 48,
              width: isMobile ? "100%" : "110%",
              marginLeft: isMobile ? 0 : "-5%",
            }}>
              {[
                { title: "GHOST PRODUCTION & DEMO FINISHING", sub: "For artists who need Label-Ready tracks", btn: "Get Your Track", to: "/ghost", premium: true },
                { title: "PRODUCTION, MIX & MASTERING LESSONS", sub: "For producers who want to master it themselves", btn: "Start Learning", to: "/lessons", premium: false },
                { title: "TEMPLATES & MASTERCLASS SHOP", sub: "For producers building their toolkit", btn: "Browse Shop", to: "/shop", premium: false },
              ].map((card, i) => (
                <Link
                  key={i}
                  to={card.to}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: isMobile ? "14px 12px 12px" : "24px 24px 20px",
                    background: card.premium
                      ? "linear-gradient(135deg, #0a0a20, #0d0418)"
                      : "#04040f",
                    border: card.premium
                      ? `2px solid ${cyan}`
                      : "1px solid #141420",
                    borderRadius: 10,
                    boxShadow: card.premium
                      ? "0 0 40px rgba(0,229,255,0.12)"
                      : "none",
                    textDecoration: "none",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 800,
                    fontSize: isMobile ? 12 : 16,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    color: card.premium ? cyan : "#fff",
                    lineHeight: 1.2,
                  }}>
                    {card.title}
                  </div>
                  <div style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: isMobile ? 10 : 13,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.4,
                    flex: 1,
                  }}>
                    {card.sub}
                  </div>
                  <div style={{
                    marginTop: isMobile ? 6 : 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: isMobile ? 10 : 13,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: card.premium ? cyan : "rgba(255,255,255,0.6)",
                  }}>
                    {card.btn} <span style={{ fontSize: isMobile ? 12 : 15 }}>→</span>
                  </div>
                </Link>
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
                  color: cyan,
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

        {/* ══════ 2. BIO — About Steven ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
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
              <div style={{ ...label(purple), marginBottom: 10 }}>ABOUT ME</div>
              <div style={{ ...heading(isMobile ? 28 : 40), marginBottom: 20 }}>
                DJ, Producer &<br />
                <span style={{ color: cyan }}>Audio Engineer</span>
              </div>
              <div style={{ ...body, marginBottom: 16, color: "rgba(255,255,255,0.75)" }}>
                20+ years in electronic music. I produce, DJ, teach and master — all at label standard.
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8, marginTop: 20 }}>RELEASED ON</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Moblack Records · MTGD · Godeeva · Sony Music · Sony / Orianna · Redolent
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8 }}>2 BEATPORT TOP 10 TRACKS</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Jungle Walk — Godeeva · Fuego En Tus Ojos — Sony / Orianna
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8 }}>DJS SUPPORTING MY MUSIC</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Hugel · Claptone · ARTBAT · Hernan Cattaneo · Francis Mercier · Pauza · MESTIZA · DJ Chus · Joeski
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8 }}>PERFORMED AT</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Pacha Ibiza · Pacha Barcelona · Zamna Festival · Canary Islands · USA · Latin America · Europe
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8, marginTop: 16 }}>THE ANGELS DUO</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                Part of the Afro / Latin House duo{" "}
                <a href="https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz" target="_blank" rel="noreferrer" style={{ color: cyan, textDecoration: "none" }}>The Angels</a>
                {" "}— 15M+ streams ·{" "}
                <a href="https://www.beatport.com/artist/the-angels-il/913642" target="_blank" rel="noreferrer" style={{ color: cyan, textDecoration: "none" }}>Beatport</a>
              </div>

              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginTop: 4 }}>
                I teach what I know. I produce what you hear.
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 3. VIDEOS — "They play my music." ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 36), textAlign: "center", marginBottom: 8 }}>
              THEY PLAY <span style={{ background: `linear-gradient(90deg, ${cyan}, ${purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MY MUSIC.</span>
            </h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 40 }}>
              Original releases, productions and mastering — on the biggest stages.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {/* Hugel */}
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>HUGEL — LIVE SET</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Steven Angel's tracks supported by top DJs</div>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <LazyYouTube id="tPYhltoFTZo" title="Hugel Live Set" />
                </div>
              </div>

              {/* ARTBAT */}
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: cyan, marginBottom: 4 }}>ARTBAT — LIVE SET</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>La Cantadora</span> — Mastered by Steven Angel · Played by ARTBAT
                </div>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111" }}>
                  <video src="/artbat-video.mp4" controls playsInline preload="none" poster="/images/artbat-thumb.webp"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>

              {/* The Angels */}
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: purple, marginBottom: 4 }}>THE ANGELS — LIVE SUPPORT</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Steven Angel tracks supported live</div>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(187,134,252,0.2)" }}>
                  <video src="/the-angels-support-v2.mov" controls playsInline preload="none" poster="/images/angels-thumb.webp"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>

            {/* Hernan Cattaneo quote */}
            <div style={{ padding: isMobile ? "24px 20px" : "28px 40px", background: "linear-gradient(135deg, #08081a, #100a20)", border: "1px solid rgba(187,134,252,0.25)", borderLeft: "4px solid " + purple, borderRadius: 8, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: 24, marginBottom: 28 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1.4, fontStyle: "italic", marginBottom: 8 }}>
                  "Sounds really good!!"
                </div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: "0.05em" }}>HERNAN CATTANEO</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>Legendary DJ & Producer · On Steven Angel mastering work</div>
              </div>
              <div style={{ width: isMobile ? "100%" : 320, flexShrink: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(187,134,252,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <img src="/images/hernan-email.webp" alt="Email from Hernan Cattaneo saying Sounds really good" loading="lazy" width="320" height="240" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            </div>

            {/* Canary Islands live set */}
            <div>
              <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 16, textAlign: "center" }}>WATCH ME PLAY</div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(187,134,252,0.12)" }}>
                <LazyYouTube id="sPArmZafsX8" title="Steven Angel Live Set — Canary Islands" />
              </div>
            </div>
          </div>
        </section>

        {/* ══════ 3. MUSIC — "Listen to my work." ══════ */}
        <TrackPlayer />

        {/* ══════ 5. LESSON DEMO ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 24 : 36), textAlign: "center", marginBottom: 8 }}>
              A GLIMPSE OF HOW <span style={{ color: cyan }}>I TEACH.</span>
            </h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 32 }}>
              Watch a free sample lesson — then book your own session.
            </div>

            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,229,255,0.1)", marginBottom: 24 }}>
              <LazyYouTube id="SFzJhU6ZMOs" title="Steven Angel Free Lesson" />
            </div>

            <div style={{ textAlign: "center" }}>
              <Link to="/lessons" style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "15px 44px",
                borderRadius: 50,
                border: `2px solid ${cyan}`,
                color: cyan,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 0 28px rgba(0,229,255,0.4)",
              }}>
                See Full Lesson Packages &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════ 6. (moved to after hero) ══════ */}

        {/* ══════ 7. TESTIMONIALS ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label(purple), marginBottom: 12, textAlign: "center" }}>WHAT THEY SAY</div>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 12 }}>WHAT CLIENTS &amp; STUDENTS SAY</h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 40, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              From ghost production clients to students — real results.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
              {testimonials.map(({ n, f, t, g }) => (
                <div key={n} style={{
                  background: "#04040f",
                  border: "1px solid #141420",
                  borderTop: `2px solid ${cyan}`,
                  borderRadius: 10,
                  padding: isMobile ? "24px 20px" : "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  <div style={{ ...body, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                    "{t}"
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.05em" }}>{n}</div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{f}</div>
                    </div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      {g}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...body, textAlign: "center", marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
              (Testimonials shown are representative — real quotes will replace these soon.)
            </div>
          </div>
        </section>

      </main>

      {/* ══════ CONTACT ══════ */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...heading(isMobile ? 28 : 40), marginBottom: 12 }}>
            LET'S <span style={{ color: cyan }}>TALK.</span>
          </h2>
          <div style={{ ...body, marginBottom: 32, color: "rgba(255,255,255,0.65)" }}>
            Got a question or want to collaborate? Drop your details or message me on WhatsApp.
          </div>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/972523561353"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#1a7a42",
              color: "#fff",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "16px 32px",
              borderRadius: 50,
              textDecoration: "none",
              boxShadow: "0 0 32px rgba(37,211,102,0.4)",
              marginBottom: 32,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.882a.5.5 0 00.61.61l6.163-1.529A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.626 0 11.999 0zm.001 21.818a9.818 9.818 0 01-5.012-1.374l-.36-.214-3.724.924.942-3.626-.234-.373A9.818 9.818 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818S21.818 6.58 21.818 12c0 5.421-4.398 9.818-9.818 9.818z"/>
            </svg>
            WhatsApp Me
          </a>

          {/* Divider: OR */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, color: "rgba(255,255,255,0.3)", fontSize: 12, letterSpacing: "0.2em" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            OR
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Name + Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const data = Object.fromEntries(new FormData(form));
              const btn = form.querySelector("button");
              if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
              fetch("https://ghost-backend-production-adb6.up.railway.app/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: data.name, email: data.email, message: "Homepage contact form", source: "home-contact" }),
              })
                .then((r) => r.ok ? r.json() : Promise.reject(r))
                .then(() => {
                  if (btn) { btn.textContent = "Thanks! I'll be in touch."; btn.style.background = cyan; btn.style.color = "#000"; }
                  form.reset();
                })
                .catch(() => {
                  if (btn) { btn.disabled = false; btn.textContent = "Try Again"; }
                });
            }}
            style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420, margin: "0 auto" }}
          >
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              style={{ background: "#08080f", border: "1px solid #1a1a2e", borderRadius: 6, padding: "14px 16px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
            />
            <input
              name="email"
              type="email"
              placeholder="Your email"
              required
              style={{ background: "#08080f", border: "1px solid #1a1a2e", borderRadius: 6, padding: "14px 16px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
            />
            <button
              type="submit"
              style={{
                background: `linear-gradient(135deg, ${cyan}, #00b8d4)`,
                color: "#000",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "14px 28px",
                borderRadius: 50,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 28px rgba(0,229,255,0.5)",
                marginTop: 4,
              }}
            >
              Send
            </button>
          </form>
        </div>
      </section>

      {/* ══════ 8. FOOTER ══════ */}
      <footer style={{ padding: "28px 48px", borderTop: "1px solid #0d0d0d", textAlign: "center" }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
          Steven Angel — DJ · Producer · Mentor
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { label: "Ghost Production", to: "/ghost" },
            { label: "Lessons", to: "/lessons" },
            { label: "Shop", to: "/shop" },
            { label: "Instagram", href: "https://www.instagram.com/theangels_tlv/" },
            { label: "Spotify", href: "https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz" },
            { label: "Beatport", href: "https://www.beatport.com/artist/the-angels-il/913642" },
          ].map(({ label: lbl, to, href }) =>
            to ? (
              <Link key={lbl} to={to} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: cyan, textDecoration: "none" }}>{lbl}</Link>
            ) : (
              <a key={lbl} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{lbl}</a>
            )
          )}
        </div>
        <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          &copy; {new Date().getFullYear()} Steven Angel — All Rights Reserved
        </span>
      </footer>

    </div>
  );
}
