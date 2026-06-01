/**
 * Shared sticky Nav — used on all pages (Ghost, Lessons, Shop, Homepage).
 * Desktop: inline links. Mobile: hamburger menu.
 */
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CYAN = "#00E5FF";

const NAV_LINKS = [
  { label: "Ghost", to: "/ghost" },
  { label: "Mix & Master", to: "/mix-mastering" },
  { label: "Lessons", to: "/lessons" },
  { label: "The Lab", to: "/blog" },
  { label: "Shop", to: "/shop" },
];

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 600 : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const goUp = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length <= 1) navigate("/");
    else { parts.pop(); navigate("/" + parts.join("/")); }
  };

  return (
    <>
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
        {/* Logo + back arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={goUp}
            aria-label="Go up one level"
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              color: CYAN, fontSize: 15, lineHeight: 1, opacity: 0.8,
            }}
          >
            ←
          </button>
          <Link to="/" style={{
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 900, fontSize: 20, letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none", color: "#fff",
            lineHeight: 1, whiteSpace: "nowrap",
          }}>
            STEVEN <span style={{ color: CYAN }}>ANGEL</span>
          </Link>
        </div>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 600, fontSize: 13, letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: location.pathname === to ? CYAN : "rgba(255,255,255,0.6)",
                  textDecoration: "none", lineHeight: 1,
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile hamburger button */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 6, display: "flex", flexDirection: "column",
              gap: 5, justifyContent: "center",
            }}
          >
            <span style={{
              width: 22, height: 2, background: menuOpen ? CYAN : "rgba(255,255,255,0.7)",
              borderRadius: 1, transition: "all 0.2s",
              transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
            }} />
            <span style={{
              width: 22, height: 2, background: menuOpen ? CYAN : "rgba(255,255,255,0.7)",
              borderRadius: 1, transition: "all 0.2s",
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              width: 22, height: 2, background: menuOpen ? CYAN : "rgba(255,255,255,0.7)",
              borderRadius: 1, transition: "all 0.2s",
              transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
            }} />
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.95)", backdropFilter: "blur(14px)",
          zIndex: 99, display: "flex", flexDirection: "column",
          padding: "32px 28px", gap: 8,
          animation: "fadeIn 0.15s ease",
        }}>
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700, fontSize: 22, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: location.pathname === to ? CYAN : "rgba(255,255,255,0.8)",
                textDecoration: "none", padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {label}
            </Link>
          ))}

          {/* Instagram + WhatsApp */}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <a href="https://www.instagram.com/stevenangel.prod/" target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              Instagram
            </a>
            <a href="https://wa.me/972523561353" target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              WhatsApp
            </a>
            <a href="https://open.spotify.com/artist/3jLa1XGkqkvMhn2MpLJB3H" target="_blank" rel="noreferrer"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              Spotify
            </a>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </>
  );
}
