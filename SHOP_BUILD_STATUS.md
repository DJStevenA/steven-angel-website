# Shop Build Status — Steven Angel

**Last updated:** 2026-04-12
**Backend repo:** https://github.com/DJStevenA/ghost-backend (deployed on Railway → `https://ghost-backend-production-adb6.up.railway.app`)
**Frontend repo:** https://github.com/DJStevenA/steven-angel-website (deployed on Netlify → `https://steven-angel.com`)

---

## DONE & DEPLOYED

### Phase 1 — Shop frontend (commit `f8a908f`)
- `/shop` route with 6 products, 15% welcome popup (`WELCOME15`), hidden H1 for SEO

### Phase 1.5 — El Barrio video (commit `2563711`)
- El Barrio card embeds Hugel & Claptone Pacha Ibiza video

### Phase 2 — Backend Auth + SQLite (commit `d7bb653` on `ghost-backend`)
- `/shop/auth/*` endpoints, JWT (30 day), bcryptjs, SQLite via better-sqlite3
- 15/15 local + 6/6 production tests pass

### Phase 2.5 — Per-product pages + SEO (commit `4eb34ed`)
- Slug-based URLs, JSON-LD Product schema, seoTitle/seoDescription per product
- sitemap.xml updated with all 6 product URLs

### Phase 2.6 — Design cleanup (commit `4ab1779`)
- Box3D component, GenreArtwork SVG variants, AudioPlayer, SEO tag pills
- Removed emojis, features list, file size warnings

### Phase 3 — Shop Auth frontend (commit `28e710e`)
- AuthContext, LoginPage, SignupPage, AccountPage with JWT persistence

### Phase 4 — PayPal checkout (backend `1d49b47`, frontend `e863c47`)
- PayPal Smart Buttons via SDK `<script>` (not npm)
- `/shop/config`, `/shop/checkout/create`, `/shop/checkout/capture`
- WELCOME15 coupon (15% off), double-purchase prevention
- CheckoutModal with login redirect, price breakdown, success state
- Currently in **sandbox** mode — switch to live = env var change only

### Phase 5 — Cloudflare R2 storage + Dropbox migration
- **R2 bucket `steven-angel-shop`** — private, signed URLs only
- **14 files uploaded** (6 ZIPs + 6 MP3 audio previews + 2 videos, ~4 GB total)
- `GET /shop/download/:productId` — auth-required, 15-min signed URL with clean filename
- `GET /shop/media/*` — public, 302 redirect to 24h signed URL for audio/video previews
- `scripts/dropbox-to-r2.js` — streaming migration (Dropbox API → R2 multipart, zero disk)
- AccountPage Download button wired to signed URL (opens in new tab)

### Phase 5.5 — Dropbox refresh token (backend `index.js`)
- Replaced 4-hour `DROPBOX_TOKEN` with permanent OAuth2 refresh token flow
- `getDropboxAccessToken()` caches token, auto-refreshes 5 min before expiry
- Railway vars: `DROPBOX_REFRESH_TOKEN`, `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`
- Old `DROPBOX_TOKEN` deleted from Railway

### Phase 6 — AI 3D box covers + WebP optimization
- 6 AI-generated photorealistic box renders (Nano Banana) replace CSS Box3D
- Products: masterclass, el-barrio, mega-bundle, balkan-boy, maria-maria, solomun-arabian
- WebP compression: 36 MB PNGs → 0.67 MB WebPs (98% reduction)
- El Barrio: box image shown in grid + video below on product page
- Badge pills (BEST SELLER, BEST VALUE, etc.) moved to inline flow — no longer cut off

### Misc fixes
- `/fallover` catch-all → `<Navigate to="/" replace />`
- Router: lazy-loaded shop chunks

---

## PENDING — Awaiting push (2 local commits + 1 new)

These commits are done locally but **not pushed** (GitHub auth broken — `gh` CLI missing):
1. `ec5d24b` — Add WebP covers + update image refs
2. `32e3616` — Fix badge cutoff + restore original covers
3. `77bf232` — Remove redundant PNGs (saves 36 MB)

**Fix:** Install `gh` CLI → `gh auth login` → `git push origin main`

---

## PENDING — Needs Steven's input

| Task | Details | Priority |
|------|---------|----------|
| GitHub auth fix | Steven runs `gh auth login` after CLI install | HIGH |
| PayPal live | Create live PayPal app → update 3 Railway vars | HIGH (before launch) |
| Masterclass videos | 2 sales videos (talking + graphics) — need Dropbox paths | MEDIUM |
| bpm + musicalKey | 6 products have null values in products.js | LOW (SEO only) |
| Product details | Ableton version, plugins, track length from Wix | LOW |
| Clarity JS errors | 6 errors — Steven shares from dashboard | LOW |

---

## ENVIRONMENT

| Component | Location |
|-----------|----------|
| Frontend repo | `steven-angel-website-final/` (Netlify auto-deploy from GitHub) |
| Backend repo | `ghost-backend/` (Railway auto-deploy from GitHub) |
| R2 bucket | `steven-angel-shop` (Cloudflare, private) |
| Database | SQLite on Railway (ephemeral — mount Volume + set `DB_PATH` before launch) |
| PayPal | Sandbox mode (`PAYPAL_MODE=sandbox`) |

### Railway env vars (ghost-backend)
- `DROPBOX_REFRESH_TOKEN`, `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`
- `JWT_SECRET`

---

## KEY FILES

### Frontend (`src/shop/`)
`products.js` · `ProductCard.jsx` · `ProductPage.jsx` · `ShopPage.jsx` · `CheckoutButton.jsx` · `CheckoutModal.jsx` · `AuthContext.jsx` · `LoginPage.jsx` · `SignupPage.jsx` · `AccountPage.jsx` · `DiscountPopup.jsx` · `AudioPlayer.jsx`

### Backend (`ghost-backend/`)
`index.js` · `shop.js` · `db.js` · `scripts/dropbox-to-r2.js` · `scripts/test-r2.js`
