import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOrderedProducts } from "./products.js";
import ProductCard from "./ProductCard.jsx";
import DiscountPopup from "./DiscountPopup.jsx";
import CheckoutModal from "./CheckoutModal.jsx";
import { useAuth } from "./AuthContext.jsx";
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
  fontFamily: "Barlow Condensed, sans-serif",
  fontWeight: 900,
  fontSize,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#fff",
  lineHeight: 1.1,
});

const body = {
  fontFamily: "DM Sans, sans-serif",
  fontSize: 15,
  color: "rgba(255,255,255,0.6)",
  lineHeight: 1.7,
};

const label = (color = CYAN) => ({
  fontFamily: "Barlow Condensed, sans-serif",
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
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const products = getOrderedProducts();
  const { user, loading: authLoading } = useAuth();
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
      <DiscountPopup />

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
              fontFamily: "Barlow Condensed, sans-serif",
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
              <Link key={to} to={to} style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", color: to === "/shop" ? CYAN : "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Sign in / My Account button — hidden during initial auth load to avoid flicker */}
        {!authLoading && (
          <Link
            to={user ? "/shop/account" : "/shop/login"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: user ? "rgba(0,229,255,0.08)" : "transparent",
              border: `1px solid ${user ? CYAN : "rgba(255,255,255,0.2)"}`,
              color: user ? CYAN : "rgba(255,255,255,0.85)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: isMobile ? 11 : 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: isMobile ? "7px 14px" : "9px 18px",
              borderRadius: 4,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {user ? (isMobile ? "Account" : "My Account") : "Sign In"}
          </Link>
        )}
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
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 22, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
                  Exclusive · One Buyer Only · Full Rights Transfer
                </div>
                <div style={{ ...body, maxWidth: 580, margin: "0 auto" }}>
                  Finished, release-ready tracks by{" "}
                  <span style={{ color: CYAN, fontWeight: 600 }}>Steven Angel</span>.
                  Each is sold exactly once. You get the WAV, the rights, and a signed NDA.
                  Once sold, it disappears from this catalog forever.
                </div>
              </>
            ) : (
              <>
                <div style={{ ...heading(isMobile ? 36 : 56), marginBottom: 16 }}>
                  Ableton Templates &<br />
                  <span style={{ color: CYAN }}>Afro House Masterclass</span>
                </div>
                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: isMobile ? 16 : 22, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", marginBottom: 28 }}>
                  Real Sessions From a Signed Artist · Instant Download
                </div>
                <div style={{ ...body, maxWidth: 640, margin: "0 auto" }}>
                  Production templates and a video masterclass by{" "}
                  <span style={{ color: CYAN, fontWeight: 600 }}>Steven Angel</span> — released on{" "}
                  <span style={{ color: PURPLE, fontWeight: 600 }}>MTGD, Moblack, Godeeva, Sony</span>
                  . The exact sessions used for tracks played by{" "}
                  <span style={{ color: CYAN, fontWeight: 600 }}>Hugel, Claptone, and ARTBAT</span>.
                </div>
              </>
            )}
          </div>
        </section>

        {/* ═══ Trust Badges ═══ */}
        <div style={{
          display: "flex", justifyContent: "center", gap: isMobile ? 16 : 32,
          padding: isMobile ? "0 16px 24px" : "0 60px 28px",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "🔒", stat: "100%", text: "Secure Payments" },
            { icon: "⚡", stat: "Instant", text: "Download After Payment" },
            { icon: "💬", stat: "24/7", text: "Support Available" },
          ].map(({ icon, stat, text }) => (
            <div key={text} style={{
              display: "flex", alignItems: "center", gap: 8,
              fontFamily: "DM Sans, sans-serif", fontSize: 12,
              color: "rgba(255,255,255,0.5)",
            }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ color: CYAN, fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, letterSpacing: "0.05em" }}>{stat}</span>
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
                  fontFamily: "Barlow Condensed, sans-serif",
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
              <span key={text} style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
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
        {activeTab === "shop" && (
          <section style={{ padding: isMobile ? "0 16px 60px" : "0 60px 80px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }} data-shop-grid="true">
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: isMobile ? 20 : 24 }}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} isMobile={isMobile} onBuy={handleBuy} />
                ))}
              </div>
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
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${CYAN}, #00b8d4)`, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 20, margin: "0 auto 16px" }}>
                      {step.num}
                    </div>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.05em", marginBottom: 8, color: "#fff" }}>
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

      {/* Checkout Modal — opens when user clicks Buy Now on any product card */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
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
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
            Need Help?
          </div>
          <a href={WA} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppLead("SH", "shop_help")} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "#25D366", borderRadius: 8, textDecoration: "none",
            fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "#fff",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z"/></svg>
            WhatsApp
          </a>
          <a href={MAIL} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)",
            borderRadius: 8, textDecoration: "none",
            fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "#00E5FF",
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
