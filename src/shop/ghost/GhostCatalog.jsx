import React, { useState, useEffect } from "react";
import GhostTrackCard from "./GhostTrackCard.jsx";
import ContractModal from "./ContractModal.jsx";

const API_BASE = "https://ghost-backend-production-adb6.up.railway.app";
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";

const GENRES = ["All", "Afro House", "Afro Latin", "Afro Latin / Ethnic House", "Indie Dance", "Tech House"];

const GENRE_LABELS = {
  "All": "All",
  "Afro House": "Afro House",
  "Afro Latin": "Afro Latin",
  "Afro Latin / Ethnic House": "Ethnic House",
  "Indie Dance": "Indie Dance",
  "Tech House": "Tech House",
};

export default function GhostCatalog({ isMobile }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGenre, setActiveGenre] = useState("All");
  const [buyTrack, setBuyTrack] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/ghost/tracks`)
      .then((r) => r.json())
      .then((data) => {
        setTracks(Array.isArray(data) ? data : data.tracks || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load tracks. Please refresh.");
        setLoading(false);
      });
  }, []);

  const filtered = activeGenre === "All"
    ? tracks
    : tracks.filter((t) => t.genre === activeGenre);

  const available = tracks.filter((t) => !t.sold).length;
  const total = tracks.length;

  return (
    <div>
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700,
          fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
          color: PURPLE, marginBottom: 12,
        }}>
          Ghost Catalog
        </div>
        <div style={{
          fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900,
          fontSize: isMobile ? 28 : 40, textTransform: "uppercase",
          letterSpacing: "0.04em", color: "#fff", lineHeight: 1.1, marginBottom: 12,
        }}>
          Exclusive Ghost Tracks
        </div>
        <div style={{
          fontFamily: "DM Sans, sans-serif", fontSize: 14,
          color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto",
        }}>
          Each track sold once. Full copyright transfer. NDA included. Once it's gone, it's gone.
        </div>
        {!loading && total > 0 && (
          <div style={{
            marginTop: 12, fontFamily: "DM Sans, sans-serif", fontSize: 12,
            color: available > 0 ? CYAN : "rgba(255,255,255,0.35)",
          }}>
            {available} of {total} tracks still available
          </div>
        )}
      </div>

      {/* Genre filter bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        justifyContent: "center", marginBottom: isMobile ? 24 : 36,
      }}>
        {GENRES.map((genre) => {
          const isActive = activeGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: isActive
                  ? `1px solid ${CYAN}`
                  : "1px solid rgba(255,255,255,0.12)",
                background: isActive ? `${CYAN}18` : "transparent",
                color: isActive ? CYAN : "rgba(255,255,255,0.5)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700, fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase", cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {GENRE_LABELS[genre]}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
          Loading catalog…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#ff8080", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Track grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif", fontSize: 14 }}>
              No tracks in this genre.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
              gap: isMobile ? 16 : 20,
            }}>
              {filtered.map((track) => (
                <GhostTrackCard
                  key={track.id}
                  track={track}
                  isMobile={isMobile}
                  onBuy={(t) => setBuyTrack(t)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Ghost track exclusivity note */}
      {!loading && !error && (
        <div style={{
          marginTop: isMobile ? 32 : 44,
          padding: "18px 20px",
          border: `1px solid ${PURPLE}30`,
          borderRadius: 10,
          background: `${PURPLE}06`,
          display: "flex", gap: 14, alignItems: "flex-start",
          maxWidth: 680, margin: `${isMobile ? 32 : 44}px auto 0`,
        }}>
          <span style={{ color: PURPLE, fontSize: 18, flexShrink: 0 }}>⚠</span>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>Exclusive sale only.</strong> Each track is sold to one buyer. After purchase it's permanently removed from this catalog and will never be sold, licensed, or credited to Steven Angel again. A full exclusivity agreement is signed before payment.
          </div>
        </div>
      )}

      {/* Contract + Purchase Modal */}
      {buyTrack && (
        <ContractModal
          track={buyTrack}
          onClose={() => setBuyTrack(null)}
        />
      )}
    </div>
  );
}
