import { useEffect, useState } from "react";
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
    { n: "Marco R.", f: "Italy",   t: "In 3 months with Steven I went from bedroom beats to getting signed. His cut-the-fat method is everything.", g: "Afro House" },
    { n: "DJ Kobi",  f: "Israel",  t: "The way Steven breaks down Ableton completely changed how I work. My workflow is 3x faster.", g: "Melodic Techno" },
    { n: "Sarah M.", f: "UK",      t: "After 6 lessons my tracks finally sound like they belong on a major label. Life changing.", g: "Deep House" },
    { n: "Niko V.",  f: "Germany", t: "Steven identifies exactly what is missing from a track. Best investment in my music career.", g: "Tech House" },
  ];

  const flags = { Italy: "\u{1F1EE}\u{1F1F9}", Israel: "\u{1F1EE}\u{1F1F1}", UK: "\u{1F1EC}\u{1F1E7}", Germany: "\u{1F1E9}\u{1F1EA}" };

  const audioTracks = [
    { file: "/audio/maria-maria.mp3", title: "Maria Maria", genre: "Afro House" },
    { file: "/audio/tequila.mp3", title: "Tequila", genre: "Afro Latin House" },
    { file: "/audio/body-moving.mp3", title: "Body Moving", genre: "Tech House" },
    { file: "/audio/indie-dance-disco-vibe.mp3", title: "Disco Vibe", genre: "Indie Dance" },
  ];

  /* ═══════════════════════  RENDER  ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, padding: "0 48px", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
          STEVEN <span style={{ color: cyan }}>ANGEL</span>
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
        <Link to="/ghost" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1, border: "2px solid " + cyan, color: cyan, padding: "10px 22px", borderRadius: 3, textDecoration: "none", whiteSpace: "nowrap" }}>
          WORK WITH ME
        </Link>
      </nav>

      <main>

        {/* ══════ 1. HERO ══════ */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", overflow: "hidden", padding: isMobile ? "0 16px" : "0 24px" }}>
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

            <h1 style={{ ...heading("clamp(64px,10vw,130px)"), marginBottom: 12, letterSpacing: "0.06em", background: `linear-gradient(90deg, ${cyan}, ${purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              STEVEN ANGEL
            </h1>

            <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${cyan}, ${purple})`, margin: "0 auto 20px" }} />

            <h2 style={{ ...heading(isMobile ? 24 : 36), marginBottom: 20, color: "rgba(255,255,255,0.85)" }}>
              Afro House · Tech House · Indie Dance
            </h2>

            <div style={{ ...body, fontSize: 16, maxWidth: 520, margin: "0 auto", color: "rgba(255,255,255,0.5)" }}>
              Played by Hugel & Claptone at Pacha Ibiza
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
                Moblack Records · MTGD (Hugel's label) · Godeeva · Sony Music
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8 }}>PLAYED BY</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Hugel · Claptone · ARTBAT · Hernan Cattaneo · Francis Mercier · DJ Chus · Joeski
              </div>

              <div style={{ ...label(cyan), fontSize: 10, marginBottom: 8 }}>PERFORMED AT</div>
              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Pacha Ibiza · Pacha Barcelona · Zamna Festival · Canary Islands · USA · Latin America · Europe
              </div>

              <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.55)", fontStyle: "italic", marginTop: 8 }}>
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

        {/* ══════ 3. MUSIC — "My releases." ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 36), textAlign: "center", marginBottom: 8 }}>
              MY <span style={{ color: cyan }}>RELEASES.</span>
            </h2>
            <div style={{ ...body, textAlign: "center", marginBottom: 32 }}>
              Original releases on MTGD, Moblack, Godeeva and more.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              {audioTracks.map(({ file, title, genre }) => (
                <div key={file} style={{ background: "#04040f", border: "1px solid #141420", borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ ...label(cyan), fontSize: 10, marginBottom: 4 }}>{genre}</div>
                  <div style={{ ...heading(15), color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>{title}</div>
                  <audio controls preload="none" controlsList="nodownload" style={{ width: "100%", accentColor: cyan }}>
                    <source src={file} type="audio/mpeg" />
                  </audio>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════ 4. SERVICES — "Work with me." ══════ */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 40 }}>
              WORK WITH <span style={{ background: `linear-gradient(90deg, ${cyan}, ${purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ME.</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
              {[
                { title: "Ghost Production", line: "I produce your track. You own it.", to: "/ghost", accent: cyan },
                { title: "1-on-1 Lessons", line: "Learn the system I used to get signed.", to: "/lessons", accent: purple },
                { title: "Templates & Courses", line: "Download and start building today.", to: "/shop", accent: cyan },
              ].map(({ title, line, to, accent }) => (
                <Link key={to} to={to} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: "#000",
                    border: `1px solid ${accent}33`,
                    borderTop: `2px solid ${accent}`,
                    borderRadius: 10,
                    padding: isMobile ? "28px 20px" : "36px 28px",
                    textAlign: "center",
                    transition: "box-shadow 0.3s",
                  }}>
                    <div style={{ ...heading(isMobile ? 20 : 24), color: accent, marginBottom: 12 }}>{title}</div>
                    <div style={{ ...body, fontSize: 14, marginBottom: 20 }}>{line}</div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: accent,
                    }}>
                      {to === "/ghost" ? "See How It Works" : to === "/lessons" ? "See Packages" : "Visit the Shop"} &rarr;
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
            <h2 style={{ ...heading(isMobile ? 28 : 44), textAlign: "center", marginBottom: 40 }}>STUDENTS &amp; CLIENTS</h2>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 16 }}>
              {testimonials.map(({ n, f, t, g }) => (
                <div key={n} style={{ background: "#04040f", border: "1px solid #141420", borderRadius: 8, padding: "24px 24px" }}>
                  <div style={{ ...body, fontSize: 14, fontStyle: "italic", marginBottom: 14, color: "rgba(255,255,255,0.7)" }}>"{t}"</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{n}</div>
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{flags[f] || ""} {f} · {g}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

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
