/**
 * ResetPage — /shop/reset?token=XXX
 *
 * Reads token from URL. User enters new password + confirm → POST /shop/auth/reset.
 * On success: redirect to /shop/login with success flash.
 */
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const CYAN = "#00E5FF";
const BG = "#080810";
const BG_ALT = "#04040f";
const MIN_PASSWORD_LENGTH = 8;

export default function ResetPage() {
  const { apiBase } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "Reset Password | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => navigate("/shop/login", { replace: true }), 2500);
      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Request a new reset link.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/shop/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}>
        <Link to="/" style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", textDecoration: "none", color: "#fff" }}>
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
      </div>

      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "40px 20px" : "60px 60px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: BG_ALT, border: "1px solid #141420", borderTop: `2px solid ${CYAN}`, borderRadius: 12, padding: isMobile ? "32px 24px" : "40px 36px", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: CYAN, marginBottom: 12, textAlign: "center" }}>
            Reset Password
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900, fontSize: isMobile ? 28 : 34, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", lineHeight: 1.1, margin: "0 0 8px", textAlign: "center" }}>
            Choose a new password
          </h1>

          {success ? (
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <p style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 14, color: "#4ade80", lineHeight: 1.6, marginBottom: 20 }}>
                ✓ Password updated.
              </p>
              <p style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                Enter a new password for your account.
              </p>
              <form onSubmit={handleSubmit}>
                <label style={{ display: "block", fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  autoFocus
                  minLength={MIN_PASSWORD_LENGTH}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "12px 14px", fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 14, color: "#fff", marginBottom: 18, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <label style={{ display: "block", fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, padding: "12px 14px", fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 14, color: "#fff", marginBottom: 10, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                {error && (
                  <div style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: "#ff6b6b", marginTop: 8, marginBottom: 12, padding: "8px 12px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 4 }}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: "100%", background: submitting ? "rgba(0,229,255,0.4)" : `linear-gradient(135deg, ${CYAN}, #00b8d4)`, border: "none", borderRadius: 6, padding: "14px 28px", fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", color: "#000", cursor: submitting ? "wait" : "pointer", marginTop: 14, marginBottom: 18, boxShadow: "0 0 24px rgba(0,229,255,0.4)" }}
                >
                  {submitting ? "Resetting..." : "Set New Password"}
                </button>
              </form>
              <div style={{ textAlign: "center", fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                <Link to="/shop/login" style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>Back to sign in</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
