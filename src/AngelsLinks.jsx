/**
 * /angels — "link in bio" page for The Angels (Steven's duo).
 *
 * A self-hosted replacement for linktr.ee/TheAngelsTLV: same content, same
 * layout, on our own domain — so the clicks land in our GA4 instead of
 * Linktree's, and the page can never be gated behind their paywall.
 *
 * This is a SEPARATE page from /links (Steven Angel's solo service links).
 * The two share nothing.
 *
 * Everything renders from PROFILE / SOCIALS / LINKS below — to change the
 * page, edit the data, not the markup. All destinations are off-site, so
 * every card and icon opens in a new tab.
 *
 * Thumbnails and the avatar were pulled off the Linktree CDN and re-hosted in
 * /public/images/angels/ (resized: 3.9 MB → 64 KB) so the page has no runtime
 * dependency on linktr.ee.
 */
import React from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "./lib/analytics/gtag";
import { usePageView, useTimeOnPage } from "./lib/analytics/hooks";

/* ─────────────────────────── CONTENT — edit here ─────────────────────────── */

const PROFILE = {
  name: "THE ANGELS",
  bio: "The Angels are a married duo of afro-house DJs hailing from Tel Aviv, Israel.",
  avatar: "/images/angels/avatar.jpg",
};

// Order matches the Linktree icon row.
const SOCIALS = [
  { label: "Spotify", icon: "spotify", url: "https://open.spotify.com/artist/2pVGLwnxVTzWK6fdTzwVSz" },
  { label: "Instagram", icon: "instagram", url: "https://instagram.com/theangels_tlv" },
  { label: "YouTube", icon: "youtube", url: "https://www.youtube.com/playlist?list=PLlaeNg6UzgMv8KM5e99XpOW2hvRC4pMcA" },
  { label: "SoundCloud", icon: "soundcloud", url: "https://soundcloud.com/theangelsoflove" },
  { label: "Apple Music", icon: "applemusic", url: "https://music.apple.com/us/artist/the-angels/1531531752" },
  { label: "WhatsApp", icon: "whatsapp", url: "https://api.whatsapp.com/send?phone=972523561353" },
  { label: "Facebook", icon: "facebook", url: "https://www.facebook.com/TheAngels.Oflove/" },
  { label: "TikTok", icon: "tiktok", url: "https://tiktok.com/@theangels_oflove" },
  { label: "Email", icon: "email", url: "mailto:theangelstlv@gmail.com" },
];

// { label, url, thumbnail? }
const LINKS = [
  {
    label: "Watch the angels live set - Canary Islands",
    url: "https://www.youtube.com/watch?v=sPArmZafsX8",
    thumbnail: "/images/angels/canary.jpg",
  },
  {
    label: "Afrohouse Masterclass",
    url: "https://www.drop-edm.co.il/product-page/the-complete-afro-house-production-masterclass",
  },
  // Booking points at our own EPK page (Steven, 2026-07-29) — replaced the
  // external Canva site. On-site, so it navigates in the same tab.
  { label: "Booking", url: "/the-angels" },
  {
    label: "The Angels - Bio / About Us",
    url: "https://www.dropbox.com/s/agp3tr1ckby6cnt/The%20Angels%20-%20Bio%20.pdf?dl=0",
  },
  {
    label: "The Angels - EPK / Press Kit",
    url: "https://www.dropbox.com/sh/53havk46chc2tap/AACgq8DJ3JmbEL2vdreaz-NQa?dl=0",
    thumbnail: "/images/angels/epk.jpg",
  },
  {
    label: "The Angels - Tracklist - Spotify",
    url: "https://open.spotify.com/playlist/3ktqJg7RoTeuLTtRRXsDfm",
    thumbnail: "/images/angels/tracklist.jpg",
  },
  {
    label: "Live Shows / Mixes",
    url: "https://www.youtube.com/playlist?list=PLlaeNg6UzgMt9iDUNCU8MgfDCpwGgLvgQ",
    thumbnail: "/images/angels/live-shows.jpg",
  },
  { label: "Interview for Electronic Groove", url: "https://electronicgroove.com/interview-the-angels/" },
  {
    label: "interview for HMWL",
    url: "https://www.housemusicwithlove.com/2022/israeli-dj-producer-couple-the-angels-give-tips-on-working-with-your-partner-and-finding-balance/",
    thumbnail: "/images/angels/hmwl.jpg",
  },
];

