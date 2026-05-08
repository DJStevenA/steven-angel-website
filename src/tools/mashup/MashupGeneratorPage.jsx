/**
 * MashupGeneratorPage.jsx — Phase 2E (updated from Phase 2D)
 *
 * Auth-required. Redirects to /shop/login?return=/tools/mashup if not logged in.
 *
 * Phase 2D wires:
 *   - Render button click → startRenderFlow
 *   - RenderProgressIndicator (while job.status === 'processing')
 *   - RenderErrorBanner (while job.status is failed/refunded/cancelled)
 *   - OutputPanel (when job.status === 'ready' and !job.stemsExpired)
 *   - InsufficientCreditsModal (on 402 from /render)
 *   - Toast notifications (cancel outcomes)
 *
 * Phase 2E adds:
 *   - AIDirectorFloatingButton (mobile-only, bottom-right) — opens AIDirectorChat
 *     in full-screen modal mode at <= 900px.
 *   - chatModalOpen state — passed to AIDirectorFloatingButton + AIDirectorChat.
 *   - The right column AIDirectorChat (desktop) is hidden via CSS at <= 900px.
 *
 * Render button states (4):
 *   disabled-need-tracks  — no tracks loaded yet
 *   disabled-need-roles   — tracks loaded but roles not assigned
 *   enabled               — both tracks + roles assigned + sufficient credits
 *   disabled-need-credits — not enough credits
 *
 * No emoji anywhere.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../shop/AuthContext.jsx";
import { getCreditsBalance } from "./lib/api.js";
import { startRenderFlow } from "./lib/renderFlow.js";
import useMashupState from "./useMashupState.js";
import TrackPanel from "./components/TrackPanel.jsx";
import MiniDaw from "./components/MiniDaw.jsx";
import AIDirectorChat from "./components/AIDirectorChat.jsx";
import AIDirectorFloatingButton from "./components/AIDirectorFloatingButton.jsx";
import RenderProgressIndicator from "./components/RenderProgressIndicator.jsx";
import RenderErrorBanner from "./components/RenderErrorBanner.jsx";
import InsufficientCreditsModal from "./components/InsufficientCreditsModal.jsx";
import OutputPanel from "./components/OutputPanel.jsx";
import styles from "./styles.module.css";
import pageStyles from "./MashupGeneratorPage.module.css";

const RENDER_COST = 6;

// ---------------------------------------------------------------------------
// Render button
// ---------------------------------------------------------------------------

/**
 * Determine render button state from current store snapshot + balance.
 * Returns one of: 'need-tracks' | 'need-roles' | 'enabled' | 'need-credits'
 */
function getRenderButtonState(tracks, roles, balance) {
  const hasBothTracks = tracks.a?.buffer && tracks.b?.buffer;
  if (!hasBothTracks) return 'need-tracks';

  const hasBothRoles = roles.vocal && roles.instr;
  if (!hasBothRoles) return 'need-roles';

  if (balance != null && balance < RENDER_COST) return 'need-credits';
  return 'enabled';
}

