# Next.js SSR Migration Plan
## steven-angel.com — React SPA → Next.js SSR

---

## Why
React SPA (current) loads an empty HTML, then downloads 200KB of JS, then renders the page. The browser can't see images or text until JS runs. This causes:
- LCP: 5+ seconds (hero image waits for JS chain)
- CLS: 0.12 (fonts swap after JS renders)
- PageSpeed: 71-82 (ceiling for React SPA with GA)

Next.js SSR sends complete HTML from the server. Browser sees images and text immediately. Expected result:
- LCP: ~1.5 seconds
- CLS: ~0.02
- PageSpeed: 88-97

---

## What Changes

| | React SPA (now) | Next.js SSR (after) |
|---|---|---|
| HTML response | Empty `<div id="root">` | Full page with content |
| Hero image | Waits for JS → React → render | In HTML immediately |
| Fonts | Load after JS, cause CLS | In HTML, no shift |
| Routing | Client-side (React Router) | File-based (automatic) |
| Image optimization | Manual WebP + sizing | Automatic (next/image) |
| Hosting | Netlify (static) | Vercel (SSR) |
| GitHub repo | Same repo, new branch | Same repo |
| Backend (Railway) | No change | No change |
| Domain | No change | No change |

## What Does NOT Change
- Design — identical, same CSS, same colors, same layout
- Content — same text, same images, same audio, same video
- Backend — Railway stays as is, /contact and /sign-first unchanged
- Forms — same fetch to Railway
- Analytics — same GA + Ads IDs
- Domain — steven-angel.com stays

---

## File Mapping

```
CURRENT (React SPA)              →  NEXT.JS (SSR)
src/main.jsx (router)            →  app/layout.jsx (root layout)
src/App.jsx (homepage)           →  app/page.jsx
src/Ghost.jsx (ghost page)       →  app/ghost/page.jsx
src/Sign.jsx (sign page)         →  app/sign/page.jsx
public/* (all assets)            →  public/* (same, no change)
index.html (entry + fonts + GA)  →  app/layout.jsx (head + fonts + GA)
vite.config.js                   →  next.config.js
netlify.toml                     →  vercel.json (or nothing)
```

---

## Agent Plan (3 agents in parallel)

### Agent 1: Convert App.jsx → app/page.jsx
**Input:** Current `src/App.jsx`
**Task:**
1. Add `"use client"` at top (keeps useState/useEffect working)
2. Replace `<img>` with `next/image` where beneficial (hero only)
3. Remove `import { useState, useEffect } from "react"` → keep as client component
4. Export as default function
5. No style changes — keep all inline styles exactly as they are

**Output:** `app/page.jsx`

### Agent 2: Convert Ghost.jsx → app/ghost/page.jsx
**Input:** Current `src/Ghost.jsx`
**Task:**
1. Split into layout (server) + client parts:
   - `app/ghost/page.jsx` — server component with metadata export
   - `app/ghost/GhostClient.jsx` — client component with "use client" (all the interactive stuff)
2. Move SEO meta tags to Next.js `metadata` export (replaces useEffect meta manipulation)
3. Replace hero `<img>` with `next/image` (priority prop = automatic fetchpriority + optimization)
4. Keep VideoPlayer, audio players, FAQ accordion in client component
5. No style changes

**Output:** `app/ghost/page.jsx` + `app/ghost/GhostClient.jsx`

### Agent 3: Convert Sign.jsx → app/sign/page.jsx + Create layout.jsx
**Input:** Current `src/Sign.jsx` + `index.html`
**Task:**
1. Convert Sign.jsx:
   - Add `"use client"` at top
   - Export as default
   - Remove Google Fonts CDN link (will be in layout)
2. Create `app/layout.jsx`:
   - HTML boilerplate with lang="en"
   - Self-hosted fonts (same @font-face from current index.html)
   - Google Analytics script (async in head)
   - Meta description, canonical, viewport
   - CSS reset (margin: 0, padding: 0, background: #000)
   - Clarity comment (disabled, ready to re-enable)
3. Create `next.config.js`:
   - Image domains: img.youtube.com
   - Output: standalone (for Vercel)
4. Create `package.json` with Next.js dependencies

**Output:** `app/sign/page.jsx` + `app/layout.jsx` + `next.config.js` + `package.json`

---

## After Agents Finish (Me)

### Step 4: Assembly & Testing (15 min)
1. Copy all agent outputs to `steven-angel-nextjs/`
2. Copy `public/` folder (all assets — images, audio, video, fonts)
3. `npm install` + `npm run build`
4. Fix any build errors
5. `npm run dev` — test locally

### Step 5: Deploy to Vercel (15 min)
1. Create Vercel project linked to GitHub
2. Deploy to temporary URL (e.g., steven-angel-nextjs.vercel.app)
3. Test all pages: /, /ghost, /sign
4. Test contact form (sends to Railway)
5. Run PageSpeed on temporary URL

### Step 6: PageSpeed Verification (15 min)
1. Run PageSpeed 3 times on Vercel URL
2. Compare with current scores
3. If score < 88: identify and fix remaining issues
4. If score ≥ 88: proceed to domain switch

### Step 7: Domain Switch (10 min)
1. Add steven-angel.com domain to Vercel
2. Update DNS (or Vercel handles automatically)
3. Verify site works on production domain
4. Keep Netlify as backup for 48 hours
5. Delete Netlify site after confirming everything works

---

## Estimated Timeline

| Phase | Time | Parallel? |
|-------|------|-----------|
| Agents 1+2+3 | 15 min | Yes, all 3 |
| Assembly + build | 15 min | No |
| Vercel deploy | 15 min | No |
| PageSpeed test + fixes | 15 min | No |
| Domain switch | 10 min | No |
| **Total** | **~70 min** | |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Build fails | All current code stays untouched. Fix errors one by one. |
| Vercel URL doesn't work | Debug locally with `npm run dev` first |
| PageSpeed not improved | SSR guaranteed to improve LCP. If not enough, check next/image config |
| Forms break | Railway backend unchanged. Just verify fetch URL works from Vercel domain |
| Audio/video breaks | All in public/ folder, same paths, no change needed |
| Domain switch fails | Keep Netlify running as fallback for 48 hours |
| Design looks different | No CSS changes — identical inline styles |

---

## Verification Checklist (After Migration)

### Functionality
- [ ] Homepage loads with all sections
- [ ] Ghost page loads with all sections
- [ ] Sign page loads and connects to Railway
- [ ] Contact form sends email (both pages)
- [ ] Audio players work (all 13 tracks)
- [ ] Video plays (Hugel/Claptone + showcases)
- [ ] WhatsApp links work
- [ ] Calendly links work
- [ ] Navigation between pages works
- [ ] Mobile responsive

### Performance
- [ ] PageSpeed Mobile ≥ 88 (3 runs average)
- [ ] LCP ≤ 2.5s
- [ ] FCP ≤ 1.5s
- [ ] CLS ≤ 0.05
- [ ] TBT ≤ 200ms

### SEO
- [ ] Title tags correct on all pages
- [ ] Meta descriptions present
- [ ] Canonical URLs correct
- [ ] Sitemap accessible
- [ ] robots.txt accessible
- [ ] OG tags on ghost page

### Analytics
- [ ] GA tracking fires on page load
- [ ] GA tracks page navigation
- [ ] Google Ads conversion tag present
