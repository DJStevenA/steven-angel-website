import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

  return {
    name: 'static-seo-pages',
    closeBundle() {
      const distDir = path.resolve('dist');
      const indexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexPath)) return;

      const html = fs.readFileSync(indexPath, 'utf8');
      const ghostHtml = html
        .replace(
          /<title>[\s\S]*?<\/title>/,
          '<title>Afro House & Tech House Ghost Producer | Steven Angel</title>'
        )
        .replace(
          /<meta name="description" content="[^"]*"\s*\/>/,
          '<meta name="description" content="Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included." />'
        )
        .replace(
          /<link rel="canonical" href="[^"]*"\s*\/>/,
          '<link rel="canonical" href="https://steven-angel.com/ghost" />'
        )
        .replace(
          /<meta property="og:title" content="[^"]*"\s*\/>/,
          '<meta property="og:title" content="Afro House & Tech House Ghost Producer | Steven Angel" />'
        )
        .replace(
          /<meta property="og:description" content="[^"]*"\s*\/>/,
          '<meta property="og:description" content="Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included." />'
        )
        .replace(
          /<meta property="og:url" content="[^"]*"\s*\/>/,
          '<meta property="og:url" content="https://steven-angel.com/ghost" />'
        )
        .replace(
          /<meta name="twitter:title" content="[^"]*"\s*\/>/,
          '<meta name="twitter:title" content="Afro House & Tech House Ghost Producer | Steven Angel" />'
        )
        .replace(
          /<meta name="twitter:description" content="[^"]*"\s*\/>/,
          '<meta name="twitter:description" content="Buy an Afro House, Tech House or Indie Dance Ghost Production — releases on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included." />'
        )
        .replace(
          '</head>',
          `    <script type="application/ld+json" id="ghost-service-jsonld">${ghostSchema}</script>\n  </head>`
        );

      const ghostDir = path.join(distDir, 'ghost');
      fs.mkdirSync(ghostDir, { recursive: true });
      fs.writeFileSync(path.join(ghostDir, 'index.html'), ghostHtml);
    },
  };
}

export default defineConfig({
  plugins: [react(), prefetchLazyChunks(), staticSeoPages()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
