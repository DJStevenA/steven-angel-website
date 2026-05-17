/**
 * BlogCTA — premium card pattern that lives at the end of each post.
 * Same gradient + cyan border as the "best value" CTA cards on /lessons
 * and the homepage hero cards.
 *
 * Props:
 *   - headline   : string  (Barlow Condensed 900 uppercase)
 *   - body       : string  (1-2 sentences, DM Sans)
 *   - ctaLabel   : string  (button text — keep specific, no "Learn more")
 *   - ctaHref    : string  (internal path or external URL)
 *   - external   : boolean (opens in new tab if true)
 */
import { Link } from "react-router-dom";

const CYAN = "#00E5FF";

export default function BlogCTA({ headline, body, ctaLabel, ctaHref, external = false }) {
  if (!ctaHref) return null;

  const Btn = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
        fontWeight: 800,
        fontSize: 14,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        padding: "16px 32px",
        borderRadius: 6,
        background: CYAN,
        color: "#0a0a14",
        boxShadow: "0 0 30px rgba(0,229,255,0.35)",
        textDecoration: "none",
      }}
    >
      {ctaLabel} <span style={{ fontSize: 16 }}>→</span>
    </span>
  );

  return (
    <section
      style={{
        marginTop: 48,
        marginBottom: 24,
        padding: "36px 28px",
        background: "linear-gradient(135deg, #0a0a20, #0d0418)",
        border: `2px solid ${CYAN}`,
        borderRadius: 12,
        textAlign: "center",
        boxShadow: "0 0 40px rgba(0,229,255,0.10)",
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: CYAN,
          marginBottom: 10,
        }}
      >
        Next step
      </div>
      <h3
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: "#fff",
          margin: "0 0 12px",
          lineHeight: 1.15,
        }}
      >
        {headline}
      </h3>
      {body && (
        <p
          style={{
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 16,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 560,
            margin: "0 auto 22px",
          }}
        >
          {body}
        </p>
      )}
      {external ? (
        <a href={ctaHref} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          {Btn}
        </a>
      ) : (
        <Link to={ctaHref} style={{ textDecoration: "none" }}>
          {Btn}
        </Link>
      )}
    </section>
  );
}
