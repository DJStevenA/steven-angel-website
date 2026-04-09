/**
 * Box3D — realistic 3D template box mockup (DVD/CD case style, à la AFFECTEDD/ABT)
 *
 * Used by both ProductCard.jsx (in the shop grid) and ProductPage.jsx (per-product page).
 *
 * Renders a perspective-transformed box with:
 *   - Front face: full-bleed cover artwork + name overlay + spine logo
 *     → uses `product.coverImageUrl` if set (real photo), otherwise falls back
 *       to the procedural `GenreArtwork` SVG
 *   - Left spine face: vertical product name (the "VHS spine" effect)
 *   - Top edge highlight + drop shadow under the box
 *
 * To use a real cover image: set `coverImageUrl` on the product in products.js
 * (e.g. `coverImageUrl: "/shop/el-barrio-cover.jpg"`). The image should be
 * 1080×1350 or 1080×1080, with the bottom 30% dark enough for the title and
 * "By Steven Angel" overlay to read in white.
 *
 * GenreArtwork (fallback) picks the right SVG cover based on product.type and genre:
 *   - "course" → masterclass (Afro House dancer with raised arms + small play badge)
 *   - "techno" → Melodic Techno cosmic landscape (mountains, sun rings, stars)
 *   - default → Afro House mask + tribal sun
 */

import React from "react";

