// Generate shop product covers via Gemini 2.5 Flash Image ("Nano Banana").
// Same VHS-box visual language as the existing 6 shop covers (balkan-boy, el-barrio, etc.).
// Reads GEMINI_API_KEY from .env.local. Writes PNG + WebP into public/shop/.
//
// Run: node scripts/generate-shop-covers.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "shop");

// Load .env.local
const envFile = path.join(ROOT, ".env.local");
const envText = fs.readFileSync(envFile, "utf8");
const envMatch = envText.match(/GEMINI_API_KEY=(.+)/);
if (!envMatch) throw new Error("GEMINI_API_KEY not found in .env.local");
const API_KEY = envMatch[1].trim();

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Shop cover style template — matches existing 6 covers exactly.
// Photoreal 3D box render, NOT illustration. Cyan rim glow. Spine on left.
// Title + spec line baked into front face.
const buildPrompt = ({ title, subtitle, genreTag, hero }) => `Photorealistic 3D render of a glossy black VHS/DVD case standing upright on a dark reflective surface, viewed from a slight 3/4 angle so we see both the FRONT cover and the LEFT spine. Cinematic studio lighting, pure black background (#000000), soft cyan reflection beneath the box. NOT an illustration, NOT a flat graphic — this must look like a real physical product photo of a glossy plastic case.

Box has a vivid cyan neon glow (#00E5FF) rimming every edge of the case as if illuminated from inside. The box has crisp, sharp 3D form with realistic plastic specular highlights and depth.

LEFT SPINE (visible on left side of the box):
- Vertical white sans-serif text reading "STEVEN ANGEL" rotated 90° (reading bottom-to-top)
- Small "DVD CASE" tag near the bottom in tiny white letters
- A small white music-note icon near the very bottom of the spine

FRONT COVER (the visible face of the box):
- TOP-CENTER: A small rounded white/light-gray pill containing the text "${genreTag.toUpperCase()}" in black small-caps letters
- MIDDLE (taking up the central 50% of the box): ${hero}
- BOTTOM-CENTER (large): Bold uppercase title in pure white, condensed sans-serif (Barlow Condensed Black style): "${title.toUpperCase()}"
- Just below title (smaller): "${subtitle}" in light gray
- Very bottom: A cyan glowing handwritten cursive signature reading "Steven Angel"

Surround the box with darkness — pure black background, no other objects, just the floating box with its cyan rim glow and a subtle pool of cyan light reflecting off the surface below. Wide cinematic landscape aspect ratio, the box centered slightly left-of-center, plenty of empty black space around it. Ultra high detail, photographic realism.`;

const products = [
  {
    slug: "indie-dance-nu-disco",
    title: "Indie Dance",
    subtitle: "Nu Disco · Ableton Live Template",
    genreTag: "Indie Dance · Nu Disco",
    // Hero: 70s/80s nu disco aesthetic — mirror ball + neon palm + retrowave grid
    hero: "A stylized neon mirror ball glowing with cyan and warm purple light at the center, casting sharp light rays outward, surrounded by abstract neon palm tree silhouettes and a retrowave grid horizon stretching toward a setting sun in the background, geometric disco-era patterns interlaced with modern dance club energy, Hotsince 82 / Purple Disco Machine / Solomun / Adam Ten / Darco aesthetic — moody, melodic, hypnotic",
  },
  {
    slug: "moog-loops-samples",
    title: "Moog Loops & Samples",
    subtitle: "30 Loops · 10 One-Shots · Sample Pack",
    genreTag: "Sample Pack · Analog Bass",
    // Hero: vintage Moog modular synth with patch cables
    hero: "A photorealistic vintage Moog modular synthesizer at the center — wooden side panels, rows of silver knobs glowing under cyan light, multicolored patch cables looping between modules, glowing VU meters, dark studio backdrop, warm analog electricity emanating outward as cyan particles, thick fat bass waveform shapes pulsing horizontally in the background",
  },
  {
    slug: "darbuka-loops",
    title: "Darbuka Loops",
    subtitle: "102 Files · 51 Loops · Sample Pack",
    genreTag: "Afro Latin · Ethnic House",
    // Hero: darbuka with desert atmosphere
    hero: "A photorealistic ornate brass darbuka drum at the center, intricate Middle Eastern engravings catching cyan and warm gold light, two hands hovering above it captured mid-percussion strike with cyan energy bursting from the drum head, swirling desert sand particles and atmospheric mist around it, hint of a distant moonlit dune horizon, fusion of ancient ritual percussion and modern club energy",
  },
  {
    slug: "dirty-tech-house",
    title: "Dirty Tech House",
    subtitle: "Ableton Live Template",
    genreTag: "Tech House",
    // Hero: industrial warehouse tech house — Michael Bibi / Solid Grooves vibe
    hero: "A gritty industrial warehouse club scene at the center — distorted concrete walls, a massive stack of subwoofer speakers blasting cyan bass waves outward, raw exposed pipework above, dense atmospheric smoke shot through with cyan and purple strobe lights, a single glowing 808 drum machine in the foreground with knobs catching the cyan light, Michael Bibi / Clonnee / Solid Grooves underground tech house aesthetic — raw, dirty, hypnotic, percussion-driven",
  },
];

async function generateOne(product) {
  const prompt = buildPrompt(product);
  console.log(`\n[${product.slug}] Generating…`);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[${product.slug}] API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`[${product.slug}] No image in response: ${JSON.stringify(json).slice(0, 200)}`);

  const buf = Buffer.from(part.inlineData.data, "base64");
  const pngPath = path.join(OUT_DIR, `${product.slug}-cover.png`);
  const webpPath = path.join(OUT_DIR, `${product.slug}-cover.webp`);

  fs.writeFileSync(pngPath, buf);
  await sharp(buf).webp({ quality: 82 }).toFile(webpPath);

  const pngSize = (fs.statSync(pngPath).size / 1024).toFixed(0);
  const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(0);
  console.log(`[${product.slug}] ✓ PNG ${pngSize}KB · WebP ${webpSize}KB`);
}

console.log(`Generating ${products.length} shop covers in parallel via Nano Banana…`);
const results = await Promise.allSettled(products.map(generateOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  console.error(`\n⚠ ${failed.length} failed:`);
  failed.forEach((r) => console.error(`  - ${r.reason.message}`));
  process.exit(1);
}
console.log(`\n✅ All ${products.length} covers generated.`);
