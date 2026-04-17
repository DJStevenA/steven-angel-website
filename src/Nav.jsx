/**
 * Shared sticky Nav — used on all pages (Ghost, Lessons, Shop, Homepage).
 * Homepage (App.jsx) renders its own identical inline nav; this component
 * is for every other page so the nav stays consistent site-wide.
 */
import { Link, useLocation } from "react-router-dom";

const CYAN = "#00E5FF";

export default function Nav() {
  const location = useLocation();

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: 64,
      padding: "0 clamp(20px, 4vw, 48px)",
      background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      boxSizing: "border-box",
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 900,
        fontSize: 20,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textDecoration: "none",
        color: "#fff",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}>
        STEVEN <span style={{ color: CYAN }}>ANGEL</span>
      </Link>

      {/* Links — hidden on mobile */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {[
          { label: "Ghost", to: "/ghost" },
          { label: "Lessons", to: "/lessons" },
          { label: "Shop", to: "/shop" },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: location.pathname === to ? CYAN : "rgba(255,255,255,0.6)",
              textDecoration: "none",
              lineHeight: 1,
              display: typeof window !== "undefined" && window.innerWidth < 600 ? "none" : undefined,
            }}
          >
            {label}
          </Link>
        ))}

        {/* CTA */}
        <Link to="/ghost" style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          lineHeight: 1,
          border: `2px solid ${CYAN}`,
          color: CYAN,
          padding: "10px 22px",
          borderRadius: 3,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}>
          WORK WITH ME
        </Link>
      </div>
    </nav>
  );
}
