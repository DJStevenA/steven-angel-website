import React, { useEffect } from "react";
import Nav from "./Nav.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

/**
 * /terms — Terms of Service page.
 * Last updated: 2026-05-27.
 */
function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service — Steven Angel";
    const setMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta(
      'meta[name="description"]',
      "Terms of service for steven-angel.com — shop, ghost production, mix & mastering, lessons, and producer tools."
    );
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://steven-angel.com/terms");
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
            Terms of Service
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

          <p style={body}>
            By using steven-angel.com (the "Site") and purchasing any products or
            services, you agree to the following terms. If you do not agree, please
            do not use the Site.
          </p>

          {/* ── 1. Overview ── */}
          <h2 style={sectionDivider}>1. Overview</h2>
          <p style={body}>
            The Site is operated by Steven Angel (sole proprietor), based in Tel
            Aviv, Israel. The Site offers digital products (Ableton templates,
            sample packs, masterclass videos), ghost production services, mix &amp;
            mastering services, music production lessons, and producer tools
            (Mashup Generator).
          </p>

          {/* ── 2. Accounts ── */}
          <h2 style={sectionDivider}>2. Accounts</h2>
          <h3 style={subheading}>Registration</h3>
          <p style={body}>
            Some features require a free account (email + password). You are
            responsible for keeping your login credentials secure. You must not
            share accounts or create accounts for others without their consent.
          </p>
          <h3 style={subheading}>Guest Checkout</h3>
          <p style={body}>
            You may purchase products without creating an account. A guest account
            is created automatically using your email so you can access your
            downloads later.
          </p>

          {/* ── 3. Digital Products ── */}
          <h2 style={sectionDivider}>3. Digital Products (Shop)</h2>
          <h3 style={subheading}>License</h3>
          <p style={body}>
            When you purchase a digital product (template, sample pack, or
            masterclass), you receive a personal, non-transferable, non-exclusive
            license to use it in your own music productions. You may release music
            made with these products commercially.
          </p>
          <h3 style={subheading}>Restrictions</h3>
          <ul style={ulStyle}>
            <li>You may <strong>not</strong> resell, redistribute, or share the original files.</li>
            <li>You may <strong>not</strong> include the raw files in competing products (sample packs, templates, courses).</li>
            <li>You may <strong>not</strong> claim the files as your own creation for resale purposes.</li>
          </ul>
          <h3 style={subheading}>Delivery</h3>
          <p style={body}>
            Products are delivered digitally via download links available in your
            account. Download links are valid for 15 minutes and can be regenerated
            at any time from your account page.
          </p>

          {/* ── 4. Ghost Production ── */}
          <h2 style={sectionDivider}>4. Ghost Production</h2>
          <p style={body}>
            Ghost production orders are governed by the separate Ghost Production
            Agreement signed at checkout. Key terms:
          </p>
          <ul style={ulStyle}>
            <li>100% copyright and master rights transfer to the buyer upon full payment.</li>
            <li>Full confidentiality — the producer will never claim credit.</li>
            <li>The track is exclusive — it will not be sold to anyone else.</li>
            <li>All samples and sounds used are 100% royalty-free.</li>
            <li>Payments are non-refundable once work has commenced.</li>
          </ul>
          <p style={body}>
            The full agreement is presented and signed digitally before payment.
          </p>

          {/* ── 5. Mix & Mastering ── */}
          <h2 style={sectionDivider}>5. Mix &amp; Mastering</h2>
          <p style={body}>
            Mix &amp; mastering orders are paid via PayPal. After payment, you
            upload your stems/files via the provided Dropbox link. Steven will
            deliver the finished files to the same Dropbox folder.
          </p>
          <p style={body}>
            Turnaround times are estimates, not guarantees. Revisions are included
            as specified in each package. Additional revisions beyond the package
            scope may incur extra fees.
          </p>

          {/* ── 6. Credits & Producer Tools ── */}
          <h2 style={sectionDivider}>6. Credits &amp; Producer Tools</h2>
          <p style={body}>
            Credits are a platform currency used to pay for tool usage (e.g. Mashup
            Generator renders). Credits are non-refundable and non-transferable.
            Unused credits do not expire. If a render fails, credits are refunded
            automatically.
          </p>

          {/* ── 7. Payments ── */}
          <h2 style={sectionDivider}>7. Payments</h2>
          <p style={body}>
            All payments are processed through PayPal. Prices are listed in USD
            (ghost tracks display EUR equivalents). A 3.5% PayPal processing fee
            may apply to ghost production orders and is shown before checkout.
          </p>
          <p style={body}>
            We do not store your credit card details. All payment data is handled
            by PayPal in accordance with their terms and PCI compliance.
          </p>

          {/* ── 8. Refunds ── */}
          <h2 style={sectionDivider}>8. Refunds</h2>
          <p style={body}>
            See our{" "}
            <a href="/refund" style={linkStyle}>
              Refund Policy
            </a>{" "}
            for full details. In summary: digital product sales are final; ghost
            production is non-refundable once work begins; failed tool renders are
            auto-refunded.
          </p>

          {/* ── 9. Intellectual Property ── */}
          <h2 style={sectionDivider}>9. Intellectual Property</h2>
          <p style={body}>
            All content on the Site (design, text, audio, video, code) is owned by
            Steven Angel unless otherwise stated. Your purchase of a product grants
            you a license to use it as described above — it does not transfer
            ownership of the Site content or brand.
          </p>

          {/* ── 10. Prohibited Use ── */}
          <h2 style={sectionDivider}>10. Prohibited Use</h2>
          <ul style={ulStyle}>
            <li>Attempting to access other users' accounts or data.</li>
            <li>Automated scraping or data collection from the Site.</li>
            <li>Uploading malicious files to any upload endpoint.</li>
            <li>Using purchased products to create competing sample packs, templates, or courses.</li>
            <li>Circumventing download restrictions or sharing download links.</li>
          </ul>

          {/* ── 11. Limitation of Liability ── */}
          <h2 style={sectionDivider}>11. Limitation of Liability</h2>
          <p style={body}>
            The Site and all products are provided "as is." Steven Angel is not
            liable for any indirect, incidental, or consequential damages arising
            from your use of the Site or products. Total liability for any claim is
            limited to the amount you paid for the specific product or service.
          </p>

          {/* ── 12. Governing Law ── */}
          <h2 style={sectionDivider}>12. Governing Law</h2>
          <p style={body}>
            These terms are governed by the laws of the State of Israel. Any
            disputes shall be resolved in the courts of Tel Aviv, Israel.
          </p>

          {/* ── 13. Changes ── */}
          <h2 style={sectionDivider}>13. Changes to These Terms</h2>
          <p style={body}>
            We may update these terms from time to time. Changes take effect when
            posted. Continued use of the Site after changes constitutes acceptance
            of the new terms. Material changes will be communicated via email to
            users with accounts.
          </p>

          {/* ── Contact ── */}
          <h2 style={sectionDivider}>Contact</h2>
          <p style={body}>
            Questions about these terms? Email{" "}
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

export default TermsPage;
