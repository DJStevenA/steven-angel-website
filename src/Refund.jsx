import React, { useEffect } from "react";
import Nav from "./Nav.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

/**
 * /refund — Refund Policy page.
 * Last updated: 2026-05-27.
 */
function RefundPage() {
  useEffect(() => {
    document.title = "Refund Policy — Steven Angel";
    const setMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta(
      'meta[name="description"]',
      "Refund policy for steven-angel.com — digital products, ghost production, mix & mastering, and producer tool credits."
    );
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://steven-angel.com/refund");
  }, []);

  const heading = (fontSize) => ({
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 900,
    fontSize,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fff",
    lineHeight: 1.1,
  });

  const sectionDivider = {
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: PURPLE,
    marginTop: 56,
    marginBottom: 8,
    paddingTop: 24,
    borderTop: "1px solid rgba(187, 134, 252, 0.25)",
  };

  const subheading = {
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: CYAN,
    marginTop: 32,
    marginBottom: 12,
  };

  const body = {
    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
    fontSize: 16,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.7,
    marginBottom: 16,
  };

  const linkStyle = { color: CYAN, textDecoration: "underline" };
  const ulStyle = { ...body, paddingLeft: 24, marginBottom: 16 };

  const highlight = {
    background: "rgba(0, 229, 255, 0.08)",
    border: "1px solid rgba(0, 229, 255, 0.2)",
    borderRadius: 8,
    padding: "16px 20px",
    marginBottom: 24,
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      <Nav />

      <main style={{ padding: "60px 20px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1
            style={{
              ...heading("clamp(32px, 6vw, 56px)"),
              background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 16,
            }}
          >
            Refund Policy
          </h1>

          <div
            style={{
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 32,
              fontStyle: "italic",
            }}
          >
            Steven Angel &middot; Last updated: 2026-05-27
          </div>

          <div style={highlight}>
            <p style={{ ...body, marginBottom: 0 }}>
              <strong style={{ color: "#fff" }}>Quick summary:</strong> Digital
              downloads are non-refundable. Ghost production is non-refundable once
              work begins. Mix &amp; mastering issues are resolved via free
              revisions. Failed tool renders are auto-refunded.
            </p>
          </div>

          {/* ── 1. Digital Products ── */}
          <h2 style={sectionDivider}>1. Digital Products (Shop)</h2>
          <p style={body}>
            Ableton templates, sample packs, masterclass videos, and other digital
            downloads are <strong>non-refundable</strong> once purchased.
          </p>
          <p style={body}>
            Because digital files can be downloaded and copied instantly, we cannot
            verify whether a product has been used after purchase. This is standard
            practice for digital goods.
          </p>
          <h3 style={subheading}>Exceptions</h3>
          <ul style={ulStyle}>
            <li>
              <strong>Duplicate purchase:</strong> If you accidentally bought the
              same product twice, contact us within 48 hours for a full refund of
              the duplicate.
            </li>
            <li>
              <strong>Defective file:</strong> If the download is corrupted or
              incomplete and we cannot provide a working replacement, you will
              receive a full refund.
            </li>
          </ul>

          {/* ── 2. Ghost Production ── */}
          <h2 style={sectionDivider}>2. Ghost Production</h2>
          <p style={body}>
            Ghost production is a custom creative service. Due to the bespoke
            nature of this work:
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Before work begins:</strong> If you contact us before any
              production work has started, we will issue a full refund.
            </li>
            <li>
              <strong>After work has commenced:</strong> Payments are{" "}
              <strong>non-refundable</strong>. This is stated in the Ghost
              Production Agreement signed at checkout.
            </li>
          </ul>
          <h3 style={subheading}>Race Condition Protection</h3>
          <p style={body}>
            Ghost tracks from the catalog are exclusive (one buyer only). If two
            buyers attempt to purchase the same track simultaneously and both
            payments go through, the second buyer is{" "}
            <strong>automatically refunded in full</strong> via PayPal. No action
            needed on your part.
          </p>

          {/* ── 3. Mix & Mastering ── */}
          <h2 style={sectionDivider}>3. Mix &amp; Mastering</h2>
          <p style={body}>
            Mix &amp; mastering is a professional audio service with a subjective
            quality component. Our approach:
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Not satisfied with the result?</strong> Contact us. We offer
              free revisions within the scope of your package to get it right.
            </li>
            <li>
              <strong>Revisions beyond package scope:</strong> May incur an
              additional fee, discussed before proceeding.
            </li>
            <li>
              <strong>Refund:</strong> If we cannot deliver an acceptable result
              after the included revisions, we will discuss a partial or full refund
              on a case-by-case basis.
            </li>
          </ul>

          {/* ── 4. Credits ── */}
          <h2 style={sectionDivider}>4. Credits (Producer Tools)</h2>
          <p style={body}>
            Credit purchases are <strong>non-refundable</strong>. Credits do not
            expire.
          </p>
          <h3 style={subheading}>Automatic Refunds for Failed Renders</h3>
          <p style={body}>
            If a Mashup Generator render fails or times out, the credits consumed
            for that render (6 credits) are{" "}
            <strong>refunded to your balance automatically</strong>. You do not
            need to contact us. The same applies if you cancel a render before it
            completes.
          </p>

          {/* ── 5. How to Request ── */}
          <h2 style={sectionDivider}>5. How to Request a Refund</h2>
          <p style={body}>
            If you believe you qualify for a refund under the exceptions above:
          </p>
          <ul style={ulStyle}>
            <li>
              Email{" "}
              <a href="mailto:hello@steven-angel.com" style={linkStyle}>
                hello@steven-angel.com
              </a>{" "}
              with your PayPal order ID and a description of the issue.
            </li>
            <li>We respond within 48 hours on business days.</li>
            <li>
              Approved refunds are processed via PayPal within 5-10 business days.
            </li>
          </ul>

          {/* ── 6. Chargebacks ── */}
          <h2 style={sectionDivider}>6. Chargebacks</h2>
          <p style={body}>
            Please contact us before filing a PayPal dispute or chargeback. We are
            responsive and fair. Filing a chargeback without contacting us first may
            result in your account being suspended and future purchases blocked.
          </p>

          {/* ── Contact ── */}
          <h2 style={sectionDivider}>Contact</h2>
          <p style={body}>
            Questions about refunds? Email{" "}
            <a href="mailto:hello@steven-angel.com" style={linkStyle}>
              hello@steven-angel.com
            </a>
            .
          </p>

          <div style={{ height: 40 }} />

          <a
            href="/"
            style={{
              ...body,
              color: CYAN,
              textDecoration: "none",
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            &larr; Back to steven-angel.com
          </a>
        </div>
      </main>

      <footer
        style={{
          padding: "28px 40px",
          background: "#02020a",
          borderTop: "1px solid #0d0d18",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          &copy; 2026 Steven Angel &middot;{" "}
          <a href="/" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}>
            steven-angel.com
          </a>
        </span>
      </footer>
    </div>
  );
}

export default RefundPage;