/* ─── GenreArtwork ─── */
function GenreArtwork({ product, accentColor, accentRgba, isPurple, isMobile }) {
  const stroke = accentColor;
  const baseSvgProps = {
    viewBox: "0 0 300 380",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid slice",
    "aria-hidden": "true",
  };

  /* ─── MASTERCLASS COVER (Afro House themed — same family as templates) ─── */
  if (product.type === "course") {
    return (
      <svg {...baseSvgProps}>
        <defs>
          <linearGradient id="mc_sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0610" />
            <stop offset="40%" stopColor={isPurple ? "#3d0e4a" : "#3d1410"} />
            <stop offset="75%" stopColor={isPurple ? "#1a0530" : "#5c1010"} />
            <stop offset="100%" stopColor="#0a0008" />
          </linearGradient>
          <radialGradient id="mc_sun_grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="25%" stopColor="#ffd166" stopOpacity="0.9" />
            <stop offset="55%" stopColor={accentColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mc_overlay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect width="300" height="380" fill="url(#mc_sky)" />
        <circle cx="150" cy="180" r="105" fill="url(#mc_sun_grad)" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const innerR = 110;
          const outerR = 140;
          const x1 = 150 + Math.cos(angle) * innerR;
          const y1 = 180 + Math.sin(angle) * innerR;
          const x2 = 150 + Math.cos(angle) * outerR;
          const y2 = 180 + Math.sin(angle) * outerR;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd166" strokeWidth="1.8" opacity="0.4" />
          );
        })}
        {/* Head */}
        <circle cx="150" cy="155" r="34" fill="#000" opacity="0.92" />
        {/* Headdress feathers */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 6) * (Math.PI * 0.85) - Math.PI * 0.925;
          const r = 34;
          const tipR = 60;
          const tipX = 150 + Math.cos(angle) * tipR;
          const tipY = 155 + Math.sin(angle) * tipR;
          const leftX = 150 + Math.cos(angle - 0.11) * r;
          const leftY = 155 + Math.sin(angle - 0.11) * r;
          const rightX = 150 + Math.cos(angle + 0.11) * r;
          const rightY = 155 + Math.sin(angle + 0.11) * r;
          return (
            <polygon
              key={i}
              points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
              fill="#000"
              opacity="0.92"
            />
          );
        })}
        {/* Mask features */}
        <ellipse cx="138" cy="151" rx="5" ry="2" fill={accentColor} opacity="0.95" />
        <ellipse cx="162" cy="151" rx="5" ry="2" fill={accentColor} opacity="0.95" />
        <line x1="150" y1="155" x2="150" y2="170" stroke={accentColor} strokeWidth="1.5" opacity="0.85" />
        <rect x="143" y="173" width="14" height="2" fill={accentColor} opacity="0.8" />
        <circle cx="128" cy="163" r="1.5" fill={accentColor} opacity="0.8" />
        <circle cx="172" cy="163" r="1.5" fill={accentColor} opacity="0.8" />
        {/* Body with raised arms */}
        <path d="M 122 192 Q 150 188 178 192 L 192 280 Q 150 290 108 280 Z" fill="#000" opacity="0.92" />
        <path
          d="M 122 195 Q 95 175 78 145 Q 76 142 80 140 Q 84 138 88 142 Q 110 175 130 200 Z"
          fill="#000"
          opacity="0.92"
        />
        <path
          d="M 178 195 Q 205 175 222 145 Q 224 142 220 140 Q 216 138 212 142 Q 190 175 170 200 Z"
          fill="#000"
          opacity="0.92"
        />
        {Array.from({ length: 7 }).map((_, i) => (
          <circle
            key={i}
            cx={130 + i * 6.7}
            cy={200 + Math.sin(i * 0.6) * 2}
            r="1.8"
            fill={accentColor}
            opacity="0.85"
          />
        ))}
        <line x1="0" y1="290" x2="300" y2="290" stroke={accentColor} strokeWidth="0.8" opacity="0.5" />
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (i * 23) % 300;
          const y = 295 + (i % 5) * 8;
          return <circle key={i} cx={x} cy={y} r={0.6 + (i % 3) * 0.3} fill="#ffd166" opacity="0.5" />;
        })}
        {/* Play badge */}
        <circle cx="260" cy="35" r="14" fill="rgba(0,0,0,0.7)" stroke={accentColor} strokeWidth="1.2" />
        <polygon points="255,28 255,42 268,35" fill={accentColor} />
        <rect width="300" height="380" fill="url(#mc_overlay)" />
      </svg>
    );
  }

  /* ─── MELODIC TECHNO COVER ─── */
  if (/melodic techno|techno/i.test(product.genre)) {
    return (
      <svg {...baseSvgProps}>
        <defs>
          <linearGradient id="mt_sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#040818" />
            <stop offset="40%" stopColor="#0a1428" />
            <stop offset="70%" stopColor={isPurple ? "#1a0530" : "#04202c"} />
            <stop offset="100%" stopColor="#000" />
          </linearGradient>
          <radialGradient id="mt_sun" cx="50%" cy="55%" r="38%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="25%" stopColor={accentColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mt_overlay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect width="300" height="380" fill="url(#mt_sky)" />
        {Array.from({ length: 50 }).map((_, i) => {
          const x = ((i * 31 + 13) % 295) + 3;
          const y = ((i * 17) % 200) + 5;
          const r = 0.5 + (i % 4) * 0.4;
          return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.4 + (i % 5) * 0.12} />;
        })}
        {[150, 120, 90, 60, 30].map((r, i) => (
          <circle
            key={r}
            cx="150"
            cy="200"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity={0.18 + (4 - i) * 0.06}
          />
        ))}
        <circle cx="150" cy="200" r="80" fill="url(#mt_sun)" />
        <polygon
          points="0,310 40,260 80,290 130,225 170,275 220,235 260,285 300,250 300,380 0,380"
          fill="#000"
          opacity="0.92"
        />
        <polygon
          points="0,330 50,290 110,310 160,270 210,300 260,275 300,295 300,380 0,380"
          fill="#000"
          opacity="0.7"
        />
        <rect width="300" height="380" fill="url(#mt_overlay)" />
      </svg>
    );
  }

  /* ─── AFRO HOUSE COVER (default) ─── */
  return (
    <svg {...baseSvgProps}>
      <defs>
        <linearGradient id="ah_sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0610" />
          <stop offset="40%" stopColor={isPurple ? "#3d0e4a" : "#3d1410"} />
          <stop offset="75%" stopColor={isPurple ? "#1a0530" : "#5c1010"} />
          <stop offset="100%" stopColor="#0a0008" />
        </linearGradient>
        <radialGradient id="ah_sun_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="25%" stopColor="#ffd166" stopOpacity="0.9" />
          <stop offset="55%" stopColor={accentColor} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ah_overlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="50%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="300" height="380" fill="url(#ah_sky)" />
      <circle cx="150" cy="180" r="100" fill="url(#ah_sun_grad)" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const innerR = 105;
        const outerR = 135;
        const x1 = 150 + Math.cos(angle) * innerR;
        const y1 = 180 + Math.sin(angle) * innerR;
        const x2 = 150 + Math.cos(angle) * outerR;
        const y2 = 180 + Math.sin(angle) * outerR;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffd166" strokeWidth="1.8" opacity="0.4" />
        );
      })}
      {/* Head */}
      <circle cx="150" cy="170" r="38" fill="#000" opacity="0.92" />
      {/* Decorative crown */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = (i / 9) * Math.PI - Math.PI;
        const r = 38;
        const tipR = 56;
        const tipX = 150 + Math.cos(angle) * tipR;
        const tipY = 170 + Math.sin(angle) * tipR;
        const leftX = 150 + Math.cos(angle - 0.13) * r;
        const leftY = 170 + Math.sin(angle - 0.13) * r;
        const rightX = 150 + Math.cos(angle + 0.13) * r;
        const rightY = 170 + Math.sin(angle + 0.13) * r;
        return (
          <polygon
            key={i}
            points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
            fill="#000"
            opacity="0.92"
          />
        );
      })}
      {/* Mask features */}
      <ellipse cx="138" cy="166" rx="5" ry="2" fill={accentColor} opacity="0.95" />
      <ellipse cx="162" cy="166" rx="5" ry="2" fill={accentColor} opacity="0.95" />
      <line x1="150" y1="170" x2="150" y2="184" stroke={accentColor} strokeWidth="1.5" opacity="0.85" />
      <rect x="143" y="187" width="14" height="2" fill={accentColor} opacity="0.8" />
      <circle cx="128" cy="177" r="1.5" fill={accentColor} opacity="0.8" />
      <circle cx="172" cy="177" r="1.5" fill={accentColor} opacity="0.8" />
      <circle cx="125" cy="183" r="1.5" fill={accentColor} opacity="0.8" />
      <circle cx="175" cy="183" r="1.5" fill={accentColor} opacity="0.8" />
      {/* Body */}
      <path d="M 122 208 Q 150 205 178 208 L 192 280 Q 150 290 108 280 Z" fill="#000" opacity="0.92" />
      {Array.from({ length: 7 }).map((_, i) => (
        <circle
          key={i}
          cx={130 + i * 6.7}
          cy={216 + Math.sin(i * 0.6) * 2}
          r="1.8"
          fill={accentColor}
          opacity="0.85"
        />
      ))}
      <line x1="0" y1="290" x2="300" y2="290" stroke={accentColor} strokeWidth="0.8" opacity="0.5" />
      {Array.from({ length: 20 }).map((_, i) => {
        const x = (i * 23) % 300;
        const y = 295 + (i % 5) * 8;
        return <circle key={i} cx={x} cy={y} r={0.6 + (i % 3) * 0.3} fill="#ffd166" opacity="0.5" />;
      })}
      <rect width="300" height="380" fill="url(#ah_overlay)" />
    </svg>
  );
}