/* ──────────────────────── brand glyphs (monochrome) ──────────────────────── */

const ICONS = {
  spotify: (
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  ),
  instagram: (
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  ),
  youtube: (
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  ),
  soundcloud: (
    <>
      <path
        d="M1.3 13.6v2.8M3.6 11.9v4.5M5.9 10.4v6M8.2 11.7v4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M10.5 16.4V8.1c0-.3.2-.5.4-.6 3-1 6.2.7 7 3.8.5-.3 1.1-.4 1.7-.4 1.9 0 3.4 1.6 3.4 3.5s-1.5 3.5-3.4 3.5h-9.1z" />
    </>
  ),
  applemusic: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.2 1h11.6C21.1 1 23 2.9 23 6.2v11.6c0 3.3-1.9 5.2-5.2 5.2H6.2C2.9 23 1 21.1 1 17.8V6.2C1 2.9 2.9 1 6.2 1zm10.9 3.6a.7.7 0 0 0-.6-.2L9.2 5.9c-.4.1-.6.4-.6.8v7.9a2.15 2.15 0 1 0 1.5 2.05V9.25l5.7-1.2v4.5a2.15 2.15 0 1 0 1.5 2.05V5.2a.7.7 0 0 0-.2-.6z"
    />
  ),
  whatsapp: (
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.17c-.25.69-1.43 1.32-2 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.62-2.98-1.29-4.92-4.29-5.07-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.84 2.06.91 2.21.08.15.13.32.03.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.77 1.27 1.65 2.06 1.14 1.01 2.09 1.32 2.39 1.47.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.19 1.4z" />
  ),
  facebook: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  ),
  tiktok: (
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.7a5.68 5.68 0 0 0-.77-.05A5.66 5.66 0 1 0 15.54 15.3V8.9a7.34 7.34 0 0 0 4.3 1.38V7.19a4.29 4.29 0 0 1-3.24-1.37z" />
  ),
  email: (
    <path d="M3 5h18a1 1 0 0 1 1 1v.35l-9.47 5.3a1.1 1.1 0 0 1-1.06 0L2 6.35V6a1 1 0 0 1 1-1zm19 3.64V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8.64l9.47 5.3c.33.18.73.18 1.06 0L22 8.64z" />
  ),
};

/* ──────────────────────────────── helpers ────────────────────────────────── */

function track(url, label, listId) {
  try {
    trackEvent("select_item", {
      item_list_id: listId,
      item_list_name: "The Angels — link in bio",
      items: [{ item_id: url, item_name: label }],
    });
  } catch (_) {}
}

/* ───────────────────────────────── styles ────────────────────────────────── */

