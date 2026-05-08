/**
 * api.js — Mashup Generator API wrappers
 *
 * One function per backend endpoint.
 * All JWT-required functions accept a token argument.
 * All functions throw on non-2xx with { status, error, ...rest } so callers
 * can pattern-match (e.g. status === 402 for INSUFFICIENT_CREDITS).
 *
 * Base URL comes from AuthContext so it stays in sync with the rest of the app.
 *
 * Endpoint table (all mashup-specific use /mashup/*; credit ops use /credits/*):
 *   GET  /mashup/pricing           — public
 *   GET  /credits/balance          — JWT
 *   GET  /credits/history          — JWT
 *   POST /credits/checkout/create  — JWT
 *   POST /credits/checkout/guest-start — public
 *   POST /credits/checkout/capture — JWT
 *   POST /mashup/upload-url        — JWT
 *   POST /mashup/render            — JWT
 *   GET  /mashup/jobs/:jobId       — JWT
 *   GET  /mashup/stems/:jobId/:kind — JWT (302 to signed URL)
 */

const TOKEN_KEY = "steven_angel_shop_token";

// All exported wrappers take `apiBase` as a parameter (from useAuth().apiBase),
// so we don't import API_BASE here. AuthContext owns the single source of truth.

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build default JSON headers. Adds Authorization only when token is truthy.
 */
function jsonHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

/**
 * Throw a structured error from a non-2xx fetch response.
 * Tries to parse JSON body for { error, required, available, existing, ... }.
 */
async function throwApiError(res) {
  let body = {};
  try {
    body = await res.json();
  } catch (_) {
    // ignore parse failure — body may be empty
  }
  const err = new Error(body.error || `HTTP ${res.status}`);
  err.status = res.status;
  Object.assign(err, body);
  throw err;
}

/**
 * Handle a 401 response: clear the stored JWT and redirect to login.
 * Does NOT throw; the redirect itself terminates the flow in the browser.
 */
function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEY);
  // Use replace so the user can go back after re-login
  window.location.replace(
    `/shop/login?return=${encodeURIComponent(window.location.pathname)}`
  );
}

/**
 * Core fetch wrapper. Throws on non-2xx; handles 401 with redirect.
 */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    handleUnauthorized();
    // Return a never-resolving promise — the page is navigating away
    return new Promise(() => {});
  }
  if (!res.ok) {
    await throwApiError(res);
  }
  return res;
}

// ---------------------------------------------------------------------------
// Public endpoints (no auth required)
// ---------------------------------------------------------------------------

/**
 * GET /mashup/pricing
 * Returns { renderCost: 6, packs: [{id, credits, priceUsd, name, renders}] }
 */
export async function getMashupPricing(apiBase) {
  const res = await apiFetch(`${apiBase}/mashup/pricing`);
  return res.json();
}

/**
 * POST /credits/checkout/guest-start
 * body: { packId, email }
 * Returns { orderId, token, packId, credits, priceUsd }
 */
export async function startGuestCreditsCheckout(apiBase, packId, email) {
  const res = await apiFetch(`${apiBase}/credits/checkout/guest-start`, {
    method: "POST",
    headers: jsonHeaders(null),
    body: JSON.stringify({ packId, email }),
  });
  return res.json();
}

// ---------------------------------------------------------------------------
// JWT-required endpoints
// ---------------------------------------------------------------------------

/**
 * GET /credits/balance
 * Returns { balance: number }
 */
export async function getCreditsBalance(apiBase, token) {
  const res = await apiFetch(`${apiBase}/credits/balance`, {
    headers: jsonHeaders(token),
  });
  return res.json();
}

/**
 * GET /credits/history
 * Returns { transactions: [...] }
 */
export async function getCreditsHistory(apiBase, token) {
  const res = await apiFetch(`${apiBase}/credits/history`, {
    headers: jsonHeaders(token),
  });
  return res.json();
}

/**
 * POST /credits/checkout/create
 * body: { packId }
 * Returns { orderId, packId, credits, priceUsd }
 */
export async function createCreditsCheckout(apiBase, token, packId) {
  const res = await apiFetch(`${apiBase}/credits/checkout/create`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ packId }),
  });
  return res.json();
}

/**
 * POST /credits/checkout/capture
 * body: { orderId }
 * Returns { success: true, balance: number }
 */
export async function captureCreditsCheckout(apiBase, token, orderId) {
  const res = await apiFetch(`${apiBase}/credits/checkout/capture`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify({ orderId }),
  });
  return res.json();
}

/**
 * POST /mashup/upload-url
 * body: { uploadId?, role: 'a'|'b', contentType, ext }
 * Returns { uploadId, key, uploadUrl, expiresInSeconds }
 */
export async function getUploadUrl(apiBase, token, { uploadId, role, contentType, ext }) {
  const body = { role, contentType, ext };
  if (uploadId) body.uploadId = uploadId;
  const res = await apiFetch(`${apiBase}/mashup/upload-url`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * POST /mashup/render
 * body: { source_a_key, source_b_key, vocal_role, arrangement }
 * Returns { jobId, status: "processing" }
 *
 * Throws with err.status === 402 and err.required/err.available on
 * INSUFFICIENT_CREDITS, and err.status === 409 with err.existing.jobId
 * on DUPLICATE_RENDER.
 */
export async function startRender(apiBase, token, body) {
  const res = await apiFetch(`${apiBase}/mashup/render`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * GET /mashup/jobs/:jobId
 * Returns full job state + signed stem URLs when ready.
 */
export async function getJob(apiBase, token, jobId) {
  const res = await apiFetch(`${apiBase}/mashup/jobs/${encodeURIComponent(jobId)}`, {
    headers: jsonHeaders(token),
  });
  return res.json();
}

/**
 * GET /mashup/stems/:jobId/:kind
 * kind: 'vocals' | 'no-vocals' | 'drums' | 'bass' | 'other'
 *
 * The server returns a 302 redirect to a signed R2 URL.
 * We follow the redirect (fetch follows by default) and return the final URL
 * so callers can use it directly in an <a href> or programmatic download.
 *
 * Note: since fetch follows 302 automatically and the final destination is
 * a different origin (R2), we return the response.url which is the signed URL.
 */
export async function getStemUrl(apiBase, token, jobId, kind) {
  const res = await apiFetch(
    `${apiBase}/mashup/stems/${encodeURIComponent(jobId)}/${encodeURIComponent(kind)}`,
    { headers: jsonHeaders(token) }
  );
  // After following the redirect, res.url is the signed download URL
  return res.url;
}

/**
 * POST /mashup/jobs/:jobId/cancel
 * Returns { success: true, refunded: 6 }
 *      OR { success: false, reason: 'too_late', message }
 *      OR { success: false, reason: 'race_lost', finalStatus, message }
 */
export async function cancelRender(token, apiBase, jobId) {
  const res = await apiFetch(
    `${apiBase}/mashup/jobs/${encodeURIComponent(jobId)}/cancel`,
    {
      method: "POST",
      headers: jsonHeaders(token),
    }
  );
  return res.json();
}
