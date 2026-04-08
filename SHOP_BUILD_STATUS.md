# Shop Build Status — Steven Angel

**Last updated:** 2026-04-08
**Backend repo:** https://github.com/DJStevenA/ghost-backend (deployed on Railway → `https://ghost-backend-production-adb6.up.railway.app`)
**Frontend repo:** https://github.com/DJStevenA/steven-angel-website (deployed on Netlify → `https://steven-angel.com`)

---

## ✅ DONE & DEPLOYED IN PRODUCTION

### Phase 1 — Shop frontend (commit `f8a908f`)
- New `/shop` route with 6 products
- Display order: Masterclass → El Barrio → Mega Bundle → Balkan Boy → Maria Maria → Solomun
- 15% welcome discount popup (`WELCOME15`) — shows once per visitor after 2s
- Hidden H1 for SEO + minimal trust pills
- Lazy-loaded chunk

### Phase 1.5 — El Barrio video (commit `2563711`)
- El Barrio product card embeds the actual Hugel & Claptone video at Pacha Ibiza
- Reuses existing `/videos/hugel-claptone-ibiza.mp4` (13 MB) — no new asset upload
- ProductCard renders video player branch when `previewVideoUrl` is set

### Phase 2 — Backend Auth + SQLite (commit `d7bb653` on `ghost-backend`)
- New `/shop/auth/*` endpoints (signup, login, me, logout) + `/shop/purchases`
- SQLite via `better-sqlite3` (path configurable via `DB_PATH` env var)
- JWT (30 day expiry) + bcrypt (10 rounds)
- Self-contained: doesn't touch `/contact`, `/sign-first`, etc.
- **15/15 local tests pass + 6/6 production tests pass**
- Mounted in `index.js` via 4-line addition (router pattern)

### Phase 2.5 — Per-product pages + SEO (commit `4eb34ed`)
- Each product has its own URL via `slug` field
  - `/shop/afro-house-masterclass-ableton-live-tutorial-jungle-walk`
  - `/shop/afro-house-ableton-live-template-el-barrio-mtgd`
  - `/shop/afro-house-balkan-ableton-live-template-balkan-boy`
  - `/shop/afro-house-remix-ableton-live-template-maria-maria`
  - `/shop/melodic-techno-ableton-template-solomun-artbat-style`
  - `/shop/melodic-techno-afro-house-ableton-template-bundle`
- New `ProductPage.jsx` component with hidden H1, JSON-LD Product schema, dynamic page title/meta/canonical
- ProductCard now wraps cover + name in `<Link>` to per-product page
- `seoTitle` + `seoDescription` per product
- `bpm` + `musicalKey` fields (currently null — Steven needs to fill in)
- Expanded `keywords` array per product with artist styles (Hugel, Claptone, Keinemusik, Solomun, Artbat, Tale Of Us)
- `getProductBySlug` + `getProductSpecs` helpers
- `sitemap.xml` updated with all 6 product URLs

### Phase 2.6 — Design cleanup (commit `4ab1779`)
- New shared `Box3D.jsx` (3D template-box mockup, AFFECTEDD/ABT-style, with left spine + full-bleed SVG cover artwork)
- `GenreArtwork` SVG component with 3 cover variants:
  - `course` → African dancer with raised arms + tribal headdress + small play badge
  - `techno` → cosmic landscape (concentric rings, stars, mountains)
  - default afro house → African mask with tribal scarification + setting sun
- **REMOVED all emojis** (▶ ⤓ ⚠ 📦 ⚡ ✓ →) from shop components
- **REMOVED features list** ("nekudot khazakot") from product cards + pages
- **REMOVED file size + Wi-Fi warnings** (kept in product data, not rendered)
- **REPLACED generic trust pills** with product-specific SEO tag pills
  - On `/shop`: 10 keyword-rich category pills
  - Per product: 5 SEO-targeted pills (Hugel Style, Beatport Top 10, MTGD Release, etc.)