function RenderButton({ tracks, roles, balance, onClick }) {
  const state = getRenderButtonState(tracks, roles, balance);

  if (state === 'need-tracks') {
    return (
      <button
        type="button"
        className={pageStyles.renderBtnDisabled}
        disabled
        aria-label="Load two tracks to continue"
      >
        LOAD TWO TRACKS TO CONTINUE
      </button>
    );
  }

  if (state === 'need-roles') {
    return (
      <button
        type="button"
        className={pageStyles.renderBtnDisabled}
        disabled
        aria-label="Assign vocal and instrumental roles"
      >
        ASSIGN VOCAL + INSTR ROLES
      </button>
    );
  }

  if (state === 'need-credits') {
    return (
      <Link
        to="/tools/mashup/credits"
        className={pageStyles.renderBtnCredits}
        aria-label="Buy more credits to render"
      >
        BUY MORE CREDITS
      </Link>
    );
  }

  // enabled
  return (
    <button
      type="button"
      className={pageStyles.renderBtnEnabled}
      onClick={onClick}
      aria-label={`Render mashup — uses ${RENDER_COST} credits`}
    >
      RENDER MASHUP — {RENDER_COST} CREDITS
    </button>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  if (!message) return null;

  return (
    <div
      className={pageStyles.toast}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MashupGeneratorPage() {
  const { token, user, loading: authLoading, apiBase } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Insufficient-credits modal state: null | { required, available }
  const [insufficientCredits, setInsufficientCredits] = useState(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState(null);

  // AI Director chat modal state (mobile floating button trigger)
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // AbortController ref — lets cancel clean up in-flight uploads on unmount
  const abortControllerRef = useRef(null);

  // Store selectors
  const tracks = useMashupState((s) => s.tracks);
  const roles = useMashupState((s) => s.roles);
  const regions = useMashupState((s) => s.regions);
  const effects = useMashupState((s) => s.effects);
  const drops = useMashupState((s) => s.drops);
  const uploadIds = useMashupState((s) => s.uploadIds);
  const job = useMashupState((s) => s.job);

  // Store actions
  const setJob = useMashupState((s) => s.setJob);
  const setUploadId = useMashupState((s) => s.setUploadId);
  const setUploadProgress = useMashupState((s) => s.setUploadProgress);
  const clearJob = useMashupState((s) => s.clearJob);
  const clearUploadIds = useMashupState((s) => s.clearUploadIds);
  const resetAll = useMashupState((s) => s.resetAll);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate("/shop/login?return=/tools/mashup", { replace: true });
    }
  }, [token, authLoading, navigate]);

  // Fetch credits balance
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function fetchBalance() {
      setBalanceLoading(true);
      try {
        const data = await getCreditsBalance(apiBase, token);
        if (!cancelled) setBalance(data.balance ?? null);
      } catch (_) {
        // Non-fatal — render button will degrade gracefully
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    }

    fetchBalance();
    return () => { cancelled = true; };
  }, [token, apiBase]);

  // Abort uploads on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ── Render handler ────────────────────────────────────────────────────────

  const handleRender = useCallback(async () => {
    if (!token) return;

    setInsufficientCredits(null);

    // Create a fresh AbortController for this render flow
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await startRenderFlow({
        token,
        apiBase,
        tracks,
        roles,
        arrangement: { regions, effects, drops },
        uploadIds,
        setJob,
        setUploadId,
        setUploadProgress,
        signal: controller.signal,
      });

      // On success: re-fetch balance so the top bar reflects the deducted credits
      try {
        const data = await getCreditsBalance(apiBase, token);
        setBalance(data.balance ?? null);
      } catch (_) {
        // Non-fatal
      }
    } catch (err) {
      if (err.kind === 'INSUFFICIENT_CREDITS') {
        // Clear the synthetic processing job first
        setJob(null);
        setInsufficientCredits({ required: err.required, available: err.available });
      } else if (err.kind === 'TRACKS_MISSING' || err.kind === 'ROLES_MISSING') {
        setJob(null);
        setToastMessage(err.message || "Please check tracks and roles before rendering.");
      } else {
        // Upload failed, network error, etc. — show error banner
        setJob({
          jobId: null,
          status: "failed",
          errorMessage: err.message || "An unexpected error occurred. Please try again.",
        });
      }
    }
  }, [
    token, apiBase, tracks, roles, regions, effects, drops, uploadIds,
    setJob, setUploadId, setUploadProgress,
  ]);

  // ── Cancel handler ────────────────────────────────────────────────────────

  function handleCancelled({ refunded }) {
    // Re-fetch balance to reflect refund
    if (token) {
      getCreditsBalance(apiBase, token)
        .then((data) => setBalance(data.balance ?? null))
        .catch(() => {});
    }
    // Clear job — go back to render-ready state
    setJob(null);
    const amount = refunded ?? RENDER_COST;
    setToastMessage(`Render cancelled. ${amount} credits refunded.`);
  }

  // ── "Try Again" — keep tracks + roles, clear job + uploadIds ─────────────

  function handleTryAgain() {
    clearJob();
    clearUploadIds();
  }

  // ── "Start Over" — full reset ─────────────────────────────────────────────

  function handleStartOver() {
    resetAll();
  }

  // ── "Try Another Arrangement" — clear job + uploadIds, keep tracks + roles ─

  function handleTryAnother() {
    clearJob();
    clearUploadIds();
  }

  // ── Dismiss toast ─────────────────────────────────────────────────────────

  const dismissToast = useCallback(() => setToastMessage(null), []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const rendersRemaining = balance != null ? Math.floor(balance / RENDER_COST) : null;

  const jobStatus = job?.status ?? null;
  const isProcessing = jobStatus === 'processing';
  const isError = jobStatus === 'failed' || jobStatus === 'refunded' || jobStatus === 'cancelled';
  const isReady = jobStatus === 'ready' && !job?.stemsExpired;
  const showRenderButton = !isProcessing && !isError && !isReady;

  if (authLoading) {
    return <div style={{ background: "#080810", minHeight: "100vh" }} />;
  }

  if (!token) return null;

  return (
    <div className={styles.page}>
      <div className={pageStyles.pageInnerWide}>

        {/* ─── Top bar ─── */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Link to="/" className={styles.wordmark}>
              STEVEN ANGEL <span className={styles.wordmarkAccent}>TOOLS</span>
            </Link>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link to="/tools/mashup">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: "#00E5FF" }}>
                  MASHUP
                </span>
              </Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span>Generator</span>
            </nav>
          </div>

          <div className={styles.topBarRight}>
            {!balanceLoading && balance != null && (
              <span className={styles.balanceChip}>
                <span>{balance}</span>{" "}credits
                {rendersRemaining != null && (
                  <> &middot; <span>{rendersRemaining}</span>{" "}
                  {rendersRemaining === 1 ? "mashup" : "mashups"}</>
                )}
              </span>
            )}
            {balanceLoading && (
              <span className={styles.balanceChip} style={{ color: "rgba(255,255,255,0.3)" }}>
                Loading balance...
              </span>
            )}
            {user?.email && (
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
              }}>
                {user.email}
              </span>
            )}
          </div>
        </div>

        {/* ─── Main layout ─── */}
        <div className={pageStyles.layout}>

          {/* Left column */}
          <div className={pageStyles.leftCol}>

            {/* Track panels side-by-side */}
            <div className={pageStyles.tracksRow}>
              <TrackPanel slot="a" />
              <TrackPanel slot="b" />
            </div>

            {/* Mini DAW */}
            <MiniDaw className={pageStyles.dawBlock} />

            {/* Render area — conditionally shows button / progress / error / output */}
            <div className={pageStyles.renderArea}>

              {/* Render button (default idle state) */}
              {showRenderButton && (
                <RenderButton
                  tracks={tracks}
                  roles={roles}
                  balance={balance}
                  onClick={handleRender}
                />
              )}

              {/* Processing state */}
              {isProcessing && (
                <RenderProgressIndicator
                  job={job}
                  token={token}
                  apiBase={apiBase}
                  onCancelled={handleCancelled}
                  onToast={setToastMessage}
                />
              )}

              {/* Error / cancelled / refunded state */}
              {isError && (
                <RenderErrorBanner
                  job={job}
                  onTryAgain={handleTryAgain}
                  onStartOver={handleStartOver}
                />
              )}

              {/* Ready state */}
              {isReady && (
                <OutputPanel
                  job={job}
                  onTryAnother={handleTryAnother}
                  onNewMashup={handleStartOver}
                />
              )}

            </div>

          </div>

          {/* Right column — AI Director (desktop only; hidden via CSS at <=900px) */}
          <div className={pageStyles.rightCol}>
            <div className={pageStyles.aiDirectorPanel}>
              <AIDirectorChat />
            </div>
          </div>

        </div>

      </div>

      {/* ─── Insufficient credits modal — mounted at page root ─── */}
      {insufficientCredits && (
        <InsufficientCreditsModal
          required={insufficientCredits.required}
          available={insufficientCredits.available}
          onDismiss={() => setInsufficientCredits(null)}
        />
      )}

      {/* ─── Toast notifications ─── */}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={dismissToast} />
      )}

      {/* ─── AI Director chat modal (mobile, rendered when open) ─── */}
      {chatModalOpen && (
        <AIDirectorChat
          modalMode
          onClose={() => setChatModalOpen(false)}
        />
      )}

      {/* ─── Floating AI Director button (mobile-only, visible via CSS at <=900px) ─── */}
      <AIDirectorFloatingButton
        isOpen={chatModalOpen}
        onToggle={() => setChatModalOpen((v) => !v)}
      />

    </div>
  );
}
