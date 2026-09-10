import React from "react";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";

/* ─── Color tokens (match /privacy) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";

/**
 * /accessibility — Accessibility statement.
 *
 * Required for an Israeli business site under the Equal Rights for Persons
 * with Disabilities (Service Accessibility Adjustments) Regulations, 2013,
 * reg. 35: standard followed, what was done, known gaps, a named contact,
 * and the date of the last review. Title + meta come from PageTitle in
 * main.jsx and the static SEO page in vite.config.js.
 */
const UPDATED = "10 September 2026";

export default function AccessibilityPage() {
  const heading = {
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 900,
    fontSize: "clamp(32px, 6vw, 56px)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1.1,
    background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: CYAN,
    marginBottom: 16,
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
  const ulStyle = { ...body, paddingLeft: 24 };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      <Nav />

      <main style={{ padding: "60px 20px 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={heading}>Accessibility Statement</h1>

          <p
            style={{
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.62)",
              marginBottom: 32,
              fontStyle: "italic",
            }}
          >
            Steven Angel &middot; Last reviewed: {UPDATED}
          </p>

          <p style={body}>
            steven-angel.com should work for everyone, including people who use
            a screen reader, navigate by keyboard only, need larger text or
            stronger contrast, or are sensitive to motion. This page explains
            what we have done, what is still imperfect, and how to reach us if
            something gets in your way.
          </p>

          <h2 style={subheading}>The standard we follow</h2>
          <p style={body}>
            The site is built to meet Israeli Standard IS 5568, which adopts the
            Web Content Accessibility Guidelines (WCAG) 2.0 at level AA, as
            required by the Equal Rights for Persons with Disabilities (Service
            Accessibility Adjustments) Regulations, 2013. Pages are checked with
            automated WCAG 2.0 A and AA scans and by hand with a keyboard.
          </p>

          <h2 style={subheading}>What we have done</h2>
          <ul style={ulStyle}>
            <li>An accessibility toolbar on every page (the round blue button, bottom left) with larger text, high contrast, grayscale, link highlighting, a plain readable font and a switch that stops animations and pauses background videos. Your choices are remembered on this device.</li>
            <li>A &ldquo;Skip to content&rdquo; link that appears on the first press of the Tab key.</li>
            <li>A clearly visible focus outline on every link, button and form field when you navigate by keyboard.</li>
            <li>Page structure with real headings, landmarks and labelled buttons, so screen readers can announce and jump between sections.</li>
            <li>Text and button colors checked against the WCAG AA contrast ratios.</li>
            <li>Text alternatives for meaningful images and accessible names on icon-only buttons such as play, pause and cart.</li>
            <li>Scroll-in animations are skipped when your device&rsquo;s &ldquo;reduce motion&rdquo; setting is on.</li>
            <li>Layouts that reflow on phones and tablets and keep working when the browser is zoomed to 200%.</li>
          </ul>

          <h2 style={subheading}>Known limitations</h2>
          <p style={body}>We are still working on these:</p>
          <ul style={ulStyle}>
            <li>Music previews and some videos have no captions or transcripts. Most of them are instrumental, and track details are always written next to the player.</li>
            <li>Payment windows are provided by PayPal and Airwallex and embedded pages come from YouTube and Instagram. Their accessibility is managed by those companies.</li>
            <li>Some older blog posts may contain images whose text alternatives are not yet complete.</li>
          </ul>
          <p style={body}>
            If any of these blocks you from buying, booking or getting
            information, contact us and we will give you the same service
            another way, for example by email, phone or WhatsApp.
          </p>

          <h2 style={subheading}>Accessibility contact</h2>
          <p style={body}>
            If you have trouble using the site, or have a suggestion, please
            tell us. We reply within 5 business days.
          </p>
          <ul style={ulStyle}>
            <li><strong>Name:</strong> Steven Angel</li>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:dj.steven.angel@gmail.com" style={linkStyle}>dj.steven.angel@gmail.com</a>
            </li>
            <li>
              <strong>Phone / WhatsApp:</strong>{" "}
              <a href="tel:+972523561353" style={linkStyle}>+972 52-356-1353</a>
            </li>
            <li><strong>Location:</strong> Tel Aviv, Israel</li>
          </ul>
          <p style={body}>
            It helps if you tell us the page address, what you were trying to
            do, and which browser and assistive technology you use.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
