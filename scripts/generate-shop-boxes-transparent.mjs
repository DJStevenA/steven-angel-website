// Generate standalone 3D box PNGs with TRANSPARENT BACKGROUND for Social agent
// (reels / TikTok / IG carousels — they overlay the box on video backgrounds).
//
// Output: public/shop/boxes/<slug>-box.png (transparent BG)
// Also mirrors to: Apps/Ghost_Content/website-assets-2026-04-25/box-3d-renders/
//
// Approach: Nano Banana (gemini-2.5-flash-image) with explicit transparent-BG
// prompt. Same VHS box style as the flat covers but no background, no surface,
// no reflection — just the box + its own drop shadow on transparency.
//
// Run: node scripts/generate-shop-boxes-transparent.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "shop", "boxes");
const SOCIAL_MIRROR = "/Volumes/Untitled/Dropbox/Apps/Ghost_Content/website-assets-2026-04-25/box-3d-renders";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(SOCIAL_MIRROR, { recursive: true });

const envFile = path.join(ROOT, ".env.local");
const envText = fs.readFileSync(envFile, "utf8");
const envMatch = envText.match(/GEMINI_API_KEY=(.+)/);
if (!envMatch) throw new Error("GEMINI_API_KEY not found in .env.local");
const API_KEY = envMatch[1].trim();

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const buildPrompt = ({ title, subtitle, genreTag, hero }) => `Photorealistic 3D render of a glossy black VHS/DVD case standing upright, viewed from a slight 3/4 angle so we see both the FRONT cover and the LEFT spine. NOT an illustration — this must look like a real physical product photo.

CRITICAL: Pure WHITE background (#FFFFFF). No surface, no reflection, no shadow on a surface — just the box floating on a clean white backdrop. The box must NOT touch the bottom of the frame. Lots of empty white space around all four edges of the box (padding).

Box has vivid cyan neon glow (#00E5FF) rimming every edge of the case as if illuminated from inside. Sharp 3D form with realistic plastic specular highlights.

LEFT SPINE (visible on left side of the box):
- Vertical white sans-serif text reading exactly "STEVEN ANGEL" rotated 90° (reading bottom-to-top)
- Tiny white "DVD CASE" tag near the bottom
- Tiny music-note icon at the very bottom

FRONT COVER (the visible face of the box):
- TOP: small rounded white/light-gray pill containing "${genreTag.toUpperCase()}" in black small-caps
- MIDDLE (central 50% of the box): ${hero}
- BOTTOM-CENTER (large): Bold uppercase white condensed sans-serif title "${title.toUpperCase()}"
- Just below title (smaller, light gray): "${subtitle}"
- Very bottom: cyan glowing handwritten cursive signature reading exactly "Steven Angel"

The composition must be: BOX centered, white background everywhere else. The image will be processed to make the white pixels transparent — so the cleaner the white, the better.

Ultra high detail, photographic realism, clean studio product shot, sharp focus on the box.`;

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
  console.log(`\n[${product.slug}] Generating box on white BG…`);

  const body = {
    contents: [{ parts: [{ text: buildPrompt(product) }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`[${product.slug}] API ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`[${product.slug}] No image in response`);

  const buf = Buffer.from(part.inlineData.data, "base64");

  // Process: convert white background → transparent
  // 1. Decode image to raw RGBA
  // 2. For each pixel: if it's near-white (R+G+B > 720), set alpha=0
  //    Use a soft threshold so the cyan glow doesn't get clipped
  const img = sharp(buf).ensureAlpha();
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Soft white-to-transparent — gradient based on brightness above threshold
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const brightness = (r + g + b) / 3;
    // Anything brighter than 240 (out of 255) → transparent
    // Soft transition from 220-240 for smooth edges
    let newAlpha = a;
    if (brightness > 240) {
      newAlpha = 0;
    } else if (brightness > 220) {
      newAlpha = Math.floor(((240 - brightness) / 20) * 255);
    }
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = newAlpha;
  }

  const transparentBuf = await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Write to public/shop/boxes/
  const outPath = path.join(OUT_DIR, `${product.slug}-box.png`);
  fs.writeFileSync(outPath, transparentBuf);

  // Mirror to Social agent
  const socialPath = path.join(SOCIAL_MIRROR, `${product.slug}-box.png`);
  fs.copyFileSync(outPath, socialPath);

  const size = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`[${product.slug}] ✓ ${size}KB → public/shop/boxes/${product.slug}-box.png + Social mirror`);
}

console.log(`Generating ${products.length} transparent-BG box PNGs via Nano Banana…`);
const results = await Promise.allSettled(products.map(generateOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  console.error(`\n⚠ ${failed.length} failed:`);
  failed.forEach((r) => console.error(`  - ${r.reason.message}`));
  process.exit(1);
}
console.log(`\n✅ All ${products.length} transparent box renders generated + mirrored to Social.`);
