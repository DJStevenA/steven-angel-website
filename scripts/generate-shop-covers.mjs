// Generate shop product covers via Gemini 2.5 Flash Image ("Nano Banana").
// Matches the existing 6 shop covers' format (landscape ~16:9, ~1324×722 for web).
// Generates at native resolution from Nano Banana, then sharp resizes to 1324×740 WebP.
//
// Writes:
//   public/shop/<slug>-cover.png      (full-res master — DO NOT delete per feedback rule)
//   public/shop/<slug>-cover.webp     (1324×740 web)
//   Apps/Ghost_Content/website-assets-2026-04-25/shop-covers/<slug>-cover.webp + .png (Social mirror)
//
// Run: node scripts/generate-shop-covers.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "shop");
const SOCIAL_MIRROR = "/Volumes/Untitled/Dropbox/Apps/Ghost_Content/website-assets-2026-04-25/shop-covers";

const envFile = path.join(ROOT, ".env.local");
const envText = fs.readFileSync(envFile, "utf8");
const envMatch = envText.match(/GEMINI_API_KEY=(.+)/);
if (!envMatch) throw new Error("GEMINI_API_KEY not found in .env.local");
const API_KEY = envMatch[1].trim();

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Same VHS-box visual language as the existing 6 shop covers.
// CRITICAL: landscape composition — box on the LEFT/CENTER, atmospheric supporting
// elements + soft cyan reflection on the surface RIGHT of the box.
const buildPrompt = ({ title, subtitle, genreTag, hero }) => `Photorealistic 3D landscape product shot, wide cinematic landscape composition (16:9 aspect ratio), of a glossy black VHS/DVD case standing upright on a dark reflective surface, viewed from a slight 3/4 angle so we see both the FRONT cover and the LEFT spine. The box is positioned at the CENTER of the frame with empty atmospheric dark space to the left and right of it. NOT an illustration, NOT a square composition — a wide landscape product photo with the box vertical in the middle.

Cinematic studio lighting, pure near-black background (#080810), soft cyan reflection beneath the box. This must look like a real physical product photo on a reflective stage.

Box has vivid cyan neon glow (#00E5FF) rimming every edge of the case as if illuminated from inside. Sharp 3D plastic specular highlights.

LEFT SPINE (visible on left side of the box):
- Vertical white sans-serif text reading exactly "STEVEN ANGEL" rotated 90° (reading bottom-to-top)
- Tiny white "DVD CASE" tag near the bottom
- Tiny music-note icon at the very bottom

FRONT COVER (the visible face of the box):
- TOP: small rounded white/light-gray pill containing "${genreTag.toUpperCase()}" in black small-caps
- MIDDLE: ${hero}
- BOTTOM-CENTER (large): Bold uppercase white condensed sans-serif title "${title.toUpperCase()}"
- Just below title (smaller, light gray): "${subtitle}"
- Very bottom: cyan glowing handwritten cursive signature reading exactly "Steven Angel"

WIDE LANDSCAPE composition with cinematic depth. The box occupies the CENTER 50-60% of the frame horizontally. Atmospheric dark space + subtle cyan particles + lens flare on the LEFT and RIGHT of the box. Soft pool of cyan light reflecting off the surface below. Ultra high detail, photographic realism. The full image should be a wide 16:9 landscape ratio — wider than it is tall.`;

const products = [
  {
    slug: "indie-dance-nu-disco",
    title: "Indie Dance",
    subtitle: "Nu Disco · Ableton Live Template",
    genreTag: "Indie Dance · Nu Disco",
    hero: "A stylized neon mirror ball glowing with cyan and warm purple light at the center, casting sharp light rays outward, surrounded by abstract neon palm tree silhouettes and a retrowave grid horizon stretching toward a setting sun, geometric disco-era patterns interlaced with modern dance club energy",
  },
  {
    slug: "moog-loops-samples",
    title: "Moog Loops & Samples",
    subtitle: "30 Loops · 10 One-Shots · Sample Pack",
    genreTag: "Sample Pack · Analog Bass",
    hero: "A photorealistic vintage Moog modular synthesizer at the center with wooden side panels, rows of silver knobs glowing under cyan light, multicolored patch cables looping between modules, glowing VU meters, warm analog electricity emanating outward as cyan particles, thick fat bass waveform shapes pulsing horizontally in the background",
  },
  {
    slug: "darbuka-loops",
    title: "Darbuka Loops",
    subtitle: "102 Files · 51 Loops · Sample Pack",
    genreTag: "Afro Latin · Ethnic House",
    hero: "A photorealistic ornate brass darbuka drum at the center, intricate Middle Eastern engravings catching cyan and warm gold light, two hands hovering above it captured mid-percussion strike with cyan energy bursting from the drum head, swirling desert sand particles around it, distant moonlit dune horizon",
  },
  {
    slug: "dirty-tech-house",
    title: "Dirty Tech House",
    subtitle: "Ableton Live Template",
    genreTag: "Tech House",
    hero: "A gritty industrial warehouse club scene at the center with distorted concrete walls, a massive stack of subwoofer speakers blasting cyan bass waves outward, raw exposed pipework above, dense atmospheric smoke shot through with cyan and purple strobe lights, a single glowing 808 drum machine in the foreground with knobs catching the cyan light",
  },
];

async function generateOne(product) {
  console.log(`\n[${product.slug}] Generating landscape cover…`);

  const body = {
    contents: [{ parts: [{ text: buildPrompt(product) }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9" },
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${product.slug}] API ${res.status}: ${err}`);
  }

  const json = await res.json();
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`[${product.slug}] No image in response: ${JSON.stringify(json).slice(0, 300)}`);

  const rawBuf = Buffer.from(part.inlineData.data, "base64");

  // Detect actual returned size — for telemetry
  const meta = await sharp(rawBuf).metadata();
  console.log(`[${product.slug}] Nano Banana returned ${meta.width}×${meta.height}`);

  // Save full-res PNG master
  const pngPath = path.join(OUT_DIR, `${product.slug}-cover.png`);
  fs.writeFileSync(pngPath, rawBuf);

  // Resize to 1324×740 WebP for the web — matches existing shop covers
  // (existing are 1324×722-738, we standardize at 1324×740 since Nano Banana
  // sometimes returns slightly non-16:9 results)
  const webpPath = path.join(OUT_DIR, `${product.slug}-cover.webp`);
  await sharp(rawBuf)
    .resize({ width: 1324, height: 740, fit: "cover", position: "center" })
    .webp({ quality: 82 })
    .toFile(webpPath);

  // Mirror to Social
  fs.mkdirSync(SOCIAL_MIRROR, { recursive: true });
  fs.copyFileSync(pngPath, path.join(SOCIAL_MIRROR, `${product.slug}-cover.png`));
  fs.copyFileSync(webpPath, path.join(SOCIAL_MIRROR, `${product.slug}-cover.webp`));

  const pngSize = (fs.statSync(pngPath).size / 1024).toFixed(0);
  const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(0);
  console.log(`[${product.slug}] ✓ PNG ${pngSize}KB (${meta.width}×${meta.height}) · WebP ${webpSize}KB (1324×740) · Mirrored to Social`);
}

console.log(`Generating ${products.length} shop covers (landscape 16:9, ~1324×740) via Nano Banana…`);
const results = await Promise.allSettled(products.map(generateOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  console.error(`\n⚠ ${failed.length} failed:`);
  failed.forEach((r) => console.error(`  - ${r.reason.message}`));
  process.exit(1);
}
console.log(`\n✅ All ${products.length} covers generated at proper aspect.`);
