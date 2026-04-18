/**
 * ForgotPage — /shop/forgot
 *
 * Enter email → POST /shop/auth/forgot → show "check your email" message.
 * Backend returns {ok: true} regardless of whether email exists (no enumeration).
 */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const CYAN = "#00E5FF";
const BG = "#080810";
const BG_ALT = "#04040f";

export default function ForgotPage() {
  const { apiBase } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "Forgot Password | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/shop/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}>
        <Link to="/" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", textDecoration: "none", color: "#fff" }}>
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
      </div>

      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "60px 60px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: BG_ALT, border: "1px solid #141420", borderTop: `2px solid ${CYAN}`, borderRadius: 12, padding: isMobile ? "32px 24px" : "40px 36px", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: CYAN, marginBottom: 12, textAlign: "center" }}>
            Forgot Password
          </div>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 34, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1, margin: "0 0 8px", textAlign: "center" }}>
            Reset Your Password
          </h1>

          {sent ? (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 20 }}>
                If an account exists for <strong style={{ color: CYAN }}>{email}</strong>, you'll get a password reset email within a minute.
              </p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 24 }}>
                Check your spam folder if you don't see it. The link is valid for 1 hour.
              </p>
              <Link to="/shop/login" style={{ color: CYAN, textDecoration: "none", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "12px 14px", fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "#fff", marginBottom: 18, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                {error && (
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#ff6b6b", marginBottom: 12, padding: "8px 12px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 4 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: "100%", background: submitting ? "rgba(0,229,255,0.4)" : `linear-gradient(135deg, ${CYAN}, #00b8d4)`, border: "none", borderRadius: 6, padding: "14px 28px", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "#000", cursor: submitting ? "wait" : "pointer", marginTop: 6, marginBottom: 18, boxShadow: "0 0 24px rgba(0,229,255,0.4)" }}
                >
                  {submitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <div style={{ textAlign: "center", fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                Remembered it?{" "}
                <Link to="/shop/login" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
                <br />
                <Link to="/shop" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Back to shop</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
