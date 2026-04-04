# Steven Angel Website — Project Status
## Date: 2026-04-04

---

## What Happened (The Problem)

The live site (steven-angel.com) was always deployed to Netlify via **manual drag & drop** (Netlify Drop).
It was never synced with GitHub.

The source folders on the Mac (`steven-angel-website 1-7`) contained **older versions** of the code — only the homepage (`App.jsx`), without:
- The full Ghost Production page (`/ghost`)
- The Sign/Contract page (`/sign`)
- React Router setup
- Many images (webp versions, video thumbnails)

A previous chat session connected a **partial GitHub repo** to Netlify, which broke the live site because the repo was missing critical files.

The **only complete working version** was the Netlify deploy from **30.3.2026**, saved as a backup in:
`/Dropbox/Busniees assets 2026/steven web site 2026/Backup/30.3.2026/`

---

## What Was Done (This Session)

### 1. Full Source Reconstruction
Reconstructed the complete Vite + React source code from the 30.3 build output:
- **App.jsx** — Homepage (reconstructed from minified `index-es52p3ir.js`)
- **Ghost.jsx** — Full ghost production page (reconstructed from `ghost-cf-oojw3.js`)
- **Sign.jsx** — Contract signing page (reconstructed from `sign-qcyhttkj.js` + backup source)
- **main.jsx** — React Router with lazy loading for Ghost and Sign pages

### 2. Project Setup
- `package.json` with React 18 + React Router + Vite
- `vite.config.js`
- `netlify.toml` with caching headers + SPA routing
- `index.html` with inlined fonts, GA, Clarity, preloads
- `.gitignore`
- All static assets copied from 30.3 backup (images, audio, video, fonts)

### 3. GitHub + Netlify
- Git repo initialized and pushed to: **https://github.com/DJStevenA/steven-angel-website**
- Netlify connected to GitHub for **automatic deploys** on every push
- Build command: `npm run build` | Publish: `dist`

### 4. Ghost Page Redesign
- Hero: Removed Calendly + WhatsApp CTAs, added Pacha Ibiza video with custom thumbnail
- Added "Listen To My Work" CTA that scrolls to audio section
- Moved About Steven section right after the video
- Changed "Place Your Order" buttons to "Book A Free Consultation" (links to Calendly)
- Removed Pacha Ibiza video from the showcases section (already in hero)

### 5. Homepage Fixes
- Removed floating "Listen To My Work" SoundCloud player
- Fixed audio player grid alignment
- Fixed white border around page (CSS reset)

### 6. Performance Optimizations
- Removed render-blocking `fonts.css` (fonts already inlined in HTML)
- Added `<link rel="preload">` for hero image and critical fonts
- Deferred GA, Google Ads, and Clarity scripts to after page load
- Converted all thumbnails from JPG to WebP (292KB -> 72KB)
- Added meta description for SEO

**PageSpeed Results (Ghost page, mobile):**
- Performance: **82** (was ~50)
- FCP: **1.3s** (was 2.6s)
- LCP: **4.9s** (was 6.5s)
- TBT: **70ms** (was 170ms)
- Speed Index: **1.9s** (was 3.2s)
- SEO: **92+**

---

## Current State

### What's Working
- Site is live at **www.steven-angel.com**
- GitHub auto-deploys to Netlify on every push
- All 3 pages work: `/` (home), `/ghost`, `/sign`
- Sign page connects to Railway backend (`ghost-backend-production-adb6.up.railway.app`)
- Analytics: GA + Google Ads + Clarity all active
- SEO: sitemap, robots.txt, meta descriptions, canonical URLs

### File Structure
```
steven-angel-website-final/
├── src/
│   ├── main.jsx          # React Router (/, /ghost, /sign)
│   ├── App.jsx           # Homepage
│   ├── Ghost.jsx         # Ghost Production page
│   └── Sign.jsx          # Contract signing page
├── public/
│   ├── images/           # All images (webp + jpg)
│   ├── audio/            # MP3 files (13 tracks)
│   ├── videos/           # MP4 + thumbnails
│   └── fonts/            # Self-hosted woff2 fonts
├── index.html            # Entry point with analytics + fonts
├── netlify.toml          # Netlify config
├── package.json
└── vite.config.js
```

### What's NOT in GitHub (by design)
- `the-angels-support-v2.mov` — 64MB, exceeds GitHub limit. Exists locally only.
- `hugel claptone tuhubnail/` — source screenshots, not needed in repo.
- `node_modules/`, `dist/` — generated on build.

### Remaining Tasks (Not Yet Done)
- [ ] New section: "Why Work Directly With Me?" (text + comparison table + CTA)
- [ ] Sitemap URLs: change from `steven-angel.com` to `www.steven-angel.com` for consistency with canonical
- [ ] Consider: further LCP optimization (hero image is the main bottleneck)
- [ ] Consider: the `.mov` file — convert to MP4 or host externally

---

## Key URLs
- **Live site:** https://www.steven-angel.com
- **Ghost page:** https://www.steven-angel.com/ghost
- **GitHub repo:** https://github.com/DJStevenA/steven-angel-website
- **Backend (Railway):** https://ghost-backend-production-adb6.up.railway.app
- **Backend repo:** https://github.com/DJStevenA/ghost-backend

## Analytics IDs
- Google Analytics: `G-MP292X46WY`
- Google Ads: `AW-999991173`
- Microsoft Clarity: `w5o1l2p0bt`