- New `AudioPlayer` component (button reveals native HTML5 `<audio>` with controls) — gracefully hidden when `audioUrl` is null
- New `seoTags` array per product (5 tags each) + `audioUrl` field (currently null)
- Both `ProductCard.jsx` and `ProductPage.jsx` rewritten for cleaner code
- All texts use `overflowWrap`/`wordBreak` to prevent overflow
- `minWidth: 0` + `overflow: hidden` as guards

### Bundle status (after Phase 2.6)
```
Sign         8.79 KB  (unchanged)
ProductPage 10.70 KB  (lazy)
ShopPage    16.12 KB  (lazy)
Box3D       23.98 KB  (shared chunk)
Ghost       35.33 KB  (unchanged)
index      206.88 KB
```

---

## 🟡 IN PROGRESS (saved but not yet pushed)

### Phase 3 — Frontend Auth pages (started, not deployed)
- ✅ `src/shop/AuthContext.jsx` — full React context with login/signup/logout/refresh + localStorage persistence + auto /me fetch on mount
- ✅ `src/shop/LoginPage.jsx` — email + password sign-in form with error handling, redirect support, "remember me" via localStorage
- ⬜ `src/shop/SignupPage.jsx` — TODO
- ⬜ `src/shop/AccountPage.jsx` — TODO (lists user's purchases + download links)
- ⬜ Add routes `/shop/login`, `/shop/signup`, `/shop/account` in `main.jsx`
- ⬜ Wrap `<App>` in `<AuthProvider>` so the whole app has access
- ⬜ Add Sign In / Account header button to ShopPage
- ⬜ Test the full flow in preview
- ⬜ Commit + push

---

## ⬜ PENDING (waiting on Steven)

### Steven needs to:
1. **Add `JWT_SECRET` to Railway env vars** (already generated, saved in Steven's Dropbox shop folder)
2. **Send Cloudflare R2 credentials:**
   - R2_ACCESS_KEY_ID
   - R2_SECRET_ACCESS_KEY
   - R2_ENDPOINT (`https://168da92bc19100644a5b866992180bd7.r2.cloudflarestorage.com`)
   - R2_BUCKET (`steven-angel-shop` recommended)
   - R2_PUBLIC_URL (`https://pub-XXX.r2.dev`)
   - Full step-by-step guide in chat history
3. **Fill in `bpm` and `musicalKey` for each product** in `src/shop/products.js` (currently `null`, marked with `TODO Steven` comments)
4. **Approve final design** (Box3D artwork is "good enough for now" per Steven, will revisit with real photos later)
5. **Provide cover image graphics** (or approve approach: real photos from Pexels/Unsplash). Full text spec for each product is in chat history (sizes 1080×1350, file naming convention `{product-slug}-cover.jpg`, target folder `/public/shop/`)

### After Steven sends R2 credentials, I'll do Phase 5:
- Upload all 6 product ZIP files (~3.85 GB total) to R2
- Upload masterclass intro video (105 MB → 30 MB after ffmpeg compression — `/tmp/ffmpeg` is already downloaded)
- Upload 6 audio preview MP3 files
- Replace `dropboxPath` with `r2Key` in `products.js`
- Wire `audioUrl` and `previewVideoUrl` (for masterclass) to public R2 URLs
- Add backend endpoint `GET /shop/download/:productId` that returns a 15-minute signed R2 URL — only for users who have a `paid` purchase for that product
- This **REPLACES the entire Phase 5 (Dropbox OAuth)** that was originally planned. R2 is better in every way.

### Phase 4 — PayPal Sandbox integration (not yet started)
- Backend already has PayPal credentials in env vars (`PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE=sandbox`) used by `/create-order`, `/capture-order` for ghost production
- Add `/shop/checkout/create` and `/shop/checkout/capture` endpoints under `/shop/*` namespace (separate from ghost flow)
- Add PayPal Smart Buttons to ProductPage + ProductCard
- On capture: insert into `purchases` table with `status='paid'`
- Apply `WELCOME15` coupon code if provided

---

## 🛠 ENVIRONMENT NOTES (for Claude)

### Local toolchain
- `npm` and `node` are at `/usr/local/bin/{npm,node}` — must `export PATH="/usr/local/bin:$PATH"` before `npm run build` because the sandbox PATH doesn't include them by default
- Preview server `.claude/launch.json` is configured to invoke vite directly via `node /path/to/vite.js` (workaround for `env: node: No such file or directory`)
- `ffmpeg` (8.1, full features) is at `/tmp/ffmpeg` — downloaded as static binary from evermeet.cx, not installed system-wide
- Backend repo is cloned at `/tmp/ghost-backend`

### Important: Backend deployments
- Railway auto-deploys `main` branch of `ghost-backend`
- The backend uses `better-sqlite3` (native module) — successfully built on Railway in Phase 2 deploy
- The backend uses `bcryptjs` (pure JS, no native deps)
- DB is currently ephemeral on Railway (no Volume mounted) — Steven will mount a Volume + set `DB_PATH=/data/shop.db` later
- `JWT_SECRET` not yet set in Railway env vars — backend warns but uses dev fallback. **Must set before real users sign up.**

### Memory notes
- `/Users/stevenangel/.claude/projects/-Users-stevenangel-Dropbox-Busniees-assets-2026-steven-web-site-2026/memory/`
- `MEMORY.md` is the index
- `shop_seo_strategy.md` — long-tail keywords from Steven's research
- `shop_design_pending.md` — visual polish items to revisit later
- `site_cleanup_todos.md` — `/fallover` dead link + localhost references + 6 Clarity JS errors (post-shop)

---

## 📌 KEY DECISIONS MADE

1. **R2 instead of Dropbox** — eliminates Phase 5 (Dropbox OAuth refresh tokens), unlimited egress is free, native CDN, S3-compatible API
2. **SQLite via better-sqlite3** instead of Postgres — simpler, no dashboard access needed, works fine for the expected concurrency
3. **JWT stateless** instead of session table — simpler, no DB writes per request
4. **bcryptjs** instead of `bcrypt` — pure JS, no Railway native build issues
5. **Per-product pages** with slug-based URLs — Steven's WeMakeDanceMusic/Abletunes research proved the slug itself is part of the SEO signal
6. **`/shop/*` namespace** in backend — keeps shop code self-contained, doesn't touch existing `/contact` or `/sign-first` flows

---

## 📂 KEY FILES

### Frontend (`steven-angel-website-final/src/shop/`)
- `products.js` — product catalog (6 products, slugs, seoTitle, seoDescription, seoTags, audioUrl, bpm/key fields)
- `Box3D.jsx` — shared 3D box mockup component (used by ProductCard + ProductPage)
- `ProductCard.jsx` — single product card (in /shop grid)
- `ProductPage.jsx` — per-product detail page (/shop/:slug)
- `ShopPage.jsx` — main /shop page
- `DiscountPopup.jsx` — 15% off welcome popup
- `AuthContext.jsx` — auth state + API calls (NOT YET IMPORTED ANYWHERE)
- `LoginPage.jsx` — email/password login form (NOT YET ROUTED)

### Backend (`ghost-backend/`)
- `index.js` — Express server (existing /contact + /sign-first + new /shop router mount)
- `db.js` — SQLite + schema + prepared statements
- `shop.js` — /shop/* router (signup, login, me, logout, purchases)

---

## 🎨 GRAPHICS SPEC FOR STEVEN (cover images for each product)

Detailed text spec is in chat history. Summary:
- **Format:** PNG/JPG, 1080×1350 (4:5 portrait) or 1080×1080
- **Location:** `/public/shop/`
- **Naming:** `{product-id}-cover.jpg` (e.g. `el-barrio-cover.jpg`)
- **Each cover needs:**
  - Top tag: `{GENRE} · {DAW} TEMPLATE`
  - Big product name in Barlow Condensed
  - "BY STEVEN ANGEL" + accent line
  - Style: photographic background + color palette matching product (purple for Best Seller/Best Value, cyan for the rest)

Steven will provide these later (post Phase 3 + 4 + 5).
