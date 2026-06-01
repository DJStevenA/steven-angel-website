import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import matter from 'gray-matter'
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
    offers: [
      { '@type': 'Offer', name: 'Demo Finishing', price: '300', priceCurrency: 'USD', url: 'https://steven-angel.com/ghost/finish-demo' },
      { '@type': 'Offer', name: 'Full Production (No Vocal)', price: '800', priceCurrency: 'USD', url: 'https://steven-angel.com/ghost/custom' },
      { '@type': 'Offer', name: 'Full Production with Vocal', price: '1500', priceCurrency: 'USD', url: 'https://steven-angel.com/ghost/custom' },
      { '@type': 'Offer', name: 'Ready-Made Ghost Track', priceRange: '€39–€870', priceCurrency: 'EUR', url: 'https://steven-angel.com/ghost', availability: 'https://schema.org/InStock' },
    ],
  });

  const shopTitle = 'Ableton Templates & Afro House Masterclass | Steven Angel';
  const shopDescription =
    'Afro House Ableton templates and masterclass by Steven Angel — signed MTGD & Moblack artist. Hugel, Keinemusik, Moblack style. From $19.99. Instant download.';

  const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const replaceMeta = (html, replacements) => {
    const ogImageExtras = [];
    if (replacements.ogImageWidth) ogImageExtras.push(`<meta property="og:image:width" content="${replacements.ogImageWidth}" />`);
    if (replacements.ogImageHeight) ogImageExtras.push(`<meta property="og:image:height" content="${replacements.ogImageHeight}" />`);
    if (replacements.ogImageType) ogImageExtras.push(`<meta property="og:image:type" content="${replacements.ogImageType}" />`);
    if (replacements.ogImageAlt) ogImageExtras.push(`<meta property="og:image:alt" content="${escapeAttr(replacements.ogImageAlt)}" />`);
    if (replacements.productPrice != null) ogImageExtras.push(`<meta property="product:price:amount" content="${replacements.productPrice}" />`);
    if (replacements.productCurrency) ogImageExtras.push(`<meta property="product:price:currency" content="${replacements.productCurrency}" />`);
    const ogImageBlock = [`<meta property="og:image" content="${replacements.ogImage}" />`, ...ogImageExtras].join('\n    ');

    return html
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
        /<meta property="og:type" content="[^"]*"\s*\/>/,
        `<meta property="og:type" content="${replacements.ogType || 'website'}" />`
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
        ogImageBlock
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
  };

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
          ogTitle: 'Steven Angel — Ghost Tracks for Afro House, Tech House & Indie Dance',
          ogDescription:
            'Buy ready-to-release Ghost Tracks signed on MTGD, Moblack & Godeeva. Beatport Top 10. From $300. NDA included.',
          ogImage: `${siteUrl}/images/ghost-og.jpg`,
          ogImageWidth: 1200,
          ogImageHeight: 630,
          ogImageType: 'image/jpeg',
          ogImageAlt: 'Steven Angel — Ghost Tracks for Afro House, Tech House & Indie Dance',
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

      /* ───────── SIMPLE PAGES — static meta + per-route canonical ─────────
       * Without this loop, /lessons, /the-angels, /mix-mastering, /ghost/custom,
       * /ghost/finish-demo, /privacy, /sign etc. all fall back to dist/index.html
       * — which means every one of them gets the homepage's canonical (=`/`).
       * Google then treats them as "Alternate page with proper canonical tag"
       * and refuses to index them as themselves, and Google Ads flags any
       * sitelink to them as "Destination mismatch" (the canonical doesn't
       * agree with the URL the user lands on). Mirrors the titles +
       * descriptions in src/main.jsx so the static HTML matches the SPA.
       * Added 2026-05-18 after the GSC "Alternate page" notification +
       * Google Ads policy disapproval surface revealed the gap. */
      const SIMPLE_PAGES = [
        {
          path: '/ghost/custom',
          title: 'Custom Afro House Ghost Production | Steven Angel',
          description:
            'Custom Afro House ghost production for DJs and artists. Released on MTGD, Moblack, Godeeva. Hugel & Claptone played my work. Full track from $800 — 5-7 day delivery.',
          lcpImage: '/images/dj-hero-ghost.webp',
          ogImage: `${siteUrl}/images/ghost-og.jpg`,
        },
        {
          path: '/ghost/finish-demo',
          title: 'Demo Finishing — Afro House Ghost Production | Steven Angel',
          description:
            'Send me your Afro House demo — get back a label-ready full track in 3-5 days. From $300. Released on MTGD, Moblack, Godeeva.',
          lcpImage: '/images/dj-hero-ghost.webp',
          ogImage: `${siteUrl}/images/ghost-og.jpg`,
        },
        {
          path: '/lessons',
          title: 'Ableton Lessons by a Moblack & MTGD Artist | Steven Angel',
          description:
            '1-on-1 Ableton lessons from a producer released on Moblack, MTGD & Sony. Afro House, Latin House, Tech House & Indie Dance. From $30 intro session.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Ableton Production Lessons',
            provider: { '@type': 'Person', name: 'Steven Angel', url: 'https://steven-angel.com' },
            description: '1-on-1 online Ableton production lessons. 3 modules: Software, Music Theory, Sound Design + Mix & Mastering. Afro House, Melodic Techno, Indie Dance.',
            offers: [
              { '@type': 'Offer', name: '1 Hour Lesson', price: '80', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Intro Session', price: '30', priceCurrency: 'USD' },
            ],
          },
        },
        {
          path: '/the-angels',
          title: 'The Angels — Afro / Latin House Duo | EPK',
          description:
            'The Angels — Afro / Latin House / Tribal duo. 10M+ streams, Beatport Top 10. Played by Hugel, Claptone, Sofi Tukker. Released on MTGD, Moblack, Sony.',
        },
        {
          path: '/mix-mastering',
          title: 'Professional Mix & Mastering from $35 | Steven Angel',
          description:
            'Professional online mastering from $35. Trusted by Hernan Cattaneo & Dole & Kom. Mix + Master from $150. 3-day turnaround. Afro House, Melodic Techno, Electronic.',
          schema: {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Mix & Mastering',
            provider: { '@type': 'Person', name: 'Steven Angel', url: 'https://steven-angel.com' },
            description: 'Professional mix and mastering for Afro House, Afro Latin, Indie Dance, Melodic Techno. Trusted by Hernan Cattaneo & Dole & Kom.',
            offers: [
              { '@type': 'Offer', name: 'Mastering', price: '35', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Stem Mastering (10 stems)', price: '75', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Mix + Master (30 stems)', price: '150', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Mix + Master (30-100 stems)', price: '250', priceCurrency: 'USD' },
            ],
          },
        },
        {
          path: '/privacy',
          title: 'Privacy Policy — Steven Angel Marketing',
          description:
            'Privacy policy for Steven Angel Marketing — covers the @stevenangel.prod Instagram automation built with the Steven Angel Marketing Meta App.',
        },
        {
          path: '/links',
          title: 'Steven Angel — Links · Ghost Production · Mix & Mastering · Lessons',
          description:
            'All Steven Angel links — Ghost Production, Mix & Mastering, Lessons, Templates, Masterclass and more. Beatport Top 10 producer based in Tel Aviv.',
        },
        {
          path: '/sign',
          title: 'Ghost Production Agreement | Steven Angel',
          description: 'Sign your ghost production agreement with Steven Angel.',
        },
        {
          path: '/mix-mastering/upload',
          title: 'Mix & Master Upload | Steven Angel',
          description: 'Upload your stems for mastering.',
          noindex: true, // post-payment private page — should not be in search
        },
      ];

      for (const page of SIMPLE_PAGES) {
        let pageHtml = replaceMeta(html, {
          title: page.title,
          description: page.description,
          canonical: `${siteUrl}${page.path}`,
          ogImage: page.ogImage || `${siteUrl}/images/dj-hero.webp`,
          lcpImage: page.lcpImage, // undefined → falls back to /images/dj-hero.webp inside replaceMeta
        });
        if (page.noindex) {
          pageHtml = pageHtml.replace(
            '</head>',
            `    <meta name="robots" content="noindex,follow" />\n  </head>`
          );
        }
        // Service schema for service pages (Google AI Overviews / Generative UI)
        if (page.schema) {
          pageHtml = injectJsonLd(pageHtml, 'service-jsonld', page.schema);
        }
        const pageDir = path.join(distDir, ...page.path.split('/').filter(Boolean));
        fs.mkdirSync(pageDir, { recursive: true });
        fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml);
      }

      /* ───────── BLOG — /blog index + /blog/<slug> per-post ───────── */
      const blogIndexTitle = 'THE LAB — Production Notes by Steven Angel';
      const blogIndexDescription =
        'Production notes from a Beatport Top 10 producer. Mix, mastering, and the small decisions that separate hobbyist tracks from label releases.';

      // Load + parse all .md posts at build time. Filter to status: published,
      // sort newest first (matches src/blog/posts.js).
      const postsDir = path.resolve('src/blog/posts');
      let blogPosts = [];
      if (fs.existsSync(postsDir)) {
        blogPosts = fs.readdirSync(postsDir)
          .filter((f) => f.endsWith('.md'))
          .map((file) => {
            const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
            return matter(raw).data;
          })
          .filter((p) => p.status === 'published')
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      // /blog index
      const blogIndexSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: blogIndexTitle,
        description: blogIndexDescription,
        url: `${siteUrl}/blog`,
        publisher: {
          '@type': 'Person',
          name: 'Steven Angel',
          url: `${siteUrl}/`,
        },
        blogPost: blogPosts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          url: `${siteUrl}/blog/${p.slug}`,
          datePublished: typeof p.date === 'string' ? p.date : new Date(p.date).toISOString().slice(0, 10),
          author: { '@type': 'Person', name: 'Steven Angel' },
        })),
      };

      const blogIndexHtml = injectJsonLd(
        replaceMeta(html, {
          title: blogIndexTitle,
          description: blogIndexDescription,
          canonical: `${siteUrl}/blog`,
          ogType: 'website',
          ogTitle: blogIndexTitle,
          ogDescription: blogIndexDescription,
          ogImage: `${siteUrl}/images/dj-hero.webp`,
        }),
        'blog-index-jsonld',
        blogIndexSchema
      );

      const blogDir = path.join(distDir, 'blog');
      fs.mkdirSync(blogDir, { recursive: true });
      fs.writeFileSync(path.join(blogDir, 'index.html'), blogIndexHtml);

      // /blog/<slug>/index.html per post
      for (const post of blogPosts) {
        const slug = post.slug;
        if (!slug) continue;
        const canonical = `${siteUrl}/blog/${slug}`;
        const isoDate = typeof post.date === 'string'
          ? post.date
          : new Date(post.date).toISOString().slice(0, 10);

        const ogImageUrl = `${siteUrl}/images/dj-hero.webp`;

        const articleSchema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.meta_description || '',
          datePublished: isoDate,
          dateModified: isoDate,
          author: {
            '@type': 'Person',
            name: 'Steven Angel',
            url: `${siteUrl}/`,
          },
          publisher: {
            '@type': 'Person',
            name: 'Steven Angel',
            url: `${siteUrl}/`,
          },
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          image: ogImageUrl,
          url: canonical,
        };

        let postHtml = injectJsonLd(
          replaceMeta(html, {
            title: post.title.length > 65 ? post.title.slice(0, 62) + '…' : post.title,
            description: post.meta_description || '',
            canonical,
            ogType: 'article',
            ogTitle: post.title,
            ogDescription: post.meta_description || '',
            ogImage: ogImageUrl,
          }),
          'blog-article-jsonld',
          articleSchema
        );

        // BreadcrumbList: Home → Blog → Post Title
        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
            { '@type': 'ListItem', position: 3, name: post.title },
          ],
        };
        postHtml = injectJsonLd(postHtml, 'blog-breadcrumb-jsonld', breadcrumbSchema);

        if (Array.isArray(post.faq_schema) && post.faq_schema.length > 0) {
          const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq_schema.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          };
          postHtml = injectJsonLd(postHtml, 'blog-faq-jsonld', faqSchema);
        }

        const postDir = path.join(distDir, 'blog', slug);
        fs.mkdirSync(postDir, { recursive: true });
        fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
      }

      for (const product of PRODUCTS.filter((p) => p.enabled)) {
        const canonical = `${siteUrl}/shop/${product.slug}`;
        // Per-product 1200x630 JPG for OG (Facebook scraper renders JPG more
        // reliably than WebP). Derived from the WebP cover path by replacing
        // -cover.webp with -og.jpg — see public/shop/<name>-og.jpg.
        const ogImagePath = product.image.replace(/-cover\.webp$/, '-og.jpg');
        const ogImageUrl = `${siteUrl}${ogImagePath}`;
        const productImageForSchema = `${siteUrl}${product.image}`;
        const productSchema = {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: `${product.name} — ${product.headline}`,
          description: product.seoDescription || product.description,
          brand: { '@type': 'Brand', name: 'Steven Angel' },
          sku: product.id,
          image: productImageForSchema,
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
            ogType: 'product',
            ogTitle: product.seoTitle || `${product.name} | Steven Angel`,
            ogDescription: product.seoDescription || product.description,
            ogImage: ogImageUrl,
            ogImageWidth: 1200,
            ogImageHeight: 630,
            ogImageType: 'image/jpeg',
            ogImageAlt: `${product.name} — ${product.headline}`,
            productPrice: product.price,
            productCurrency: product.currency,
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
