import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./shop/AuthContext.jsx";

const Ghost = lazy(() => import("./Ghost.jsx"));
const Sign = lazy(() => import("./Sign.jsx"));
const ShopPage = lazy(() => import("./shop/ShopPage.jsx"));
const ProductPage = lazy(() => import("./shop/ProductPage.jsx"));
const LoginPage = lazy(() => import("./shop/LoginPage.jsx"));
const SignupPage = lazy(() => import("./shop/SignupPage.jsx"));
const AccountPage = lazy(() => import("./shop/AccountPage.jsx"));

// Reserved shop subpaths that should NOT be treated as product slugs
const SHOP_RESERVED_PATHS = new Set(["login", "signup", "account"]);

// Dynamic page title + meta description per route (SEO)
// Note: ProductPage and auth pages set their own title/meta/canonical via useEffect.
// We skip the override here for dynamic shop pages to avoid clobbering.
function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    // Skip override for any /shop/<something> page — they handle SEO themselves
    const isShopSubPage = location.pathname.startsWith("/shop/") && location.pathname !== "/shop";
    if (isShopSubPage) return;

    const titles = {
      "/": "Ghost Producer · Afro House & Indie Dance | Steven Angel",
      "/ghost": "Afro House & Tech House Ghost Producer | Steven Angel",
      "/sign": "Ghost Production Agreement | Steven Angel",
      "/shop": "Ableton Templates & Afro House Masterclass | Steven Angel",
    };
    const descriptions = {
      "/": "Steven Angel — professional ghost producer. Afro House, Indie Dance & Tech House. Released on Moblack, MTGD, Sony.",
      "/ghost": "Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included.",
      "/sign": "Sign your ghost production agreement with Steven Angel.",
      "/shop": "Afro House Ableton templates and masterclass by Steven Angel — signed MTGD & Moblack artist. Hugel, Keinemusik, Moblack style. From $19.99. Instant download.",
    };
    document.title = titles[location.pathname] || titles["/"];
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", descriptions[location.pathname] || descriptions["/"]);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://steven-angel.com" + (location.pathname === "/" ? "/" : location.pathname));
  }, [location]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PageTitle />
        <Suspense fallback={<div style={{ background: "#000", minHeight: "100vh" }} />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/ghost" element={<Ghost />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/shop" element={<ShopPage />} />
            {/* Auth routes — must come BEFORE /shop/:slug so they're not treated as product slugs */}
            <Route path="/shop/login" element={<LoginPage />} />
            <Route path="/shop/signup" element={<SignupPage />} />
            <Route path="/shop/account" element={<AccountPage />} />
            <Route path="/shop/:slug" element={<ProductPage />} />
            {/* Catch-all — any unknown URL (e.g. /fallover, typos, stale links) redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
