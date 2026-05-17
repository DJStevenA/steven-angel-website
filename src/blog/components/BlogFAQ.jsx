/**
 * BlogFAQ — renders an array of {q, a} as a native <details>/<summary>
 * accordion. Question copy in cyan; answer in body color.
 *
 * The matching FAQPage JSON-LD is injected by the staticSeoPages Vite
 * plugin at build time — this component is the visual rendering.
 */

const CYAN = "#00E5FF";

export default function BlogFAQ({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <section style={{ marginTop: 48, marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
          fontWeight: 900,
          fontSize: 28,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#fff",
          margin: "0 0 20px",
          paddingLeft: 14,
          borderLeft: `3px solid ${CYAN}`,
        }}
      >
        FAQ
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <details
            key={i}
            style={{
              background: "#04040f",
              border: "1px solid #141420",
              borderRadius: 10,
              padding: "0",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                listStyle: "none",
                padding: "16px 20px",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: "0.02em",
                color: CYAN,
                outline: "none",
              }}
            >
              {item.q}
            </summary>
            <div
              style={{
                padding: "0 20px 18px",
                fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                fontSize: 15,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
