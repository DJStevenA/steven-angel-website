/**
 * BlogCard — single post tile rendered on the /blog index.
 *
 * Cover image: uses /blog/images/<slug>-cover.webp if present; falls back
 * to brand gradient placeholder. The fallback handler swaps to the
 * gradient if the file 404s.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { excerpt } from "../posts.js";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return String(iso);
  }
}

export default function BlogCard({ post }) {
  if (!post) return null;
  const subline = post.meta_description || excerpt(post, 180);
  const coverUrl = `/blog/images/${post.slug}-cover.webp`;
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#04040f",
        border: "1px solid #141420",
        borderRadius: 12,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${CYAN}55`;
        e.currentTarget.style.boxShadow = `0 0 24px rgba(0,229,255,0.10)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#141420";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Cover area — real image with brand-gradient fallback */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: `linear-gradient(135deg, #0a0a20 0%, #0d0418 55%, #050516 100%)`,
          overflow: "hidden",
        }}
      >
        {!coverFailed && (
          <img
            src={coverUrl}
            alt={`${post.title} — cover`}
            loading="lazy"
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
              background: `radial-gradient(circle at 30% 30%, ${CYAN}22 0%, transparent 55%), radial-gradient(circle at 75% 75%, ${PURPLE}22 0%, transparent 55%)`,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: 18,
            bottom: 14,
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: CYAN,
            textShadow: "0 1px 8px rgba(0,0,0,0.7)",
          }}
        >
          THE LAB
        </div>
      </div>

      {/* Text */}
      <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <h2
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            color: "#fff",
            margin: 0,
          }}
        >
          {post.title}
        </h2>

        <p
          style={{
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 15,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
            flex: 1,
          }}
        >
          {subline}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>
            {formatDate(post.date)}
            {post.estimated_read_time ? ` · ${post.estimated_read_time} read` : ""}
          </span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: CYAN,
            }}
          >
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
