/**
 * Steven Angel Shop — Product Catalog
 *
 * To add a product: copy a block, change id/name/price/paths.
 * To remove a product: delete the block (or set `enabled: false`).
 *
 * IMPORTANT:
 * - `dropboxPath` is the source ZIP in Dropbox (used by backend to generate temporary download links)
 * - `previewVideoUrl` will be the Cloudflare R2 public URL (filled in Phase 6)
 * - `image` is the local thumbnail in /public/shop/ (created in Phase 6)
 * - `slug` is the URL slug for the per-product page (/shop/:slug). Built for SEO:
 *     genre + software ("ableton-template") + specifics + (BPM/key when available).
 * - `bpm` and `musicalKey` are filled by Steven later — they appear in the slug + product
 *   card for SEO ("Afro House Ableton Template — 122 BPM Fm").
 *
 * Prices are in USD.
 */

export const PRODUCTS = [
  // ─────────────────────────────────────────────────────────
  {
    id: "afro-house-masterclass",
    slug: "afro-house-masterclass-ableton-live-tutorial-jungle-walk",
    enabled: true,
    type: "course", // "course" or "template" — affects checkout flow & post-purchase access
    name: "Jungle Walk Masterclass",
    headline: "Learn How I Made a Beatport Top 10 Track",
    seoTitle: "Afro House Masterclass — How To Produce Afro House In Ableton Live | Steven Angel",
    seoDescription:
      "Afro House masterclass in Ableton Live — full breakdown of 'Jungle Walk', a Beatport Top 10 track supported by Francis Mercier, DJ Chus & Joeski. 5 lessons + project file + 100+ samples. $29.",
    price: 29,
    currency: "USD",
    badge: "BEST SELLER",
    badgeColor: "purple", // "cyan" | "purple" | null
    genre: "Afro House",
    daw: "Ableton Live",
    bpm: null, // TODO Steven: fill in actual BPM
    musicalKey: null, // TODO Steven: fill in actual key (e.g. "Am", "Fm")
    description:
      'A 60-minute video masterclass walking through the full production process of "Jungle Walk" — released on Godeeva, reached Top 10 on Beatport, and supported by Francis Mercier, DJ Chus, and Joeski. 5 focused lessons covering kick & bass design, percussion programming, vocal processing, synths, and mixing & mastering. Includes the full Ableton Live project file and a 100+ sample pack. Perfect for producers serious about leveling up to the standard of MTGD, Moblack, and Godeeva.',
    shortDescription: '"Jungle Walk" project + 5 lessons + sample pack',
    keywords: [
      // Course intent — high purchase intent
      "how to produce afro house in ableton live",
      "afro house music production online course",
      "ableton afro house tutorial step by step",
      "melodic afro house masterclass",
      "afro house beat making video tutorial",
      "learn afro house production course",
      "afro house production course",
      "afro house ableton tutorial",
      // Sample pack & content
      "afro house sample pack",
      "afro house drum kit",
      "afro house midi pack",
      "afro house serum presets",
      "afro house drum loops",
      "afro house sounds download",
      // Artist style
      "keinemusik style samples",
      "hugel style samples",
      "moblack style samples",
    ],
    features: [
      "60 min HD video masterclass",
      "5 in-depth production lessons",
      'Full "Jungle Walk" Ableton project',
      "100+ samples & one-shots",
      "Serum presets included",
      "Lifetime access to updates",
    ],
    image: "/shop/masterclass-thumb.webp", // created in Phase 6
    previewVideoUrl: null, // TODO: wire masterclass intro video from R2 (video/masterclass-intro.mp4)
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/jungle-walk.mp3",
    dropboxPath: "/On Line Lessons/Afro House Master Class/Afro House MasterClass - DL PACK.zip",
    fileSize: "237 MB",
    // SEO tags shown as pills under the buy button — high-value search terms
    seoTags: [
      "Afro House Masterclass",
      "Ableton Live Tutorial",
      "Beatport Top 10",
      "Online Course",
      "Sample Pack Included",
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "balkan-boy",
    slug: "afro-house-balkan-ableton-live-template-balkan-boy",
    enabled: true,
    type: "template",
    name: "Balkan Boy",
    headline: "The Balkan Afro House Sound Hugel & Claptone Play",
    seoTitle: "Balkan Boy — Afro House Ableton Template (Hugel Style) | Steven Angel",
    seoDescription:
      "Balkan Afro House Ableton Live 12 template — Hugel & Grossomodo style. Full project file with Serum presets, mixdown, and 269 MB sample pack. Royalty-free. $19.99 instant download.",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Afro Latin / Balkan House",
    daw: "Ableton Live 12",
    bpm: null, // TODO Steven
    musicalKey: null, // TODO Steven
    description:
      "Authentic Balkan-influenced Afro House template inspired by Hugel and Grossomodo. Built in Ableton Live 12 with Serum presets, full mixdown, and 269MB sample pack. Perfect for producers wanting to nail the Eastern European Afro House sound.",
    shortDescription: "Ableton 12 · Serum presets · 269 MB sample pack",
    keywords: [
      "afro house ableton template",
      "afro house ableton live 12 template",
      "afro house ableton live template",
      "afro house project file ableton",
      "hugel style afro house template",
      "hugel style ableton template",
      "grossomodo style template",
      "balkan afro house template",
      "balkan ableton template",
      "afro latin ableton template",
      "afro latin sample pack",
      "moblack style ableton template",
      "afro house template download",
      "premium ableton templates",
    ],
    features: [
      "Full Ableton Live 12 project",
      "Custom Serum presets",
      "Full mixdown & master chain",
      "269 MB sample pack included",
      "Royalty-free for commercial release",
    ],
    image: "/shop/balkan-boy-thumb.webp",
    previewVideoUrl: null,
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/balkan-boy.mp3",
    dropboxPath:
      "/Ghost Tracks templates sample packs/2025/Ableton Template/Balkan Boy/Balkan Boy_Ableton Template By Steven Angel.zip",
    fileSize: "269 MB",
    seoTags: [
      "Ableton Template",
      "Afro House Project",
      "Hugel Style",
      "Balkan Afro House",
      "Ableton Live 12",
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "maria-maria",
    slug: "afro-house-remix-ableton-live-template-maria-maria",
    enabled: true,
    type: "template",
    name: "Maria Maria Remix",
    headline: "The Real Session Behind The Angels' Hit Remix",
    seoTitle: "Maria Maria Afro House Remix — Ableton Live 11 Template | Steven Angel",
    seoDescription:
      "The Angels' official Santana 'Maria Maria' Afro House remix — full Ableton Live 11 session. Vocal chops, percussion, mixdown. Supported by DJ Chus. $19.99 instant download.",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Afro House",
    daw: "Ableton Live 11",
    bpm: null, // TODO Steven
    musicalKey: null, // TODO Steven
    description:
      "The Angels' official Maria Maria Afro House remix — now your full project file. Supported by DJ Chus and played across festivals in Latin America and Europe. Built in Ableton Live 11, this is the actual session used for the released remix: vocal chops, percussion layers, bass design, and full mixdown. Learn how a signed Afro House remix is built from the ground up.",
    shortDescription: "Ableton 11 · Official remix project · Full stems",
    keywords: [
      "afro house ableton template",
      "afro house ableton live 11 template",
      "afro house remix ableton template",
      "afro house project file ableton",
      "afro house remix project",
      "afro house stems",
      "santana maria maria remix",
      "the angels remix template",
      "dj chus supported track",
      "afro house template download",
      "ghost production templates ableton",
      "ableton live project files download",
      "moblack style ableton template",
      "premium ableton templates",
    ],
    features: [
      "Official released remix project",
      "Ableton Live 11 session",
      "All vocal chops & layers",
      "Full mixdown",
      "Royalty-free production rights",
    ],
    image: "/shop/maria-maria-thumb.webp",
    previewVideoUrl: null,
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/maria-maria.mp3",
    dropboxPath:
      "/Ghost Tracks templates sample packs/2024/Maria Maria/The Angels - Maria Maria (Afro House Remix) Project.zip",
    fileSize: "883 MB",
    seoTags: [
      "Ableton Template",
      "Afro House Remix",
      "DJ Chus Supported",
      "Santana Remix",
      "Ableton Live 11",
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "el-barrio",
    slug: "afro-house-ableton-live-template-el-barrio-mtgd",
    enabled: true,
    type: "template",
    name: "El Barrio",
    headline: "The MTGD Release Hugel & Claptone Played at Pacha Ibiza",
    seoTitle: "El Barrio — MTGD Afro House Ableton Live Template (Hugel & Claptone Style) | Steven Angel",
    seoDescription:
      "The actual Ableton Live 11 project for 'El Barrio' — MTGD release played live by Hugel & Claptone at Pacha Ibiza. Real session, drums, bass, vocal chops, full mixdown. $19.99.",
    price: 19.99,
    currency: "USD",
    badge: "PLAYED BY HUGEL & CLAPTONE",
    badgeColor: "cyan",
    genre: "Afro House",
    daw: "Ableton Live 11",
    bpm: null, // TODO Steven
    musicalKey: null, // TODO Steven
    description:
      'The actual Ableton project for "El Barrio" — released on MTGD (Hugel\'s label) and played live by Hugel and Claptone at Pacha Ibiza. Built in Ableton Live 11. This is the real session — drum programming, bassline, vocal chops, and the full mixdown that made it onto Beatport. If you want to know exactly how a track lands on a major Afro House label, this is the closest you can get without being in the studio with me.',
    shortDescription: "MTGD release · Ableton 11 · The real session",
    keywords: [
      "afro house ableton template",
      "afro house ableton live 11 template",
      "afro house project file ableton",
      "hugel ableton template",
      "hugel style ableton template",
      "hugel style afro house template",
      "claptone ableton template",
      "claptone style house template",
      "keinemusik ableton template",
      "keinemusik style afro house project",
      "afro house stems",
      "mtgd template",
      "pacha ibiza track template",
      "afro house played by hugel",
      "moblack style ableton template",
      "premium ableton templates",
      "ghost production templates ableton",
      "ableton live project files download",
    ],
    features: [
      "Real MTGD-released project",
      "Played by Hugel & Claptone live",
      "Full Ableton Live 11 session",
      "Drum programming & bassline",
      "Vocal chops & full mixdown",
    ],
    image: "/shop/el-barrio-thumb.webp",
    previewVideoUrl: "/videos/hugel-claptone-ibiza.mp4",
    previewVideoThumb: "/images/pacha-ibiza-thumb.webp",
    previewVideoCaption: "Hugel & Claptone playing El Barrio at Pacha Ibiza",
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/el-barrio.mp3",
    dropboxPath:
      "/Ghost Tracks templates sample packs/2025/Ableton Template/El Barrio/The Angels - El Bario Ableton Template Project.zip",
    fileSize: "429 MB",
    seoTags: [
      "Ableton Template",
      "Afro House Project",
      "Hugel Style",
      "MTGD Release",
      "Pacha Ibiza Track",
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "solomun-arabian",
    slug: "melodic-techno-ableton-template-solomun-artbat-style",
    enabled: true,
    type: "template",
    name: "Solomun / Artbat Arabian Techno",
    headline: "Festival-Ready Melodic Techno in Solomun & Artbat Style",
    seoTitle: "Solomun & Artbat Style Melodic Techno Ableton Template — Arabian | Steven Angel",
    seoDescription:
      "Arabian-influenced Melodic Techno Ableton Live template — Solomun & Artbat style. Middle Eastern percussion, atmospheric synths, festival-ready mixdown. $19.99 instant download.",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Melodic Techno",
    daw: "Ableton Live",
    bpm: null, // TODO Steven
    musicalKey: null, // TODO Steven
    description:
      "Arabian-influenced melodic techno in the style of Solomun and Artbat. Fully mixed and mastered Ableton Live project with authentic Middle Eastern percussion, atmospheric synth work, and a driving techno groove. Perfect template for producers exploring the cross-cultural melodic techno sound that's dominating mainstage festivals. Includes all presets, samples, and mixdown chains.",
    shortDescription: "Melodic Techno · Middle Eastern percussion · Fully mastered",
    keywords: [
      "melodic techno ableton template",
      "melodic techno ableton live template",
      "melodic techno project file ableton",
      "solomun style template",
      "solomun style melodic techno",
      "artbat style template",
      "artbat style ableton project",
      "tale of us style template",
      "afterlife style template",
      "indie dance ableton template",
      "tech house ableton template",
      "arabian techno template",
      "middle eastern techno ableton",
      "festival melodic techno template",
      "premium ableton templates",
      "ableton live project files download",
    ],
    features: [
      "Fully mixed & mastered",
      "Middle Eastern percussion",
      "Atmospheric synth work",
      "All presets included",
      "Royalty-free samples",
    ],
    image: "/shop/solomun-arabian-thumb.webp",
    previewVideoUrl: null, // TODO: wire solomun preview video from R2 (video/solomun-preview.mp4)
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/solomun-arabian.mp3",
    dropboxPath:
      "/Ghost Tracks templates sample packs/For IN SOUND/SOLOMUN/Solomun Melodic Techno Project.zip",
    fileSize: "737 MB",
    seoTags: [
      "Melodic Techno Template",
      "Solomun Style",
      "Artbat Style",
      "Arabian Techno",
      "Festival Sound",
    ],
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "mega-bundle",
    slug: "melodic-techno-afro-house-ableton-template-bundle",
    enabled: true,
    type: "template",
    name: "Melodic Techno Mega Bundle",
    headline: "3 Pro Templates + Sample Pack — Save 50%",
    seoTitle: "Melodic Techno Mega Bundle — 3 Ableton Templates + Sample Pack | Steven Angel",
    seoDescription:
      "3 premium Ableton Live templates (Artbat style, Tale Of Us style, Afro House crossover) + sample pack with Serum & Diva presets. Save 50% vs buying separately. $39.",
    price: 39,
    currency: "USD",
    badge: "BEST VALUE",
    badgeColor: "purple",
    genre: "Melodic Techno / Afro House",
    daw: "Ableton Live",
    bpm: null, // TODO Steven
    musicalKey: null, // TODO Steven
    description:
      "Three premium templates + a curated sample pack — everything you need for melodic techno and crossover production. Includes an Artbat-style template, a Tale Of Us-inspired session, an Afro House crossover project, and a sample pack with kicks, percussion loops, vocal chops, and atmospheric textures. Built in Ableton Live with Serum and Diva presets included. Best value in the shop.",
    shortDescription: "3 templates + sample pack · 1.29 GB · Best value",
    keywords: [
      "melodic techno ableton template",
      "melodic techno ableton bundle",
      "ableton template bundle",
      "tech house ableton template",
      "afro house ableton template",
      "artbat style template",
      "artbat style ableton project",
      "tale of us style template",
      "afterlife style template",
      "afro house sample pack",
      "afro house drum kit",
      "afro house midi pack",
      "melodic house serum presets",
      "techno bundle",
      "premium ableton templates",
      "ghost production templates ableton",
      "ableton live project files download",
    ],
    features: [
      "3 complete Ableton projects",
      "Artbat-style template",
      "Tale Of Us-inspired session",
      "Afro House crossover project",
      "Curated sample pack included",
      "Serum & Diva presets",
    ],
    image: "/shop/mega-bundle-thumb.webp",
    previewVideoUrl: null,
    audioUrl: "https://ghost-backend-production-adb6.up.railway.app/shop/media/audio/mega-bundle.mp3",
    dropboxPath: "/Ghost Tracks templates sample packs/For IN SOUND/MELODIC TECHNO/Mega_Bundle_Pack.zip",
    fileSize: "1.29 GB",
    seoTags: [
      "Melodic Techno Bundle",
      "Artbat Style",
      "Tale Of Us Style",
      "3 Templates + Pack",
      "Best Value",
    ],
  },
];

// Helper to get only enabled products
export const getActiveProducts = () => PRODUCTS.filter((p) => p.enabled);

// Helper to find a product by ID
export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);

// Helper to find a product by URL slug (for /shop/:slug pages)
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);

// Build a "spec line" for SEO/display: "Ableton Live 11 · Afro House · 122 BPM · Fm"
// Gracefully omits BPM/key if not yet filled in
export const getProductSpecs = (product) => {
  const parts = [product.daw, product.genre];
  if (product.bpm) parts.push(`${product.bpm} BPM`);
  if (product.musicalKey) parts.push(product.musicalKey);
  return parts.join(" · ");
};

// Sort order for the shop grid (best sellers first)
export const SHOP_DISPLAY_ORDER = [
  "afro-house-masterclass",
  "el-barrio",
  "mega-bundle",
  "balkan-boy",
  "maria-maria",
  "solomun-arabian",
];

// Get products in display order
export const getOrderedProducts = () => {
  const active = getActiveProducts();
  return SHOP_DISPLAY_ORDER.map((id) => active.find((p) => p.id === id)).filter(Boolean);
};
