// Floating accessibility toolbar, framework-free, so the same file runs on any
// of Steven's sites. Controls: text size, high contrast, grayscale, link
// highlighting, readable font, stop animations. Choices persist per site in
// localStorage. Also injects a "skip to content" link and a visible keyboard
// focus ring, which the Israeli standard (IS 5568 / WCAG 2.0 AA) requires.
//
// Labels follow <html lang> at the moment the panel opens, so a site with a
// language toggle gets the right language without extra wiring.

const TEXT = {
  he: {
    button: "תפריט נגישות", title: "נגישות", size: "גודל טקסט",
    smaller: "הקטנת טקסט", bigger: "הגדלת טקסט",
    contrast: "ניגודיות גבוהה", grayscale: "גווני אפור", links: "הדגשת קישורים",
    readable: "פונט קריא", still: "עצירת אנימציות", reset: "איפוס הגדרות",
    statement: "הצהרת נגישות", skip: "דילוג לתוכן", close: "סגירה",
  },
  en: {
    button: "Accessibility menu", title: "Accessibility", size: "Text size",
    smaller: "Smaller text", bigger: "Larger text",
    contrast: "High contrast", grayscale: "Grayscale", links: "Highlight links",
    readable: "Readable font", still: "Stop animations", reset: "Reset settings",
    statement: "Accessibility statement", skip: "Skip to content", close: "Close",
  },
};

const DEFAULTS = { zoom: 0, contrast: false, grayscale: false, links: false, readable: false, still: false };
const TOGGLES = ["contrast", "grayscale", "links", "readable", "still"];

const CSS = `
.a11yw-skip{position:fixed;top:-80px;inset-inline-start:12px;z-index:2147483646;background:#111;color:#fff;
  font:700 15px/1 Arial,Helvetica,sans-serif;padding:12px 18px;border-radius:0 0 8px 8px;text-decoration:none;transition:top .15s}
.a11yw-skip:focus{top:0;outline:3px solid #ffbf47!important;outline-offset:2px!important}
.a11yw-target:focus{outline:none!important}
/* !important so it also beats inline outline:none left on inputs and buttons */
:focus-visible{outline:3px solid var(--a11yw-focus,#1a66d0)!important;outline-offset:2px!important}
.a11yw-btn{position:fixed;z-index:2147483645;width:52px;height:52px;border-radius:50%;background:#1a66d0;
  border:2px solid #fff;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}
.a11yw-btn svg{width:30px;height:30px}
.a11yw-btn:focus-visible{outline:3px solid #ffbf47!important;outline-offset:3px!important}
.a11yw-panel{position:fixed;z-index:2147483645;width:260px;max-width:calc(100vw - 24px);background:#fff;color:#1a1a1a;
  border:1px solid #cfcfcf;border-radius:12px;padding:14px;box-shadow:0 16px 44px rgba(0,0,0,.35);
  font:15px/1.4 Arial,Helvetica,sans-serif;display:flex;flex-direction:column;gap:6px}
.a11yw-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.a11yw-title{font-weight:700;font-size:19px}
.a11yw-x{background:none;border:0;font-size:22px;line-height:1;cursor:pointer;color:#333;padding:2px 6px;border-radius:6px}
.a11yw-row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#f5f5f5;color:#1a1a1a;
  border:1px solid #d6d6d6;border-radius:8px;padding:10px 12px;cursor:pointer;font:inherit;text-align:start;text-decoration:none;width:100%}
.a11yw-row[aria-pressed="true"]{background:#e8f0fe;border-color:#1a66d0}
.a11yw-dot{width:13px;height:13px;border-radius:50%;border:2px solid #666;flex-shrink:0}
.a11yw-row[aria-pressed="true"] .a11yw-dot{background:#1a66d0;border-color:#1a66d0}
.a11yw-size{cursor:default}
.a11yw-size .a11yw-ctl{display:flex;align-items:center;gap:6px}
.a11yw-size button{background:#fff;color:#1a1a1a;border:1px solid #bbb;border-radius:6px;padding:4px 10px;cursor:pointer;font:700 14px Arial,sans-serif}
.a11yw-size button:disabled{opacity:.4;cursor:default}
.a11yw-size output{min-width:42px;text-align:center;font-size:13px;color:#444}
.a11yw-reset{justify-content:center;color:#444}
.a11yw-link{justify-content:center;color:#0b57c9;background:none;border:0;text-decoration:underline}
html.a11yw-zoom-1 body{zoom:1.12}
html.a11yw-zoom-2 body{zoom:1.25}
html.a11yw-links a{text-decoration:underline!important;text-underline-offset:3px}
html.a11yw-readable body *:not(svg):not(path):not(.a11yw-btn *){font-family:Arial,Helvetica,sans-serif!important;letter-spacing:0!important}
html.a11yw-still *,html.a11yw-still *::before,html.a11yw-still *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
`;