/* ─── Box3D — the 3D box wrapper ─── */
export default function Box3D({ product, isPurple, accentColor, accentRgba, isMobile }) {
  const spineGradient = isPurple
    ? `linear-gradient(180deg, #1a0530 0%, #0a020f 100%)`
    : `linear-gradient(180deg, #021018 0%, #02060d 100%)`;

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        position: "relative",
        perspective: "1400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      {/* Drop shadow under the box */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          right: "14%",
          height: "16px",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(12px)",
        }}
      />
      {/* Color glow under the box */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "15%",
          right: "20%",
          height: "20px",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(${accentRgba},0.4) 0%, rgba(0,0,0,0) 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* The 3D box wrapper */}
      <div
        style={{
          width: "82%",
          height: "82%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: "rotateY(20deg) rotateX(2deg)",
        }}
      >
        {/* LEFT SPINE FACE */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "16%",
            height: "100%",
            background: spineGradient,
            border: `1px solid rgba(${accentRgba},0.3)`,
            borderRight: "none",
            borderRadius: "3px 0 0 3px",
            transformOrigin: "right center",
            transform: "rotateY(-72deg)",
            boxShadow: `inset -10px 0 16px rgba(0,0,0,0.7)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#fff",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              whiteSpace: "nowrap",
              textShadow: `0 0 8px rgba(${accentRgba},0.6)`,
            }}
          >
            STEVEN ANGEL
          </div>
        </div>

        {/* FRONT FACE — full-bleed cover artwork + overlay text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            border: `1px solid rgba(${accentRgba},0.5)`,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: `0 30px 70px rgba(0,0,0,0.7), 0 0 60px rgba(${accentRgba},0.15)`,
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            {product.coverImageUrl ? (
              <img
                src={product.coverImageUrl}
                alt={product.name}
                loading="lazy"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <GenreArtwork
                product={product}
                accentColor={accentColor}
                accentRgba={accentRgba}
                isPurple={isPurple}
                isMobile={isMobile}
              />
            )}
          </div>

          {/* Top tag */}
          <div
            style={{
              position: "absolute",
              top: "5%",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 8,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              padding: "0 12px",
            }}
          >
            {product.genre.split("/")[0].trim()} · {product.daw} Template
          </div>

          {/* Big product name */}
          <div
            style={{
              position: "absolute",
              bottom: "16%",
              left: 0,
              right: 0,
              textAlign: "center",
              padding: "0 8%",
            }}
          >
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 22 : 28,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "#fff",
                lineHeight: 0.95,
                textShadow: `0 4px 16px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,1)`,
                wordBreak: "break-word",
              }}
            >
              {product.name}
            </div>
          </div>

          {/* Steven Angel signature */}
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 2,
                background: accentColor,
                margin: "0 auto 6px",
                boxShadow: `0 0 10px rgba(${accentRgba},0.8)`,
              }}
            />
            <div
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: accentColor,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              By Steven Angel
            </div>
          </div>
        </div>

        {/* TOP edge highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "5%",
            background: `linear-gradient(180deg, rgba(${accentRgba},0.5) 0%, transparent 100%)`,
            transformOrigin: "top center",
            transform: "rotateX(75deg) translateY(-25%)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}
