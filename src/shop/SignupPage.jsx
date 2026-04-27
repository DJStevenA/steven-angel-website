/**
 * SignupPage — /shop/signup
 *
 * Email + password + (optional) name signup form.
 * On success: redirects to /shop/account (or to the page in the `redirect` query param).
 * Has a link back to /shop/login.
 *
 * Validation:
 * - Email must be valid format (HTML5 + server validates again)
 * - Password must be at least 8 characters (matches backend MIN_PASSWORD_LENGTH)
 * - Confirm password must match
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const CYAN = "#00E5FF";
const BG = "#080810";
const BG_ALT = "#04040f";

export default function SignupPage() {
  const { signup, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "Create Account | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/shop/account";

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signup(email, password, name || undefined);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6,
    padding: "12px 14px",
    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
    fontSize: 14,
    color: "#fff",
    marginBottom: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)",
    marginBottom: 8,
  };

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}>
        <Link
          to="/"
          style={{
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.1em",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          STEVEN <span style={{ color: CYAN }}>ANGEL</span>
        </Link>
      </div>

      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "30px 20px" : "50px 60px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: BG_ALT,
            border: "1px solid #141420",
            borderTop: `2px solid ${CYAN}`,
            borderRadius: 12,
            padding: isMobile ? "32px 24px" : "40px 36px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Create Account
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 900,
              fontSize: isMobile ? 30 : 38,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#fff",
              lineHeight: 1.1,
              margin: "0 0 8px",
              textAlign: "center",
            }}
          >
            Join the Shop
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Get lifetime access to your downloads. Re-download anytime.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            <label style={labelStyle}>Password (minimum 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            {error && (
              <div
                style={{
                  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                  fontSize: 12,
                  color: "#ff6b6b",
                  marginTop: 4,
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: "rgba(255,107,107,0.08)",
                  border: "1px solid rgba(255,107,107,0.3)",
                  borderRadius: 4,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: submitting
                  ? "rgba(0,229,255,0.4)"
                  : `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                border: "none",
                borderRadius: 6,
                padding: "14px 28px",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#000",
                cursor: submitting ? "wait" : "pointer",
                marginTop: 8,
                marginBottom: 18,
                boxShadow: "0 0 24px rgba(0,229,255,0.4)",
              }}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
            }}
          >
            Already have an account?{" "}
            <Link
              to={`/shop/login${location.search}`}
              style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}
            >
              Sign in
            </Link>
            <br />
            <Link
              to="/shop"
              style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
