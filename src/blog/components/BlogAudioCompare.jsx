/**
 * BlogAudioCompare — side-by-side Before / After audio comparison.
 *
 * If beforeUrl / afterUrl aren't provided (still waiting on Steven to
 * upload), renders a placeholder block. If they are provided, renders
 * two native <audio controls> elements.
 *
 * Convention: audio files live at /blog/audio/<filename>.mp3
 *   - "<slug>-premaster.mp3"
 *   - "<slug>-mastered.mp3"
 *
 * Markdown bodies can also embed raw <audio src="…"> tags inline —
 * rehype-raw is enabled in BlogPost so HTML inside the MD renders.
 */

const CYAN = "#00E5FF";

export default function BlogAudioCompare({ label, beforeUrl, afterUrl }) {
  const ready = Boolean(beforeUrl && afterUrl);

  return (
    <figure
      style={{
        margin: "32px 0",
        padding: "20px 22px",
        background: "#04040f",
        border: "1px solid #141420",
        borderRadius: 10,
      }}
    >
      {label && (
        <figcaption
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: CYAN,
            marginBottom: 12,
          }}
        >
          {label}
        </figcaption>
      )}

      {ready ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 6,
              }}
            >
              Before (premaster)
            </div>
            <audio controls preload="none" src={beforeUrl} style={{ width: "100%" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 6,
              }}
            >
              After (mastered)
            </div>
            <audio controls preload="none" src={afterUrl} style={{ width: "100%" }} />
          </div>
        </div>
      ) : (
        <div
          style={{
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            fontStyle: "italic",
          }}
        >
          Audio coming soon — Steven uploads these manually.
        </div>
      )}
    </figure>
  );
}
