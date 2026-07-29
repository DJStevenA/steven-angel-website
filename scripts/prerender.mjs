/**
 * Postbuild prerender — fixes "Discovered - currently not indexed" for all routes.
 *
 * Boots `vite preview` on a random local port, then uses Puppeteer (via
 * @prerenderer/prerenderer) to visit every public route and capture the
 * fully-rendered HTML. The rendered <body> is merged back into the static
 * HTML produced by the `staticSeoPages` plugin in vite.config.js, so that
 * per-route <head> SEO meta (title, canonical, og:*, JSON-LD) is preserved
 * untouched.
 *
 * Route list mirrors staticSeoPages exactly:
 *   - 12 hardcoded routes (homepage + ghost + shop + simple pages + blog index)
 *   - All published blog posts (auto-derived from src/blog/posts/<slug>.md)
 *   - All enabled shop products (auto-derived from PRODUCTS in src/shop/products.js)
 *
 * /mix-mastering/upload is intentionally skipped — it has noindex meta and is
 * a post-payment private page.
 *
 * Slow Railway-bound routes (/ghost, /shop, /the-angels) are covered by the
 * 8s `renderAfterTime` which exceeds GhostCatalog's 10s and TheAngels' 8s
 * fetch abort timeouts. Worst case on Railway cold start the prerender
 * captures the loading state — better than empty body.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import { PRODUCTS } from '../src/shop/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// ─────────────────────────────────────────────────────────────
// Route enumeration — mirrors staticSeoPages in vite.config.js
// ─────────────────────────────────────────────────────────────

const HARDCODED_ROUTES = [
  '/',
  '/ghost',
  '/shop',
  '/ghost/custom',
  '/ghost/finish-demo',
  '/lessons',
  '/the-angels',
  '/mix-mastering',
  '/privacy',
  '/links',
  '/angels',
  '/sign',
  '/blog',
  // '/mix-mastering/upload' — skipped: noindex, post-payment private
];

function blogRoutes() {
  const postsDir = path.join(ROOT, 'src/blog/posts');
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
      return matter(raw).data;
    })
    .filter((p) => p.status === 'published' && p.slug)
    .map((p) => `/blog/${p.slug}`);
}

function productRoutes() {
  return PRODUCTS.filter((p) => p.enabled).map((p) => `/shop/${p.slug}`);
}

const ALL_ROUTES = [
  ...HARDCODED_ROUTES,
  ...blogRoutes(),
  ...productRoutes(),
];

// ─────────────────────────────────────────────────────────────
// HTML merge — preserve staticSeoPages head, replace body
// ─────────────────────────────────────────────────────────────

function mergeHead(prerenderedHtml, originalHtml) {
  const origHeadMatch = originalHtml.match(/<head>([\s\S]*?)<\/head>/i);
  if (!origHeadMatch) {
    // Original file missing head — bail to prerendered as-is
    return prerenderedHtml;
  }
  const origHead = origHeadMatch[1];

  // Replace the prerendered <head>...</head> with the original's contents.
  // Keep the original <head> tag attributes from prerendered (e.g., lang).
  const merged = prerenderedHtml.replace(
    /<head[^>]*>[\s\S]*?<\/head>/i,
    (match) => {
      const openTag = match.match(/<head[^>]*>/i)?.[0] || '<head>';
      return `${openTag}${origHead}</head>`;
    },
  );
  return merged;
}

function writeRouteHtml(route, html) {
  // Map route '/' → dist/index.html, '/foo' → dist/foo/index.html
  const segments = route.split('/').filter(Boolean);
  const targetDir = path.join(DIST, ...segments);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html);
}

function readOriginalHtml(route) {
  const segments = route.split('/').filter(Boolean);
  const filePath = path.join(DIST, ...segments, 'index.html');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function getLaunchOptions() {
  // On Netlify / CI: use @sparticuz/chromium — slim, serverless-optimized binary
  // that works in Linux build env without system Chromium dependencies.
  // Locally: rely on puppeteer's bundled Chromium (downloaded during npm install).
  const isCI = !!process.env.NETLIFY || !!process.env.CI;
  if (isCI) {
    const chromium = (await import('@sparticuz/chromium')).default;
    return {
      executablePath: await chromium.executablePath(),
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: chromium.headless,
    };
  }
  return {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };
}

async function main() {
  console.log(`Prerendering ${ALL_ROUTES.length} routes...`);

  const launchOptions = await getLaunchOptions();

  // Prerenderer spins up its own static file server pointing at staticDir.
  // No need for vite preview — its built-in server handles dist/.
  const prerenderer = new Prerenderer({
    staticDir: DIST,
    server: { host: '127.0.0.1' },
    renderer: new PuppeteerRenderer({
      headless: true,
      maxConcurrentRoutes: 2,
      renderAfterTime: 8000, // covers React mount + Suspense + Railway cold start (10s abort budget)
      timeout: 30000,
      viewport: { width: 1280, height: 800 },
      // Don't fetch GTM / Clarity / analytics during prerender — they'd skew
      // GA stats and add latency. Also blocks any third-party CDN by default,
      // which we accept (R2 audio doesn't matter for SEO HTML capture).
      skipThirdPartyRequests: true,
      consoleHandler: () => {}, // suppress page console noise
      launchOptions,
    }),
  });

  try {
    await prerenderer.initialize();

    // 3. Render all routes
    const renderedRoutes = await prerenderer.renderRoutes(ALL_ROUTES);

    // 4. Post-process: merge staticSeoPages head into prerendered body, write back
    let ok = 0;
    let redirected = 0;
    let failed = 0;

    const normalize = (p) => (p.replace(/\/+$/, '') || '/');

    for (const rendered of renderedRoutes) {
      const route = rendered.originalRoute;
      const finalRoute = rendered.route;

      // Guard against React Router catch-all redirecting to "/". Trailing
      // slash differences (e.g. /ghost → /ghost/ from the static server's
      // pretty-URL handling) are not real redirects and should be treated
      // as equivalent.
      if (normalize(finalRoute) !== normalize(route)) {
        console.warn(`⚠ ${route} → redirected to ${finalRoute}, skipping write`);
        redirected++;
        continue;
      }

      const original = readOriginalHtml(route);
      if (!original) {
        console.warn(`⚠ ${route} — no original HTML found in dist/, skipping`);
        failed++;
        continue;
      }

      const merged = mergeHead(rendered.html, original);
      writeRouteHtml(route, merged);
      console.log(`✓ ${route}`);
      ok++;
    }

    console.log('');
    console.log(`Done: ${ok} ok, ${redirected} redirected, ${failed} failed`);

    if (ok === 0) {
      throw new Error('Prerender produced zero successful routes');
    }
  } finally {
    await prerenderer.destroy().catch(() => {});
  }
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
