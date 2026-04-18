/**
 * LoginPage — /shop/login
 *
 * Email + password sign-in form.
 * On success: redirects to /shop/account (or to the page in the `redirect` query param).
 * Has links to /shop/signup and /shop/forgot-password (forgot-password not implemented yet).
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.title = "Sign In | Steven Angel Shop";
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Determine where to send the user after login
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/shop/account";

  // If already logged in, redirect immediately
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
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
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
      {/* Top Logo Bar */}
      <div style={{ padding: isMobile ? "20px 20px 0" : "24px 60px 0" }}>
        <Link
          to="/"
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
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
          padding: isMobile ? "40px 20px" : "60px 60px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: BG_ALT,
            border: "1px solid #141420",
            borderTop: `2px solid ${CYAN}`,
            borderRadius: 12,
            padding: isMobile ? "32px 24px" : "40px 36px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Heading */}
          <div
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CYAN,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Sign In
          </div>
          <h1
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
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
            Welcome Back
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Sign in to access your downloads and re-download anytime.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email field */}
            <label
              style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "12px 14px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#fff",
                marginBottom: 18,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            {/* Password field */}
            <label
              style={{
                display: "block",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "12px 14px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 14,
                color: "#fff",
                marginBottom: 8,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />

            {/* Error message */}
            {error && (
              <div
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  color: "#ff6b6b",
                  marginTop: 8,
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

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginTop: 6, marginBottom: 4 }}>
              <Link to="/shop/forgot" style={{ fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
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
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#000",
                cursor: submitting ? "wait" : "pointer",
                marginTop: 14,
                marginBottom: 18,
                boxShadow: "0 0 24px rgba(0,229,255,0.4)",
              }}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Bottom links */}
          <div
            style={{
              textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
            }}
          >
            New customer?{" "}
            <Link
              to={`/shop/signup${location.search}`}
              style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}
            >
              Create an account
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
