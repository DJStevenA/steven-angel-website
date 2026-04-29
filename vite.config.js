import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { PRODUCTS } from './src/shop/products.js'

// Plugin to add prefetch hints for lazy-loaded chunks
function prefetchLazyChunks() {
  return {
    name: 'prefetch-lazy-chunks',
    transformIndexHtml(html, { bundle }) {
      if (!bundle) return html;
      const ghostChunk = Object.keys(bundle).find(k => k.includes('Ghost'));
      const links = [];
      if (ghostChunk) {
        links.push({
          tag: 'link',
          attrs: { rel: 'prefetch', href: '/' + ghostChunk },
          injectTo: 'head',
        });
      }
      return links;
    },
  };
}

function staticSeoPages() {
  const siteUrl = 'https://steven-angel.com';
  const ghostSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Afro House, Tech House & Indie Dance Ghost Production',
    serviceType: 'Ghost Production Service',
    description:
      'Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included.',
    provider: {
      '@type': 'Person',
      name: 'Steven Angel',
      url: 'https://steven-angel.com/',
      sameAs: [
        'https://steven-angel.com/',
        'https://steven-angel.com/ghost',
      ],
    },
    areaServed: 'Worldwide',
    url: 'https://steven-angel.com/ghost',
    offers: {
      '@type': 'Offer',
      price: '300',
      priceCurrency: 'USD',
      url: 'https://steven-angel.com/ghost',
      availability: 'https://schema.org/InStock',
    },
  });

  const shopTitle = 'Ableton Templates & Afro House Masterclass | Steven Angel';
  const shopDescription =
    'Afro House Ableton templates and masterclass by Steven Angel — signed MTGD & Moblack artist. Hugel, Keinemusik, Moblack style. From $19.99. Instant download.';

  const replaceMeta = (html, replacements) =>
    html
      .replace(
        /<title>[\s\S]*?<\/title>/,
        `<title>${replacements.title}</title>`
      )
      .replace(
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${replacements.description}" />`
      )
      .replace(
        /<link rel="canonical" href="[^"]*"\s*\/>/,
        `<link rel="canonical" href="${replacements.canonical}" />`
      )
      .replace(
        /<meta property="og:title" content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${replacements.ogTitle || replacements.title}" />`
      )
      .replace(
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${replacements.ogDescription || replacements.description}" />`
      )
      .replace(
        /<meta property="og:url" content="[^"]*"\s*\/>/,
        `<meta property="og:url" content="${replacements.canonical}" />`
      )
      .replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${replacements.ogImage}" />`
      )
      .replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/>/,
        `<meta name="twitter:title" content="${replacements.twitterTitle || replacements.title}" />`
      )
      .replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${replacements.twitterDescription || replacements.description}" />`
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/>/,
        `<meta name="twitter:image" content="${replacements.ogImage}" />`
      )
      .replace(
        /<link rel="preload" as="image" type="image\/webp" href="[^"]*"[^>]*\/>/,
        `<link rel="preload" as="image" type="image/webp" href="${replacements.lcpImage || '/images/dj-hero.webp'}" fetchpriority="high" />`
      );

  const injectJsonLd = (html, id, schema) =>
    html.replace(
      '</head>',
      `    <script type="application/ld+json" id="${id}">${JSON.stringify(schema)}</script>\n  </head>`
    );

  return {
    name: 'static-seo-pages',
    closeBundle() {
      const distDir = path.resolve('dist');
      const indexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexPath)) return;

      const html = fs.readFileSync(indexPath, 'utf8');
      const ghostHtml = injectJsonLd(
        replaceMeta(html, {
          title: 'Afro House & Tech House Ghost Producer | Steven Angel',
          description:
            'Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included.',
          canonical: `${siteUrl}/ghost`,
          ogImage: `${siteUrl}/images/dj-hero-ghost.webp`,
          lcpImage: '/images/dj-hero-ghost.webp', // /ghost-specific preload override
        }),
        'ghost-service-jsonld',
        JSON.parse(ghostSchema)
      );

      const ghostDir = path.join(distDir, 'ghost');
      fs.mkdirSync(ghostDir, { recursive: true });
      fs.writeFileSync(path.join(ghostDir, 'index.html'), ghostHtml);

      const shopHtml = replaceMeta(html, {
        title: shopTitle,
        description: shopDescription,
        canonical: `${siteUrl}/shop`,
        ogImage: `${siteUrl}/shop/masterclass-cover.webp`,
      });

      const shopDir = path.join(distDir, 'shop');
      fs.mkdirSync(shopDir, { recursive: true });
      fs.writeFileSync(path.join(shopDir, 'index.html'), shopHtml);

      for (const product of PRODUCTS.filter((p) => p.enabled)) {
        const canonical = `${siteUrl}/shop/${product.slug}`;
        const productImage = `${siteUrl}${product.image}`;
        const productSchema = {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: `${product.name} — ${product.headline}`,
          description: product.seoDescription || product.description,
          brand: { '@type': 'Brand', name: 'Steven Angel' },
          sku: product.id,
          image: productImage,
          offers: {
            '@type': 'Offer',
            price: String(product.price),
            priceCurrency: product.currency,
            availability: 'https://schema.org/InStock',
            url: canonical,
          },
        };

        const productHtml = injectJsonLd(
          replaceMeta(html, {
            title: product.seoTitle || `${product.name} | Steven Angel`,
            description: product.seoDescription || product.description,
            canonical,
            ogTitle: product.seoTitle || `${product.name} | Steven Angel`,
            ogDescription: product.seoDescription || product.description,
            ogImage: productImage,
          }),
          'product-jsonld',
          productSchema
        );

        const productDir = path.join(distDir, 'shop', product.slug);
        fs.mkdirSync(productDir, { recursive: true });
        fs.writeFileSync(path.join(productDir, 'index.html'), productHtml);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), prefetchLazyChunks(), staticSeoPages()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Dev-only proxy: forwards Railway-bound requests through the Vite dev
  // server so localhost previews can call the production backend without
  // tripping its CORS allowlist (origin becomes localhost-via-proxy → no
  // browser CORS check). Has no effect on production builds.
  server: {
    proxy: {
      '/ghost/tracks': {
        target: 'https://ghost-backend-production-adb6.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/shop/media': {
        target: 'https://ghost-backend-production-adb6.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/the-angels/instagram': {
        target: 'https://ghost-backend-production-adb6.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
