/**
 * MashupJobPage.jsx — Job status + polling page
 *
 * Reads :jobId from useParams().
 * Auth-required. Polls GET /mashup/jobs/:jobId every 3 seconds while
 * status === 'processing' (or 'queued'). Stops on 'ready'/'failed'/'refunded'.
 *
 * States rendered:
 *   processing/queued  — animated pulse + estimated time
 *   ready              — stem download links
 *   failed/refunded    — error banner + auto-refund reassurance + start-over link
 *
 * No emoji anywhere.
 */

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../shop/AuthContext.jsx";
import { getJob } from "./lib/api.js";
import styles from "./styles.module.css";

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(["ready", "failed", "refunded"]);

// Stem kinds in the order we present download links
const STEM_KINDS = [
  { key: "vocalsUrl",    label: "Vocals",         kind: "vocals"    },
  { key: "noVocalsUrl", label: "No Vocals",       kind: "no-vocals" },
  { key: "drumsUrl",    label: "Drums",           kind: "drums"     },
  { key: "bassUrl",     label: "Bass",            kind: "bass"      },
  { key: "otherUrl",    label: "Other",           kind: "other"     },
];

export default function MashupJobPage() {
  const { jobId } = useParams();
  const { token, user, loading: authLoading, apiBase } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const pollRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate(`/shop/login?return=/tools/mashup/jobs/${encodeURIComponent(jobId)}`, {
        replace: true,
      });
    }
  }, [token, authLoading, navigate, jobId]);

  // Polling effect
  useEffect(() => {
    if (!token || !jobId) return;

    let cancelled = false;

    async function poll() {
      try {
        const data = await getJob(apiBase, token, jobId);
        if (cancelled) return;

        setJob(data);
        setLoadError(null);
        setLoading(false);

        if (TERMINAL_STATUSES.has(data.status)) {
          // Stop polling
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.message || "Could not load job status");
        setLoading(false);
        // Stop polling on hard errors (e.g. 404 — job not found / not owned)
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    // Initial fetch immediately, then poll
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [token, jobId, apiBase]);

  // Stop polling once we reach a terminal state (also guarded above but
  // belt-and-suspenders in case setJob and the interval race)
  useEffect(() => {
    if (job && TERMINAL_STATUSES.has(job.status) && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [job]);

  if (authLoading) {
    return <div style={{ background: "#080810", minHeight: "100vh" }} />;
  }

  if (!token) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>

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
              <span>Job</span>
            </nav>
          </div>
          <div className={styles.topBarRight}>
            {user?.email && (
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {user.email}
              </span>
            )}
          </div>
        </div>

        {/* ─── Job ID pill ─── */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 24,
        }}>
          Job ID: {jobId}
        </div>

        {/* ─── Loading ─── */}
        {loading && !loadError && (
          <div className={styles.panel}>
            <div className={styles.jobStatusBox}>
              <span className={styles.processingDot} />
              <span className={styles.loadingText}>Loading job status...</span>
            </div>
          </div>
        )}

        {/* ─── Error loading job ─── */}
        {loadError && (
          <div className={styles.panel}>
            <div className={styles.errorBanner}>
              <div className={styles.errorBannerTitle}>Could not load job</div>
              <div>{loadError}</div>
            </div>
            <div className={styles.centeredActions}>
              <Link to="/tools/mashup" className={styles.btnOutline}>
                Back to Mashup Generator
              </Link>
            </div>
          </div>
        )}

        {/* ─── Job loaded: render by status ─── */}
        {!loading && !loadError && job && (
          <>
            {/* Processing / queued */}
            {(job.status === "processing" || job.status === "queued") && (
              <div className={styles.panel}>
                <div className={styles.jobStatusBox}>
                  <span className={styles.jobStatusLabel}>Status</span>
                  <div className={styles.jobStatusText}>
                    <span className={styles.processingDot} />
                    Processing...
                  </div>
                  <div className={styles.jobStatusSub}>
                    Roughly 30 to 60 seconds remaining.
                    <br />
                    You can leave this page and come back — your job will still be here.
                  </div>
                </div>
              </div>
            )}

            {/* Ready */}
            {job.status === "ready" && (
              <div className={styles.panel}>
                <div style={{ marginBottom: 24, textAlign: "center" }}>
                  <span className={styles.jobStatusLabel}>Status</span>
                  <div className={styles.jobStatusText} style={{ color: "#00E5FF" }}>
                    Your mashup is ready
                  </div>
                  <div className={styles.jobStatusSub}>
                    Download your stems below.
                  </div>
                </div>

                <div className={styles.stemList}>
                  {STEM_KINDS.map(({ key, label, kind }) => {
                    const url = job[key];
                    if (!url) return null;
                    return (
                      <div className={styles.stemItem} key={kind}>
                        <span className={styles.stemName}>{label}</span>
                        <a
                          href={url}
                          download
                          className={styles.btnOutline}
                          style={{ padding: "8px 20px", fontSize: 12 }}
                        >
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.centeredActions}>
                  <Link to="/tools/mashup" className={styles.btnPrimary}>
                    Create another mashup
                  </Link>
                </div>
              </div>
            )}

            {/* Failed or refunded */}
            {(job.status === "failed" || job.status === "refunded") && (
              <div className={styles.panel}>
                <div className={styles.errorBanner}>
                  <div className={styles.errorBannerTitle}>Render failed</div>
                  <div>
                    {job.errorMessage || "Something went wrong during rendering."}
                  </div>
                  <div style={{ marginTop: 10, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                    Your 6 credits were refunded automatically.
                  </div>
                </div>

                <div className={styles.centeredActions}>
                  <Link to="/tools/mashup" className={styles.btnPrimary}>
                    Start over
                  </Link>
                  <Link to="/tools/mashup/credits" className={styles.btnLink}>
                    Check credit balance
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
