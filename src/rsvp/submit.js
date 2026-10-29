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
export const RSVP_LIVE = false;

// TODO(live): agreed with whatsbot / the CRM agent. Not decided yet.
const RSVP_ENDPOINT = null;

export async function submitRsvp(ev, values) {
  if (!RSVP_LIVE) return { ok: true, sample: true };

  if (!RSVP_ENDPOINT) throw new Error("RSVP_LIVE is true but RSVP_ENDPOINT is not set");
  const res = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: ev.key,
      source: ev.source,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone, // E.164, e.g. +13055551234
      consent: values.consent, // boolean
    }),
  });
  if (!res.ok) throw new Error(`RSVP failed: ${res.status}`);

  // Pixel: only after a saved RSVP, and only if the pixel loaded.
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead");
  }
  return { ok: true };
}
