/**
 * /shop/airwallex-preview — RAW Airwallex Drop-in preview.
 *
 * PURPOSE: show what the Drop-in widget looks like with ZERO custom styling.
 * No card wrapper, no headings overrides, no theme tweaks, no brand colors.
 * Just the SDK's default render — exactly what you'd see in Airwallex's own
 * docs page.
 *
 * Environment: matches the backend Airwallex config (currently "prod").
 * Creates a $1 USD intent. Do NOT submit a card unless you're OK charging
 * yourself $1 — this page is for visual inspection only.
 *
 * This page lives ONLY on the `airwallex-dropin-preview` branch. It will
 * appear on the Netlify branch preview URL but is NOT linked from anywhere
 * on the main site.
 */

import React, { useEffect, useRef, useState } from "react";

const BACKEND = "https://ghost-backend-production-adb6.up.railway.app";
const SDK_URL = "https://checkout.airwallex.com/assets/elements.bundle.min.js";

let sdkPromise = null;
function loadAirwallexSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.Airwallex) return resolve(window.Airwallex);
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => {
      if (window.Airwallex) resolve(window.Airwallex);
      else reject(new Error("Airwallex SDK loaded but window.Airwallex is undefined"));
    };
    s.onerror = () => { sdkPromise = null; reject(new Error("Failed to load Airwallex SDK")); };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

export default function AirwallexPreviewPage() {
  const containerRef = useRef(null);
  const elementRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | success
  const [intent, setIntent] = useState(null);

  useEffect(() => {
    document.title = "Airwallex Drop-in Preview";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        setStatus("loading");

        // 1. Fetch preview intent from backend (uses live Airwallex creds,
        //    $1 USD intent — page is preview-only, not linked from prod)
        const res = await fetch(`${BACKEND}/shop/checkout/airwallex-preview-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Backend error (${res.status})`);
        }
        if (cancelled) return;
        setIntent(data);

        // 2. Load SDK
        const Airwallex = await loadAirwallexSdk();
        if (cancelled) return;

        // 3. Init SDK matching the backend's environment
        const env = data.environment === "demo" ? "demo" : "prod";
        await Airwallex.init({
          env,
          enabledElements: ["payments"],
        });

        // 4. Create + mount the Drop-in with MINIMAL config — no theme, no
        //    custom appearance, no styling overrides. Just intent_id and
        //    client_secret. The SDK uses its default Airwallex look.
        const element = Airwallex.createElement("dropIn", {
          intent_id: data.intent_id,
          client_secret: data.client_secret,
          currency: data.currency,
        });
        elementRef.current = element;

        if (!cancelled && containerRef.current) {
          element.mount(containerRef.current);
          setStatus("ready");
        }

        element.on("success", (event) => {
          console.log("[airwallex-preview] success", event);
          setStatus("success");
        });
        element.on("error", (event) => {
          // Silent — debug only, never shown.
          console.error("[airwallex-preview] element error:", event);
        });
      } catch (err) {
        if (cancelled) return;
        // Silent — debug only.
        console.error("[airwallex-preview] setup error:", err);
      }
    }

    setup();

    return () => {
      cancelled = true;
      if (elementRef.current) {
        try { elementRef.current.unmount(); } catch { /* ignore */ }
        elementRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      color: "#111",
      padding: "32px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>
          Airwallex Drop-in — raw preview
        </h1>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>
          $1.00 USD intent · No custom styling applied. Do not submit a card
          unless you want to charge yourself $1.
        </p>

        {status === "loading" && (
          <div style={{ padding: 24, textAlign: "center", color: "#666" }}>
            Loading Drop-in…
          </div>
        )}

        {/* Drop-in mount target — no wrapper styling. */}
        <div ref={containerRef} style={{ minHeight: 360 }} />

        {intent && (
          <details style={{ marginTop: 24, fontSize: 11, color: "#888" }}>
            <summary style={{ cursor: "pointer" }}>Intent details (debug)</summary>
            <pre style={{
              fontSize: 11, background: "#f6f6f6", padding: 12,
              borderRadius: 4, overflow: "auto",
            }}>{JSON.stringify(intent, null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
