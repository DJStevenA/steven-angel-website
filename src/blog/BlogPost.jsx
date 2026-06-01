/**
 * Blog single-post page — /blog/:slug
 *
 * Renders one post:
 *   - Hero (eyebrow, H1, date · read time, optional cover gradient)
 *   - Markdown body via react-markdown (remark-gfm + rehype-raw)
 *   - FAQ accordion (from post.faq_schema)
 *   - CTA card (to post.cta_target)
 *   - Footer nav: prev / next posts + "All posts"
 *
 * Inline <audio src="…"> inside the markdown body is allowed via
 * rehype-raw — Steven drops them by hand when audio files are ready.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import Nav from "../Nav.jsx";
import Footer from "../Footer.jsx";
import BlogFAQ from "./components/BlogFAQ.jsx";
import BlogCTA from "./components/BlogCTA.jsx";
import posts, { findBySlug } from "./posts.js";
import { usePageView, useScrollDepth, useTimeOnPage } from "../lib/analytics/hooks";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const SITE = "https://steven-angel.com";

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

function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return String(iso);
  }
}

/* ───────── Markdown render-style overrides ───────── */
function ctaHeadlineFor(post) {
  const cta = post?.cta_target || "";
  if (cta.startsWith("/mix-mastering")) return "Ready to get your track mastered?";
  if (cta.startsWith("/shop")) return "Ready to build with a pro chain?";
  if (cta.startsWith("/ghost/custom")) return "Need a custom ghost track?";
  if (cta.startsWith("/ghost/finish-demo")) return "Send me your demo — get it finished.";
  if (cta.startsWith("/ghost")) return "Need a ghost track signed on MTGD or Moblack?";
  if (cta.startsWith("/lessons")) return "Want me to teach you this 1-on-1?";
  return "Work with Steven →";
}

function ctaBodyFor(post) {
  const cta = post?.cta_target || "";
  if (cta.startsWith("/mix-mastering"))
    return "Mix & Mastering from $35. Trusted by Hernan Cattaneo and Dole & Kom. 3-day turnaround.";
  if (cta.startsWith("/shop"))
    return "Afro House Ableton templates from $19.99 — the same chain structure used on my MTGD and Moblack releases.";
  if (cta.startsWith("/ghost/custom"))
    return "Custom Afro House ghost production from $800. Released on MTGD, Moblack, Godeeva. 5–7 day delivery.";
  if (cta.startsWith("/ghost/finish-demo"))
    return "Send your demo — I'll bring it to label standard. From $300. 3–5 day turnaround.";
  if (cta.startsWith("/ghost"))
    return "Ready-to-release ghost tracks signed on MTGD, Moblack and Godeeva. From $300. NDA included.";
  if (cta.startsWith("/lessons"))
    return "1-on-1 Ableton lessons by a Moblack & MTGD artist. From $30 intro session.";
  return "";
}

function ctaLabelFor(post) {
  const cta = post?.cta_target || "";
  if (cta.startsWith("/mix-mastering")) return "Mix & Master — from $35";
  if (cta.startsWith("/shop")) return "Browse templates";
  if (cta.startsWith("/ghost/custom")) return "Start a custom track";
  if (cta.startsWith("/ghost/finish-demo")) return "Finish my demo";
  if (cta.startsWith("/ghost")) return "Browse ghost tracks";
  if (cta.startsWith("/lessons")) return "Book a lesson";
  return "Continue →";
}