// Grayscale and contrast are filters on <html> itself: a filter on the root
// element does not become the containing block for fixed elements, so the
// site's floating buttons keep their place (a filter on <body> would move them).
function applyToHtml(p) {
  const h = document.documentElement;
  h.classList.toggle("a11yw-zoom-1", p.zoom === 1);
  h.classList.toggle("a11yw-zoom-2", p.zoom === 2);
  h.classList.toggle("a11yw-links", p.links);
  h.classList.toggle("a11yw-readable", p.readable);
  h.classList.toggle("a11yw-still", p.still);
  const f = [p.grayscale && "grayscale(1)", p.contrast && "contrast(1.45)"].filter(Boolean).join(" ");
  h.style.filter = f;
  holdVideos(p.still);
}

// Muted autoplay loops are moving content too (WCAG 2.2.2), so "stop
// animations" pauses them and plays them again when switched off. A video the
// visitor chose to play (with sound, or by pressing play) is left alone.
const isAmbient = (v) => v.autoplay && v.muted;
function holdVideos(on) {
  document.querySelectorAll("video").forEach((v) => {
    if (!isAmbient(v)) return;
    if (on && !v.paused) { v.pause(); v.dataset.a11ywHeld = "1"; }
    if (!on && v.dataset.a11ywHeld) { delete v.dataset.a11ywHeld; v.play().catch(() => {}); }
  });
}
function onPlay(e) {
  const v = e.target;
  if (!(v instanceof HTMLVideoElement) || !isAmbient(v)) return;
  if (!document.documentElement.classList.contains("a11yw-still")) return;
  if (navigator.userActivation && navigator.userActivation.isActive) return;
  v.pause();
  v.dataset.a11ywHeld = "1";
}

const ICON = '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true" focusable="false"><circle cx="12" cy="4.4" r="2.1"/><path d="M19.9 7.6c-2.6.6-5.3.9-7.9.9s-5.3-.3-7.9-.9a.95.95 0 0 0-.4 1.9c1.9.4 3.8.7 5.8.8v2.1c0 .4 0 .8-.13 1.2l-2.1 6.1a1 1 0 0 0 1.9.65l1.9-5.55h1.86l1.9 5.55a1 1 0 1 0 1.9-.65l-2.1-6.1c-.13-.4-.13-.8-.13-1.2v-2.1c2-.1 3.9-.4 5.8-.8a.95.95 0 0 0-.4-1.9z"/></svg>';

/**
 * @param {object} o
 * @param {string} o.storageKey   unique per site
 * @param {string} o.statementUrl link to the accessibility statement
 * @param {"left"|"right"} [o.side="left"]  physical side for the button
 * @param {number} [o.bottom=22]  px from the bottom, to clear other floats
 * @param {string} [o.skipTarget="#main"]  selector the skip link jumps to
 * @param {string} [o.focusColor] outline colour for keyboard focus
 */
