// Generate ghost cover art via Gemini 2.5 Flash Image (aka "Nano Banana").
// Reads GEMINI_API_KEY from .env.local. Writes PNG + WebP into public/shop/.
//
// Run: node scripts/generate-ghost-covers.mjs

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

const MODEL = "gemini-2.5-flash-image"; // aka "Nano Banana" — same model used for the existing 15 ghost covers
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Same template as the 15 existing ghost covers — see briefs/_archive/2026-04-18/
// Style cues sharpened to match the existing illustrated/concept-art look
// (NOT photorealistic — the existing covers are digital paintings).
// Hero subject CENTER-LEFT (not dead center), and ALWAYS includes a musical element
// (instrument, speaker, vinyl, synth, etc.) — matching the existing 15 covers.
const buildPrompt = ({ track, genre, visual }) => `Stylized digital illustration cover art, concept-art painting style, NOT photorealistic, NOT a photo. Full-bleed image, no 3D box, no frame, no border.
Dark atmospheric painted scene with strong cyan (#00E5FF) glow as the dominant accent and purple (#BB86FC) as secondary. Near-black background (#080810). Hero subject positioned CENTER-LEFT of the frame (NOT dead center): ${visual}. Right side of frame has atmospheric supporting elements — swirling cyan and purple smoke/mist, glowing particles, secondary lighting effects. Vibrant glowing energy effects, dramatic rim lighting on the hero subject. Wide cinematic landscape format.

Text overlays baked into image — clean typographic layout:
- Top-left corner: small rounded pill containing "GHOST TRACK" in cyan uppercase letters with thin cyan border
- Bottom-center: very large bold uppercase title "${track.toUpperCase()}" in pure white, Barlow Condensed Black style, subtle cyan glow
- Bottom-left corner: small rounded pill containing "${genre.toUpperCase()}" in white, dark semi-transparent fill with thin cyan border
- (NO price pill — price added via HTML overlay on the live site)

Dark vignette on all edges. Ultra high detail. Wide cinematic landscape composition.`;

const tracks = [
  {
    slug: "down",
    track: "Down",
    genre: "Tech House",
    // Musical hero: classic TR-909-style analog drum machine with bass-wave ripples descending
    visual: "An iconic vintage analog drum machine (Roland TR-909 / TR-808 style) at center-left with glowing cyan pads and orange-cyan illuminated knobs, deep cyan sub-bass wave ripples emanating downward from the unit into a dark abyss below, swirling purple smoke on the right side, dark concrete club floor stretching into shadow, raw underground tech-house atmosphere",
  },
  {
    slug: "kora-prayer",
    track: "Kora Prayer",
    genre: "Afro House",
    // Musical hero: kora instrument glowing, hands raised in prayer on the right
    visual: "A West African kora instrument (gourd harp-lute) at center-left, glowing with cyan and purple sacred energy, ghostly silhouettes of hands raised in prayer on the right side of the frame, warm amber temple light bleeding through from behind, mystical desert atmosphere with floating cyan dust",
  },
  {
    slug: "midnight",
    track: "Midnight",
    genre: "Melodic Techno",
    // Musical hero: vintage analog synthesizer under the moon
    visual: "A vintage analog synthesizer with glowing keys and knobs at center-left, cyan light emanating from the keyboard, full moon hanging in the right side of the sky, dark city silhouette stretching across the horizon behind, purple mist curling between buildings, nocturnal melodic atmosphere",
  },
  {
    slug: "up",
    track: "UP",
    genre: "Tech House",
    // Musical hero: massive stack of speakers shooting cyan beams upward
    visual: "A massive stack of vintage concert speakers at center-left, intense cyan light beams shooting straight upward from the speakers into a purple sky, skyscraper silhouettes rising on the right side, electric energy pulsing through the air, ascending festival atmosphere",
  },
];

async function generateOne(t) {
  const prompt = buildPrompt(t);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9" }, // closest API-supported ratio to the 11:6 spec
    },
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 400)}`);
  }

  const data = await res.json();
  // Find inline image data in response
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) {
    throw new Error("No image in response: " + JSON.stringify(data).slice(0, 400));
  }

  const buf = Buffer.from(imgPart.inlineData.data, "base64");
  const pngPath = path.join(OUT_DIR, `ghost-${t.slug}-cover.png`);
  fs.writeFileSync(pngPath, buf);

  // Convert to WebP (~98% smaller, matches existing ghost covers)
  const webpPath = path.join(OUT_DIR, `ghost-${t.slug}-cover.webp`);
  await sharp(pngPath).webp({ quality: 82 }).toFile(webpPath);

  const pngKB = (fs.statSync(pngPath).size / 1024).toFixed(0);
  const webpKB = (fs.statSync(webpPath).size / 1024).toFixed(0);
  return { slug: t.slug, png: pngPath, webp: webpPath, pngKB, webpKB };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Optional slug filter from CLI: `node script.mjs down kora-prayer`
  const onlySlugs = process.argv.slice(2);
  const queue = onlySlugs.length ? tracks.filter((t) => onlySlugs.includes(t.slug)) : tracks;
  console.log(`Generating ${queue.length} ghost cover(s) via Nano Banana (${MODEL})...`);
  for (const t of queue) {
    process.stdout.write(`  • ${t.slug.padEnd(14)} `);
    try {
      const r = await generateOne(t);
      console.log(`✓ ${r.pngKB} KB → ${r.webpKB} KB WebP`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
  }
  console.log(`\nFiles in: ${OUT_DIR}`);
})();
