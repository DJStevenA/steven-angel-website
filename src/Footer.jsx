/**
 * Shared Footer — used on Ghost, Lessons, Shop, ProductPage.
 * Homepage (App.jsx) has its own inline footer with identical links.
 *
 * Steven 2026-06-08: added legal sub-row (Privacy / Terms / Refund) +
 * location line per UNPWNED audit GDPR finding + /ghost SiteWise report.
 */
import { Link } from "react-router-dom";

const CYAN = "#00E5FF";
const FONT_HEAD = "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif";
const FONT_BODY = "'DM Sans', 'DM Sans Fallback', sans-serif";

const PRIMARY_LINKS = [
  { label: "Ghost Production", to: "/ghost" },
  { label: "Lessons", to: "/lessons" },
  { label: "The Lab", to: "/blog" },
  { label: "Shop", to: "/shop" },
  { label: "Instagram", href: "https://www.instagram.com/theangels_tlv/" },
  { label: "Spotify", href: "https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz" },
  { label: "Beatport", href: "https://www.beatport.com/artist/the-angels-il/913642" },
];

const LEGAL_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Refund Policy", to: "/refund" },
  { label: "Contact", href: "mailto:dj.steven.angel@gmail.com" },
];

export default function Footer() {
  return (
    <footer style={{ padding: "28px 40px", background: "#02020a", borderTop: "1px solid #0d0d18", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
        Steven Angel — DJ · Producer · Mentor
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
        {PRIMARY_LINKS.map(({ label, to, href }) =>
          to ? (
            <Link key={label} to={to} style={{ fontFamily: FONT_BODY, fontSize: 12, color: CYAN, textDecoration: "none" }}>{label}</Link>
          ) : (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: FONT_BODY, fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{label}</a>
          )
        )}
      </div>

      {/* Legal row — required by GDPR / consumer protection */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginBottom: 10 }}>
        {LEGAL_LINKS.map(({ label, to, href }) =>
          to ? (
            <Link key={label} to={to} style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{label}</Link>
          ) : (
            <a key={label} href={href} style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{label}</a>
          )
        )}
      </div>

      <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
        Tel Aviv, Israel
      </div>
      <span style={{ fontFamily: FONT_BODY, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
        &copy; {new Date().getFullYear()} Steven Angel — All Rights Reserved
      </span>
    </footer>
  );
}
