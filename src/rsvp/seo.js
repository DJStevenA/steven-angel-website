/**
 * Per-page <head> for the RSVP pages. Pure JS: used at build time by
 * vite.config.js (static <head> per route, which is what crawlers and the
 * Facebook/Instagram link scrapers read) and at run time by head.js, so both
 * produce the same tags.
 *
 * Title = the brief's title. Description = the brief's one-line summary.
 * og:image = the wide 2160x1080 eventbrite banner. noindex on both.
 */
import { SITE, eventUrl } from "./events.js";

export const absUrl = (p) => (/^https?:\/\//.test(p) ? p : `${SITE}${p.startsWith("/") ? "" : "/"}${p}`);

export const OG_IMAGE_SIZE = { width: 2160, height: 1080, type: "image/jpeg" };

export function rsvpHead(ev) {
  return {
    title: ev.title,
    description: ev.summary,
    canonical: eventUrl(ev),
    image: absUrl(ev.banner),
    imageAlt: ev.title,
    robots: "noindex",
  };
}

// Inter stands in for Posh's Haas Grotesk. Loaded only on these two pages:
// the static head (vite.config.js) carries it for a cold load, head.js adds it
// if the page is reached by in-app navigation.
export const INTER_CSS =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
