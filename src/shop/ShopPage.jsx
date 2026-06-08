import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrderedProducts } from "./products.js";
import ProductCard from "./ProductCard.jsx";
import DiscountPopup from "./DiscountPopup.jsx";
import FreeAfroLatinPopup from "./FreeAfroLatinPopup.jsx";
import { useAuth } from "./AuthContext.jsx";
import { useCart } from "./CartContext.jsx";
import GhostCatalog from "./ghost/GhostCatalog.jsx";
import Footer from "../Footer.jsx";
import { useShopPlayer } from "./ShopPlayerContext.jsx";
import { trackWhatsAppLead, trackViewItemList } from "../lib/analytics/events";
import { usePageView, useScrollDepth, useTimeOnPage } from "../lib/analytics/hooks";

/* ─── Color Constants (matches BRAND_GUIDE.md) ─── */
const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BG = "#080810";
const BG_ALT = "#04040f";

/* ─── Style Helpers ─── */
const heading = (fontSize) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 900,
  fontSize,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.1,
});

const body = {
  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.7,
};

const label = (color = CYAN) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color,
});

export default function ShopPage() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const products = getOrderedProducts();
  const { user, loading: authLoading } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const { currentTrack } = useShopPlayer();

  const params = new URLSearchParams(location.search);
  const activeTab = params.get("tab") === "ghost" ? "ghost" : "shop";

  // Remarketing signals — distinct page_category per tab
  usePageView(activeTab === "ghost" ? "shop_ghost" : "shop");
  useScrollDepth(activeTab === "ghost" ? "shop_ghost" : "shop");
  useTimeOnPage(activeTab === "ghost" ? "shop_ghost" : "shop");

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Clarity: track shop page visit
  useEffect(() => {
    if (window.clarity) window.clarity("event", "shopVisit");
  }, []);

  // GA4 view_item_list — fire once on mount (StrictMode guard)
  const viewItemListFired = useRef(false);
  useEffect(() => {
    if (viewItemListFired.current) return;
    viewItemListFired.current = true;
    trackViewItemList(products, 'shop');
  }, []);

  // BreadcrumbList + CollectionPage + ItemList JSON-LD — Steven 2026-06-08
  // per SiteWise audit (only Person was found before). Helps Google + AI
  // shopping agents understand the shop catalog and price range.
  useEffect(() => {
    const existing = document.getElementById("shop-jsonld");
    if (existing) existing.remove();
    const ld = document.createElement("script");
    ld.id = "shop-jsonld";
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://steven-angel.com" },
          { "@type": "ListItem", position: 2, name: "Shop", item: "https://steven-angel.com/shop" },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Steven Angel — Shop",
        url: "https://steven-angel.com/shop",
        description: "Ableton templates, masterclasses, and sample packs from Steven Angel — Afro House, Tech House, Melodic Techno.",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Steven Angel — Templates & Lessons",
        itemListElement: products.slice(0, 10).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `https://steven-angel.com/shop/${p.slug}`,
          name: p.name,
        })),
      },
    ]);
    document.head.appendChild(ld);
    return () => {
      const node = document.getElementById("shop-jsonld");
      if (node) node.remove();
    };
  }, []);

  useEffect(() => {
    if (activeTab === "ghost" && window.clarity) window.clarity("event", "ghostCatalogView");
  }, [activeTab]);

  // Phase 4: Buy button opens the PayPal checkout modal
  const handleBuy = (product) => {
    setCheckoutProduct(product);
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", paddingBottom: currentTrack ? (isMobile ? 64 : 72) : 0 }}>
      {/* Welcome discount popup (shows once per visitor) */}
      {/* Lead magnet popup — replaces the old DiscountPopup. Old component
          still imported but not rendered, kept for quick rollback if needed. */}
      <FreeAfroLatinPopup />

      {/* Hidden H1 for SEO — long-tail keywords mixed in */}
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Afro House Ableton Templates, Melodic Techno Project Files & Online Masterclass — Hugel, Claptone, Keinemusik, Solomun & Artbat Style — Steven Angel Shop
      </h1>

      {/* Hidden H2 (also screen-reader only) — secondary keyword cluster */}
      <h2
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Premium Ableton Live project files download — Afro House, Melodic Techno, Tech House, Indie Dance — released on MTGD, Moblack, Godeeva
      </h2>

      {/* ═══ Top Nav Bar ═══ */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
          padding: "0 clamp(20px, 4vw, 48px)",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxSizing: "border-box",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              if (window.history.length > 2) window.history.back();
              else window.location.href = "/";
            }}
            aria-label="Go back"
            style={{
              background: "transparent",
              border: "none",
              color: CYAN,
              fontSize: 15,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              opacity: 0.8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.8; }}
          >
            ←
          </button>
          <Link
            to="/"
            style={{
              fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: "0.1em",
              textDecoration: "none",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            STEVEN <span style={{ color: CYAN }}>ANGEL</span>
          </Link>
        </div>

        {/* Nav links — hidden on small mobile */}
        {!isMobile && (
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[{ label: "Ghost", to: "/ghost" }, { label: "Lessons", to: "/lessons" }, { label: "Shop", to: "/shop" }].map(({ label, to }) => (
              <Link key={to} to={to} style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: to === "/shop" ? CYAN : "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Cart icon */}
          <Link
            to="/shop/cart"
            aria-label={`Cart (${cartCount} items)`}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 4,
              background: cartCount > 0 ? "rgba(0,229,255,0.08)" : "transparent",
              border: `1px solid ${cartCount > 0 ? CYAN : "rgba(255,255,255,0.15)"}`,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cartCount > 0 ? CYAN : "rgba(255,255,255,0.6)"} strokeWidth="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: CYAN, color: "#000",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: 11, minWidth: 18, height: 18,
                borderRadius: 9, display: "flex", alignItems: "center",
                justifyContent: "center", lineHeight: 1,
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Sign in / My Account — icon only */}
          {!authLoading && (
            <Link
              to={user ? "/shop/account" : "/shop/login"}
              aria-label={user ? "My account" : "Sign in"}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 4,
                background: user ? "rgba(0,229,255,0.08)" : "transparent",
                border: `1px solid ${user ? CYAN : "rgba(255,255,255,0.15)"}`,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={user ? CYAN : "rgba(255,255,255,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>
      </nav>

      <main>
        {/* ═══ Hero Section ═══ */}
        <section
          style={{
            padding: isMobile ? "50px 20px 30px" : "70px 60px 40px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ ...label(activeTab === "ghost" ? PURPLE : CYAN), marginBottom: 20 }}>SHOP</div>
            {activeTab === "ghost" ? (
              <>
                <div style={{ ...heading(isMobile ? 36 : 56), marginBottom: 16 }}>
                  Ghost Tracks<br />
                  <span style={{ color: PURPLE }}>For Sale</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 22, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
                  Exclusive · One Buyer Only · Full Rights Transfer
                </div>
                <div style={{ ...body, maxWidth: 580, margin: "0 auto", marginBottom: 18 }}>
                  Finished, release-ready tracks by{" "}
                  <span style={{ color: CYAN, fontWeight: 600 }}>Steven Angel</span>.
                  Each is sold exactly once. You get the WAV, the rights, and a signed NDA.
                  Once sold, it disappears from this catalog forever.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? 8 : 10 }}>
                  {["Mastered WAV & MP3", "Extended Edit & Radio Edit", "Stems", "NDA + Full Rights"].map((d) => (
                    <span key={d} style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 12px",
                      background: "rgba(187,134,252,0.06)",
                      border: "1px solid rgba(187,134,252,0.2)",
                      borderRadius: 20,
                      fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
                      fontSize: 11, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap",
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ ...heading(isMobile ? 36 : 56), marginBottom: 16 }}>
                  Ableton Templates &<br />
                  <span style={{ color: CYAN }}>Masterclass</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══ Trust Badges ═══ */}
        {/* min-height reserves space so badges don't shove content (was 0.254 CLS culprit on /shop) */}
        <div style={{
          display: "flex", justifyContent: "center", gap: isMobile ? 16 : 32,
          padding: isMobile ? "0 16px 24px" : "0 60px 28px",
          flexWrap: "wrap",
          minHeight: isMobile ? 64 : 36,
          alignItems: "center",
        }}>
          {[
            { icon: "🔒", stat: "100%", text: "Secure Payments" },
            { icon: "⚡", stat: "Instant", text: "Download After Payment" },
            { icon: "💬", stat: "24/7", text: "Support Available" },
          ].map(({ icon, stat, text }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.5)",
            }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ color: CYAN, fontWeight: 700, fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontSize: 13, letterSpacing: "0.05em" }}>{stat}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* ═══ Tab Strip ═══ */}
        <div style={{
          display: "flex", justifyContent: "center",
          padding: isMobile ? "0 16px 28px" : "0 60px 36px",
        }}>
          <div style={{
            display: "inline-flex", gap: 4,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: 4,
          }}>
            {[
              { key: "shop", label: "Templates & Masterclass", to: "/shop" },
              { key: "ghost", label: "Ghost Tracks", to: "/shop?tab=ghost" },
            ].map(({ key, label: tabLabel, to }) => (
              <Link
                key={key}
                to={to}
                style={{
                  padding: isMobile ? "8px 14px" : "9px 22px",
                  borderRadius: 6,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                  fontWeight: 700, fontSize: isMobile ? 12 : 13,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  textDecoration: "none", whiteSpace: "nowrap",
                  background: activeTab === key
                    ? (key === "ghost" ? `${PURPLE}20` : `${CYAN}18`)
                    : "transparent",
                  color: activeTab === key
                    ? (key === "ghost" ? PURPLE : CYAN)
                    : "rgba(255,255,255,0.45)",
                  border: activeTab === key
                    ? `1px solid ${key === "ghost" ? PURPLE : CYAN}50`
                    : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {tabLabel}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ SEO pills (templates tab only) ═══ */}
        {activeTab === "shop" && (
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, padding: isMobile ? "0 16px 30px" : "0 60px 40px", maxWidth: 1000, margin: "0 auto" }}>
            {["Afro House Templates", "Melodic Techno Templates", "Ableton Live Projects", "Hugel Style", "Keinemusik Style", "Solomun Style", "Artbat Style", "Sample Packs", "Online Masterclass", "Royalty-Free"].map((text) => (
              <span key={text} style={{ fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontWeight: 500, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                {text}
              </span>
            ))}
          </div>
        )}

        {/* ═══ Ghost Catalog ═══ */}
        {activeTab === "ghost" && (
          <section style={{ padding: isMobile ? "0 16px 60px" : "0 60px 80px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <GhostCatalog isMobile={isMobile} />
            </div>
          </section>
        )}

        {/* ═══ Products Grid (templates tab) ═══ */}
        {/* Anchors for Google Ads sitelinks: /shop#templates and /shop#demos
            both scroll to the products grid (every card has audio preview). */}
        {activeTab === "shop" && (
          <section id="templates" style={{ padding: isMobile ? "0 16px 60px" : "0 60px 80px", scrollMarginTop: 80 }}>
            <span id="demos" aria-hidden="true" />
            <div style={{ maxWidth: 1200, margin: "0 auto" }} data-shop-grid="true">
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: isMobile ? 20 : 24 }}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} isMobile={isMobile} onBuy={handleBuy} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ Mix & Mastering cross-promote (templates tab only) ═══ */}
        {activeTab === "shop" && (
          <section style={{ padding: isMobile ? "0 20px 60px" : "0 60px 80px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Link
                to="/mix-mastering"
                style={{
                  textDecoration: "none",
                  padding: isMobile ? "28px 24px" : "40px 48px",
                  background: "linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(187,134,252,0.12) 100%), #04040f",
                  border: "1px solid rgba(0,229,255,0.3)",
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  justifyContent: "space-between",
                  gap: isMobile ? 18 : 32,
                  transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "rgba(0,229,255,0.5)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,229,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.3em", textTransform: "uppercase", color: "#00E5FF", marginBottom: 8,
                  }}>
                    Mix &amp; Master Services
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900, fontSize: isMobile ? 24 : 32,
                    textTransform: "uppercase", letterSpacing: "0.02em", color: "#fff",
                    lineHeight: 1.1, marginBottom: 8,
                  }}>
                    Get Your Track Club Ready
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontSize: isMobile ? 14 : 15,
                    color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
                  }}>
                    Professional mastering from <strong style={{ color: "#00E5FF" }}>$35</strong>. Trusted by Hernan Cattaneo &amp; Dole &amp; Kom. 3-day turnaround, 16-bit WAV + HQ MP3.
                  </div>
                </div>
                <div style={{
                  padding: isMobile ? "12px 24px" : "14px 28px",
                  background: "linear-gradient(135deg, #00E5FF, #BB86FC)",
                  color: "#000", borderRadius: 8,
                  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 800,
                  fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  Master My Track →
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* ═══ FAQ / Trust Section (templates tab only) ═══ */}
        {activeTab === "shop" && (
          <section style={{ padding: isMobile ? "40px 20px" : "60px 60px", background: BG_ALT, borderTop: "1px solid #0d0d0d" }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div style={{ ...heading(isMobile ? 26 : 36), textAlign: "center", marginBottom: 32 }}>
                How It Works
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 20 : 32 }}>
                {[
                  { num: "1", title: "Choose & Pay", desc: "Pick your template or course. Pay securely with PayPal or credit card." },
                  { num: "2", title: "Instant Email", desc: "Receive your private download link in your inbox within seconds." },
                  { num: "3", title: "Lifetime Access", desc: "Create a free account to re-download anytime. No expiry, no limits." },
                ].map((step) => (
                  <div key={step.num} style={{ textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 900, fontSize: 20, margin: "0 auto 16px" }}>
                      {step.num}
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.05em", marginBottom: 8, color: "#fff" }}>
                      {step.title}
                    </div>
                    <div style={{ ...body, fontSize: 13 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* ═══ Support Widget ═══ */}
      <SupportWidget />

      {/* Checkout moved to /shop/cart page with full cart flow */}
    </div>
  );
}

function SupportWidget() {
  const [open, setOpen] = useState(false);
  const { currentTrack } = useShopPlayer();
  const WA = "https://wa.me/972523561353?text=Hi%20Steven%2C%20I%20have%20a%20question%20about%20the%20shop.";
  const MAIL = "mailto:hello@steven-angel.com?subject=Shop%20Support";

  // Lift the widget above the sticky player when it's visible
  const isMobileWidget = typeof window !== "undefined" ? window.innerWidth < 600 : false;
  const playerHeight = currentTrack ? (isMobileWidget ? 64 : 72) : 0;

  return (
    <div style={{ position: "fixed", bottom: 24 + playerHeight, right: 24, zIndex: 9000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, transition: "bottom 0.25s ease-out" }}>
      {open && (
        <div style={{
          background: "#0d0d1a", border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column",
          gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          minWidth: 200,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
            Need Help?
          </div>
          <a href={WA} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppLead("SH", "shop_help")} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "#25D366", borderRadius: 8, textDecoration: "none",
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontWeight: 600, fontSize: 13, color: "#fff",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z"/></svg>
            WhatsApp
          </a>
          <a href={MAIL} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)",
            borderRadius: 8, textDecoration: "none",
            fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif", fontWeight: 600, fontSize: 13, color: "#00E5FF",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            hello@steven-angel.com
          </a>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Support"
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background: open ? "#0d0d1a" : "linear-gradient(135deg,#00E5FF,#00b8d4)",
          border: open ? "2px solid #00E5FF" : "none",
          color: open ? "#00E5FF" : "#000",
          boxShadow: "0 4px 20px rgba(0,229,255,0.35)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, transition: "all 0.2s",
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
