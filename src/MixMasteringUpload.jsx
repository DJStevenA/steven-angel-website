/**
 * Mix & Mastering Upload Page — /mix-mastering/upload?order_id=...
 *
 * Post-PayPal landing page. Polls backend for order status and shows
 * the correct UI: upload CTA, stems-received confirmation, or download CTA.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";

const CYAN = "#00E5FF";
const PURPLE = "#BB86FC";
const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const WHATSAPP = "https://wa.me/972523561353";

/* ── style helpers (match MixMastering.jsx) ── */
const heading = (size) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 900,
  textTransform: "uppercase",
  lineHeight: 1,
  letterSpacing: "0.02em",
  fontSize: size,
});
const body = {
  fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
  fontWeight: 400,
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.7)",
  fontSize: 15,
};
const label = (color) => ({
  fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: "0.35em",
  textTransform: "uppercase",
  color: color || CYAN,
});
const card = {
  background: "#04040f",
  border: "1px solid rgba(0,229,255,0.2)",
  borderRadius: 12,
  padding: "24px 20px",
};

/* ── gtag helper ── */
function gtag(...args) {
  if (typeof window !== "undefined" && window.gtag) window.gtag(...args);
}

/* ── WhatsApp icon ── */
function WAIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.106 1.51 5.833L.057 23.054a.75.75 0 00.92.92l5.222-1.453A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 01-4.98-1.366l-.357-.214-3.706 1.032 1.032-3.706-.214-.357A9.75 9.75 0 1112 21.75z" />
    </svg>
  );
}

/* ── Skeleton loader ── */
function Skeleton({ isMobile }) {
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: isMobile ? "40px 20px" : "80px 24px" }}>
      {[100, 60, 200, 140].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 2 ? 56 : 20,
            width: `${w}%`.replace("100%", "100%"),
            maxWidth: w === 100 ? "100%" : `${w * 3}px`,
            borderRadius: 8,
            background: "rgba(255,255,255,0.07)",
            marginBottom: 18,
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
    </div>
  );
}

/* ── Error card ── */
function ErrorCard({ message, isMobile }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: isMobile ? "40px 20px" : "80px 24px", textAlign: "center" }}>
      <div style={{ ...card, borderColor: "rgba(255,100,100,0.25)" }}>
        <div style={{ ...heading(28), color: "#ff6b6b", marginBottom: 12 }}>Something went wrong</div>
        <div style={{ ...body, marginBottom: 24 }}>{message}</div>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", background: "#1a7a42", color: "#fff",
            borderRadius: 8, textDecoration: "none",
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 800, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase",
          }}
        >
          <WAIcon /> Message Steven on WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ── Stems received / in-progress card ── */
