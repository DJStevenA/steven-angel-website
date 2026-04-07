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
 *
 * Prices are in USD.
 */

export const PRODUCTS = [
  // ─────────────────────────────────────────────────────────
  {
    id: "afro-house-masterclass",
    enabled: true,
    type: "course", // "course" or "template" — affects checkout flow & post-purchase access
    name: "Jungle Walk Masterclass",
    headline: "Learn How I Made a Beatport Top 10 Track",
    price: 29,
    currency: "USD",
    badge: "BEST SELLER",
    badgeColor: "purple", // "cyan" | "purple" | null
    genre: "Afro House",
    daw: "Ableton Live",
    description:
      'A 60-minute video masterclass walking through the full production process of "Jungle Walk" — released on Godeeva, reached Top 10 on Beatport, and supported by Francis Mercier, DJ Chus, and Joeski. 5 focused lessons covering kick & bass design, percussion programming, vocal processing, synths, and mixing & mastering. Includes the full Ableton Live project file and a 100+ sample pack. Perfect for producers serious about leveling up to the standard of MTGD, Moblack, and Godeeva.',
    shortDescription: '"Jungle Walk" project + 5 lessons + sample pack',
    keywords: [
      "afro house sample pack",
      "afro house drum kit",
      "afro house midi pack",
      "afro house serum presets",
      "afro house synth presets",
      "afro house loops",
      "afro house bass presets",
      "afro house drum loops",
      "afro house sound pack",
      "afro house sounds download",
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
    previewVideoUrl: null, // filled in Phase 6 (Cloudflare R2)
    dropboxPath: "/On Line Lessons/Afro House Master Class/Afro House MasterClass - DL PACK.zip",
    fileSize: "237 MB",
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "balkan-boy",
    enabled: true,
    type: "template",
    name: "Balkan Boy",
    headline: "The Balkan Afro House Sound Hugel & Claptone Play",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Afro Latin / Balkan House",
    daw: "Ableton Live 12",
    description:
      "Authentic Balkan-influenced Afro House template inspired by Hugel and Grossomodo. Built in Ableton Live 12 with Serum presets, full mixdown, and 269MB sample pack. Perfect for producers wanting to nail the Eastern European Afro House sound.",
    shortDescription: "Ableton 12 · Serum presets · 269 MB sample pack",
    keywords: [
      "afro house ableton template",
      "afro house project file ableton",
      "hugel ableton template",
      "moblack style ableton template",
      "afro latin sample pack",
      "balkan ableton template",
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
    dropboxPath:
      "/Ghost Tracks templates sample packs/2025/Ableton Template/Balkan Boy/Balkan Boy_Ableton Template By Steven Angel.zip",
    fileSize: "269 MB",
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "maria-maria",
    enabled: true,
    type: "template",
    name: "Maria Maria Remix",
    headline: "The Real Session Behind The Angels' Hit Remix",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Afro House",
    daw: "Ableton Live 11",
    description:
      "The Angels' official Maria Maria Afro House remix — now your full project file. Supported by DJ Chus and played across festivals in Latin America and Europe. Built in Ableton Live 11, this is the actual session used for the released remix: vocal chops, percussion layers, bass design, and full mixdown. Learn how a signed Afro House remix is built from the ground up.",
    shortDescription: "Ableton 11 · Official remix project · Full stems",
    keywords: [
      "afro house ableton template",
      "afro house project file ableton",
      "afro house stems",
      "santana maria maria remix",
      "the angels remix template",
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
    dropboxPath:
      "/Ghost Tracks templates sample packs/2024/Maria Maria/The Angels - Maria Maria (Afro House Remix) Project.zip",
    fileSize: "883 MB",
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "el-barrio",
    enabled: true,
    type: "template",
    name: "El Barrio",
    headline: "The MTGD Release Hugel & Claptone Played at Pacha Ibiza",
    price: 19.99,
    currency: "USD",
    badge: "PLAYED BY HUGEL & CLAPTONE",
    badgeColor: "cyan",
    genre: "Afro House",
    daw: "Ableton Live 11",
    description:
      'The actual Ableton project for "El Barrio" — released on MTGD (Hugel\'s label) and played live by Hugel and Claptone at Pacha Ibiza. Built in Ableton Live 11. This is the real session — drum programming, bassline, vocal chops, and the full mixdown that made it onto Beatport. If you want to know exactly how a track lands on a major Afro House label, this is the closest you can get without being in the studio with me.',
    shortDescription: "MTGD release · Ableton 11 · The real session",
    keywords: [
      "afro house ableton template",
      "afro house project file ableton",
      "hugel ableton template",
      "keinemusik ableton template",
      "afro house stems",
      "mtgd template",
    ],
    features: [
      "Real MTGD-released project",
      "Played by Hugel & Claptone live",
      "Full Ableton Live 11 session",
      "Drum programming & bassline",
      "Vocal chops & full mixdown",
    ],
    image: "/shop/el-barrio-thumb.webp",
    previewVideoUrl: null,
    dropboxPath:
      "/Ghost Tracks templates sample packs/2025/Ableton Template/El Barrio/The Angels - El Bario Ableton Template Project.zip",
    fileSize: "429 MB",
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "solomun-arabian",
    enabled: true,
    type: "template",
    name: "Solomun / Artbat Arabian Techno",
    headline: "Festival-Ready Melodic Techno in Solomun & Artbat Style",
    price: 19.99,
    currency: "USD",
    badge: null,
    badgeColor: null,
    genre: "Melodic Techno",
    daw: "Ableton Live",
    description:
      "Arabian-influenced melodic techno in the style of Solomun and Artbat. Fully mixed and mastered Ableton Live project with authentic Middle Eastern percussion, atmospheric synth work, and a driving techno groove. Perfect template for producers exploring the cross-cultural melodic techno sound that's dominating mainstage festivals. Includes all presets, samples, and mixdown chains.",
    shortDescription: "Melodic Techno · Middle Eastern percussion · Fully mastered",
    keywords: [
      "melodic techno ableton template",
      "indie dance ableton template",
      "tech house ableton template",
      "solomun style template",
      "artbat style template",
      "arabian techno template",
    ],
    features: [
      "Fully mixed & mastered",
      "Middle Eastern percussion",
      "Atmospheric synth work",
      "All presets included",
      "Royalty-free samples",
    ],
    image: "/shop/solomun-arabian-thumb.webp",
    previewVideoUrl: null,
    dropboxPath:
      "/Ghost Tracks templates sample packs/For IN SOUND/SOLOMUN/Solomun Melodic Techno Project.zip",
    fileSize: "737 MB",
  },

  // ─────────────────────────────────────────────────────────
  {
    id: "mega-bundle",
    enabled: true,
    type: "template",
    name: "Melodic Techno Mega Bundle",
    headline: "3 Pro Templates + Sample Pack — Save 50%",
    price: 39,
    currency: "USD",
    badge: "BEST VALUE",
    badgeColor: "purple",
    genre: "Melodic Techno / Afro House",
    daw: "Ableton Live",
    description:
      "Three premium templates + a curated sample pack — everything you need for melodic techno and crossover production. Includes an Artbat-style template, a Tale Of Us-inspired session, an Afro House crossover project, and a sample pack with kicks, percussion loops, vocal chops, and atmospheric textures. Built in Ableton Live with Serum and Diva presets included. Best value in the shop.",
    shortDescription: "3 templates + sample pack · 1.29 GB · Best value",
    keywords: [
      "melodic techno ableton template",
      "tech house ableton template",
      "afro house ableton template",
      "afro house sample pack",
      "afro house drum kit",
      "afro house midi pack",
      "techno bundle",
      "ableton template bundle",
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
    dropboxPath: "/Ghost Tracks templates sample packs/For IN SOUND/MELODIC TECHNO/Mega_Bundle_Pack.zip",
    fileSize: "1.29 GB",
    largeFileWarning: true, // Show "Large file — recommended on Wi-Fi" notice on this product
  },
];

// Helper to get only enabled products
export const getActiveProducts = () => PRODUCTS.filter((p) => p.enabled);

// Helper to find a product by ID
export const getProductById = (id) => PRODUCTS.find((p) => p.id === id);

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
