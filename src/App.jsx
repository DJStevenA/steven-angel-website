import { useEffect, useState } from "react";

const PORTRAIT = "https://placehold.co/600x400/1a1a2e/00E5FF?text=PORTRAIT";
const OUTDOOR = "https://placehold.co/1200x675/0a0a20/BB86FC?text=OUTDOOR";
const STAGE = "https://placehold.co/1200x675/05050D/00E5FF?text=STAGE";

export default function StevenAngel() {
  const C = "#00E5FF";
  const P = "#BB86FC";
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTab, setPlayerTab] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  const H = (s) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1.0,
    letterSpacing: "0.02em",
    fontSize: s,
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
    color: color || C,
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

  const glowC = "rgba(0,229,255,0.4)";
  const glowP = "rgba(187,134,252,0.4)";

  const outcomes = [
    "Make your tracks POWERFUL, punchy, and crystal clear",
    "Produce EDM, House and Techno tracks from scratch",
    "Get your music signed on the right labels",
    "Master mixing and mastering for a professional sound",
    "Create catchy arrangements, buildups, drops and intros",
    "Start and finish new tracks quickly and easily",
  ];

  const levels = [
    { t: "BEGINNER", c: C, d: "New to production — learn Ableton Live and EDM fundamentals from the ground up." },
    { t: "INTERMEDIATE", c: P, d: "Already producing but want to level up your mixing, sound design and label-readiness." },
    { t: "ADVANCED", c: C, d: "Fill gaps in your workflow, explore new techniques, get fresh inspiration." },
  ];

  const pricing = [
    { dur: "1 HOUR", price: "$85", ph: "$85 / hr", best: false, badge: null, d: "Perfect for a focused deep-dive on one topic — sound design, mixing, arrangement or workflow." },
    { dur: "2 HOURS", price: "$150", ph: "$75 / hr", best: true, badge: null, d: "The most popular choice. Enough time to build something from scratch and really get into it." },
    { dur: "4 HOURS", price: "$275", ph: "$68.75 / hr", best: false, badge: "BEST VALUE", d: "Full intensive session — ideal for tackling a complete track from start to finish." },
  ];

  const genres = [
    ["Melodic Techno", "Artbat, Anyma Style", null],
    ["Afro House", "Keinemusik, Black Coffee Style", null],
    ["Afro Tech", "Joezi, Caiiro, Enoo Napa Style", null],
    ["Latin Afro House", "Hugel, The Angels Style", "/audio/tequila.mp3"],
    ["Tech House", "Mau P, John Summit Style", null],
    ["House", "Purple Disco Machine Style", null],
    ["Hard Techno", "Drumcode, Amelie Lens Style", null],
    ["Indie Dance", "Bicep, Adam Ten, Folamour Style", null],
    ["Tribal / Deep Tech", "Bonton, Hernan Cattaneo Style", null],
    ["Balkan / Arab House", "Acid Arab, Groosamodo, Zafrir Style", ["/audio/sagapo.mp3", "/audio/disko-spalvov.mp3"]],
  ];

  const testimonials = [
    { n: "Marco R.", f: "Italy", t: "In 3 months with Steven I went from bedroom beats to getting signed. His cut-the-fat method is everything.", g: "Afro House" },
    { n: "DJ Kobi", f: "Israel", t: "The way Steven breaks down Ableton completely changed how I work. My workflow is 3x faster.", g: "Melodic Techno" },
    { n: "Sarah M.", f: "UK", t: "After 6 lessons my tracks finally sound like they belong on a major label. Life changing.", g: "Deep House" },
    { n: "Niko V.", f: "Germany", t: "Steven identifies exactly what is missing from a track. Best investment in my music career.", g: "Tech House" },
  ];

  const flags = { Italy: "🇮🇹", Israel: "🇮🇱", UK: "🇬🇧", Germany: "🇩🇪" };

  const clipL = [
    [C, C, null, C, C, null],
    [null, P, P, null, P, P],
    [C, null, C, C, null, C],
    [null, "#FFE66D", null, "#FFE66D", "#FFE66D", null],
    [P, null, P, null, null, P],
    ["#4ECDC4", "#4ECDC4", null, "#4ECDC4", null, "#4ECDC4"],
    [null, C, null, null, C, C],
    ["#FF6B6B", null, "#FF6B6B", "#FF6B6B", null, null],
  ];

  const clipR = [
    [P, null, P, null, P, null],
    [C, C, null, C, null, C],
    [null, "#FF6B6B", "#FF6B6B", null, "#FF6B6B", null],
    ["#FFE66D", null, "#FFE66D", null, null, "#FFE66D"],
    [null, C, null, C, C, null],
    [P, P, null, null, P, null],
    [null, null, "#4ECDC4", null, "#4ECDC4", "#4ECDC4"],
    [C, null, C, null, C, null],
  ];

  return (
    <div style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", height: 64, padding: "0 48px", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
          STEVEN <span style={{ color: C }}>ANGEL</span>
        </div>
        <div style={{ display: isMobile ? "none" : "flex", gap: 32, alignItems: "center" }}>
          {["About", "Lessons", "Ghost", "Contact"].map(l => (
            <a key={l} href={"#" + l.toLowerCase()} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none", lineHeight: 1 }}>{l}</a>
          ))}
        </div>
        <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1, border: "2px solid " + C, color: C, padding: "10px 22px", borderRadius: 3, textDecoration: "none", whiteSpace: "nowrap" }}>
          FREE INTRO CALL
        </a>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", overflow: "hidden", padding: isMobile ? "0 16px" : "0 24px" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img src="https://placehold.co/1333x2000/001a00/00E5FF?text=DJ+HERO+PHOTO" alt="Steven Angel live" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.35) saturate(1.2)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,1) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(0,229,255,0.05) 0%, transparent 65%)" }} />
        </div>

        <div style={{ position: "absolute", left: 0, top: "8%", width: "25%", opacity: 0.12, transform: "perspective(600px) rotateY(22deg)", transformOrigin: "left center" }}>
          {clipL.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 3, marginBottom: 5 }}>
              {row.map((cl, j) => <div key={j} style={{ flex: 1, height: 14, background: cl || "#0d0d0d", borderRadius: 2 }} />)}
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", right: 0, top: "8%", width: "25%", opacity: 0.12, transform: "perspective(600px) rotateY(-22deg)", transformOrigin: "right center" }}>
          {clipR.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 3, marginBottom: 5 }}>
              {row.map((cl, j) => <div key={j} style={{ flex: 1, height: 14, background: cl || "#0d0d0d", borderRadius: 2 }} />)}
            </div>
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 820 }}>
          <div style={{ ...H("clamp(64px,10vw,130px)"), marginBottom: 12, letterSpacing: "0.06em" }}>
            STEVEN <span style={{ color: C }}>ANGEL</span>
          </div>
          <div style={{ width: 80, height: 2, background: "linear-gradient(90deg," + C + "," + P + ")", margin: "0 auto 20px" }} />
          <div style={{ ...label(), marginBottom: 24 }}>ABLETON MENTOR · GHOST PRODUCER · MIXING & MASTERING ENGINEER</div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...H("clamp(42px,6.5vw,82px)") }}>LAST NIGHT HUGEL</div>
            <div style={{ ...H("clamp(42px,6.5vw,82px)") }}>PLAYED MY TRACK —</div>
            <div style={{ ...H("clamp(42px,6.5vw,82px)"), background: "linear-gradient(90deg," + C + "," + P + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              LET ME SHOW YOU
            </div>
            <div style={{ ...H("clamp(42px,6.5vw,82px)"), background: "linear-gradient(90deg," + C + "," + P + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              HOW I MADE IT.
            </div>
          </div>
          <div style={{ ...body, maxWidth: 520, margin: "0 auto 48px", fontSize: 16 }}>
            Helping Artists Shape Their Sound and Learn the Art of EDM Production
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#lessons" style={btn(C, glowC)}>SEE LESSONS</a>
            <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={btn(P, glowP)}>BOOK FREE INTRO</a>
            <a href="#ghost" style={btn("rgba(255,255,255,0.7)", "0 0 20px rgba(255,255,255,0.1)")}>ORDER GHOST PRODUCTION</a>
          </div>
        </div>
      </section>

      {/* CREDIBILITY BAR */}
      <div style={{ background: "#04040f", borderTop: "1px solid #0d0d18", borderBottom: "1px solid #0d0d18", padding: "28px 48px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24, marginBottom: 22 }}>
            {[["20+", "Years Experience"], ["100M+", "Streams & Views"], ["500+", "Students Worldwide"], ["Ableton Certified", "Trainer"], ["Top 10 Releases", "On Beatport"]].map(([v, s]) => (
              <div key={v} style={{ textAlign: "center" }}>
                <div style={{ ...H(22), color: C }}>{v}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>SUPPORTED BY</div>
            {["Hugel", "Claptone", "Hernan Cattaneo", "Roger Sanchez", "DJ Chus", "ARTBAT", "Oscar G", "PAUZA", "Mëstiza"].map(name => (
              <span key={name} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.15em", padding: "5px 14px", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 20, color: "rgba(255,255,255,0.6)", background: "rgba(0,229,255,0.04)" }}>{name}</span>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>SIGNED TO</div>
            {["Moblack", "Sony", "Ultra", "Armada", "Godeeva", "Spinn", "MTGD", "Redolent", "Made in Miami"].map(lbl => (
              <span key={lbl} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.12em", padding: "3px 10px", border: "1px solid rgba(187,134,252,0.25)", borderRadius: 20, color: P, background: "rgba(187,134,252,0.04)" }}>{lbl}</span>
            ))}
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.15em", padding: "4px 12px", color: "rgba(255,255,255,0.25)", alignSelf: "center" }}>& more</span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, marginTop: 14, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginRight: 8, alignSelf: "center" }}>GENRES</div>
            {["Afro House", "Tech House", "Techno", "House", "Indie Dance"].map(g => (
              <span key={g} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.15em", padding: "4px 12px", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 20, color: C, background: "rgba(0,229,255,0.04)" }}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AS HEARD BY */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.0, fontSize: isMobile ? 28 : 36, textAlign: "center", marginBottom: 8 }}>
            ORIGINAL RELEASES · PRODUCTIONS · MIX & MASTERING
          </div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 28 : 36, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", color: C, margin: "0 auto 40px" }}>
            PLAYED BY THE BIG DOGS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20, marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>HUGEL — LIVE SET</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Steven Angel's tracks supported by top DJs</div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                <iframe src="https://www.youtube.com/embed/tPYhltoFTZo" title="Hugel" allowFullScreen={true} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: C, marginBottom: 4 }}>ARTBAT — LIVE SET</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>La Cantadora</span> — Mastered by Steven Angel · Played by ARTBAT
              </div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#111" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, letterSpacing: "0.2em" }}>ARTBAT.MP4 — LOADS ON LIVE SITE</div>
              </div>
            </div>
            <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: P, marginBottom: 4 }}>SUPPORT VIDEO — COMING SOON</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Add your video link here</div>
              <div style={{ position: "relative", paddingBottom: isMobile ? "56.25%" : "28%", height: 0, borderRadius: 8, overflow: "hidden", border: "2px dashed rgba(187,134,252,0.25)", background: "rgba(187,134,252,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.2em", color: "rgba(187,134,252,0.4)" }}>▶ PLACEHOLDER</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Claptone / Hernan Cattaneo / other support video</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hernan Cattaneo quote */}
          <div style={{ padding: "28px 40px", background: "linear-gradient(135deg, #08081a, #100a20)", border: "1px solid rgba(187,134,252,0.25)", borderLeft: "4px solid " + P, borderRadius: 8, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg," + P + "," + C + ")", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, color: "#000", flexShrink: 0 }}>HC</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1.4, fontStyle: "italic", marginBottom: 8 }}>"Sounds really good!!"</div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: "0.05em" }}>HERNAN CATTANEO</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Legendary DJ & Producer · On Steven Angel mastering work</div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 72, alignItems: "center" }}>
          <div>
            <div style={{ ...label(), marginBottom: 14 }}>ABOUT STEVEN</div>
            <div style={{ ...H(isMobile ? 28 : 44), marginBottom: 28 }}>20 YEARS. SONY.<br />MOBLACK. BEATPORT TOP 10.<br /><span style={{ color: C }}>NOW TEACHING.</span></div>
            <div style={{ ...body, marginBottom: 16 }}>
              Steven Angel is a DJ, Producer and Audio Engineer with over 20 years of experience. One half of the Afro-House duo <strong style={{ color: "#fff" }}>The Angels</strong>, and mastering engineer for the Swedish label HMWL.
            </div>
            <div style={{ ...body, marginBottom: 16 }}>
              Released on <strong style={{ color: "#fff" }}>Sony, Ultra, Armada, MoBlack, Godeeva, MTGD</strong> and more. Worked with <strong style={{ color: "#fff" }}>Hernan Cattaneo, SKAZI, Hugel, Floyd Levine</strong> and DJ Chus.
            </div>
            <div style={{ ...body, marginBottom: 0 }}>
              Gained over <span style={{ color: C, fontWeight: 600 }}>100M+ streams</span> worldwide. Teaching philosophy: <span style={{ color: C, fontWeight: 600 }}>Cut the Fat</span> — no theory overload, just what works on dancefloors.
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg,#0a0a20,#130a1e)", border: "1px solid rgba(187,134,252,0.12)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
              <img src={PORTRAIT} alt="Steven Angel" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #0a0a20 100%)" }} />
            </div>
            <div style={{ padding: "28px 32px 32px" }}>
              <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 20 }}>RELEASED ON</div>
              {["Sony Music", "Ultra Records", "MoBlack Records", "Armada Music", "Godeeva", "MTGD", "SPINN Records"].map(name => (
                <div key={name} style={{ padding: "11px 0", borderBottom: "1px solid #0d0d18" }}>
                  <span style={{ ...H(17), color: "rgba(255,255,255,0.75)" }}>{name}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #0d0d18" }}>
                <div style={{ ...label("rgba(255,255,255,0.2)"), marginBottom: 12 }}>SUPPORTED BY</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {["Hugel", "Claptone", "Roger Sanchez", "DJ Chus", "Hernan Cattaneo", "Floyd Levine"].map(a => (
                    <span key={a} style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "4px 9px" }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LESSONS */}
      <section id="lessons" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ ...label(P), marginBottom: 10, textAlign: "center" }}>1-ON-1 ONLINE LESSONS</div>
          <div style={{ ...H(isMobile ? 36 : 60), textAlign: "center", marginBottom: 16 }}>LEARN TO MAKE TRACKS<br />THAT GET SIGNED</div>
          <div style={{ fontFamily: "DM Sans, sans-serif", lineHeight: 1.8, color: "rgba(255,255,255,0.58)", fontSize: 15, textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            1-on-1 Ableton sessions in Afro House, Tech House, Techno, House & Indie Dance — from workflow and sound design to mixing and arrangement.
          </div>
          <div style={{ background: "#04040f", border: "1px solid rgba(0,229,255,0.1)", borderTop: "3px solid " + C, borderRadius: 8, padding: "36px 44px", marginBottom: 28 }}>
            <div style={{ ...label(), marginBottom: 22 }}>WHAT YOU WILL LEARN</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px 40px" }}>
              {outcomes.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 7, height: 7, background: C, borderRadius: "50%", flexShrink: 0, marginTop: 7, boxShadow: "0 0 8px " + C }} />
                  <div style={{ ...body, fontSize: 14 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
            {levels.map(({ t, c, d }) => (
              <div key={t} style={{ padding: 28, background: "#04040f", border: "1px solid rgba(255,255,255,0.05)", borderTop: "3px solid " + c, borderRadius: 6 }}>
                <div style={{ ...H(14), color: c, marginBottom: 12 }}>{t}</div>
                <div style={{ ...body, fontSize: 13 }}>{d}</div>
              </div>
            ))}
          </div>
          {/* PRICING */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...label(P), textAlign: "center", marginBottom: 24 }}>PRICING</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 20 }}>
              {pricing.map(({ dur, price, ph, best, badge, d }) => (
                <div key={dur} style={{ padding: 32, borderRadius: 8, position: "relative", background: best ? "linear-gradient(135deg,#0a0a20,#0d0418)" : "#04040f", border: best ? "2px solid " + C : "1px solid #141420", boxShadow: best ? "0 0 40px rgba(0,229,255,0.1)" : "none", display: "flex", flexDirection: "column" }}>
                  {badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg," + C + "," + P + ")", color: "#000", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.25em", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>{badge}</div>}
                  <div style={{ ...label(best ? C : "rgba(255,255,255,0.35)"), marginBottom: 14 }}>{dur}</div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 64, lineHeight: 1, color: best ? "#fff" : "rgba(255,255,255,0.85)", marginBottom: 4 }}>{price}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: best ? C : "rgba(255,255,255,0.3)", marginBottom: 18 }}>{ph}</div>
                  <div style={{ ...body, fontSize: 13, marginBottom: 24, flexGrow: 1 }}>{d}</div>
                  <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", padding: "12px 20px", borderRadius: 50, textDecoration: "none", border: "2px solid " + (best ? C : "rgba(255,255,255,0.2)"), color: best ? C : "rgba(255,255,255,0.45)", boxShadow: best ? "0 0 20px rgba(0,229,255,0.3)" : "none" }}>BOOK NOW</a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "44px", background: "linear-gradient(135deg,#04040f,#0a0418)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 8 }}>
            <div style={{ ...H(36), marginBottom: 24 }}>READY TO LEVEL UP YOUR SOUND?</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://calendly.com/dj-steven-angel/15-min-zoom" target="_blank" rel="noreferrer" style={btn(C, glowC)}>BOOK FREE INTRO CALL</a>
              <a href="https://api.whatsapp.com/send?phone=972523561353" target="_blank" rel="noreferrer" style={btn(P, glowP)}>WHATSAPP ME</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ ...label(), marginBottom: 10, textAlign: "center" }}>STUDENT RESULTS</div>
          <div style={{ ...H(isMobile ? 36 : 60), textAlign: "center", marginBottom: 40 }}>STUDENTS. CLIENTS.<br />REAL RESULTS.</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 20 }}>
            {testimonials.map(({ n, f, t, g }) => (
              <div key={n} style={{ padding: 32, background: "#000", border: "1px solid #141420", borderRadius: 6 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: C, fontSize: 14 }}>★</span>)}</div>
                <div style={{ ...body, marginBottom: 18, fontStyle: "italic", fontSize: 14 }}>{t}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ ...H(16) }}>{n}</div>
                    <div style={{ ...body, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{flags[f]} {f}</div>
                  </div>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, padding: "5px 12px", border: "1px solid rgba(187,134,252,0.3)", borderRadius: 20, fontSize: 11, color: P, letterSpacing: "0.15em" }}>{g}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section style={{ padding: "60px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/9", gridColumn: "1 / -1" }}>
              <img src={OUTDOOR} alt="Steven Angel performing live" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
              <img src={PORTRAIT} alt="Steven Angel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "4/3" }}>
              <img src={STAGE} alt="Steven Angel on stage" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* GHOST PRODUCTION */}
      <section id="ghost" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#04040f", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ ...label("rgba(255,255,255,0.25)"), marginBottom: 12, textAlign: "center" }}>PROFESSIONAL SERVICE</div>
          <div style={{ ...H(isMobile ? 32 : 52), textAlign: "center", marginBottom: 14 }}>YOUR VISION.<br />MY SOUND.</div>
          <div style={{ ...H(isMobile ? 22 : 32), color: C, textAlign: "center", marginBottom: 8 }}>LABEL-READY PRODUCTION.</div>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: 32 }}>Full tracks · Demo finishing · Mix & Master — NDA included</div>
          <div style={{ ...body, textAlign: "center", maxWidth: 580, margin: "0 auto 44px" }}>
            Hire a professional ghost producer for Afro House, Melodic Techno, Tech House and more. Custom tracks built for your sound — club-ready, label-ready, and 100% yours.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 36 }}>
            {genres.map(([g, ref, audio]) => (
              <div key={g} style={{ padding: "18px 22px", background: "#000", border: "1px solid #141420", borderRadius: 6 }}>
                <div style={{ ...H(17), color: "rgba(255,255,255,0.8)", marginBottom: 5 }}>{g}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: audio ? 10 : 0 }}>{ref}</div>
                {audio && (Array.isArray(audio) ? audio : [audio]).map((src, i) => (
                  <audio key={i} controls src={src} style={{ width: "100%", height: 28, display: "block", marginTop: 6, opacity: 0.8 }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://api.whatsapp.com/send?phone=972523561353" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px 32px", borderRadius: 50, textDecoration: "none" }}>WHATSAPP ME</a>
            <a href="#contact" style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", color: "rgba(255,255,255,0.7)", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", padding: "14px 32px", borderRadius: 50, textDecoration: "none", border: "2px solid rgba(255,255,255,0.25)" }}>LEAVE YOUR DETAILS</a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: isMobile ? "60px 20px" : "90px 60px", background: "#000", borderTop: "1px solid #0d0d0d" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div style={{ ...label(P), marginBottom: 12 }}>GET IN TOUCH</div>
          <div style={{ ...H(72), marginBottom: 12 }}>READY?<br />LET'S MAKE<br />SOMETHING.</div>
          <div style={{ ...body, marginBottom: 44 }}>Send me your demo — I'll tell you exactly what's missing.</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {["Your Name", "Email Address"].map(ph => (
              <input key={ph} placeholder={ph} style={{ fontFamily: "DM Sans, sans-serif", background: "#04040f", border: "1px solid #1a1a2e", color: "#fff", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4 }} />
            ))}
          </div>
          <select style={{ fontFamily: "DM Sans, sans-serif", width: "100%", background: "#04040f", border: "1px solid #1a1a2e", color: "rgba(255,255,255,0.4)", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4, marginBottom: 12 }}>
            <option>I am interested in...</option>
            <option>1-on-1 Production Lessons</option>
            <option>Ghost Production</option>
            <option>Mixing and Mastering</option>
          </select>
          <textarea placeholder="Tell me about your music and what you want to achieve..." rows={4} style={{ fontFamily: "DM Sans, sans-serif", width: "100%", background: "#04040f", border: "1px solid #1a1a2e", color: "#fff", padding: "15px 17px", fontSize: 14, outline: "none", borderRadius: 4, marginBottom: 16, resize: "vertical", boxSizing: "border-box" }} />
          <button style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, letterSpacing: "0.25em", width: "100%", padding: "18px", background: "linear-gradient(90deg," + C + "," + P + ")", border: "none", color: "#000", fontSize: 16, textTransform: "uppercase", cursor: "pointer", borderRadius: 4, marginBottom: 24 }}>
            SEND MESSAGE
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {[["INSTAGRAM", "https://www.instagram.com/theangels_tlv/"], ["SOUNDCLOUD", "https://soundcloud.com/theangelsoflove"], ["WHATSAPP", "https://api.whatsapp.com/send?phone=972523561353"]].map(([lbl, href]) => (
              <a key={lbl} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{lbl}</a>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: "22px 48px", borderTop: "1px solid #0d0d0d", textAlign: "center" }}>
        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 10, color: "#1f1f1f", letterSpacing: "0.3em" }}>
          {new Date().getFullYear()} STEVEN ANGEL — ALL RIGHTS RESERVED
        </span>
      </footer>

      {/* FLOATING MUSIC PLAYER */}
      <div style={{ position: "fixed", bottom: isMobile ? 16 : 28, right: isMobile ? 16 : 28, zIndex: 999 }}>
        <button onClick={() => setPlayerOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 10, background: playerOpen ? "rgba(0,0,0,0.95)" : "linear-gradient(135deg,#00E5FF,#BB86FC)", border: playerOpen ? "1px solid rgba(0,229,255,0.3)" : "none", borderRadius: 50, padding: "12px 22px", cursor: "pointer", boxShadow: "0 4px 32px rgba(0,229,255,0.35)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={playerOpen ? C : "#000"}>
            {playerOpen ? <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></> : <polygon points="5,3 19,12 5,21"/>}
          </svg>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", color: playerOpen ? C : "#000", whiteSpace: "nowrap" }}>
            {playerOpen ? "CLOSE PLAYER" : "LISTEN TO MY WORK"}
          </span>
        </button>
        {playerOpen && (
          <div style={{ position: "absolute", bottom: 62, right: 0, width: isMobile ? 300 : 360, background: "#08080f", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #0d0d18" }}>
              {[["PRODUCTIONS", 0], ["MASTERING", 1]].map(([lbl, idx]) => (
                <button key={lbl} onClick={() => setPlayerTab(idx)} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: playerTab === idx ? "2px solid " + C : "2px solid transparent", cursor: "pointer", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", color: playerTab === idx ? C : "rgba(255,255,255,0.35)" }}>{lbl}</button>
              ))}
            </div>
            {playerTab === 0 && <iframe width="360" height="300" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/theangelsoflove/sets/steven-angel-productions-2026/s-OQGp26KiwbI&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false" style={{ display: "block" }} />}
            {playerTab === 1 && <iframe width="360" height="300" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/theangelsoflove/sets/premaster-vs-master/s-7B87xgWzOoY&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false" style={{ display: "block" }} />}
          </div>
        )}
      </div>

    </div>
  );
}
