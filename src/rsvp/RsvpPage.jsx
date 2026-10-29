/**
 * Guest-list page for one show. A close copy of a Posh event page: blurred
 * banner behind everything, 976px two-column layout on desktop (copy left,
 * sticky 4:5 flyer right), flyer-first single column on mobile, sticky
 * "Join the guest list" pill that opens the form.
 *
 * Words come from copy.js (the approved brief text). Data: events.js.
 * Where the RSVP goes (and the Meta Pixel Lead): submit.js (RSVP_LIVE = false).
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { eventBySlug, isClosed } from "./events.js";
import { rsvpHead } from "./seo.js";
import { applyHead } from "./head.js";
import { ShareIcon, CheckIcon } from "./icons.jsx";
import RsvpModal from "./RsvpModal.jsx";
import { Copy, Title } from "./Text.jsx";
import "./rsvp.css";

const AVATAR = "/images/angels/avatar.jpg"; // The Angels avatar from the /angels page

const mapEmbed = (q) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
const mapLink = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/** true once the show's list has closed; flips on its own while the page is open. */
function useClosed(ev) {
  const [closed, setClosed] = useState(() => isClosed(ev));
  useEffect(() => {
    const check = () => setClosed(isClosed(ev));
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [ev]);
  return closed;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function RsvpEvent({ ev }) {
  const closed = useClosed(ev);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mainRef = useRef(null);
  const pillRef = useRef(null);
  const wasOpen = useRef(false);
  const copyTimer = useRef(null);

  useEffect(() => applyHead(rsvpHead(ev)), [ev]);

  // html.rsvp-page: dark page background for the overscroll area (index.html
  // paints html/body black) and the accessibility-button nudge, both in rsvp.css.
  // A class, not inline styles: the prerender would bake inline styles into the
  // static HTML, where they would then outlive this page.
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("rsvp-page");
    return () => html.classList.remove("rsvp-page");
  }, []);

  // The form can't open once the list has closed.
  useEffect(() => {
    if (closed && open) setOpen(false);
  }, [closed, open]);

  // Everything behind the modal is inert while it is open. When it closes the
  // page is live again first, then focus goes back to the pill that opened it.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return undefined;
    el.inert = open;
    if (!open && wasOpen.current) pillRef.current?.focus();
    wasOpen.current = open;
    return () => { el.inert = false; };
  }, [open]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const close = useCallback(() => setOpen(false), []);

  async function share() {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: ev.title, url });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    if (await copyText(url)) {
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="rsvp" data-event={ev.key}>
      <div className="rsvp-bg" aria-hidden="true">
        <img src={ev.banner} alt="" width="2160" height="1080" fetchpriority="low" />
      </div>
      <div className="rsvp-blur" aria-hidden="true" />

      <main className="rsvp-main" ref={mainRef}>
        <div className="rsvp-grid">
          <div className="rsvp-flyer-col">
            <img
              className="rsvp-flyer"
              src={ev.flyer}
              width="1080"
              height="1350"
              alt={ev.title}
              fetchpriority="high"
            />
          </div>

          <div className="rsvp-info">
            <div className="rsvp-divider rsvp-divider-top" aria-hidden="true" />

            <div className="rsvp-host">
              <div className="rsvp-host-id">
                <img className="rsvp-avatar" src={AVATAR} alt="" width="20" height="20" />
                <span>The Angels</span>
              </div>
              <button type="button" className="rsvp-icon-btn" aria-label="Share" onClick={share}>
                {copied ? <CheckIcon /> : <ShareIcon />}
              </button>
            </div>

            <h1 className="rsvp-title"><Title text={ev.title} /></h1>

            <div className="rsvp-when">
              <p className="rsvp-venue">{ev.venue}</p>
              <p className="rsvp-date"><Copy text={ev.dateLine} /></p>
              {closed && <p className="rsvp-status">Guest list closed</p>}
            </div>

            <div className="rsvp-divider" aria-hidden="true" />
            <p className="rsvp-summary"><Copy text={ev.summary} /></p>
            <div className="rsvp-divider" aria-hidden="true" />

            <h2 className="rsvp-h2">About this event</h2>
            <div className="rsvp-about">
              {ev.about.map((para, i) => (
                <p key={i}><Copy text={para} /></p>
              ))}
            </div>

            <h2 className="rsvp-h2 rsvp-h2-section">Location</h2>
            <p className="rsvp-venue">{ev.venue}</p>
            <p className="rsvp-address">{ev.address}</p>
            <div className="rsvp-map">
              <iframe
                title={`Map of ${ev.venue}`}
                src={mapEmbed(ev.mapQuery)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a className="rsvp-maplink" href={mapLink(ev.mapQuery)} target="_blank" rel="noopener noreferrer">
              Open in Maps
            </a>

            <h2 className="rsvp-h2 rsvp-h2-section">Hosted by</h2>
            <Link className="rsvp-hosted" to="/the-angels">
              <img className="rsvp-avatar rsvp-avatar-lg" src={AVATAR} alt="" width="48" height="48" />
              <span>The Angels</span>
            </Link>
          </div>
        </div>

        <div className="rsvp-cta">
          {closed ? (
            <button type="button" className="rsvp-pill" disabled>
              Guest list closed
            </button>
          ) : (
            <button type="button" className="rsvp-pill" ref={pillRef} onClick={() => setOpen(true)}>
              Join the guest list
            </button>
          )}
        </div>
      </main>

      {open && !closed && <RsvpModal ev={ev} onClose={close} />}
    </div>
  );
}

export default function RsvpPage() {
  const { slug } = useParams();
  const ev = eventBySlug(slug);
  // Unknown /the-angels/<x>: same as the site's catch-all.
  if (!ev) return <Navigate to="/" replace />;
  return <RsvpEvent key={ev.slug} ev={ev} />;
}
