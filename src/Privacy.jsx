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
 * Last updated: 2026-09-10 (Israeli Privacy Protection Law + Amendment 13,
 * Meta Pixel and Airwallex disclosures; Section B unchanged).
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
            Steven Angel &middot; Last updated: 2026-09-10
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
          <p style={body}>
            We handle personal data under the Israeli Protection of Privacy Law,
            5741-1981, including Amendment 13 (in force since August 2025), and,
            for visitors in the EU and UK, the GDPR. Where the two differ, we
            apply whichever gives you more protection.
          </p>

          {/* ════════════════════════════════════════════════
              SECTION A — WEBSITE PRIVACY
              ════════════════════════════════════════════════ */}
          <h2 style={sectionDivider}>A &middot; Website Privacy (steven-angel.com)</h2>

          {/* Who we are */}
          <h3 style={subheading}>Who we are</h3>
          <p style={body}>
            steven-angel.com is operated by Steven Angel (sole proprietor),
            based in Tel Aviv, Israel, who is the controller (database owner)
            of the personal data described here. Contact:{" "}
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
              depth), plus the Google Ads tag and the Meta Pixel, which record
              visits and purchases so we can measure ads on Google, Facebook
              and Instagram.
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
              or Airwallex (card, Apple Pay, Google Pay). We receive a
              transaction ID, the product purchased, the amount, and the email
              used. We do <em>not</em> see or store your card number.
            </li>
            <li>
              <strong>Clicking a Google Ads or Meta Ads link to the site:</strong>{" "}
              click attribution data (Google Click ID, Facebook Click ID) used
              for ad performance measurement.
            </li>
            <li>
              <strong>Clicking a WhatsApp button:</strong> nothing is collected
              by us: the click opens WhatsApp directly; if you message,
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
              <strong>Strictly necessary:</strong> auth session (JWT, set
              when you log in to the shop), 30-day expiry. Cannot be disabled.
            </li>
            <li>
              <strong>Analytics:</strong> Google Analytics 4
              (<code>_ga</code>, <code>_ga_*</code>), Microsoft Clarity
              (<code>_clck</code>, <code>_clsk</code>). Anonymized.
            </li>
            <li>
              <strong>Advertising:</strong> Google Ads conversion tracking and
              remarketing tags, and the Meta Pixel (<code>_fbp</code>,{" "}
              <code>_fbc</code>). Used to measure ad performance and to show
              relevant ads on Google's network and on Facebook and Instagram.
            </li>
          </ul>
          <p style={body}>
            You can block or delete analytics and advertising cookies in your
            browser settings at any time; the site keeps working without them.
            You can also turn off personalised ads in your{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>Google ad settings</a>{" "}
            and your{" "}
            <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" style={linkStyle}>Meta ad preferences</a>.
          </p>

          {/* Third-party services */}
          <h3 style={subheading}>Third-party services we share data with</h3>
          <p style={body}>
            We share the minimum data needed for these tools to function:
          </p>
          <ul style={ulStyle}>
            <li><strong>Google Analytics 4:</strong> anonymized usage data (Google LLC, US; EU-US Data Privacy Framework certified).</li>
            <li><strong>Microsoft Clarity:</strong> session recordings without sensitive form data (Microsoft Corp., US).</li>
            <li><strong>Google Ads:</strong> click and conversion data (Google LLC).</li>
            <li><strong>Meta Pixel:</strong> page views, product views, add-to-cart and purchase events for Facebook and Instagram ads (Meta Platforms Ireland Ltd. / Meta Platforms Inc., US).</li>
            <li><strong>PayPal:</strong> payment processing only (PayPal Holdings).</li>
            <li><strong>Airwallex:</strong> card, Apple Pay and Google Pay processing only (Airwallex).</li>
            <li><strong>Brevo:</strong> email delivery for transactional and marketing emails (Brevo SAS, EU).</li>
            <li><strong>Cloudflare:</strong> CDN, DDoS protection, R2 file storage (Cloudflare Inc., US/EU).</li>
            <li><strong>Netlify:</strong> static site hosting (Netlify Inc., US).</li>
            <li><strong>Railway:</strong> backend application hosting (Railway Corp., US).</li>
          </ul>

          {/* Your rights */}
          <h3 style={subheading}>Your rights</h3>
          <p style={body}>
            Regardless of where you are, you can:
          </p>
          <ul style={ulStyle}>
            <li><strong>Access:</strong> request a copy of the data we hold on you (section 13 of the Israeli Privacy Law).</li>
            <li><strong>Correct:</strong> ask us to fix or delete data that is wrong, incomplete or out of date (section 14).</li>
            <li><strong>Delete:</strong> ask us to delete your account and associated data.</li>
            <li><strong>Object:</strong> opt out of analytics, advertising, or marketing emails, and ask to be removed from any mailing list (section 17F).</li>
            <li><strong>Portability</strong> (GDPR / EU): receive your data in a machine-readable format.</li>
            <li><strong>Do Not Sell My Personal Information</strong> (CCPA / California): we never sell your data, but you can confirm this in writing if you want.</li>
          </ul>
          <p style={body}>
            To exercise any of these rights, email{" "}
            <a href="mailto:hello@steven-angel.com" style={linkStyle}>
              hello@steven-angel.com
            </a>
            . We respond within 30 days. If you are not satisfied with our
            answer, you can complain to the Israeli{" "}
            <a href="https://www.gov.il/en/departments/the_privacy_protection_authority" target="_blank" rel="noopener noreferrer" style={linkStyle}>Privacy Protection Authority</a>
            {" "}or, in the EU/UK, to your local data protection authority.
          </p>

          {/* Israeli notice duty (section 11, as amended by Amendment 13) */}
          <h3 style={subheading}>Is giving us your data required?</h3>
          <p style={body}>
            No law requires you to give us any personal data; it is your
            choice. Without the details a form or checkout asks for, though, we
            cannot complete that purchase, deliver the download, or answer your
            request. Browsing the site needs no personal details at all.
          </p>

          {/* Security + transfers abroad */}
          <h3 style={subheading}>How we protect your data</h3>
          <ul style={ulStyle}>
            <li>The whole site runs over HTTPS, and passwords are stored only as salted hashes.</li>
            <li>Card details go straight to PayPal or Airwallex and never reach our servers.</li>
            <li>Access to customer data is limited to Steven.</li>
            <li>Some of the providers above store data outside Israel (mainly in the US and EU). We only use providers bound by security and privacy commitments that meet Israeli rules on transferring data abroad.</li>
            <li>If a serious security incident affects your data, we report it to the Privacy Protection Authority as the law requires and tell affected users.</li>
          </ul>

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
          <h2 style={sectionDivider}>B &middot; Instagram Bot Privacy (@stevenangel.prod)</h2>

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
