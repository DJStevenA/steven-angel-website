/**
 * Blog index — /blog
 *
 * "THE LAB" — production notes from Steven Angel. Lists every published post
 * in src/blog/posts.js, newest first.
 */

import { useState, useEffect } from "react";
import Nav from "../Nav.jsx";
import Footer from "../Footer.jsx";
import BlogCard from "./components/BlogCard.jsx";
import posts from "./posts.js";
import { usePageView, useScrollDepth } from "../lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

const heading = (sz) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 900,
  fontSize: sz,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.15,
  margin: 0,
});

const body = {
  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
  fontSize: 16,
  color: "rgba(255,255,255,0.65)",
  lineHeight: 1.7,
};

const SUBTITLE =
  "Production notes from a Beatport Top 10 producer. Mix, mastering, and the small decisions that separate hobbyist tracks from label releases.";

export default function Blog() {
  usePageView("blog");
  useScrollDepth("blog");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1100 : false
  );

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1100);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      <Nav />

      <main>
        {/* ═══ HERO ═══ */}
        <section
          style={{
            padding: isMobile ? "60px 20px 40px" : "100px 60px 60px",
            textAlign: "center",
            background: BG,
            borderBottom: "1px solid #0d0d18",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: CYAN,
                marginBottom: 18,
              }}
            >
              Steven Angel · Production Notes
            </div>

            <h1
              style={{
                ...heading(isMobile ? 48 : 72),
                marginBottom: 18,
                background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              THE LAB
            </h1>

            <div
              style={{
                width: 64,
                height: 2,
                background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                margin: "0 auto 22px",
              }}
            />

            <p
              style={{
                ...body,
                fontSize: isMobile ? 16 : 18,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 620,
                margin: "0 auto",
              }}
            >
              {SUBTITLE}
            </p>
          </div>
        </section>

        {/* ═══ POSTS GRID ═══ */}
        <section
          style={{
            padding: isMobile ? "40px 20px 60px" : "60px 60px 100px",
            background: "#04040f",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            {posts.length === 0 ? (
              <div style={{ ...body, textAlign: "center", color: "rgba(255,255,255,0.5)" }}>
                First post lands soon.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  gap: isMobile ? 20 : 28,
                }}
              >
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
