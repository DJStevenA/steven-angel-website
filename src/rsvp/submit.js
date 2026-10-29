/**
 * Where the RSVP goes.
 *
 * SAMPLE MODE (this build): RSVP_LIVE = false. The form validates and shows the
 * thank-you screen, but NOTHING is sent anywhere and NO Meta Pixel "Lead" event
 * fires, so the real ads' pixel data stays clean.
 *
 * To go live, flip RSVP_LIVE to true and fill in RSVP_ENDPOINT. This is the only
 * place that sends the RSVP and the only place that fires the pixel.
 *
 * Live version, from the brief:
 *  - Do NOT post to /api/site-leads as it is: every post there lands on Steven's
 *    HOT list and pings the bot to open a chat, and Steven asked for no ping per
 *    RSVP. The endpoint and fields are to be agreed with `whatsbot` / the CRM
 *    agent (a separate list per show, like the Meta lead form flow).
 *  - Source: ev.source ("Site RSVP · The Angels · AIRE · 2026-11-11" etc).
 *  - Consent: store whether the box was ticked (true / false). Untickers are
 *    still on the list.
 *  - After a successful save, send the Meta Pixel Lead event (fbq is already
 *    initialised in index.html).
 */
export const RSVP_LIVE = true;

/* LIVE since 29.10 (Steven: "תדחוף את מה שיש"). Guests are saved by
   ghost-backend (angels-rsvp.js): one list per show, consent stored with its
   sentence, a confirmation e-mail from "The Angels", no ping per RSVP, not
   /api/site-leads. The CRM sync reads that list. */
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";

export async function submitRsvp(ev, values) {
  if (!RSVP_LIVE) return { ok: true, sample: true };

  const res = await fetch(`${BACKEND}/angels/rsvp/${ev.slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first: values.firstName,
      last: values.lastName,
      email: values.email,
      phone: values.phone, // E.164, e.g. +13055551234
      consent: values.consent, // boolean
    }),
  });
  if (res.status === 410) throw new Error("Guest list closed");
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "Something went wrong. Please try again.");
  }

  // Pixel: only after a saved RSVP, only on the real site (a draft or preview
  // sign-up must not count as an ad lead), and only if the pixel loaded.
  if (typeof window !== "undefined" && /(^|\.)steven-angel\.com$/.test(window.location.hostname)
      && typeof window.fbq === "function") {
    window.fbq("track", "Lead");
  }
  return { ok: true };
}
