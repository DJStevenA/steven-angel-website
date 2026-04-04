import { useEffect, useState, Fragment } from "react";

/* ── image paths ── */
const PORTRAIT = "/images/portrait.jpg";
const OUTDOOR  = "/images/outdoor.jpg";
const STAGE    = "/images/stage.jpg";

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
  /* ── constants ── */
  const cyan   = "#00E5FF";
  const purple = "#BB86FC";

  /* ── state ── */
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

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

  const btn = (color, glow) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    padding: "15px 44px",
    borderRadius: 50,
    border: `2px solid ${color}`,
    color: color,
    textDecoration: "none",
    display: "inline-block",
    boxShadow: `0 0 28px ${glow}`,
    background: `${glow.replace("0.4", "0.04")}`,
  });

  const glowCyan   = "rgba(0,229,255,0.4)";
  const glowPurple = "rgba(187,134,252,0.4)";

  /* ── data ── */
  const outcomes = [
    "Make your tracks POWERFUL, punchy, and crystal clear",
    "Produce House and Techno tracks from scratch",
    "Get your music signed on the right labels",
    "Master mixing and mastering for a professional sound",
    "Create catchy arrangements, buildups, drops and intros",
    "Start and finish new tracks quickly and easily",
  ];

  const levels = [
    { t: "BEGINNER",     c: cyan,   d: "New to production — learn Ableton Live and EDM fundamentals from the ground up." },
    { t: "INTERMEDIATE", c: purple, d: "Already producing but want to level up your mixing, sound design and label-readiness." },
    { t: "ADVANCED",     c: cyan,   d: "Fill gaps in your workflow, explore new techniques, get fresh inspiration." },
  ];

  const pricing = [
    { dur: "1 HOUR",  price: "$120", ph: "$120 / hr", best: false, badge: null,           d: "Perfect for a focused deep-dive — sound design, mixing, arrangement, or workflow." },
    { dur: "3 HOURS", price: "$320", ph: "$107 / hr", best: true,  badge: "MOST POPULAR", d: "Build something from scratch and really get into it. Most popular for producers levelling up." },
    { dur: "6 HOURS", price: "$580", ph: "$97 / hr",  best: false, badge: "BEST VALUE",   d: "Full intensive — multiple tracks, complete workflow overhaul, or accelerated progression." },
  ];

  const ghostPackages = [
    { name: "Finish Your Demo",                     price: "Starting from $300",   badge: "BEST ENTRY POINT", d: "You started it — I finish it. Full arrangement polish, mix and master. Stems + NDA included." },
    { name: "Full Production",                      price: "Starting from $800",   badge: "MOST POPULAR",     d: "Full track from scratch in your genre. Afro House, Afro Latin House, or Indie Dance. Label-ready. 100% yours." },
    { name: "Full Production + Sample Vocals",      price: "Starting from $1,100", badge: null,               d: "Everything in Full Production + processed vocal samples or chops woven into the arrangement." },
    { name: "Full Original Song with Vocals",       price: "Starting from $1,500", badge: "MOST COMPLETE",    d: "Everything in Full Production + exclusive original topline, recorded, tuned and mixed. 100% yours." },
  ];

  const mixPackages = [
    { name: "Mastering Only",             price: "Starting from $80",  badge: null,           d: "Stereo file in — polished, loud, club-ready WAV + MP3 out." },
    { name: "Stem Mastering",             price: "Starting from $120", badge: null,           d: "Up to 8 stems for more control and a better final result." },
    { name: "Mix + Master",              price: "Starting from $200", badge: null,           d: "Send your stems — I mix and master from scratch. Ready for release." },
    { name: "Mix + Master + Feedback",   price: "Starting from $350", badge: "MOST POPULAR", d: "Everything in Mix + Master — plus a detailed breakdown of every decision I made." },
  ];

  const shopItems = [
    { name: "Afro House MasterClass", sub: "Full Video Course on Udemy", d: "Learn the exact production method behind Beatport Top 10 releases — from sound design to arrangement to mixdown.", cta: "Get the MasterClass →", url: "https://www.udemy.com/course/the-complete-afro-house-production-masterclass/?referralCode=D9C3A8FE510B4125A5CB" },
    { name: "Templates & Sample Packs", sub: "Instant Download", d: "Ableton templates & sample packs from actual label releases on Moblack and Sony — royalty free.", cta: "Browse the Shop →", url: "https://www.drop-edm.co.il/thedealer" },
  ];

  const testimonials = [
    { n: "Marco R.", f: "Italy",   t: "In 3 months with Steven I went from bedroom beats to getting signed. His cut-the-fat method is everything.", g: "Afro House" },
    { n: "DJ Kobi",  f: "Israel",  t: "The way Steven breaks down Ableton completely changed how I work. My workflow is 3x faster.", g: "Melodic Techno" },
    { n: "Sarah M.", f: "UK",      t: "After 6 lessons my tracks finally sound like they belong on a major label. Life changing.", g: "Deep House" },
    { n: "Niko V.",  f: "Germany", t: "Steven identifies exactly what is missing from a track. Best investment in my music career.", g: "Tech House" },
  ];

  const flags = { Italy: "\u{1F1EE}\u{1F1F9}", Israel: "\u{1F1EE}\u{1F1F1}", UK: "\u{1F1EC}\u{1F1E7}", Germany: "\u{1F1E9}\u{1F1EA}" };

  const ghostFAQ = [
    ["Do you offer afro house ghost production services?", "Yes — I specialize exclusively in Afro House, Afro Latin House and Indie Dance ghost production. Every track is built to the same standard as my MTGD and Moblack releases."],
    ["Can you finish my afro house demo?", "Absolutely. The Demo Finishing package is designed for artists who have a rough idea or demo and need a release-ready afro house track. I'll complete the arrangement, sound design, mix and master."],
    ["Is an NDA included?", "Yes — every package includes a ghost producer afro house NDA. Full copyright transfer and confidentiality agreement are part of every order."],
    ["What makes you different from ghost production marketplaces?", "You work directly with a signed afro house ghost producer whose releases have charted on Beatport Top 10. No anonymous producers, no templates — every track is built from scratch."],
    ["Can I release the track on any platform?", "Yes. All samples and sounds are 100% royalty-free and cleared for commercial release on Spotify, Beatport, Apple Music and all other major platforms worldwide."],
  ];

  const ghostSamples = [
    { genre: "Afro House", artists: "Keinmusic \u00B7 Black Coffee", tracks: [{ file: "/audio/maria-maria.mp3", title: "Maria Maria" }, { file: "/audio/afro-house-i-like-it.mp3", title: "I Like It" }, { file: "/audio/newa-afro-house.mp3", title: "Nawe" }] },
    { genre: "Afro Latin House", artists: "Hugel \u00B7 The Angels", tracks: [{ file: "/audio/tequila.mp3", title: "Tequila" }, { file: "/audio/la-chingada.mp3", title: "La Chingada" }, { file: "/audio/body-dancin-remix.mp3", title: "Body Dancin' (Afro Remix)" }] },
    { genre: "Afro Tech", artists: "Joezi \u00B7 Caiiro \u00B7 Ayno Nappa", tracks: [{ file: "/audio/nipate-moyo.mp3", title: "Nipate Moyo" }, { file: "/audio/mandala-remix.mp3", title: "Mandala (Remix)" }] },
    { genre: "Indie Dance", artists: "Adam Ten", tracks: [{ file: "/audio/indie-dance-disco-vibe.mp3", title: "Disco Vibe" }, { file: "/audio/indie-dance-hard.mp3", title: "Indie Dance Hard" }] },
    { genre: "Balkan House", artists: null, tracks: [{ file: "/audio/disko-spalvov.mp3", title: "Disko Spalvov" }, { file: "/audio/sagapo.mp3", title: "Sagapo" }] },
    { genre: "Tech House", artists: null, tracks: [{ file: "/audio/body-moving.mp3", title: "Body Moving" }] },
  ];

  /* ── shared "price confirmed" note ── */
  const priceNote = (
    <div style={{ textAlign: "center", marginTop: 16 }}>
      <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
        Final price confirmed after hearing your project
      </span>
    </div>
  );

  /* ═══════════════════════  RENDER  ═══════════════════════ */
  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, padding: "0 48px", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
          STEVEN <span style={{ color: cyan }}>ANGEL</span>
        </div>
        <div style={{ display: isMobile ? "none" : "flex", gap: 32, alignItems: "center" }}>
          {["About", "Lessons", "Mix", "Ghost", "Shop", "Contact"].map((link) => (
            <a key={link} href={"#" + link.toLowerCase()} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", lineHeight: 1 }}>{link}</a>
          ))}
        </div>
        <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1, border: "2px solid " + cyan, color: cyan, padding: "10px 22px", borderRadius: 3, textDecoration: "none", whiteSpace: "nowrap" }}>
          FREE INTRO CALL
        </a>
      </nav>

      {/* ── MAIN ── */}
      <main>

        {/* ── HERO ── */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", overflow: "hidden", padding: isMobile ? "0 16px" : "0 24px" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              src="/images/dj-hero.webp"
              alt="Steven Angel live"
              fetchPriority="high"
              width="1920"
              height="1080"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.35) saturate(1.2)" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,1) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,229,255,0.05) 0%, transparent 65%)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 10, maxWidth: 820 }}>
            {/* big name */}
            <div style={{ ...heading("clamp(64px,10vw,130px)"), marginBottom: 12, letterSpacing: "0.06em" }}>
              STEVEN <span style={{ color: cyan }}>ANGEL</span>
            </div>

            {/* gradient divider */}
            <div style={{ width: 80, height: 2, background: "linear-gradient(90deg," + cyan + "," + purple + ")", margin: "0 auto 20px" }} />

            <div style={{ ...label(), marginBottom: 24 }}>ABLETON MENTOR · GHOST PRODUCER · MIXING & MASTERING ENGINEER</div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ ...heading("clamp(42px,6.5vw,82px)") }}>LAST NIGHT HUGEL</div>
              <div style={{ ...heading("clamp(42px,6.5vw,82px)") }}>PLAYED MY TRACK —</div>
              <div style={{ ...heading("clamp(42px,6.5vw,82px)"), background: "linear-gradient(90deg," + cyan + "," + purple + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                LET ME SHOW YOU
              </div>
              <div style={{ ...heading("clamp(42px,6.5vw,82px)"), background: "linear-gradient(90deg," + cyan + "," + purple + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                HOW I MADE IT.
              </div>
            </div>

            <div style={{ ...body, maxWidth: 520, margin: "0 auto 48px", fontSize: 16 }}>
              I don't teach theory. I teach what gets tracks signed.
            </div>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="#lessons" style={btn(cyan, glowCyan)}>SEE LESSONS</a>
              <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={btn(purple, glowPurple)}>BOOK FREE INTRO</a>
              <a href="#ghost" style={btn("rgba(255,255,255,0.7)", "0 0 20px rgba(255,255,255,0.1)")}>ORDER GHOST PRODUCTION</a>
            </div>
          </div>
        </section>

        {/* ── CREDIBILITY / STATS BAR ── */}
        <div style={{ background: "#04040f", borderTop: "1px solid #0d0d18", borderBottom: "1px solid #0d0d18", padding: "28px 48px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            {/* Stats row */}
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24, marginBottom: 22 }}>
              {[["20+", "Years Experience"], ["100M+", "Streams & Views"], ["500+", "Students Worldwide"], ["Ableton Certified", "Trainer"], ["Top 10 Releases", "On Beatport"]].map(([value, sub]) => (
                <div key={value} style={{ textAlign: "center" }}>
                  <div style={{ ...heading(22), color: cyan }}>{value}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Supported by row */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>SUPPORTED BY</div>
              {["Hugel", "Claptone", "Hernan Cattaneo", "Roger Sanchez", "DJ Chus", "ARTBAT", "Oscar G", "PAUZA", "M\u00EBstiza"].map((name) => (
                <span key={name} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", padding: "5px 14px", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 20, color: "rgba(255,255,255,0.6)", background: "rgba(0,229,255,0.04)" }}>{name}</span>
              ))}
            </div>

            {/* Signed to row */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>SIGNED TO</div>
              {["Moblack", "Sony", "Ultra", "Armada", "Godeeva", "Spinn", "MTGD", "Redolent", "Made in Miami"].map((name) => (
                <span key={name} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.12em", padding: "3px 10px", border: "1px solid rgba(187,134,252,0.25)", borderRadius: 20, color: purple, background: "rgba(187,134,252,0.04)" }}>{name}</span>
              ))}
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.15em", padding: "4px 12px", color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>& more</span>
            </div>

            {/* Genres row */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>GENRES</div>
              {["Afro House", "Tech House", "Techno", "House", "Indie Dance"].map((genre) => (
                <span key={genre} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.15em", padding: "4px 12px", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 20, color: cyan, background: "rgba(0,229,255,0.04)" }}>{genre}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section id="about" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f" }}>
          {/* Bio + portrait */}
          <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 72, alignItems: "center", marginBottom: 60 }}>
            <div>
              <div style={{ ...label(), marginBottom: 14 }}>ABOUT STEVEN</div>
              <h2 style={{ ...heading(isMobile ? 28 : 44), marginBottom: 28 }}>
                20 YEARS. SONY.<br />MOBLACK. BEATPORT TOP 10.<br /><span style={{ color: cyan }}>NOW TEACHING.</span>
              </h2>
              <div style={{ ...body, marginBottom: 16 }}>
                Steven Angel is a DJ, Producer and Audio Engineer with over 20 years of experience. One half of the Afro-House duo <strong style={{ color: "#fff" }}>The Angels</strong>, and mastering engineer for the Swedish label HMWL.
              </div>
              <div style={{ ...body, marginBottom: 16 }}>
                Released on <strong style={{ color: "#fff" }}>Sony, Ultra, Armada, MoBlack, Godeeva, MTGD</strong> and more. Worked with <strong style={{ color: "#fff" }}>Hernan Cattaneo, SKAZI, Hugel, Floyd Levine</strong> and DJ Chus.
              </div>
              <div style={{ ...body }}>
                Gained over <span style={{ color: cyan, fontWeight: 600 }}>100M+ streams</span> worldwide. Teaching philosophy: <span style={{ color: cyan, fontWeight: 600 }}>Cut the Fat</span> — no theory overload, just what works on dancefloors.
              </div>
            </div>

            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(187,134,252,0.12)", order: isMobile ? -1 : 0 }}>
              <img
                src={PORTRAIT}
                alt="Steven Angel DJ producer Tel Aviv"
                loading="lazy"
                width="800"
                height="1000"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block", minHeight: isMobile ? 320 : 480 }}
              />
            </div>
          </div>

          {/* Watch me play */}
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 16, textAlign: "center" }}>WATCH ME PLAY</div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(187,134,252,0.12)" }}>
              <LazyYouTube id="sPArmZafsX8" title="Steven Angel Live Set" />
            </div>
          </div>
        </section>

        {/* ── LESSONS ── */}
        <section id="lessons" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label(purple), marginBottom: 10, textAlign: "center" }}>1-ON-1 ONLINE LESSONS</div>
            <h2 style={{ ...heading(isMobile ? 36 : 60), textAlign: "center", marginBottom: 16 }}>
              LEARN TO MAKE TRACKS<br />THAT GET SIGNED
            </h2>
            <div style={{ ...body, textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
              1-on-1 Ableton sessions in Afro House, Tech House, Techno, House & Indie Dance — from workflow and sound design to mixing and arrangement.
            </div>

            {/* What you will learn */}
            <div style={{ background: "#04040f", border: "1px solid rgba(0,229,255,0.1)", borderTop: "3px solid " + cyan, borderRadius: 8, padding: "36px 44px", marginBottom: 28 }}>
              <div style={{ ...label(), marginBottom: 22 }}>WHAT YOU WILL LEARN</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px 40px" }}>
                {outcomes.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 7, height: 7, background: cyan, borderRadius: "50%", flexShrink: 0, marginTop: 7, boxShadow: "0 0 8px " + cyan }} />
                    <div style={{ ...body, fontSize: 14 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Levels */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
              {levels.map(({ t, c, d }) => (
                <div key={t} style={{ padding: 28, background: "#04040f", border: "1px solid rgba(255,255,255,0.05)", borderTop: "3px solid " + c, borderRadius: 6 }}>
                  <div style={{ ...heading(14), color: c, marginBottom: 12 }}>{t}</div>
                  <div style={{ ...body, fontSize: 13 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div style={{ ...label(purple), textAlign: "center", marginBottom: 24 }}>PRICING</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, marginBottom: 8 }}>
              {pricing.map(({ dur, price, ph, best, badge, d }) => (
                <div key={dur} style={{ padding: 32, borderRadius: 8, position: "relative", background: best ? "linear-gradient(135deg,#0a0a20,#0d0418)" : "#04040f", border: best ? "2px solid " + cyan : "1px solid #141420", boxShadow: best ? "0 0 40px rgba(0,229,255,0.1)" : "none", display: "flex", flexDirection: "column" }}>
                  {badge && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg," + cyan + "," + purple + ")", color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>{badge}</div>
                  )}
                  <div style={{ ...label(best ? cyan : "rgba(255,255,255,0.35)"), marginBottom: 14 }}>{dur}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 64, lineHeight: 1, color: best ? "#fff" : "rgba(255,255,255,0.85)", marginBottom: 4 }}>{price}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: best ? cyan : "rgba(255,255,255,0.3)", marginBottom: 18 }}>{ph}</div>
                  <div style={{ ...body, fontSize: 13, marginBottom: 12, flexGrow: 1 }}>{d}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16, fontStyle: "italic" }}>Limited spots available each month</div>
                  <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 50, textDecoration: "none", border: "2px solid " + (best ? cyan : "rgba(255,255,255,0.2)"), color: best ? cyan : "rgba(255,255,255,0.45)", boxShadow: best ? "0 0 20px rgba(0,229,255,0.3)" : "none" }}>BOOK NOW</a>
                </div>
              ))}
            </div>
            {priceNote}

            {/* Free sample lessons */}
            <div style={{ marginTop: 48 }}>
              <div style={{ ...label(cyan), marginBottom: 16, textAlign: "center" }}>FREE SAMPLE LESSONS</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
                {[{ id: "SFzJhU6ZMOs" }, { id: "1MULJiBzwdU" }, { id: "-cV_T6vixvo" }].map(({ id }) => (
                  <div key={id} style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,229,255,0.1)" }}>
                    <LazyYouTube id={id} title="Steven Angel Free Lesson" />
                  </div>
                ))}
              </div>
            </div>

            {/* Ready CTA */}
            <div style={{ textAlign: "center", padding: "44px", background: "linear-gradient(135deg,#04040f,#0a0418)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 8, marginTop: 28 }}>
              <div style={{ ...heading(36), marginBottom: 24 }}>READY TO LEVEL UP YOUR SOUND?</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={btn(cyan, glowCyan)}>BOOK FREE INTRO CALL</a>
                <a href="https://wa.me/972523561353" target="_blank" rel="noreferrer" style={btn(purple, glowPurple)}>WHATSAPP ME</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── MIX & MASTERING ── */}
        <section id="mix" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 12, textAlign: "center" }}>PROFESSIONAL SERVICE</div>
            <h2 style={{ ...heading(isMobile ? 28 : 48), textAlign: "center", marginBottom: 10 }}>
              MIX & MASTERING THAT<br />SOUNDS LIKE A LABEL RELEASE
            </h2>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: isMobile ? 14 : 17, letterSpacing: "0.06em", color: cyan, textAlign: "center", marginBottom: 40 }}>
              Played by Hugel & Claptone · Signed to Sony, Moblack, Armada · Your track — same standard.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 16, marginBottom: 24 }}>
              {mixPackages.map(({ name, price, badge, d }) => (
                <div key={name} style={{ padding: "24px 28px", background: "#000", border: badge ? "1px solid rgba(0,229,255,0.2)" : "1px solid #141420", borderTop: badge ? "2px solid " + cyan : "1px solid #141420", borderRadius: 8, position: "relative" }}>
                  {badge && (
                    <div style={{ position: "absolute", top: -12, left: 24, background: "linear-gradient(90deg," + cyan + "," + purple + ")", color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", padding: "4px 14px", borderRadius: 20 }}>{badge}</div>
                  )}
                  <div style={{ ...heading(18), color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>{name}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 22, color: cyan, marginBottom: 8 }}>{price}</div>
                  <div style={{ ...body, fontSize: 13 }}>{d}</div>
                </div>
              ))}
            </div>
            {priceNote}

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <a href="https://wa.me/972523561353" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px 32px", borderRadius: 50, textDecoration: "none" }}>
                SEND ME YOUR TRACK →
              </a>
            </div>
          </div>
        </section>

        {/* ── GHOST PRODUCTION ── */}
        <section id="ghost" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 12, textAlign: "center" }}>GHOST PRODUCTION</div>
            <h1 style={{ ...heading(isMobile ? 26 : 44), textAlign: "center", marginBottom: 10 }}>
              Ghost Production by a Signed Afro House Artist
            </h1>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: isMobile ? 14 : 17, letterSpacing: "0.06em", color: cyan, textAlign: "center", marginBottom: 16 }}>
              Specializing in Afro House Ghost Production, Afro Latin House & Indie Dance
            </div>
            <div style={{ ...body, textAlign: "center", maxWidth: 620, margin: "0 auto 40px" }}>
              Hire an afro house ghost producer with verified label releases on MTGD, Moblack & Godeeva. Unlike anonymous marketplaces, you work directly with a named artist. Every track includes stems, MIDI files, and full copyright transfer. NDA included.
            </div>

            {/* Ghost packages */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
              {ghostPackages.map(({ name, price, badge, d }) => (
                <div key={name} style={{ padding: "24px 28px", background: "#04040f", border: badge ? "1px solid rgba(187,134,252,0.2)" : "1px solid #141420", borderTop: badge ? "2px solid " + purple : "1px solid #141420", borderRadius: 8, position: "relative" }}>
                  {badge && (
                    <div style={{ position: "absolute", top: -12, left: 24, background: "linear-gradient(90deg," + purple + "," + cyan + ")", color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", padding: "4px 14px", borderRadius: 20 }}>{badge}</div>
                  )}
                  <div style={{ ...heading(20), color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>{name}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 22, color: purple, marginBottom: 8 }}>{price}</div>
                  <div style={{ ...body, fontSize: 13 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* Ghost disclaimer */}
            <div style={{ padding: "20px 28px", background: "#04040f", border: "1px solid rgba(187,134,252,0.15)", borderRadius: 8, marginBottom: 28 }}>
              <div style={{ ...body, fontSize: 13, fontStyle: "italic", textAlign: "center" }}>
                Every ghost produced track is built in the same standard as my original releases on the biggest labels. Full copyright transfer + NDA included in all packages.
              </div>
            </div>

            {/* Audio samples */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ ...label(cyan), marginBottom: 16, textAlign: "center" }}>LISTEN TO SAMPLES</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
                {ghostSamples.map(({ genre, artists, tracks }) => (
                  <div key={genre} style={{ background: "#04040f", border: "1px solid #141420", borderTop: "2px solid " + (tracks.length ? purple : "rgba(255,255,255,0.08)"), borderRadius: 8, padding: "18px 20px" }}>
                    <div style={{ ...label(tracks.length ? purple : "rgba(255,255,255,0.25)"), marginBottom: 4 }}>{genre}</div>
                    {artists && <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>{artists}</div>}
                    {tracks.length > 0 ? tracks.map(({ file, title }) => (
                      <div key={file} style={{ marginBottom: 10 }}>
                        <div style={{ ...heading(13), color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>{title}</div>
                        <audio controls preload="none" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} style={{ width: "100%", accentColor: cyan }}>
                          <source src={file} type="audio/mpeg" />
                        </audio>
                      </div>
                    )) : (
                      <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", fontStyle: "italic", marginTop: 8 }}>Sample coming soon</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {priceNote}

            {/* FAQ */}
            <div style={{ marginTop: 40, marginBottom: 28 }}>
              <div style={{ ...label(cyan), marginBottom: 20, textAlign: "center" }}>FAQ</div>
              {ghostFAQ.map(([question, answer]) => (
                <div key={question} style={{ borderBottom: "1px solid #141420", paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 6 }}>{question}</div>
                  <div style={{ ...body, fontSize: 13 }}>{answer}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="https://wa.me/972523561353" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px 32px", borderRadius: 50, textDecoration: "none" }}>
                WHATSAPP ME YOUR REFERENCE TRACK →
              </a>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF / VIDEOS ── */}
        <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...heading(isMobile ? 28 : 36), textAlign: "center", marginBottom: 8 }}>ORIGINAL RELEASES · PRODUCTIONS · MIX & MASTERING</div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 28 : 36, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", color: cyan, margin: "0 auto 40px" }}>PLAYED BY THE BIG DOGS</div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {/* Hugel */}
              <div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>HUGEL — LIVE SET</div>
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
                  <video
                    src="/artbat-video.mp4"
                    controls
                    playsInline
                    preload="none"
                    poster="/images/artbat-thumb.webp"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* The Angels */}
              <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: purple, marginBottom: 4 }}>THE ANGELS — LIVE SUPPORT</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Steven Angel tracks supported live</div>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(187,134,252,0.2)" }}>
                  <video
                    src="/the-angels-support-v2.mov"
                    controls
                    playsInline
                    preload="none"
                    poster="/images/angels-thumb.webp"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>

            {/* Hernan Cattaneo quote */}
            <div style={{ padding: isMobile ? "24px 20px" : "28px 40px", background: "linear-gradient(135deg, #08081a, #100a20)", border: "1px solid rgba(187,134,252,0.25)", borderLeft: "4px solid " + purple, borderRadius: 8, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1.4, fontStyle: "italic", marginBottom: 8 }}>
                  "Sounds really good!!"
                </div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: "0.05em" }}>HERNAN CATTANEO</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Legendary DJ & Producer · On Steven Angel mastering work</div>
              </div>
              <div style={{ width: isMobile ? "100%" : 320, flexShrink: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(187,134,252,0.2)", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <img
                  src="/images/hernan-email.webp"
                  alt="Email from Hernan Cattaneo saying Sounds really good"
                  loading="lazy"
                  width="320"
                  height="240"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── SHOP ── */}
        <section id="shop" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label(cyan), marginBottom: 12, textAlign: "center" }}>INSTANT DOWNLOAD</div>
            <h2 style={{ ...heading(isMobile ? 28 : 48), textAlign: "center", marginBottom: 10 }}>
              THE TOOLS I USE TO MAKE<br />TRACKS THAT GET SIGNED
            </h2>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: isMobile ? 13 : 16, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 40 }}>
              Ableton Templates · Sample Packs · Video Course — Instant Download
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 16 }}>
              {shopItems.map(({ name, sub, d, cta, url }) => (
                <div key={name} style={{ padding: "28px 32px", background: "#04040f", border: "1px solid #141420", borderRadius: 8, display: "flex", flexDirection: "column" }}>
                  <div style={{ ...heading(20), color: "#fff", marginBottom: sub ? 4 : 8 }}>{name}</div>
                  {sub && <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{sub}</div>}
                  <div style={{ ...body, fontSize: 13, marginBottom: 16, flexGrow: 1 }}>{d}</div>
                  <a href={url} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 50, textDecoration: "none", border: "2px solid " + cyan, color: cyan, boxShadow: "0 0 16px rgba(0,229,255,0.2)" }}>{cta}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ ...label(), marginBottom: 10, textAlign: "center" }}>STUDENT RESULTS</div>
            <h2 style={{ ...heading(isMobile ? 36 : 60), textAlign: "center", marginBottom: 40 }}>
              STUDENTS. CLIENTS.<br />REAL RESULTS.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 20 }}>
              {testimonials.map(({ n, f, t, g }) => (
                <div key={n} style={{ padding: 32, background: "#000", border: "1px solid #141420", borderRadius: 6 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                    {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ color: cyan, fontSize: 14 }}>★</span>)}
                  </div>
                  <div style={{ ...body, marginBottom: 18, fontStyle: "italic", fontSize: 14 }}>{t}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ ...heading(16) }}>{n}</div>
                      <div style={{ ...body, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{flags[f]} {f}</div>
                    </div>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, padding: "5px 12px", border: "1px solid rgba(187,134,252,0.3)", borderRadius: 20, fontSize: 11, color: purple, letterSpacing: "0.15em" }}>{g}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section style={{ padding: "60px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
              <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", gridColumn: "1 / -1" }}>
                <img src={OUTDOOR} alt="Steven Angel performing live" loading="lazy" width="800" height="600" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
                <img src={PORTRAIT} alt="Steven Angel Afro House Ghost Producer — Moblack, MTGD, Godeeva" loading="lazy" width="800" height="1000" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
                <img src={STAGE} alt="Steven Angel Beatport Top 10 producer Afro House" loading="lazy" width="800" height="600" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <div style={{ ...label(purple), marginBottom: 12 }}>GET IN TOUCH</div>
            <h2 style={{ ...heading(72), marginBottom: 12 }}>READY?<br />LET'S MAKE<br />SOMETHING.</h2>
            <div style={{ ...body, marginBottom: 44 }}>Send me your demo — I'll tell you exactly what's missing.</div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const data = Object.fromEntries(new FormData(form));
                data.source = "homepage";
                fetch("https://ghost-backend-production-adb6.up.railway.app/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                })
                  .then((r) => r.json())
                  .then((d) => { if (d.success) { alert("Message sent! I'll get back to you soon."); form.reset(); } else { alert("Something went wrong. Please try again."); } })
                  .catch(() => alert("Something went wrong. Please try again."));
              }}
              style={{ textAlign: "left" }}
            >
              <input type="hidden" name="form-name" value="homepage-contact" />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input name="name" placeholder="Your Name" required style={{ fontFamily: "DM Sans, sans-serif", background: "#04040f", border: "1px solid #1a1a2e", color: "#fff", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4 }} />
                <input name="email" type="email" placeholder="Email Address" required style={{ fontFamily: "DM Sans, sans-serif", background: "#04040f", border: "1px solid #1a1a2e", color: "#fff", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4 }} />
              </div>
              <select name="service" aria-label="Service" style={{ fontFamily: "DM Sans, sans-serif", width: "100%", background: "#04040f", border: "1px solid #1a1a2e", color: "rgba(255,255,255,0.4)", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4, marginBottom: 12 }}>
                <option value="">I am interested in...</option>
                <option>1-on-1 Production Lessons</option>
                <option>Ghost Production</option>
                <option>Mix & Mastering</option>
              </select>
              <textarea name="message" placeholder="Tell me about your music and what you want to achieve..." rows={4} style={{ fontFamily: "DM Sans, sans-serif", width: "100%", background: "#04040f", border: "1px solid #1a1a2e", color: "#fff", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4, marginBottom: 16, resize: "vertical", boxSizing: "border-box" }} />
              <button type="submit" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, letterSpacing: "0.25em", width: "100%", padding: "18px", background: "linear-gradient(90deg," + cyan + "," + purple + ")", border: "none", color: "#000", fontSize: 16, textTransform: "uppercase", cursor: "pointer", borderRadius: 4, marginBottom: 24 }}>
                SEND MESSAGE
              </button>
            </form>

            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              {[["INSTAGRAM", "https://www.instagram.com/theangels_tlv/"], ["SOUNDCLOUD", "https://soundcloud.com/theangelsoflove"], ["WHATSAPP", "https://wa.me/972523561353"]].map(([lbl, href]) => (
                <a key={lbl} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{lbl}</a>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "22px 48px", borderTop: "1px solid #0d0d0d", textAlign: "center" }}>
        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.3em" }}>
          {new Date().getFullYear()} STEVEN ANGEL — ALL RIGHTS RESERVED  ·  Afro House Ghost Producer | MTGD · Moblack · Godeeva | Worldwide
        </span>
      </footer>


    </div>
  );
}
