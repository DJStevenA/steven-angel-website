# CONTEXT FOR NEW CHAT — Steven Angel Website
Last updated: 2026-04-03 (Israel time UTC+3)

## Who is the User
Steven Angel — DJ, Producer & Audio Engineer with 20+ years experience. One half of the Afro-House duo "The Angels". Mastering engineer for Swedish label HMWL. Released on Sony, Ultra, Armada, MoBlack, Godeeva, MTGD. 100M+ streams worldwide. Based in Israel.

## The Project
Personal website for Steven Angel — offering Ableton lessons, ghost production, and mixing & mastering services. React SPA hosted on Netlify, domain on Cloudflare.

**Live URL**: https://www.steven-angel.com
**Ghost landing page**: https://www.steven-angel.com/ghost
**Other profiles**: https://stevenangel.carrd.co, https://edmwarriors.com/steven-angel

### Key Files
- `index.html` — Main HTML entry point. Contains Google Analytics (G-KTRD05NY5B), Microsoft Clarity (w5o1l2p0bt), SEO meta tags, JSON-LD structured data, static HTML for Google crawlability
- `src/App.jsx` — Main React component (~520 lines). All UI in one file. Contains nav, hero, about, lessons, ghost production, contact, floating player sections
- `src/main.jsx` — Entry point, wraps App in HelmetProvider
- `public/sitemap.xml` — Sitemap with /, /#lessons, /ghost, /#contact
- `public/robots.txt` — Allows all crawlers, references sitemap
- `vite.config.js` — Vite config with React plugin
- `package.json` — React 18, Vite 5, react-helmet-async

### Infrastructure
- **Hosting**: Netlify (auto-deploys from GitHub main branch)
- **Domain/DNS/SSL**: Cloudflare (HSTS enabled, Always Use HTTPS enabled, TLS 1.2)
- **Repo**: github.com/DJStevenA/steven-angel-website
- **Analytics**: Google Analytics (G-KTRD05NY5B) + Microsoft Clarity (w5o1l2p0bt)

## What's Done
- SEO setup: sitemap.xml, robots.txt, meta tags (OG, Twitter Card, canonical, keywords)
- Static HTML inside `<div id="root">` for Google crawler readability (React SPA workaround)
- JSON-LD structured data with business info, services, pricing
- Dedicated meta tags for /ghost route (title, description, keywords, canonical)
- Google Analytics connected (G-KTRD05NY5B)
- Microsoft Clarity connected (w5o1l2p0bt)
- Canonical URL fixed from steven-angel.netlify.app → www.steven-angel.com
- Google Search Console setup (2 pages indexed)
- Cloudflare security: HSTS, Always Use HTTPS, TLS 1.2

## Open Tasks
1. **Hero button change**: "ORDER GHOST PRODUCTION" → "BOOK A FREE CONSULTATION (ZOOM)" — link to Calendly
2. **New /order page**: Separate order flow page with service selection, contract/terms, Dropbox upload, payment — accessible from nav. Meant for after Zoom consultation. (Need content from Steven: pricing packages $300/$800, contract text, Dropbox link, payment method)
3. **Audio players redesign**: Card-style design for genre tracks in ghost production section (option 4 style — play buttons integrated into genre cards)
4. **Fade-in animations**: Sections fade in on scroll using Intersection Observer
5. **Videos**: Upload/replace placeholder videos (ARTBAT section, support video section) — need actual video files/links from Steven
6. **Delete preview branches**: preview/option-1-mini-player, preview/option-4-audio-cards still exist on GitHub (not merged, not affecting site)

## ENV Variables
- Google Analytics: G-KTRD05NY5B
- Microsoft Clarity: w5o1l2p0bt
- Calendly link: https://calendly.com/dj-steven-angel/15-min-zoom
- WhatsApp: +972523561353

## Important Rules
- User communicates in Hebrew, prefers answers in English when asked
- Never break the live site — test changes carefully
- Site is a single-file React SPA (App.jsx) — no routing library, uses hash anchors + window.location.pathname for /ghost
- The live site may have content NOT in this repo (user mentioned $300/$800 pricing and "Place an Order" button that isn't in the code)
- Don't add features beyond what's asked
- Don't use markdown formatting (asterisks, backticks) when giving URLs to copy
- Commit to main branch directly (not feature branches) unless specifically needed
- Netlify auto-deploys from main — pushing to main = live deployment
