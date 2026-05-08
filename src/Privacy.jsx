import React, { useEffect } from "react";
import Nav from "./Nav.jsx";

/* ─── Color tokens (match site palette) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

/**
 * /privacy — Privacy Policy page.
 *
 * Public, no-login required. Covers BOTH:
 *   (A) Website privacy — steven-angel.com (analytics, accounts, payments, cookies)
 *   (B) Instagram Bot privacy — @stevenangel.prod automation (Meta App Review compliant)
 *
 * Section B preserves Steven's exact text per Meta App Review spec 2026-05-08.
 * Last updated: 2026-05-08.
 */
function PrivacyPage() {
  /* SEO: title + meta description for /privacy */
  useEffect(() => {
    document.title = "Privacy Policy — Steven Angel";
    const setMeta = (selector, content) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", content);
    };
    setMeta(
      'meta[name="description"]',
      "Privacy policy for steven-angel.com and the @stevenangel.prod Instagram automation. What we collect, why, and your rights."
    );
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://steven-angel.com/privacy");
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
          {/* Title */}
          <h1
            style={{
              ...heading("clamp(32px, 6vw, 56px)"),
              background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 16,
            }}
          >
            Privacy Policy
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
            Steven Angel &middot; Last updated: 2026-05-08
          </div>

          {/* Intro */}
          <p style={body}>
            This privacy policy covers two surfaces: <strong>(A)</strong> the
            steven-angel.com website (including the shop, ghost production
            service, lessons, and mix &amp; mastering inquiries); and{" "}
            <strong>(B)</strong> the @stevenangel.prod Instagram automation built
            with the Steven Angel Marketing Meta App.
          </p>
          <p style={body}>
            We follow the principle of collecting only what we need to deliver
            the service you asked for. We do not sell or rent your personal data
            to anyone, ever.
          </p>

          {/* ════════════════════════════════════════════════
              SECTION A — WEBSITE PRIVACY
              ════════════════════════════════════════════════ */}
          <h2 style={sectionDivider}>A &mdash; Website Privacy (steven-angel.com)</h2>

          {/* Who we are */}
          <h3 style={subheading}>Who we are</h3>
          <p style={body}>
            steven-angel.com is operated by Steven Angel (sole proprietor),
            based in Tel Aviv, Israel. Contact:{" "}
            <a href="mailto:hello@steven-angel.com" style={linkStyle}>
              hello@steven-angel.com
            </a>
            .
          </p>

          {/* What we collect */}
          <h3 style={subheading}>What we collect on the website</h3>
          <p style={body}>Depending on what you do on the site:</p>
          <ul style={ulStyle}>
            <li>
              <strong>Visiting any page:</strong> anonymous usage data via Google
              Analytics 4 (page views, device, country at city level, referrer)
              and Microsoft Clarity (session recordings, click maps, scroll
              depth) &mdash; both standard analytics tools.
            </li>
            <li>
              <strong>Submitting a contact / quote form:</strong> your name,
              email, message, optional reference link.
            </li>
            <li>
              <strong>Creating a shop account:</strong> email address, hashed
              password (we never see the plain password), optional name.
            </li>
            <li>
              <strong>Buying a product:</strong> payment is processed by PayPal
              &mdash; we receive a transaction ID, the product purchased, and
              the email used. We do <em>not</em> see or store your card number.
            </li>
            <li>
              <strong>Clicking a Google Ads or Meta Ads link to the site:</strong>{" "}
              click attribution data (Google Click ID, Facebook Click ID) used
              for ad performance measurement.
            </li>
            <li>
              <strong>Clicking a WhatsApp button:</strong> nothing is collected
              by us &mdash; the click opens WhatsApp directly; if you message,
              your phone number becomes visible to Steven.
            </li>
            <li>
              <strong>Subscribing to a newsletter or completing a lead form:</strong>{" "}
              your email is stored in Brevo (our email service provider) for
              sending the requested content + occasional updates. You can
              unsubscribe from any email instantly.
            </li>
          </ul>

          {/* How we use it */}
          <h3 style={subheading}>How we use it</h3>
          <ul style={ulStyle}>
            <li>To deliver the product or service you asked for (downloads, lessons, ghost production, masterclass).</li>
            <li>To improve the site (analytics tells us which pages work, where users get stuck).</li>
            <li>To measure paid advertising performance (so we can stop wasting money on irrelevant clicks).</li>
            <li>To respond to your messages and quote requests.</li>
            <li>To send you legitimate emails (purchase confirmations, password resets, update emails you opted into).</li>
          </ul>
          <p style={body}>
            We do <strong>not</strong> use your data for: profiling, automated
            decision-making, training AI models, or sale/rental to third parties.
          </p>

          {/* Cookies & tracking */}
          <h3 style={subheading}>Cookies &amp; tracking technologies</h3>
          <p style={body}>The site uses these cookie / storage categories:</p>
          <ul style={ulStyle}>
            <li>
              <strong>Strictly necessary</strong> &mdash; auth session (JWT, set
              when you log in to the shop), 30-day expiry. Cannot be disabled.
            </li>
            <li>
              <strong>Analytics</strong> &mdash; Google Analytics 4
              (<code>_ga</code>, <code>_ga_*</code>), Microsoft Clarity
              (<code>_clck</code>, <code>_clsk</code>). Anonymized.
            </li>
            <li>
              <strong>Advertising</strong> &mdash; Google Ads conversion
              tracking + remarketing tags. Used to measure ad performance and
              show relevant ads on Google's network.
            </li>
          </ul>
          <p style={body}>
            You can disable analytics + advertising cookies via your browser
            settings. We are also planning a cookie consent banner (Klaro CMP)
            for clearer per-category opt-in.
          </p>

          {/* Third-party services */}
          <h3 style={subheading}>Third-party services we share data with</h3>
          <p style={body}>
            We share the minimum data needed for these tools to function:
          </p>
          <ul style={ulStyle}>
            <li><strong>Google Analytics 4</strong> &mdash; anonymized usage data (Google LLC, US; EU-US Data Privacy Framework certified).</li>
            <li><strong>Microsoft Clarity</strong> &mdash; session recordings without sensitive form data (Microsoft Corp., US).</li>
            <li><strong>Google Ads</strong> &mdash; click + conversion data (Google LLC).</li>
            <li><strong>PayPal</strong> &mdash; payment processing only (PayPal Holdings).</li>
            <li><strong>Brevo</strong> &mdash; email delivery for transactional + marketing emails (Brevo SAS, EU).</li>
            <li><strong>Cloudflare</strong> &mdash; CDN, DDoS protection, R2 file storage (Cloudflare Inc., US/EU).</li>
            <li><strong>Netlify</strong> &mdash; static site hosting (Netlify Inc., US).</li>
            <li><strong>Railway</strong> &mdash; backend application hosting (Railway Corp., US).</li>
          </ul>

          {/* Your rights */}
          <h3 style={subheading}>Your rights</h3>
          <p style={body}>
            Regardless of where you are, you can:
          </p>
          <ul style={ulStyle}>
            <li><strong>Access</strong> &mdash; request a copy of the data we hold on you.</li>
            <li><strong>Correct</strong> &mdash; ask us to fix any incorrect data.</li>
            <li><strong>Delete</strong> &mdash; ask us to delete your account and associated data.</li>
            <li><strong>Object</strong> &mdash; opt out of analytics, advertising, or marketing emails.</li>
            <li><strong>Portability</strong> (GDPR / EU) &mdash; receive your data in a machine-readable format.</li>
            <li><strong>Do Not Sell My Personal Information</strong> (CCPA / California) &mdash; we never sell your data, but you can confirm this in writing if you want.</li>
          </ul>
          <p style={body}>
            To exercise any of these rights, email{" "}
            <a href="mailto:hello@steven-angel.com" style={linkStyle}>
              hello@steven-angel.com
            </a>
            . We respond within 30 days.
          </p>

          {/* Data retention */}
          <h3 style={subheading}>Data retention</h3>
          <ul style={ulStyle}>
            <li><strong>Auth sessions:</strong> 30 days from last login (auto-expire).</li>
            <li><strong>Shop accounts + purchase history:</strong> kept for as long as the account exists, plus 7 years for tax/accounting (Israeli law).</li>
            <li><strong>Contact form submissions:</strong> 2 years, then deleted.</li>
            <li><strong>Newsletter list (Brevo):</strong> until you unsubscribe.</li>
            <li><strong>Analytics (GA4):</strong> 14 months (Google's default).</li>
            <li><strong>Clarity recordings:</strong> 90 days (Microsoft's default).</li>
          </ul>

          {/* Children */}
          <h3 style={subheading}>Children</h3>
          <p style={body}>
            The site is intended for users 16 and older. We do not knowingly
            collect data from children under 16. If you believe a child has
            submitted data, contact us and we will delete it.
          </p>

          {/* Changes */}
          <h3 style={subheading}>Changes to this policy</h3>
          <p style={body}>
            When we update this policy, we change the &ldquo;Last updated&rdquo;
            date at the top of this page. Material changes will be announced on
            the site and via email to anyone with a shop account.
          </p>

          {/* ════════════════════════════════════════════════
              SECTION B — INSTAGRAM BOT PRIVACY
              ════════════════════════════════════════════════ */}
          <h2 style={sectionDivider}>B &mdash; Instagram Bot Privacy (@stevenangel.prod)</h2>

          <p style={body}>
            This section covers data collected when you interact with the{" "}
            <a
              href="https://www.instagram.com/stevenangel.prod/"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              @stevenangel.prod
            </a>{" "}
            Instagram automation (the &ldquo;Bot&rdquo;), built using the Steven
            Angel Marketing Meta App.
          </p>

          {/* What we collect (Bot) */}
          <h3 style={subheading}>What we collect</h3>
          <p style={body}>
            When you comment a trigger word (e.g. &ldquo;samples&rdquo;) on our
            Instagram posts, or message us afterwards, we collect:
          </p>
          <ul style={ulStyle}>
            <li>Your Instagram username</li>
            <li>Instagram-scoped user ID (IGSID)</li>
            <li>The comment ID</li>
            <li>The email address you reply with</li>
          </ul>

          {/* Why (Bot) */}
          <h3 style={subheading}>Why</h3>
          <p style={body}>
            Solely to send you the requested free download link via Instagram
            Direct Message.
          </p>

          {/* How it's stored (Bot) */}
          <h3 style={subheading}>How it&rsquo;s stored</h3>
          <p style={body}>
            Encrypted on Cloudflare D1, EU region. We do not share, sell, or
            transfer this data to third parties.
          </p>

          {/* Retention & deletion (Bot) */}
          <h3 style={subheading}>Retention &amp; deletion</h3>
          <p style={body}>
            Data is kept until you request deletion. To request deletion, email{" "}
            <a href="mailto:hello@steven-angel.com?subject=Delete%20my%20data" style={linkStyle}>
              hello@steven-angel.com
            </a>{" "}
            with the subject &ldquo;Delete my data&rdquo;. We will delete your
            record within 30 days.
          </p>

          {/* ════════════════════════════════════════════════
              CONTACT
              ════════════════════════════════════════════════ */}
          <h2 style={sectionDivider}>Contact</h2>
          <p style={body}>
            For any privacy question or request &mdash; whether about the website
            or the Instagram Bot &mdash; email{" "}
            <a href="mailto:hello@steven-angel.com" style={linkStyle}>
              hello@steven-angel.com
            </a>
            .
          </p>

          {/* Spacer */}
          <div style={{ height: 40 }} />

          {/* Back to home */}
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

      {/* Minimal footer */}
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

export default PrivacyPage;
