/**
 * AuthContext — React context for shop user authentication
 *
 * Manages JWT token + user object via:
 *   - localStorage (key: "steven_angel_shop_token")
 *   - API calls to /shop/auth/* on the Railway backend
 *
 * Exposed via useAuth() hook:
 *   {
 *     user,            // { id, email, name, ... } or null
 *     token,           // JWT string or null
 *     loading,         // true while fetching /me on initial mount
 *     login(email, password)   → resolves with { user, token } or throws
 *     signup(email, password, name?) → resolves with { user, token } or throws
 *     logout()         // clears localStorage + state
 *     refresh()        // re-fetches /me (useful after a purchase)
 *   }
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = "https://ghost-backend-production-adb6.up.railway.app";
const TOKEN_KEY = "steven_angel_shop_token";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });
  const [loading, setLoading] = useState(true);

  // Helper: persist token to localStorage and state
  const persistToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(newToken);
  }, []);

  // Fetch current user from /me using stored token (also called on mount)
  const fetchMe = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/shop/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) {
        // Token expired or invalid → clear it
        persistToken(null);
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("[auth] fetchMe error:", err);
      // Network error — keep token but no user (will retry on refresh)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [persistToken]);

  // On mount, try to load user from stored token
  useEffect(() => {
    fetchMe(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/shop/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    persistToken(data.token);
    setUser(data.user);
    return data;
  }, [persistToken]);

  const signup = useCallback(async (email, password, name) => {
    const res = await fetch(`${API_BASE}/shop/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Signup failed");
    }
    persistToken(data.token);
    setUser(data.user);
    return data;
  }, [persistToken]);

  const logout = useCallback(() => {
    // Backend logout is a courtesy call (stateless JWT) — fire-and-forget
    if (token) {
      fetch(`${API_BASE}/shop/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    persistToken(null);
    setUser(null);
  }, [token, persistToken]);

  const refresh = useCallback(() => {
    return fetchMe(token);
  }, [fetchMe, token]);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refresh,
    apiBase: API_BASE,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
