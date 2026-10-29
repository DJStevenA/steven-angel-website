/**
 * Run-time <head> management for the RSVP pages (browser only).
 *
 * The static HTML for each page already carries these tags (vite.config.js),
 * so a cold load is right for crawlers. This keeps the head right after in-app
 * navigation and puts everything back on unmount, so the next page's tags are
 * not polluted (PageTitle in main.jsx does not touch og:image or robots).
 */
import { INTER_CSS } from "./seo.js";

// Every restore below only happens if the tag still holds OUR value. When the
// visitor leaves for another page, that page's own head code (PageTitle in
// main.jsx) may already have written its title/meta before this page's cleanup
// runs (a lazy route suspends first), and we must not overwrite that.
function upsertMeta(attr, key, content, undo) {
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(sel);
  if (el) {
    const prev = el.getAttribute("content");
    el.setAttribute("content", content);
    undo.push(() => { if (el.getAttribute("content") === content) el.setAttribute("content", prev ?? ""); });
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", content);
    document.head.appendChild(el);
    undo.push(() => el.remove());
  }
}

function ensureLink(id, attrs, undo) {
  if (document.getElementById(id)) return;
  const el = document.createElement("link");
  el.id = id;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.head.appendChild(el);
  undo.push(() => el.remove());
}

export function applyHead(head) {
  const undo = [];

  const prevTitle = document.title;
  document.title = head.title;
  undo.push(() => { if (document.title === head.title) document.title = prevTitle; });

  upsertMeta("name", "description", head.description, undo);
  upsertMeta("property", "og:title", head.title, undo);
  upsertMeta("property", "og:description", head.description, undo);
  upsertMeta("property", "og:url", head.canonical, undo);
  upsertMeta("name", "twitter:title", head.title, undo);
  upsertMeta("name", "twitter:description", head.description, undo);
  if (head.image) {
    upsertMeta("property", "og:image", head.image, undo);
    upsertMeta("name", "twitter:image", head.image, undo);
    if (head.imageAlt) upsertMeta("property", "og:image:alt", head.imageAlt, undo);
  }
  if (head.robots) {
    // noindex belongs to these pages only: always drop it on unmount, even when
    // the static head of a cold load already had it.
    let el = document.head.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "robots");
      document.head.appendChild(el);
    }
    el.setAttribute("content", head.robots);
    undo.push(() => el.remove());
  }

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) {
    const prev = canonical.getAttribute("href");
    canonical.setAttribute("href", head.canonical);
    undo.push(() => { if (canonical.getAttribute("href") === head.canonical) canonical.setAttribute("href", prev ?? ""); });
  }

  // Inter, only while one of these pages is mounted (ids match the static head).
  ensureLink("rsvp-font-pc-1", { rel: "preconnect", href: "https://fonts.googleapis.com" }, undo);
  ensureLink("rsvp-font-pc-2", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }, undo);
  ensureLink("rsvp-font-css", { rel: "stylesheet", href: INTER_CSS }, undo);

  return () => undo.reverse().forEach((fn) => fn());
}
