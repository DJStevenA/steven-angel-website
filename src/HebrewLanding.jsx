/**
 * /he — Hebrew landing page for Israeli market.
 * RTL, dark theme, same brand as steven-angel.com.
 * Links to /shop for purchases (English checkout).
 * Contact form + WhatsApp go to existing backend.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const WA_LINK = "https://wa.me/972523561353?text=" + encodeURIComponent("היי סטיבן, אני מעוניין בשיעור הפקה");

const COURSES = [
  {
    title: "קורס DJ",
    price: "החל מ-₪1,500",
    color: CYAN,
    features: ["מיקס בכל הז'אנרים", "בניית סט מקצועי", "הכרת ציוד ותוכנות", "סט מוקלט בסיום"],
    modules: [
      { title: "מיקס בסיסי", points: ["הכרת Serato / Traktor / Rekordbox", "הכרת הקונטרולר", "ביט מיקס — הלבשת שיר על שיר", "קאט מיקס — טכניקת היפ הופ", "מיקס בכל הז'אנרים", "שימוש באפקטים — לופים, קיואים, FX", "העלאת שירים לתוכנה", "סט מוקלט בסיום הקורס"] },
      { title: "בניית סט", points: ["מאיפה מורידים שירים ורימיקסים?", "מה זה קובץ באיכות טובה?", "איך מתחברים למיקסר DJ במועדון?", "בניית סט — איך יוצרים סיפור עם מוזיקה?", "התאמת מוזיקה לקהל ולחלק בערב", "בניית ארכיון מוסיקלי", "עריכה מוסיקלית"] },
      { title: "מתקדם — סאונד ושיווק", points: ["הקמת מערכת הגברה", "עבודה עם מיקסר אומנים", "תאורה וחשמל", "בניית חוזה עבודה", "שיווק ופרסום עצמי"] },
    ],
  },
  {
    title: "הפקה באבלטון",
    price: "החל מ-₪3,000",
    color: PURPLE,
    featured: true,
    features: ["מודול 1 — תוכנה", "מודול 2 — תיאוריה מוזיקלית", "מודול 3 — סאונד, מיקס ומאסטרינג"],
    modules: [
      { title: "מודול 1 — תוכנה", points: ["עבודה עם MIDI — תזמון, ציור תווים, הפיכת רעיון לצליל", "עבודה עם Audio — הקלטה, חיתוך, Warping", "Pattern, Grid & Quantize — הבסיס של כל גרוב", "One Shots & Loops — ההבדל, מתי משתמשים בכל אחד", "פלאגינים מובנים — Simpler, Sampler, Drum Rack, Wavetable", "פלאגינים חיצוניים — Splice, Serum, FabFilter, Waves", "שמירה נכונה — Folders, Collect All and Save", "Export — WAV, MP3, Stems לכל פלטפורמה"] },
      { title: "מודול 2 — תיאוריה מוזיקלית", points: ["שמות תווים — דו רה מי והמערכת האנגלית", "סולמות ואקורדים — מז'ור, מינור, מודים", "מלודיות, הרמוניות וקאונטרפוינט", "מתיחת רעיון מלודי קצר לאריינג'מנט מלא", "התאמת מלודיה לאקורדים ולבס", "פרוגרסיות אקורדים שעובדות"] },
      { title: "מודול 3 — סאונד, מיקס ומאסטרינג", points: ["סאונד דיזיין לתופים — בחירת kick, snare, hi-hat לפי ז'אנר", "שכבות תופים — Transient shaping, טכניקות layering", "שכבות סינתים — בניית צליל עשיר ורחב", "סינתזה — Serum: עיצוב בסים, לידים ופאדים מאפס", "מיקס — EQ, קומפרסור, עומק, כל ערוץ במקומו", "עיבוד מתקדם — Saturation, Sidechain, Stereo Width, Mid/Side", "צליל Club-Ready — איך הטראק נשמע גדול בכל מערכת", "מאסטרינג — Loudness, Limiting, Reference — מוכן ל-Beatport ו-Spotify"] },
    ],
  },
  {
    title: "שיעור פרטי",
    price: "₪300 / שיעור",
    color: CYAN,
    features: ["התאמה אישית מלאה", "בזום או פרונטלי", "כל ז'אנר וכל רמה", "ליווי גם אחרי השיעור"],
    modules: null,
  },
];

function CoursesSection({ isMobile, heading, body, sectionPad, waLink }) {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  return (
    <section id="courses" style={{ ...sectionPad, background: BG_ALT, borderTop: "1px solid #0d0d18" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: 12, letterSpacing: "0.3em", color: CYAN, marginBottom: 12, textAlign: "center",
        }}>
          מסלולי לימוד
        </div>
        <h2 style={{ ...heading(isMobile ? 28 : 40), textAlign: "center", marginBottom: 40 }}>
          הפוך את התחביב <span style={{ color: CYAN }}>למקצוע</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 20 }}>
          {COURSES.map((course, ci) => (
            <div key={course.title} style={{
              background: course.featured ? "linear-gradient(135deg, #0a0a20, #0d0418)" : BG,
              border: `1px solid ${course.featured ? PURPLE + "50" : "rgba(255,255,255,0.08)"}`,
              borderTop: `3px solid ${course.color}`,
              borderRadius: 12, padding: isMobile ? "24px 18px" : "28px 24px",
              display: "flex", flexDirection: "column",
            }}>
              {course.featured && (
                <div style={{
                  alignSelf: "flex-start", background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
                  color: "#000", padding: "4px 12px", borderRadius: 20, marginBottom: 12,
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.2em",
                }}>
                  הכי פופולרי
                </div>
              )}
              <h3 style={{ ...heading(22), marginBottom: 8, marginTop: 0 }}>{course.title}</h3>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24,
                color: course.color, marginBottom: 16,
              }}>
                {course.price}
              </div>

              {/* Features / Module titles — each with its own expandable detail */}
              {course.features.map((f, fi) => {
                const isOpen = course.modules && expandedCourse === ci && expandedModule === fi;
                return (
                  <React.Fragment key={f}>
                    <div
                      onClick={() => {
                        if (course.modules) {
                          if (isOpen) { setExpandedCourse(null); setExpandedModule(null); }
                          else { setExpandedCourse(ci); setExpandedModule(fi); }
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        ...body, fontSize: 14, marginBottom: isOpen ? 0 : 6,
                        cursor: course.modules ? "pointer" : "default",
                        padding: course.modules ? "6px 0" : 0,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => { if (course.modules) e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { if (course.modules) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                    >
                      <span style={{ color: course.color, fontSize: 14, marginTop: 2, flexShrink: 0 }}>
                        {course.modules ? (isOpen ? "▾" : "▸") : "\u2713"}
                      </span>
                      <span style={{ fontWeight: course.modules ? 600 : 400 }}>{f}</span>
                    </div>
                    {isOpen && course.modules[fi] && (
                      <div style={{
                        background: `rgba(${course.color === PURPLE ? "187,134,252" : "0,229,255"},0.05)`,
                        border: `1px solid ${course.color}22`,
                        borderRadius: 8, padding: "12px 14px", marginBottom: 8,
                        animation: "fadeIn 0.2s ease",
                      }}>
                        {course.modules[fi].points.map((p) => (
                          <div key={p} style={{
                            display: "flex", alignItems: "flex-start", gap: 8,
                            ...body, fontSize: 13, marginBottom: 4, color: "rgba(255,255,255,0.65)",
                          }}>
                            <span style={{ color: course.color, fontSize: 12, marginTop: 3, flexShrink: 0 }}>›</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              <a href={waLink} target="_blank" rel="noreferrer" style={{
                display: "block", textAlign: "center", marginTop: "auto", paddingTop: 16,
                padding: "12px 20px", background: course.featured ? course.color : "transparent",
                border: `1px solid ${course.color}`, borderRadius: 50, textDecoration: "none",
                color: course.featured ? "#000" : course.color,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13,
                letterSpacing: "0.15em",
              }}>
                אני רוצה לשמוע עוד
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}

export default function HebrewLanding() {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "סטיבן אנג'ל — קורסי DJ והפקת מוזיקה | Drop School";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "קורסי DJ, הפקת מוזיקה באבלטון, מיקס ומאסטרינג ושיעורים פרטיים עם סטיבן אנג'ל. Afro House, Melodic Techno, Indie Dance.");
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setLoading(true);
    try {
      await fetch(`${BACKEND}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "drop-edm-hebrew" }),
      });
      setFormSent(true);
    } catch {}
    setLoading(false);
  };

  const heading = (size) => ({
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 900,
    fontSize: size,
    letterSpacing: "0.02em",
    color: "#fff",
    lineHeight: 1.15,
  });

  const body = {
    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.7,
  };

  const sectionPad = { padding: isMobile ? "50px 20px" : "80px 60px" };

  return (
    <div dir="rtl" style={{ background: BG, minHeight: "100vh", color: "#fff", textAlign: "right" }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 4vw, 48px)", height: 64,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: "0.1em" }}>
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 12 : 24, alignItems: "center" }}>
          <a href="#courses" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>קורסים</a>
          <a href="#shop" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>חנות</a>
          <a href="#contact" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>צור קשר</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", textAlign: "center",
        padding: isMobile ? "60px 20px 50px" : "100px 60px 80px",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <img
            src="/images/dj-hero.webp"
            alt="Steven Angel"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", opacity: 0.3 }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,16,0.5), rgba(8,8,16,0.95))" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 12, letterSpacing: "0.3em", color: CYAN, marginBottom: 16,
          }}>
            DROP SCHOOL
          </div>
          <h1 style={{ ...heading(isMobile ? 36 : 56), marginBottom: 16, textAlign: "center" }}>
            למד הפקת מוזיקה
            <br />
            <span style={{
              background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              עם סטיבן אנג'ל
            </span>
          </h1>
          <p style={{ ...body, maxWidth: 540, margin: "0 auto 28px", textAlign: "center" }}>
            קורסי DJ, הפקת מוזיקה באבלטון, מיקס ומאסטרינג ושיעורים פרטיים.
            <br />
            Afro House, Melodic Techno, Indie Dance.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#courses" style={{
              padding: "14px 32px", background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
              color: "#000", borderRadius: 50, textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14,
              letterSpacing: "0.15em",
            }}>
              לקורסים
            </a>
            <a href={WA_LINK} target="_blank" rel="noreferrer" style={{
              padding: "14px 32px", background: "#25D366",
              color: "#fff", borderRadius: 50, textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14,
              letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8,
            }}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <div style={{
        display: "flex", justifyContent: "center", gap: isMobile ? 16 : 40,
        padding: "0 20px 40px", flexWrap: "wrap",
      }}>
        {[
          { num: "20+", text: "שנות ניסיון" },
          { num: "500+", text: "תלמידים" },
          { num: "50+", text: "שחרורים בלייבלים" },
        ].map(({ num, text }) => (
          <div key={text} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: CYAN }}>{num}</div>
            <div style={{ ...body, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{text}</div>
          </div>
        ))}
      </div>

      {/* ── BIO (right after trust badges) ── */}
      <section style={{ ...sectionPad, background: BG_ALT, borderTop: "1px solid #0d0d18" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 32, alignItems: "center" }}>
          <img
            src="/images/dj-hero.webp"
            alt="Steven Angel"
            style={{ width: isMobile ? "100%" : 340, height: "auto", aspectRatio: "16/10", objectFit: "cover", objectPosition: "center 20%", borderRadius: 14, border: `1px solid ${CYAN}33`, flexShrink: 0 }}
          />
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: "0.3em", color: CYAN, marginBottom: 10,
            }}>
              על המורה
            </div>
            <h2 style={{ ...heading(isMobile ? 26 : 34), marginBottom: 14, marginTop: 0 }}>
              סטיבן <span style={{ color: CYAN }}>אנג'ל</span>
            </h2>
            <p style={body}>
              DJ ומפיק מקצועי עם למעלה מ-20 שנות ניסיון. תקלט בהפקות הרייב הגדולות בארץ ובעולם, שיחרר מוזיקה בלייבלים המובילים, צבר מיליוני צפיות ודוגל בלימוד של ת'תכל'ס — "לחתוך את השומן".
            </p>
            <p style={{ ...body, marginBottom: 16 }}>
              הקורסים של Drop הם אחד-על-אחד, בהתאמה אישית מלאה. התמיכה וההדרכה נמשכות גם אחרי תום הלימודים.
            </p>

            {/* Labels */}
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 8,
            }}>
              שחרורים ב:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {["Sony", "Moblack", "MTGD (Hugel)", "Ultra", "Godeeva", "Redolent"].map((l) => (
                <span key={l} style={{
                  padding: "5px 14px", background: "rgba(187,134,252,0.08)",
                  border: "1px solid rgba(187,134,252,0.2)", borderRadius: 20,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: PURPLE, fontWeight: 600,
                }}>
                  {l}
                </span>
              ))}
            </div>

            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: 8,
            }}>
              נתמך על ידי:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Hugel", "Claptone", "Francis Mercier", "Hernan Cattaneo", "DJ Chus", "Dole & Kom"].map((a) => (
                <span key={a} style={{
                  padding: "5px 14px", background: "rgba(0,229,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.15)", borderRadius: 20,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.65)",
                }}>
                  {a}
                </span>
              ))}
            </div>

            {/* Highlights */}
            <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
              {[
                { num: "15M+", text: "Streams" },
                { num: "Top 10", text: "Beatport" },
                { num: "50K+", text: "Spotify Monthly" },
              ].map(({ num, text }) => (
                <div key={text}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: CYAN }}>{num}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <CoursesSection isMobile={isMobile} heading={heading} body={body} sectionPad={sectionPad} waLink={WA_LINK} />

      {/* ── SHOP ── */}
      <section id="shop" style={{ ...sectionPad, background: BG }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 12, letterSpacing: "0.3em", color: CYAN, marginBottom: 12, textAlign: "center",
          }}>
            חנות
          </div>
          <h2 style={{ ...heading(isMobile ? 28 : 40), textAlign: "center", marginBottom: 12 }}>
            Templates, סמפלים <span style={{ color: CYAN }}>ומסטרקלאס</span>
          </h2>
          <p style={{ ...body, textAlign: "center", maxWidth: 500, margin: "0 auto 32px" }}>
            טמפלייטים לאבלטון, ערכות סמפלים ומסטרקלאס מלא.
            הורדה מיידית, גישה לכל החיים.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {[
              { name: "Jungle Walk Masterclass", desc: "מסטרקלאס מלא — 5 שיעורים + פרויקט אבלטון + 100 סמפלים", price: "$29", badge: "BEST SELLER", color: PURPLE },
              { name: "Melodic Techno Mega Bundle", desc: "3 טמפלייטים + ערכת סמפלים — חסכו 50%", price: "$39", badge: "BEST VALUE", color: CYAN },
              { name: "Darbuka Loops", desc: "132 לופים ואאוון-שוטס של דרבוקה — Royalty Free", price: "$7", badge: null, color: CYAN },
            ].map(({ name, desc, price, badge, color: c }) => (
              <Link key={name} to="/shop" style={{
                display: "block", textDecoration: "none", color: "inherit",
                background: BG_ALT, border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `2px solid ${c}`, borderRadius: 10,
                padding: isMobile ? "20px 16px" : "24px 20px",
                transition: "transform 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = c; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                {badge && (
                  <div style={{
                    display: "inline-block", background: c === PURPLE ? `linear-gradient(90deg, ${PURPLE}, ${CYAN})` : `rgba(0,229,255,0.12)`,
                    color: c === PURPLE ? "#000" : CYAN, padding: "3px 10px", borderRadius: 20, marginBottom: 8,
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 9, letterSpacing: "0.2em",
                  }}>
                    {badge}
                  </div>
                )}
                <div style={{ ...heading(18), marginBottom: 6 }}>{name}</div>
                <div style={{ ...body, fontSize: 13, marginBottom: 10 }}>{desc}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: c }}>{price}</div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link to="/shop" style={{
              display: "inline-block", padding: "12px 28px",
              border: `1px solid ${CYAN}`, borderRadius: 50, textDecoration: "none",
              color: CYAN, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 13, letterSpacing: "0.15em",
            }}>
              לכל המוצרים
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ ...sectionPad, background: BG }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ ...heading(isMobile ? 28 : 36), textAlign: "center", marginBottom: 8 }}>
            <span style={{ color: CYAN }}>צור קשר</span>
          </h2>
          <p style={{ ...body, textAlign: "center", marginBottom: 28, fontSize: 14 }}>
            השאירו פרטים ואחזור אליכם תוך 24 שעות
          </p>

          {formSent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 44, color: CYAN, marginBottom: 12 }}>&#10003;</div>
              <div style={{ ...heading(24) }}>תודה!</div>
              <p style={{ ...body, fontSize: 14 }}>קיבלתי את הפרטים, אחזור אליך בהקדם.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {[
                { key: "name", label: "שם", type: "text", required: true },
                { key: "phone", label: "טלפון", type: "tel", required: true },
                { key: "email", label: "אימייל", type: "email", required: false },
              ].map(({ key, label, type, required }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{
                    display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: 6,
                  }}>
                    {label} {required && "*"}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    style={{
                      width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                      color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                      boxSizing: "border-box", outline: "none", textAlign: "right",
                    }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", marginBottom: 6,
                }}>
                  הודעה
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                    color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                    boxSizing: "border-box", outline: "none", resize: "vertical", textAlign: "right",
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "14px 28px",
                background: loading ? "#222" : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                color: "#000", border: "none", borderRadius: 50,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15,
                letterSpacing: "0.15em", cursor: loading ? "wait" : "pointer",
              }}>
                {loading ? "שולח..." : "שלח"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a href={WA_LINK} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", background: "#25D366", borderRadius: 50,
              textDecoration: "none", color: "#fff",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13,
            }}>
              או שלח הודעה ב-WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "28px 40px", background: "#02020a",
        borderTop: "1px solid #0d0d18", textAlign: "center",
      }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          &copy; 2026 Steven Angel &middot;{" "}
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "underline" }}>steven-angel.com</a>
          {" "}&middot;{" "}
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>מדיניות פרטיות</a>
        </span>
      </footer>
    </div>
  );
}
