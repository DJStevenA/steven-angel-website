# CONTEXT FOR NEW CHAT — Steven Angel Website
Last updated: 2026-04-04 (Israel time UTC+3)

## Who is the User
Steven Angel — DJ, Producer & Audio Engineer with 20+ years experience. One half of the Afro-House duo "The Angels". Mastering engineer for Swedish label HMWL. Released on Sony, Ultra, Armada, MoBlack, Godeeva, MTGD. 100M+ streams worldwide. Based in Israel. Communicates in Hebrew, prefers answers in English when technical.

## The Project
Personal website for Steven Angel — offering Ableton lessons, ghost production, and mixing & mastering services. React SPA built with Vite, hosted on Netlify, domain on Cloudflare.

**Live URL**: https://www.steven-angel.com
**Ghost landing page**: https://www.steven-angel.com/ghost
**Other profiles**: https://stevenangel.carrd.co, https://edmwarriors.com/steven-angel

## CRITICAL: Live Site vs GitHub Repo Mismatch
The live site was ALWAYS deployed via **Netlify Drop** (manual drag-and-drop upload). The GitHub repo (`DJStevenA/steven-angel-website`) has OLDER code from March 10, 2026 — NOT the same as the live site.

**What this means:**
- The GitHub repo code does NOT match the live site
- The live site has different hero text, images, buttons, pricing ($300/$800 offers, "Place An Order" button) that are NOT in the repo
- All SEO work done in previous chats (sitemap, robots.txt, meta tags, JSON-LD, GA, Clarity) was applied to the OLD repo code and NEVER deployed to the live site
- Connecting GitHub to Netlify will BREAK the live site (this happened on April 4 and had to be reverted)

**Current state (April 4):**
- Live site = March 30 Netlify Drop deploy (working correctly)
- GitHub repo = old March 10 code + SEO additions (does NOT match live site)
- GitHub is DISCONNECTED from Netlify

## FIRST PRIORITY: Get Live Site Code Into Repo
Before ANY work can be done, the live site source code needs to be put into the GitHub repo. The user should:
1. Find the source folder on their Mac (the folder they drag-and-drop to Netlify)
2. Either upload those files to this chat, OR upload them to GitHub directly

The live site uses these assets (discovered via PageSpeed):
- `/images/dj-hero-ghost.webp` (hero image)
- `/fonts/fonts.css` (custom fonts)
- `/assets/Ghost-Cf-OoJW3.js` (Vite build output)

## Infrastructure
- **Hosting**: Netlify via **Netlify Drop** (manual deploy, NOT connected to GitHub)
- **Domain/DNS/SSL**: Cloudflare (HSTS enabled, Always Use HTTPS enabled, TLS 1.2)
- **Repo**: github.com/DJStevenA/steven-angel-website (currently disconnected from Netlify)
- **Analytics**: Google Analytics (G-KTRD05NY5B) — in repo but NOT on live site
- **Heatmaps**: Microsoft Clarity (w5o1l2p0bt) — in repo but NOT on live site

## Tech Stack (in repo)
- React 18 + Vite 5
- react-helmet-async (for SEO meta tags per route)
- Single-file SPA: all UI in `src/App.jsx` (~520 lines)
- No routing library — uses hash anchors + `window.location.pathname` for /ghost detection
- Netlify `_redirects` file needed for SPA routing: `/*  /index.html  200`

## Key Files in Repo
- `index.html` — HTML entry point with GA, Clarity, SEO meta tags, JSON-LD, static HTML for crawlers
- `src/App.jsx` — Main React component (nav, hero, about, lessons, ghost production, contact, floating player)
- `src/main.jsx` — Entry point, wraps App in HelmetProvider
- `public/sitemap.xml` — Sitemap: /, /#lessons, /ghost, /#contact
- `public/robots.txt` — Allows all crawlers
- `public/_redirects` — Netlify SPA routing (may need to be recreated)
- `CONTEXT_FOR_NEW_CHAT.md` — This file
- `vite.config.js` — Vite config with React plugin
- `package.json` — Dependencies

## ENV Variables / IDs
- Google Analytics: G-KTRD05NY5B
- Microsoft Clarity: w5o1l2p0bt
- Calendly: https://calendly.com/dj-steven-angel/15-min-zoom
- WhatsApp: +972523561353

## What's Already Done (in repo, NOT on live site)
- SEO: sitemap.xml, robots.txt, meta tags (OG, Twitter Card, canonical, keywords)
- Static HTML inside `<div id="root">` for Google crawler readability
- JSON-LD structured data (business info, services, pricing)
- Dedicated meta tags for /ghost route
- Google Analytics script (G-KTRD05NY5B)
- Microsoft Clarity script (w5o1l2p0bt)
- Preconnect hints for external resources
- Cloudflare: HSTS, Always Use HTTPS, TLS 1.2 (configured by user manually)

## Open Tasks (after code sync)
1. **Sync repo with live site** — Get the actual live site source code into the GitHub repo
2. **Re-apply SEO work** — Apply all SEO additions on top of the correct live code
3. **Re-add GA + Clarity** — Add analytics scripts to the live code
4. **Add _redirects** — `/*  /index.html  200` for /ghost route on Netlify
5. **Hero button change**: "PLACE AN ORDER" → "BOOK A FREE CONSULTATION (ZOOM)" — this button is in the MIDDLE of the page next to two pricing offers ($300 and $800), NOT in the hero section. Link to Calendly.
6. **New /order page**: Separate order flow page with service selection, contract/terms, Dropbox upload, payment — accessible from nav. For after Zoom consultation. (Need from Steven: contract text, Dropbox link, payment method)
7. **Audio players redesign**: Card-style design for genre tracks in ghost production section (play buttons integrated into genre cards)
8. **Fade-in animations**: Sections fade in on scroll using Intersection Observer
9. **Videos**: Upload/replace placeholder videos (ARTBAT section, support video section) — need actual video files/links from Steven
10. **Improve performance**: Current PageSpeed score ~75 (LCP 5.8s, FCP 2.5s). Do NOT wrap analytics in load event listener — that dropped the score.
11. **Connect GitHub to Netlify**: Only AFTER repo matches live site
12. **Delete old branches**: preview/option-1-mini-player, preview/option-4-audio-cards

## Important Rules
- NEVER break the live site — the live site is the March 30 Netlify Drop deploy
- Do NOT connect GitHub to Netlify until repo code matches live site exactly
- Site is a single-file React SPA (App.jsx) — no routing library
- The live site has content NOT in this repo ($300/$800 pricing, "Place an Order" button, different images)
- Don't add features beyond what's asked
- Don't use markdown formatting when giving URLs to copy
- Performance: Do NOT defer analytics with load event listener (tested, dropped score)
- Netlify auto-deploys from main when connected — pushing = live deployment

## Lessons Learned (from previous chats)
- Connecting GitHub to Netlify deployed the old repo code and broke the live site
- git reset --hard + force push made things worse
- Wrapping GA/Clarity in `window.addEventListener('load', ...)` dropped PageSpeed from 75 to 72
- Dropbox shared links return 403 when fetched programmatically
- Preloading wrong hero image (repo has dj-hero.jpg, live site uses dj-hero-ghost.webp)
