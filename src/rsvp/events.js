/**
 * The two guest-list (RSVP) pages for The Angels' US shows.
 * Routes: /the-angels/aire-miami and /the-angels/spazio (noindex, not linked
 * from the nav, footer or sitemap). Brief: briefs/2026-10-29/from_marketing_angels_rsvp_pages.md
 *
 * Words on the page come from copy.js (verbatim from the brief). Only facts
 * live here: slug, venue, map address, assets, closing time, CRM source label.
 *
 * Pure JS (no JSX): also imported by vite.config.js and scripts/prerender.mjs.
 */
import { COPY } from "./copy.js";

export const SITE = "https://steven-angel.com";
export const ASSET_DIR = "/the-angels/rsvp";

const make = (key, extra) => {
  const c = COPY[key];
  return {
    key,
    ...extra,
    title: c.title,
    metaTitle: c.metaTitle || c.title,
    summary: c.paras[0],
    about: c.paras.slice(1),
    thanks: c.thanks,
    // The brief's own date line, e.g. "WEDNESDAY NOV 11TH · 9PM–4AM"
    dateLine: c.dateLine || c.paras.find((p) => /^[A-Z]+DAY /.test(p)).split("\n")[0],
  };
};

export const EVENTS = [
  make("aire", {
    slug: "aire-miami",
    venue: "AIRE Miami",
    address: "111 NE 20th St, Miami, FL 33137",
    mapQuery: "AIRE Miami, 111 NE 20th St, Miami, FL 33137",
    flyer: `${ASSET_DIR}/AIRE_feed.jpg`, // 1080x1350 (4:5)
    banner: `${ASSET_DIR}/AIRE_Miami_eventbrite.jpg`, // 2160x1080 (page background + og:image)
    // Registration closes Thu Nov 12 2026, 04:00 Florida time. Nov 12 is after
    // DST ends (Nov 1), so America/New_York is EST = UTC-5.
    closesAt: "2026-11-12T04:00:00-05:00",
    // For the live version (CRM source label from the brief)
    source: "Site RSVP · The Angels · AIRE · 2026-11-11",
  }),
  make("spazio", {
    slug: "spazio",
    venue: "Spazio",
    address: "207 Clematis St, West Palm Beach, FL 33401",
    mapQuery: "Spazio, 207 Clematis St, West Palm Beach, FL 33401",
    flyer: `${ASSET_DIR}/Spazio_feed.jpg`,
    banner: `${ASSET_DIR}/Spazio_WestPalm_eventbrite.jpg`,
    closesAt: "2026-11-15T04:00:00-05:00", // Sun Nov 15 2026, 04:00 EST
    source: "Site RSVP · The Angels · Spazio · 2026-11-14",
  }),
];

export const eventBySlug = (slug) => EVENTS.find((e) => e.slug === slug) || null;
export const eventPath = (ev) => `/the-angels/${ev.slug}`;
export const eventUrl = (ev) => `${SITE}${eventPath(ev)}`;
export const closesAtMs = (ev) => new Date(ev.closesAt).getTime();
export const isClosed = (ev, now = Date.now()) => now >= closesAtMs(ev);