function ReceivedCard({ isMobile }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <div style={{ ...card, borderColor: "rgba(0,229,255,0.35)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ ...heading(isMobile ? 26 : 32), color: "#fff", marginBottom: 12 }}>
          Stems Received
        </div>
        <div style={{ ...body, marginBottom: 8 }}>
          Steven will deliver your master within 3 days.
        </div>
        <div style={{ ...body, color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
          You'll get an email when it's ready.
        </div>
      </div>
    </div>
  );
}

/* ── Delivered / download card ── */
function DeliveredCard({ order, isMobile }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <div style={{ ...card, borderColor: "rgba(187,134,252,0.35)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎧</div>
        <div style={{ ...heading(isMobile ? 26 : 32), color: "#fff", marginBottom: 8 }}>
          Your Master is Ready
        </div>
        <div style={{ ...body, marginBottom: 24 }}>
          {order.package_name} · ${order.amount_usd}
        </div>
        <button
          onClick={() => window.open(order.view_url, "_blank")}
          style={{
            width: "100%",
            padding: "18px 24px",
            background: `linear-gradient(135deg, ${PURPLE}, #9a5fd4)`,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 18 : 22,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          Download Your Master →
        </button>
        <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Opens Dropbox in a new tab.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ MAIN UPLOAD UI ═══════════════════════ */
function UploadUI({ order, isMobile, onComplete }) {
  const [uploadClicked, setUploadClicked] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [bpm, setBpm] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);
  const timerRef = useRef(null);

  // 30-second unlock timer — starts on mount
  useEffect(() => {
    timerRef.current = setTimeout(() => setTimerDone(true), 30000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const canComplete = uploadClicked || timerDone;

  const handleUploadClick = () => {
    if (!uploadClicked) {
      setUploadClicked(true);
      gtag("event", "mm_upload_click", { order_id: order.order_id || order.id });
    }
    window.open(order.upload_url, "_blank");
  };

  const handleComplete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      const res = await fetch(`${BACKEND}/mix-mastering/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.order_id || order.id,
          track_name: trackName.trim() || undefined,
          bpm: bpm ? Number(bpm) : undefined,
          reference_url: referenceUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      gtag("event", "mm_upload_complete", {
        order_id: order.order_id || order.id,
        package_id: order.package_id,
        value: order.amount_usd,
      });
      onComplete();
    } catch (err) {
      setCompleteError(err.message || "Something went wrong. Try again or message on WhatsApp.");
      setCompleting(false);
    }
  };

  const shortId = (order.order_id || order.id || "").slice(-8).toUpperCase();

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,229,255,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "'DM Sans', 'DM Sans Fallback', sans-serif",
    fontSize: 14,
    outline: "none",
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>

      {/* Order summary */}
      <div style={{ ...card, marginBottom: 20, textAlign: "center" }}>
        <div style={{ ...label(CYAN), marginBottom: 8 }}>Your Order</div>
        <div style={{ ...heading(isMobile ? 22 : 28), color: "#fff", marginBottom: 4 }}>
          {order.package_name}
        </div>
        <div style={{ ...body, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          ${order.amount_usd} · Order #{shortId}
          {order.client_name ? ` · ${order.client_name}` : ""}
        </div>
      </div>

      {/* Big Upload CTA */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={handleUploadClick}
          style={{
            width: "100%",
            padding: "20px 24px",
            background: "linear-gradient(135deg, #00E5FF, #00b8d4)",
            color: "#000",
            border: "none",
            borderRadius: 12,
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 22 : 28,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 4px 32px rgba(0,229,255,0.25)",
          }}
        >
          Upload Your Stems →
        </button>
        <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 8 }}>
          Opens Dropbox in a new tab. No login needed.
        </div>
      </div>

      {/* Optional metadata fields */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ ...label(PURPLE), marginBottom: 14 }}>Optional Details (Recommended)</div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Track Name</div>
            <input
              type="text"
              placeholder="e.g. My Track (Demo)"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>BPM</div>
            <input
              type="number"
              placeholder="e.g. 124"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              min="50"
              max="250"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Reference Track URL</div>
          <input
            type="url"
            placeholder="YouTube or SoundCloud link"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Notes for Steven</div>
          <textarea
            placeholder="Anything Steven should know about your mix..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      {/* Done uploading button */}
      <div style={{ marginBottom: 24 }}>
        {completeError && (
          <div style={{ ...body, color: "#ff6b6b", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
            {completeError}
          </div>
        )}
        <button
          onClick={handleComplete}
          disabled={!canComplete || completing}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: "transparent",
            color: canComplete ? CYAN : "rgba(255,255,255,0.25)",
            border: `2px solid ${canComplete ? CYAN : "rgba(255,255,255,0.15)"}`,
            borderRadius: 10,
            fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 18,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: canComplete && !completing ? "pointer" : "not-allowed",
            opacity: completing ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          {completing ? "Sending..." : "I'm Done Uploading →"}
        </button>
        {!canComplete && (
          <div style={{ ...body, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 8 }}>
            Click "Upload Your Stems" first to enable this button.
          </div>
        )}
      </div>

      {/* FAQ strip */}
      <div style={{ ...card, marginBottom: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { q: "What format?", a: "Send WAV, AIFF, or MP3 320 — 16/24-bit stems or stereo bounce." },
            { q: "How long?", a: "Steven delivers in 3 days. You'll get an email when ready." },
          ].map((faq) => (
            <div key={faq.q} style={{ display: "flex", gap: 12 }}>
              <div style={{ ...label(CYAN), minWidth: 90, paddingTop: 2 }}>{faq.q}</div>
              <div style={{ ...body, fontSize: 14 }}>{faq.a}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ ...label(CYAN), minWidth: 90 }}>Need help?</div>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", background: "#1a7a42", color: "#fff",
                borderRadius: 6, textDecoration: "none",
                fontFamily: "'Barlow Condensed', 'Barlow Condensed Fallback', sans-serif",
                fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
              }}
            >
              <WAIcon /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function MixMasteringUpload() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId") || "";

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  // localStatus lets onComplete() flip to 'received' without refetching
  const [localStatus, setLocalStatus] = useState(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const fetchOrder = useCallback(async (retryCount = 0) => {
    if (!orderId) {
      setError("No order ID in URL. Please check your PayPal confirmation email.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/mix-mastering/upload/${orderId}`, {
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 404) {
        if (retryCount < 3) {
          // PayPal capture may not have written DB yet — backoff retry
          setTimeout(() => fetchOrder(retryCount + 1), 2000);
          return;
        }
        setError("Order not found. Please check your PayPal confirmation email or contact Steven.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || "Unknown server error");
      }

      // Backend may still be lazily creating Dropbox assets
      if (data.status === "paid" && !data.upload_url && retryCount < 1) {
        setTimeout(() => fetchOrder(retryCount + 1), 3000);
        return;
      }

      setOrder(data);
      setLoading(false);

      gtag("event", "mm_upload_page_view", { order_id: orderId });
    } catch (err) {
      setError(err.name === "TimeoutError"
        ? "Request timed out. Check your connection and refresh."
        : (err.message || "Failed to load your order. Please refresh."));
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder(0);
  }, [fetchOrder]);

  const status = localStatus || order?.status;

  /* ── RENDER ── */
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      <Nav />

      <main style={{ padding: isMobile ? "40px 20px 80px" : "80px 48px 120px" }}>
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48, maxWidth: 620, margin: "0 auto 40px" }}>
          <div style={{ ...label(CYAN), marginBottom: 12 }}>Mix & Mastering</div>
          <h1 style={{ ...heading(isMobile ? 30 : 44), color: "#fff", marginBottom: 0 }}>
            {status === "delivered" ? "Your Master is Ready" :
             (status === "received" || status === "in_progress") ? "Stems Received" :
             "Upload Your Stems"}
          </h1>
        </div>

        {loading && <Skeleton isMobile={isMobile} />}

        {!loading && error && (
          <ErrorCard message={error} isMobile={isMobile} />
        )}

        {!loading && !error && order && (
          <>
            {(status === "paid") && (
              <UploadUI
                order={order}
                isMobile={isMobile}
                onComplete={() => setLocalStatus("received")}
              />
            )}
            {(status === "received" || status === "in_progress") && (
              <ReceivedCard isMobile={isMobile} />
            )}
            {status === "delivered" && (
              <DeliveredCard order={order} isMobile={isMobile} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
