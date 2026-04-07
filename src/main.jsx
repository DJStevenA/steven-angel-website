import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App.jsx";

const Ghost = lazy(() => import("./Ghost.jsx"));
const Sign = lazy(() => import("./Sign.jsx"));
const ShopPage = lazy(() => import("./shop/ShopPage.jsx"));

// Dynamic page title + meta description per route (SEO)
function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      "/": "Ghost Producer · Afro House & Indie Dance | Steven Angel",
      "/ghost": "Afro House Ghost Producer — Signed MTGD & Moblack Artist | Steven Angel",
      "/sign": "Ghost Production Agreement | Steven Angel",
      "/shop": "Ableton Templates & Afro House Masterclass | Steven Angel",
    };
    const descriptions = {
      "/": "Steven Angel — professional ghost producer. Afro House, Indie Dance & Tech House. Released on Moblack, MTGD, Sony.",
      "/ghost": "Ghost production by a signed MTGD & Moblack artist. Afro House, Indie Dance & Tech House. From $300. NDA included.",
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
      <PageTitle />
      <Suspense fallback={<div style={{ background: "#000", minHeight: "100vh" }} />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/ghost" element={<Ghost />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
