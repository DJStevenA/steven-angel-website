/**
 * The guest-list form, Posh-checkout style: a centered modal on desktop, a
 * bottom sheet on mobile (CSS decides). Dark, with a close button. Focus is
 * trapped inside while it is open and Esc closes it; focus goes back to the
 * button that opened it.
 *
 * Validation is the browser's own (required / type=email / pattern), so error
 * messages are the visitor's own browser language and the page adds no copy.
 * Invalid fields get a red outline after the first submit attempt.
 */
import React, { useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons.jsx";
import { COUNTRIES, DEFAULT_COUNTRY, dialFor, phonePattern, toE164 } from "./countries.js";
import { submitRsvp } from "./submit.js";
import { COPY } from "./copy.js";
import { Copy } from "./Text.jsx";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const NOT_BLANK = ".*\\S.*";

export default function RsvpModal({ ev, onClose }) {
  const dialogRef = useRef(null);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const dial = dialFor(country);

  // Focus trap, Esc, scroll lock. (The page gives focus back to the pill that
  // opened the form, see RsvpPage.jsx.)
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.focus();

    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [onClose]);

  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (k) => String(fd.get(k) || "").trim();

    // Backstop for the browser's own validation.
    const values = {
      firstName: get("firstName"),
      lastName: get("lastName"),
      email: get("email"),
      phone: toE164(dial, get("phone")),
      consent: fd.get("consent") === "on", // optional, unchecked by default
    };
    if (!form.checkValidity() || !values.firstName || !values.lastName) {
      setTried(true);
      form.reportValidity();
      return;
    }

    // Honeypot: a bot filled the hidden field. Look like a success, do nothing.
    if (get("website")) {
      setDone(true);
      return;
    }

    setSending(true);
    try {
      await submitRsvp(ev, values);
      setDone(true);
    } catch (err) {
      // Only reachable once RSVP_LIVE is true. TODO(live): decide the failure UI
      // with Steven (copy is his call). For now the button simply re-enables.
      console.error(err);
      setSending(false);
    }
  }

  return (
    <div
      className="rsvp-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rsvp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Join the guest list"
        tabIndex={-1}
        ref={dialogRef}
      >
        <button type="button" className="rsvp-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>

        {done ? (
          <p className="rsvp-thanks" role="status"><Copy text={ev.thanks} /></p>
        ) : (
          <form
            className={`rsvp-form${tried ? " is-tried" : ""}`}
            onSubmit={onSubmit}
            onInvalidCapture={() => setTried(true)}
          >
            <div className="rsvp-two">
              <label className="rsvp-field">
                <span>First name</span>
                <input name="firstName" type="text" autoComplete="given-name" required pattern={NOT_BLANK} maxLength={60} />
              </label>
              <label className="rsvp-field">
                <span>Last name</span>
                <input name="lastName" type="text" autoComplete="family-name" required pattern={NOT_BLANK} maxLength={60} />
              </label>
            </div>

            <label className="rsvp-field">
              <span>Email</span>
              <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={120} />
            </label>

            <div className="rsvp-field">
              <label htmlFor="rsvp-phone">Phone</label>
              <div className="rsvp-phone">
                <select
                  aria-label="Country code"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.iso}>{`${c.iso} ${c.dial}`}</option>
                  ))}
                </select>
                <input
                  id="rsvp-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  required
                  pattern={phonePattern(dial)}
                  maxLength={24}
                />
              </div>
            </div>

            <label className="rsvp-consent">
              <input name="consent" type="checkbox" />
              <span>{COPY.consent}</span>
            </label>

            {/* Honeypot. Clipped in place: never position it off-screen with a
                huge negative left, that caused sideways scrolling on mobile. */}
            <div className="rsvp-hp" aria-hidden="true">
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button type="submit" className="rsvp-pill" disabled={sending}>
              Join the guest list
            </button>

            {/* TODO: once the privacy policy has its section C (guest lists), link
                to /privacy#c. Today /privacy has A, B and Contact only. */}
            <a className="rsvp-privacy" href="/privacy" target="_blank" rel="noopener">
              steven-angel.com/privacy
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
