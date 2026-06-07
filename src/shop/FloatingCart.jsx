/**
 * FloatingCart — small cart icon that floats top-right whenever the cart
 * has items. Hides itself on /shop/cart and /shop/checkout so it doesn't
 * stack with the page's own back/forward controls.
 *
 * Steven 2026-06-07: "אייקון של חלון קטן למעלה בצד ימין שנעלם" — small icon
 * top-right that disappears when not needed. Lives outside any specific
 * page (mounted from main.jsx inside <CartProvider>) so it shows on every
 * surface where a customer might be mid-browse and forget they have items.
 */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "./CartContext.jsx";

const CYAN = "#00E5FF";

const HIDE_ON = new Set(["/shop/cart", "/shop/checkout"]);

export default function FloatingCart() {
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  if (cartCount === 0) return null;
  if (HIDE_ON.has(pathname)) return null;

  return (
    <Link
      to="/shop/cart"
      aria-label={`Cart (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 2000,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "#000",
        border: `2px solid ${CYAN}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        boxShadow: `0 8px 24px rgba(0,229,255,0.35), 0 0 0 1px rgba(0,0,0,0.4)`,
        transition: "transform 160ms",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CYAN} strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          minWidth: 20,
          height: 20,
          padding: "0 6px",
          borderRadius: 10,
          background: CYAN,
          color: "#000",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.04em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #000",
          boxSizing: "content-box",
        }}
      >
        {cartCount}
      </span>
    </Link>
  );
}