export function initA11y(o) {
  if (typeof document === "undefined" || document.querySelector(".a11yw-btn")) return;
  const side = o.side === "right" ? "right" : "left";
  const bottom = o.bottom ?? 22;
  const lang = () => ((document.documentElement.lang || "he").startsWith("he") ? "he" : "en");
  const t = () => TEXT[lang()];

  const style = document.createElement("style");
  style.textContent = CSS + `.a11yw-btn{${side}:18px;bottom:${bottom}px}.a11yw-panel{${side}:18px;bottom:${bottom + 62}px}`;
  if (o.focusColor) style.textContent += `:root{--a11yw-focus:${o.focusColor}}`;
  document.head.appendChild(style);

  let prefs = { ...DEFAULTS };
  try { prefs = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(o.storageKey) || "{}") }; } catch { /* private mode */ }
  const save = () => { try { localStorage.setItem(o.storageKey, JSON.stringify(prefs)); } catch { /* private mode */ } };
  applyToHtml(prefs);
  // Media events do not bubble, but a capturing listener still sees them,
  // including videos mounted later by a SPA route change.
  document.addEventListener("play", onPlay, true);

  // Skip link: first thing a keyboard user reaches.
  const skip = document.createElement("a");
  skip.className = "a11yw-skip";
  const target = o.skipTarget || "#main";
  // A selector list ("main, h1") is not a valid href, so only a bare #id is used as one.
  skip.href = /^#[\w-]+$/.test(target) ? target : "#main";
  skip.addEventListener("click", (e) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.classList.add("a11yw-target");
    el.focus();
    el.scrollIntoView();
  });
  document.body.prepend(skip);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "a11yw-btn";
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = ICON;
  document.body.appendChild(btn);

  let panel = null;
  const labels = () => { const x = t(); btn.setAttribute("aria-label", x.button); btn.title = x.title; skip.textContent = x.skip; };
  labels();
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const close = (refocus = true) => {
    if (!panel) return;
    panel.remove(); panel = null;
    btn.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("mousedown", onOutside);
    if (refocus) btn.focus();
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  const onOutside = (e) => { if (panel && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(false); };

  const render = () => {
    const x = t();
    panel.dir = lang() === "he" ? "rtl" : "ltr";
    panel.innerHTML = `
      <div class="a11yw-head"><span class="a11yw-title" id="a11yw-title">${x.title}</span>
        <button type="button" class="a11yw-x" data-a="close" aria-label="${x.close}">×</button></div>
      <div class="a11yw-row a11yw-size"><span>${x.size}</span><span class="a11yw-ctl">
        <button type="button" data-a="smaller" aria-label="${x.smaller}" ${prefs.zoom === 0 ? "disabled" : ""}>A-</button>
        <output aria-live="polite">${["100%", "112%", "125%"][prefs.zoom]}</output>
        <button type="button" data-a="bigger" aria-label="${x.bigger}" ${prefs.zoom === 2 ? "disabled" : ""}>A+</button></span></div>
      ${TOGGLES.map((k) => `<button type="button" class="a11yw-row" data-a="toggle" data-k="${k}" aria-pressed="${prefs[k]}">
        <span>${x[k]}</span><span class="a11yw-dot" aria-hidden="true"></span></button>`).join("")}
      <button type="button" class="a11yw-row a11yw-reset" data-a="reset">${x.reset}</button>
      <a class="a11yw-row a11yw-link" href="${o.statementUrl}">${x.statement}</a>`;
  };

  const open = () => {
    panel = document.createElement("div");
    panel.className = "a11yw-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", "a11yw-title");
    render();
    panel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]");
      if (!b) return;
      const a = b.dataset.a;
      if (a === "close") return close();
      if (a === "smaller") prefs.zoom = Math.max(0, prefs.zoom - 1);
      if (a === "bigger") prefs.zoom = Math.min(2, prefs.zoom + 1);
      if (a === "toggle") prefs[b.dataset.k] = !prefs[b.dataset.k];
      if (a === "reset") prefs = { ...DEFAULTS };
      applyToHtml(prefs); save();
      const keep = b.dataset.k ? `[data-k="${b.dataset.k}"]` : `[data-a="${a}"]`;
      render();
      panel.querySelector(keep)?.focus();
    });
    document.body.appendChild(panel);
    btn.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    panel.querySelector("[data-a]")?.focus();
  };

  btn.addEventListener("click", () => (panel ? close() : open()));
}
