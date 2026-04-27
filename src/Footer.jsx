/**
 * Shared Footer — used on Ghost, Lessons, Shop, ProductPage.
 * Homepage (App.jsx) has its own inline footer with identical links.
 */
import { Link } from "react-router-dom";

const CYAN = "#00E5FF";

export default function Footer() {
  return (
    <footer style={{ padding: "28px 40px", background: "#02020a", borderTop: "1px solid #0d0d18", textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
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
        ].map(({ label, to, href }) =>
          to ? (
            <Link key={label} to={to} style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: CYAN, textDecoration: "none" }}>{label}</Link>
          ) : (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{label}</a>
          )
        )}
      </div>
      <span style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
        &copy; {new Date().getFullYear()} Steven Angel — All Rights Reserved
      </span>
    </footer>
  );
}
