# Shop Build Status — Steven Angel

**Last updated:** 2026-04-09 (Phase 5 plumbing deployed + Dropbox→R2 migration script ready — only data upload remaining)
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

### Phase 3 — Shop Auth frontend (commit `28e710e`)
- `AuthContext.jsx` — React context with useAuth() hook, JWT in localStorage (`steven_angel_shop_token`), auto /me fetch on mount, login/signup/logout/refresh
- `LoginPage.jsx` (`/shop/login`) — email+password with `?redirect=` support
- `SignupPage.jsx` (`/shop/signup`) — email+password+name+confirm with min-8-chars validation
- `AccountPage.jsx` (`/shop/account`) — protected page, shows user info + purchases list + Sign Out
- `main.jsx` — wrapped in `<AuthProvider>`, auth routes placed BEFORE `/shop/:slug`
- `ShopPage.jsx` — header has Sign In / My Account button that switches based on user state
- **Tested end-to-end in preview against PROD backend:** signup→account redirect, logout, login, wrong password, auth guard, existing pages untouched

### Phase 4 — PayPal checkout backend (commit `1d49b47` on `ghost-backend`)
- `shop.js` — added `POST /shop/checkout/create` and `POST /shop/checkout/capture`
- `SHOP_PRODUCTS` canonical price table (backend-owned so users can't tamper via frontend) — must stay in sync with `src/shop/products.js`
- `COUPONS` static table — `WELCOME15` = 15% off, case-insensitive, unknown codes silently ignored
- `PAYPAL_BASE` + `getPayPalToken` — duplicated from `index.js` (10 lines) to keep shop code self-contained
- `applyCoupon(basePrice, couponCode)` helper with `round2` to avoid floating-point drift
- `/checkout/create` — requires auth, validates productId, blocks double-purchase (hasUserPurchasedProduct), creates PayPal order via `/v2/checkout/orders` (NO_SHIPPING), stores `custom_id` JSON with { userId, productId, couponApplied }, inserts 'pending' purchase row, returns `{ orderId, originalAmount, discountAmount, finalAmount, couponApplied, productName }`
- `/checkout/capture` — requires auth, looks up purchase by paypal_order_id, 403 if wrong user, idempotent if already paid, calls `/v2/checkout/orders/:id/capture`, only marks 'paid' if COMPLETED, returns `{ success, purchase }`
- **All 7 local tests pass + /contact untouched + coupon math verified** (WELCOME15 on $19.99 → $16.99)
- **Railway deploy verified live at 110s: /shop/checkout/create returns 401 without auth, /contact still 400**
- Railway env vars required (all already present from ghost flow): `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE=sandbox`

### Phase 4 — Frontend PayPal Smart Buttons (deployed — TBD commit)
- `GET /shop/config` added to backend (exposes `paypalClientId` from Railway env so frontend never hardcodes it)
- `src/shop/CheckoutButton.jsx` — PayPal Smart Buttons wrapper. Loads SDK lazily via `<script>` tag, caches per-clientId. `createOrder` hits `/shop/checkout/create`, `onApprove` hits `/shop/checkout/capture`. Reads latest coupon via ref so buttons don't need to re-render when user types.
- `src/shop/CheckoutModal.jsx` — full-screen overlay with:
  - "Sign in to continue" state when not logged in (CTA to `/shop/login?redirect=/shop/:slug`)
  - Coupon input (auto-filled with `WELCOME15` if `localStorage.shop_discount_popup_seen`)
  - Price breakdown (subtotal / discount / total — computed client-side to mirror backend)
  - CheckoutButton inline
  - Success state → auto-redirect to `/shop/account` after 1.8s
  - Close on backdrop click / Escape / × button
  - Body scroll lock while open
- `src/shop/ShopPage.jsx` — `handleBuy` now opens `CheckoutModal` instead of alert
- `src/shop/ProductPage.jsx` — same, opens modal on Buy Now click
- **Verified live against Railway backend:**
  - `/shop/config` returns sandbox client ID: 200 ✓
  - Signup → login (E2E via preview console) ✓
  - Modal renders correct states (signed-out and signed-in) ✓
  - PayPal SDK loads (`window.paypal` global defined) ✓
  - PayPal Smart Buttons iframe rendered inside modal ✓
  - `POST /shop/checkout/create` → real sandbox orderId `07M69284DE552152F`, pricing `$29 → $24.65` with WELCOME15 ✓
- Build: `CheckoutModal` 21.70 KB lazy chunk, `ShopPage` 16.74 KB (+0.6 KB), index 209 KB (+2 KB)

---

### Phase 5 — Cloudflare R2 plumbing (backend commit `3ff5728`, frontend commit `a22af0b`)
- **Credentials received, verified, and live on Railway:**
  - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET` set via `railway variables --set`
  - Also set a strong `JWT_SECRET` (64-byte hex) so the backend stops using the dev fallback
  - Bucket name: `steven-angel-shop`
  - Endpoint: `https://168da92bc19100644a5b866992180bd7.r2.cloudflarestorage.com`
- **Backend (`shop.js`):**
  - Imports `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
  - Lazy `S3Client` — only instantiated if all 4 R2 vars exist, otherwise `/shop/download/*` returns 503
  - `SHOP_PRODUCTS` now carries `r2Key` + `downloadFilename` per product (6 keys under `products/*.zip`)
  - **`GET /shop/download/:productId`** (requires auth):
    - 404 unknown product
    - 403 if `hasUserPurchasedProduct` returns nothing
    - 503 if R2 not configured or `HeadObject` fails (catches "forgot to upload")
    - Otherwise returns `{ downloadUrl, expiresInSeconds: 900, filename }` with a signed GET URL
    - Sets `ResponseContentDisposition` so browsers save with a clean filename (e.g. `El-Barrio-Ableton-Template-Steven-Angel.zip`) instead of the opaque R2 key
- **Frontend (`AccountPage.jsx`):**
  - Download button removed the alert stub
  - Hits `/shop/download/:productId`, opens signed URL in new tab (`noopener`)
  - Per-purchase loading state (`downloadingId`), shared error banner above the list
- **Scripts (manual, not imported by server):**
  - `scripts/test-r2.js` — one-shot E2E sanity test (Head → Put → Sign → Get → Delete). Verified working against live bucket.
  - `scripts/generate-manifest.js` — walks a source dir (e.g. the Dropbox folder), builds `upload-manifest.json` by matching filenames against known product IDs
  - `scripts/upload-products.js` — multipart uploader using `@aws-sdk/lib-storage`, with progress logs and resume (skips files already in R2 with matching size)
- **Verified live against Railway (after 70s deploy):**
  - `/shop/download/el-barrio` no auth → 401 ✓
  - `/shop/download/el-barrio` with fresh signup → 403 "You don't own this product" ✓
  - `/shop/download/bogus-product` with auth → 404 "Unknown product" ✓
  - `/contact` still 400 (untouched) ✓
- **R2 env vars also configured on Railway via CLI in the same go:** `JWT_SECRET` (64-byte random hex) now set, backend no longer warns about dev fallback
### Phase 5.5 — Dropbox→R2 migration script (commit TBD)
- **`scripts/dropbox-to-r2.js`** — streams each of the 6 product ZIPs directly from Dropbox (via existing `DROPBOX_TOKEN`) into R2 multipart upload. Zero intermediate disk/memory overhead (native https → S3 Upload stream pipe). Resume-safe via R2 HeadObject + size check.
- **Why this exists:** The Dropbox folder `/Ghost Tracks templates sample packs/` is not locally synced (selective sync off). Rather than waiting for Steven to enable sync + run locally, this script runs in any environment with both `DROPBOX_TOKEN` and the 4 R2 vars — ideally on Railway itself so the ~3.85 GB transfer happens in a datacenter, not over Steven's home internet.
- **How to run (next session):**
  ```bash
  # Option A: run on Railway (recommended — no local bandwidth cost)
  railway run --service ghost-backend node scripts/dropbox-to-r2.js

  # Option B: run locally if all 5 env vars are present in your shell
  DROPBOX_TOKEN=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
    R2_ENDPOINT=... R2_BUCKET=steven-angel-shop \
    node scripts/dropbox-to-r2.js
  ```
- Uses the canonical dropbox paths from the original `products.js` dropboxPath field. Must stay in sync with both SHOP_PRODUCTS in shop.js and the actual Dropbox folder structure — if Steven ever moves a file, update the `MIGRATIONS[]` array at the top of the script.

### Phase 5.6 — Box3D coverImageUrl prop (commit TBD)
- `Box3D.jsx` now checks `product.coverImageUrl` first, falling back to `GenreArtwork` SVG if none is set
- Lets Steven drop real photos into `public/shop/` and just add `coverImageUrl: "/shop/el-barrio-cover.jpg"` to products.js — zero code changes, zero deploy coordination
- Fallback verified in preview: the Afro House Masterclass card still renders the procedural SVG because no coverImageUrl is set yet

---

## ⬜ PENDING

### Immediate next session (can be done without Steven):
1. **Run `scripts/dropbox-to-r2.js` on Railway** to upload the 6 product ZIPs (~3.85 GB total) into the R2 bucket. This completes Phase 5 technically — after this, the Download buttons on /shop/account will serve real files to paying users.
2. **After upload completes, verify** by signing up a test user, creating + capturing a sandbox PayPal purchase, then hitting `/shop/download/el-barrio` to confirm the signed URL works.

### Blocked on Steven:
1. **Fill `bpm` and `musicalKey`** for each product in `src/shop/products.js` (6 × `// TODO Steven` comments) — purely SEO/display, not blocking checkout
2. **Provide or approve cover images** — 6 × 1080×1350 JPG, filenames and spec in earlier chat. Drop into `public/shop/` and add `coverImageUrl` to products.js. Fallback SVG looks fine for launch.
3. **(Blocked on data from Steven) 6 Clarity JS errors** — need the actual error messages from the Clarity dashboard
4. **Post-launch: masterclass intro video + 6 audio previews** — separate R2 keys, can reuse the same upload script by adding entries

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
- `ShopPage.jsx` — main /shop page (has Sign In / My Account header button)
- `DiscountPopup.jsx` — 15% off welcome popup
- `AuthContext.jsx` — auth state + API calls (wired via `<AuthProvider>` in main.jsx)
- `LoginPage.jsx` — email/password login (/shop/login)
- `SignupPage.jsx` — email/password/name signup (/shop/signup)
- `AccountPage.jsx` — protected page with purchases list (/shop/account)
- `CheckoutButton.jsx` — (TODO Phase 4 frontend) PayPal Smart Buttons wrapper

### Backend (`ghost-backend/`)
- `index.js` — Express server (existing /contact + /sign-first + new /shop router mount, untouched since Phase 2)
- `db.js` — SQLite + schema + prepared statements (untouched since Phase 2)
- `shop.js` — /shop/* router (auth: signup/login/me/logout/purchases + checkout: create/capture + SHOP_PRODUCTS + COUPONS + PayPal helpers)

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
