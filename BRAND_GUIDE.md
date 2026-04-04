# Steven Angel — Brand & Style Guide
## For Content Creators & Marketing Agents

---

## Colors

### Primary
| Name | Hex | Usage |
|------|-----|-------|
| Cyan | `#00E5FF` | Primary accent, CTAs, highlights, links, headings accent |
| Purple | `#BB86FC` | Secondary accent, premium elements, "Full Production" package |
| Background | `#080810` | Main page background |
| Background Alt | `#04040f` | Alternate section background |
| Background Dark | `#02020a` | Footer, darkest elements |

### Shadows & Glows
| Name | Value | Usage |
|------|-------|-------|
| Cyan Glow | `0 0 24px rgba(0,229,255,0.4)` | Outline button glow |
| Purple Glow | `0 0 24px rgba(187,134,252,0.4)` | Premium button glow |
| WhatsApp Glow | `0 0 32px rgba(37,211,102,0.4)` | WhatsApp button glow |
| Cyan CTA Glow | `0 0 28px rgba(0,229,255,0.5)` | Filled CTA buttons |

### Text Colors
| Usage | Color |
|-------|-------|
| Primary text | `#ffffff` |
| Body text | `rgba(255,255,255,0.55)` |
| Muted text | `rgba(255,255,255,0.35)` |
| Label text | `rgba(255,255,255,0.4)` |
| Very muted | `rgba(255,255,255,0.25)` |

### Borders
| Usage | Value |
|-------|-------|
| Standard border | `1px solid #141420` |
| Subtle border | `1px solid #1a1a2e` |
| Section divider | `1px solid #0d0d0d` |
| Subtle white | `1px solid rgba(255,255,255,0.06)` |

### Gradients
| Name | Value | Usage |
|------|-------|-------|
| CTA Gradient | `linear-gradient(135deg, #00E5FF, #00b8d4)` | Primary CTA buttons |
| Premium Gradient | `linear-gradient(135deg, #0a0a20, #0d0418)` | Premium card background |
| Badge Gradient | `linear-gradient(90deg, #BB86FC, #00E5FF)` | Badges ("MOST POPULAR") |

---

## Typography

### Font Families

#### Barlow Condensed (Headings, Labels, Buttons)
- **Weights used:** 600, 700, 800, 900
- **Source:** Self-hosted woff2
- **Google Fonts link:** `https://fonts.google.com/specimen/Barlow+Condensed`
- **CSS:** `font-family: "Barlow Condensed", sans-serif`

#### DM Sans (Body Text, Descriptions)
- **Weights used:** 400, 500
- **Source:** Self-hosted woff2
- **Google Fonts link:** `https://fonts.google.com/specimen/DM+Sans`
- **CSS:** `font-family: "DM Sans", sans-serif`

#### Outfit (Logo only)
- **Weights used:** 300, 800
- **Source:** Self-hosted woff2
- **Google Fonts link:** `https://fonts.google.com/specimen/Outfit`
- **CSS:** `font-family: "Outfit", sans-serif`

### Text Styles

#### Main Heading (h1)
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 900;
letter-spacing: 0.04em;
text-transform: uppercase;
color: #fff;
line-height: 1.1;
/* Desktop: 64px | Mobile: 36px */
```

#### Section Heading (h2)
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 900;
letter-spacing: 0.04em;
text-transform: uppercase;
color: #fff;
line-height: 1.1;
/* Desktop: 40-44px | Mobile: 24-28px */
```

#### Label / Category
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 11px;
letter-spacing: 0.3em;
text-transform: uppercase;
color: #00E5FF; /* or rgba(255,255,255,0.4) for muted */
```

#### Body Text
```css
font-family: "DM Sans", sans-serif;
font-size: 15px;
color: rgba(255,255,255,0.55);
line-height: 1.7;
```

#### Button Text
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 14px;
letter-spacing: 0.2em;
text-transform: uppercase;
```

---

## Buttons

### Primary CTA (Filled)
```css
display: inline-flex;
align-items: center;
gap: 10px;
background: linear-gradient(135deg, #00E5FF, #00b8d4);
color: #000;
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 15px;
letter-spacing: 0.2em;
text-transform: uppercase;
padding: 16px 36px;
border-radius: 50px;
border: none;
box-shadow: 0 0 28px rgba(0,229,255,0.5);
```

### Outline Button (Cyan)
```css
display: inline-flex;
align-items: center;
gap: 8px;
background: transparent;
border: 2px solid #00E5FF;
color: #00E5FF;
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 14px;
letter-spacing: 0.2em;
text-transform: uppercase;
padding: 14px 32px;
border-radius: 50px;
box-shadow: 0 0 24px rgba(0,229,255,0.4);
```

### Outline Button (Purple)
```css
/* Same as cyan but: */
border: 2px solid #BB86FC;
color: #BB86FC;
box-shadow: 0 0 24px rgba(187,134,252,0.4);
```

### WhatsApp Button
```css
background: #1a7a42;
color: #fff;
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 15px;
letter-spacing: 0.15em;
padding: 16px 32px;
border-radius: 50px;
box-shadow: 0 0 32px rgba(37,211,102,0.4);
```

---

## Card Styles

### Standard Card
```css
background: #04040f;
border: 1px solid #141420;
border-radius: 10px;
padding: 28px 24px;
```

### Premium Card (Full Production)
```css
background: linear-gradient(135deg, #0a0a20, #0d0418);
border: 2px solid #BB86FC;
border-radius: 10px;
padding: 32px 28px;
box-shadow: 0 0 40px rgba(187,134,252,0.1);
```

### Input Field
```css
background: #08080f;
border: 1px solid #1a1a2e;
border-radius: 6px;
padding: 14px 16px;
color: #fff;
font-family: "DM Sans", sans-serif;
font-size: 14px;
```

---

## Badge / Pill Styles

### Signed To / Label Badge
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 600;
font-size: 11px;
letter-spacing: 0.12em;
padding: 3px 10px;
border: 1px solid rgba(187,134,252,0.25);
border-radius: 20px;
color: #BB86FC;
background: rgba(187,134,252,0.04);
```

### Supported By Badge
```css
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 12px;
letter-spacing: 0.15em;
padding: 5px 14px;
border: 1px solid rgba(0,229,255,0.2);
border-radius: 20px;
color: rgba(255,255,255,0.6);
background: rgba(0,229,255,0.04);
```

### Tag Badge (e.g., "BEST ENTRY POINT")
```css
background: rgba(0,229,255,0.15);
border: 1px solid #00E5FF;
color: #00E5FF;
font-family: "Barlow Condensed", sans-serif;
font-weight: 700;
font-size: 10px;
letter-spacing: 0.25em;
padding: 3px 14px;
border-radius: 20px;
```

---

## Key URLs
- Website: `https://steven-angel.com`
- Ghost page: `https://steven-angel.com/ghost`
- WhatsApp: `https://wa.me/972523561353`
- Calendly: `https://calendly.com/dj-steven-angel/15-min-zoom`
- Instagram: `https://www.instagram.com/theangels_tlv/`
- Spotify: `https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz`
- Beatport: `https://www.beatport.com/artist/the-angels-il/913642`
- RA: `https://ra.co/dj/theangels`
- SoundCloud: `https://soundcloud.com/theangelsoflove`

---

## Brand Voice
- **Premium but approachable** — not corporate, not casual
- **Direct and confident** — "I don't hide behind a marketplace"
- **Proof-driven** — always back claims with names (Hugel, Claptone, ARTBAT)
- **Short, punchy headlines** in Barlow Condensed uppercase
- **Warm body text** in DM Sans, lower opacity for breathing room