/* Strips the first H1 from the body (we render the title in the hero). */
function stripLeadingH1(body) {
  if (!body) return "";
  const lines = body.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (lines[i] && lines[i].startsWith("# ")) i++;
  // Trim the blank line that follows
  while (i < lines.length && lines[i].trim() === "") i++;
  return lines.slice(i).join("\n");
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = useMemo(() => findBySlug(slug), [slug]);

  // Hooks before any conditional return
  usePageView("blog_post", post ? { post_slug: post.slug, post_title: post.title } : undefined);
  useScrollDepth("blog_post");
  useTimeOnPage("blog_post");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [coverFailed, setCoverFailed] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Per-post SEO (title / meta / canonical / OG) — extends the global
  // PageTitle handler in main.jsx which doesn't know about blog slugs.
  useEffect(() => {
    if (!post) return;
    const url = `${SITE}/blog/${post.slug}`;
    document.title = post.title;
    const setMeta = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", val);
    };
    setMeta('meta[name="description"]', post.meta_description || "");
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
    setMeta('meta[property="og:type"]', "article");
    setMeta('meta[property="og:title"]', post.title);
    setMeta('meta[property="og:description"]', post.meta_description || "");
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', post.title);
    setMeta('meta[name="twitter:description"]', post.meta_description || "");
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // prev/next by date — posts already sorted newest first
  const idx = posts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx < posts.length - 1 ? posts[idx + 1] : null;

  const bodyWithoutH1 = useMemo(() => stripLeadingH1(post.body), [post.body]);

  /* ───── Markdown component overrides ─────
     Inline styles only — matches the rest of the site. */
  const mdComponents = {
    h1: ({ node, ...props }) => (
      <h1 style={{ ...heading(isMobile ? 30 : 40), marginTop: 36, marginBottom: 16 }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2
        style={{
          ...heading(isMobile ? 24 : 30),
          marginTop: 44,
          marginBottom: 14,
          paddingLeft: 14,
          borderLeft: `3px solid ${CYAN}`,
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? 20 : 22,
          letterSpacing: "0.02em",
          color: "#fff",
          margin: "28px 0 10px",
        }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        style={{
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: isMobile ? 16 : 17,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.7)",
          margin: "14px 0",
        }}
        {...props}
      />
    ),
    a: ({ node, href, ...props }) => {
      const isExternal = /^https?:\/\//i.test(href || "");
      const style = {
        color: CYAN,
        textDecoration: "none",
        borderBottom: `1px solid ${CYAN}55`,
      };
      if (isExternal) {
        return <a href={href} target="_blank" rel="noreferrer" style={style} {...props} />;
      }
      // Internal — let React Router handle if it starts with /
      if (href && href.startsWith("/")) {
        return <Link to={href} style={style} {...props} />;
      }
      return <a href={href} style={style} {...props} />;
    },
    strong: ({ node, ...props }) => (
      <strong style={{ color: "#fff", fontWeight: 700 }} {...props} />
    ),
    em: ({ node, ...props }) => (
      <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)" }} {...props} />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: "0.9em",
            background: "rgba(0,229,255,0.08)",
            color: CYAN,
            padding: "2px 6px",
            borderRadius: 4,
          }}
          {...props}
        />
      ) : (
        <code
          style={{
            display: "block",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 14,
            background: "#04040f",
            color: "rgba(255,255,255,0.85)",
            padding: "14px 16px",
            borderRadius: 8,
            overflowX: "auto",
            border: "1px solid #141420",
          }}
          {...props}
        />
      ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        style={{
          margin: "22px 0",
          padding: "10px 0 10px 20px",
          borderLeft: `3px solid ${CYAN}`,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: isMobile ? 16 : 17,
          lineHeight: 1.65,
        }}
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        style={{
          paddingLeft: 22,
          margin: "14px 0",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: isMobile ? 16 : 17,
          lineHeight: 1.7,
        }}
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        style={{
          paddingLeft: 22,
          margin: "14px 0",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
          fontSize: isMobile ? 16 : 17,
          lineHeight: 1.7,
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li style={{ marginBottom: 6, paddingLeft: 4 }} {...props} />
    ),
    hr: () => (
      <hr
        style={{
          margin: "36px 0",
          border: "none",
          borderTop: "1px solid #141420",
        }}
      />
    ),
    table: ({ node, ...props }) => (
      <div style={{ overflowX: "auto", margin: "18px 0" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.75)",
          }}
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        style={{
          textAlign: "left",
          padding: "10px 12px",
          borderBottom: `2px solid ${CYAN}55`,
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: CYAN,
        }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid #141420",
          verticalAlign: "top",
        }}
        {...props}
      />
    ),
    img: ({ node, src, alt, ...props }) => (
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        style={{ maxWidth: "100%", height: "auto", borderRadius: 8, margin: "20px 0" }}
        {...props}
      />
    ),
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      <Nav />

      <main>
        {/* ═══ HERO ═══ */}
        <header
          style={{
            padding: isMobile ? "50px 20px 30px" : "80px 60px 40px",
            background: BG,
            borderBottom: "1px solid #0d0d18",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Link
              to="/blog"
              style={{
                display: "inline-block",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: CYAN,
                textDecoration: "none",
                marginBottom: 20,
              }}
            >
              ← The Lab
            </Link>

            <h1
              style={{
                ...heading("clamp(28px, 5vw, 48px)"),
                marginBottom: 18,
              }}
            >
              {post.title}
            </h1>

            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {formatDate(post.date)}
              {post.estimated_read_time ? ` · ${post.estimated_read_time} read` : ""}
            </div>
          </div>

          {/* Cover — real image with brand-gradient fallback */}
          <div style={{ maxWidth: 880, margin: "32px auto 0" }}>
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 7",
                background:
                  "linear-gradient(135deg, #0a0a20 0%, #0d0418 55%, #050516 100%)",
                borderRadius: 12,
                border: "1px solid #141420",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!coverFailed && (
                <img
                  src={`/blog/images/${post.slug}-cover.webp`}
                  alt={`${post.title} — cover`}
                  onError={() => setCoverFailed(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
              {coverFailed && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 25% 30%, ${CYAN}22 0%, transparent 55%), radial-gradient(circle at 78% 78%, ${PURPLE}22 0%, transparent 55%)`,
                  }}
                />
              )}
            </div>
          </div>
        </header>

        {/* ═══ BODY ═══ */}
        <article
          style={{
            padding: isMobile ? "30px 20px 20px" : "60px 60px 30px",
            background: "#04040f",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={mdComponents}
            >
              {bodyWithoutH1}
            </ReactMarkdown>

            {/* FAQ from frontmatter */}
            <BlogFAQ items={post.faq_schema} />

            {/* Preferred Source CTA — Google AI Overviews citation boost */}
            <div style={{
              margin: "32px 0", padding: "16px 20px",
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: 10,
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6,
            }}>
              Want more production tips in your search results?{" "}
              <a
                href="https://www.google.com/preferences"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: CYAN, textDecoration: "underline" }}
              >
                Add Steven Angel as a Preferred Source
              </a>{" "}
              in your Google Search settings.
            </div>

            {/* CTA */}
            <BlogCTA
              headline={ctaHeadlineFor(post)}
              body={ctaBodyFor(post)}
              ctaLabel={ctaLabelFor(post)}
              ctaHref={post.cta_target || "/mix-mastering"}
            />

            {/* Prev / next + back to index */}
            <nav
              style={{
                marginTop: 40,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {(newer || older) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {older && (
                    <Link
                      to={`/blog/${older.slug}`}
                      style={{
                        display: "block",
                        padding: "16px 18px",
                        background: BG,
                        border: "1px solid #141420",
                        borderRadius: 10,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: CYAN,
                          marginBottom: 6,
                        }}
                      >
                        ← Previous
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                          fontSize: 14,
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.4,
                        }}
                      >
                        {older.title}
                      </div>
                    </Link>
                  )}
                  {newer && (
                    <Link
                      to={`/blog/${newer.slug}`}
                      style={{
                        display: "block",
                        padding: "16px 18px",
                        background: BG,
                        border: "1px solid #141420",
                        borderRadius: 10,
                        textDecoration: "none",
                        color: "inherit",
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.25em",
                          textTransform: "uppercase",
                          color: CYAN,
                          marginBottom: 6,
                        }}
                      >
                        Next →
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                          fontSize: 14,
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.4,
                        }}
                      >
                        {newer.title}
                      </div>
                    </Link>
                  )}
                </div>
              )}

              <Link
                to="/blog"
                style={{
                  alignSelf: "center",
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: CYAN,
                  textDecoration: "none",
                  padding: "10px 8px",
                }}
              >
                Read more posts →
              </Link>
            </nav>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