const STYLES = `
.ag-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  padding: 44px 18px 60px;
  /* Warm near-black wash — matches the Linktree theme the duo already uses. */
  background:
    radial-gradient(ellipse 120% 70% at 50% 0%, #4a3a2d 0%, #2a211a 30%, #140f0c 62%, #0a0807 100%),
    #0a0807;
  background-attachment: fixed;
  font-family: 'DM Sans', 'DM Sans Fallback', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #fff;
}
.ag-main { width: 100%; max-width: 480px; }

/* ── header ── */
.ag-avatar {
  width: 96px; height: 96px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 18px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45);
  background: #14100d;
}
.ag-name {
  margin: 0 0 10px;
  text-align: center;
  font-family: 'Outfit', 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.02em;
  color: #fff;
}
.ag-bio {
  margin: 0 auto 22px;
  max-width: 400px;
  text-align: center;
  font-size: 16px;
  line-height: 1.45;
  color: rgba(255,255,255,0.92);
}

/* ── social glyph row ── */
.ag-socials {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-bottom: 24px;
}
/* Nine glyphs must clear a 320px phone in one row, but a 27px icon is a
   painfully small thumb target. So the tap area is padding around the glyph —
   44px tall always, and as wide as the row allows — while the glyph itself
   stays visually the same size. Spacing between marks is that padding, not gap. */
.ag-social {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 44px;
  color: #fff;
  border-radius: 6px;
  transition: transform 0.16s ease, opacity 0.16s ease;
}
.ag-social svg { width: 27px; height: 27px; display: block; fill: currentColor; }
.ag-social:hover { transform: scale(1.12); opacity: 0.85; }

/* ── link cards ── */
.ag-links { display: flex; flex-direction: column; gap: 12px; }
.ag-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  /* Equal inline padding so the label stays optically centred in the card
     whether or not a thumbnail is pinned to the left. */
  padding: 10px 62px;
  border-radius: 8px;
  background: #000;
  text-decoration: none;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.35);
  transition: transform 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease;
}
.ag-card:hover {
  transform: scale(1.015);
  background: #141414;
  box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}
.ag-card:active { transform: scale(1); }
.ag-label {
  font-family: 'Outfit', 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  text-align: center;
  color: #fff;
}
.ag-thumb {
  position: absolute;
  left: 8px; top: 50%;
  transform: translateY(-50%);
  width: 48px; height: 48px;
  border-radius: 5px;
  object-fit: cover;
  background: #1a1a1a;
}

.ag-card:focus-visible,
.ag-social:focus-visible,
.ag-footer a:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* ── footer ── */
.ag-footer {
  margin-top: 34px;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.4);
}
.ag-footer a { color: rgba(255,255,255,0.55); text-decoration: none; border-radius: 3px; }
.ag-footer a:hover { color: #fff; }

@media (max-width: 420px) {
  .ag-page { padding: 32px 14px 46px; }
  .ag-avatar { width: 88px; height: 88px; }
  .ag-name { font-size: 25px; }
  .ag-bio { font-size: 15px; }
  .ag-socials { gap: 0; }
  .ag-social { width: 36px; height: 44px; }
  .ag-social svg { width: 24px; height: 24px; }
  .ag-card { min-height: 60px; padding: 10px 56px; }
  .ag-label { font-size: 15px; }
}

/* iPhone SE / small Androids — 9 × 32px still fits 320px minus page padding. */
@media (max-width: 359px) {
  .ag-page { padding: 28px 10px 42px; }
  .ag-social { width: 32px; }
  .ag-social svg { width: 22px; height: 22px; }
  .ag-card { padding: 10px 52px; }
  .ag-label { font-size: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .ag-card, .ag-social { transition: none; }
  .ag-card:hover, .ag-social:hover, .ag-card:active { transform: none; }
}
`;

/* ──────────────────────────────── component ──────────────────────────────── */

export default function AngelsLinks() {
  usePageView("angels_bio");
  useTimeOnPage("angels_bio");

  return (
    <div className="ag-page">
      <style>{STYLES}</style>

      <main className="ag-main">
        <img
          className="ag-avatar"
          src={PROFILE.avatar}
          alt={PROFILE.name}
          width={96}
          height={96}
        />
        <h1 className="ag-name">{PROFILE.name}</h1>
        <p className="ag-bio">{PROFILE.bio}</p>

        <nav className="ag-socials" aria-label="The Angels on social media">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="ag-social"
              onClick={() => track(s.url, s.label, "angels_bio_social")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {ICONS[s.icon]}
              </svg>
            </a>
          ))}
        </nav>

        <div className="ag-links">
          {LINKS.map((item) => {
            const inner = (
              <>
                {item.thumbnail && <img className="ag-thumb" src={item.thumbnail} alt="" loading="lazy" />}
                <span className="ag-label">{item.label}</span>
              </>
            );
            const onClick = () => track(item.url, item.label, "angels_bio");

            // On-site destinations navigate in the same tab via React Router —
            // instant, and it keeps visitors on the site rather than stacking
            // tabs in Instagram's in-app browser. Everything else opens a new tab.
            return item.url.startsWith("/") ? (
              <Link key={item.url} to={item.url} className="ag-card" onClick={onClick}>
                {inner}
              </Link>
            ) : (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ag-card"
                onClick={onClick}
              >
                {inner}
              </a>
            );
          })}
        </div>

        <footer className="ag-footer">
          <a href="/the-angels">EPK</a> · <a href="/">steven-angel.com</a>
        </footer>
      </main>
    </div>
  );
}
