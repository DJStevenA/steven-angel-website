/**
 * TrackPanel.jsx — Single track upload + analysis card (Track A or Track B)
 *
 * Receives `slot: 'a' | 'b'` prop. Self-contained card with 4 states:
 *   1. Empty — drag-drop zone / browse
 *   2. Uploading — progress bar + cancel
 *   3. Loaded — BPM / KEY / DROPS stats + role assignment buttons
 *
 * Upload flow:
 *   file selected -> AudioContext.decodeAudioData -> setTrack -> POST /mashup/upload-url
 *   -> uploadToR2 (with progress) -> on 2xx: detectBPM + detectKey + detectDrops in parallel
 *   -> update state with analysis results
 *
 * No emoji anywhere. Brand: Barlow Condensed labels, DM Sans body, cyan/purple accents.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import useMashupState from '../useMashupState.js';
import { getUploadUrl } from '../lib/api.js';
import { uploadToR2 } from '../lib/uploadProgress.js';
import { detectBPM, detectKey, detectDrops } from '../lib/audioAnalysis.js';
import { applySync } from '../lib/soundTouchSync.js';
import { useAuth } from '../../../shop/AuthContext.jsx';
import styles from './TrackPanel.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatKey(key) {
  if (!key) return '--';
  return key;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatTile({ value, label, color }) {
  return (
    <div className={styles.statTile}>
      <span
        className={styles.statValue}
        style={{ color: color || '#00E5FF' }}
      >
        {value ?? '--'}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * @param {{ slot: 'a'|'b' }} props
 */
export default function TrackPanel({ slot }) {
  const { token, apiBase } = useAuth();
  const fileInputRef = useRef(null);
  const xhrRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'decoding' | 'uploading' | 'analyzing' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Store reads
  const track = useMashupState((s) => s.tracks[slot]);
  const roles = useMashupState((s) => s.roles);
  const uploadIds = useMashupState((s) => s.uploadIds);

  // Store writes
  const setTrack = useMashupState((s) => s.setTrack);
  const setRole = useMashupState((s) => s.setRole);
  const setDrops = useMashupState((s) => s.setDrops);
  const setUploadId = useMashupState((s) => s.setUploadId);

  // Sync setters for applySync
  const setProcessedVocal = useMashupState((s) => s.setProcessedVocal);
  const setSyncApplied = useMashupState((s) => s.setSyncApplied);
  const setSyncProcessing = useMashupState((s) => s.setSyncProcessing);
  const setPlannedSync = useMashupState((s) => s.setPlannedSync);

  const isVocal = roles.vocal === slot;
  const isInstr = roles.instr === slot;

  const slotLabel = slot === 'a' ? 'TRACK A' : 'TRACK B';
  const slotColor = slot === 'a' ? '#00E5FF' : '#BB86FC';
  const dropZoneText = slot === 'a' ? 'DROP TRACK A HERE' : 'DROP TRACK B HERE';

  // ---------------------------------------------------------------------------
  // Remove track
  // ---------------------------------------------------------------------------

  const handleRemove = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setTrack(slot, null);
    setDrops(slot, []);
    setUploadState('idle');
    setUploadProgress(0);
    setErrorMsg('');
  }, [slot, setTrack, setDrops]);

  // ---------------------------------------------------------------------------
  // Upload + analysis flow
  // ---------------------------------------------------------------------------

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!token) {
      window.location.replace(`/shop/login?return=/tools/mashup`);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['mp3', 'wav', 'aiff', 'aif', 'flac', 'ogg', 'm4a'];
    if (!allowedExts.includes(ext)) {
      setErrorMsg('Unsupported file type. Use MP3, WAV, AIFF, FLAC, OGG, or M4A.');
      setUploadState('error');
      return;
    }

    setErrorMsg('');
    setUploadProgress(0);
    setUploadState('decoding');

    // 1. Decode AudioBuffer
    let audioBuffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      ctx.close();
    } catch (err) {
      setErrorMsg('Could not decode audio file. Try a different format.');
      setUploadState('error');
      return;
    }

    // 2. Set track in store with basic info (buffer available for waveform rendering).
    // Store the raw File too so renderFlow's fallback upload path has it if the
    // user hits Render before this TrackPanel's own upload finishes.
    setTrack(slot, {
      file,
      name: file.name,
      buffer: audioBuffer,
      duration: audioBuffer.duration,
      bpm: null,
      key: null,
      keyPc: null,
      drops: [],
      size: file.size,
    });

    // 3. Get upload URL from backend
    setUploadState('uploading');
    let uploadUrl, uploadKey;
    try {
      // Reuse the shared uploadId if already set (both tracks share same upload session)
      const sharedUploadId = uploadIds.a || uploadIds.b || undefined;
      const data = await getUploadUrl(apiBase, token, {
        uploadId: sharedUploadId,
        role: slot,
        contentType: file.type || 'application/octet-stream',
        ext,
      });
      uploadUrl = data.uploadUrl;
      uploadKey = data.key;
      // Store the uploadId so the other track can reuse it
      setUploadId(slot, data.key);
    } catch (err) {
      setErrorMsg('Could not get upload URL. Check your connection.');
      setUploadState('error');
      return;
    }

    // 4. Upload to R2
    try {
      const { xhr, promise } = uploadToR2(file, uploadUrl, ({ percent }) => {
        setUploadProgress(percent);
      });
      xhrRef.current = xhr;
      await promise;
      xhrRef.current = null;
    } catch (err) {
      if (err?.body === 'Upload cancelled') {
        // User cancelled — reset state
        setUploadState('idle');
        setUploadProgress(0);
        return;
      }
      setErrorMsg('Upload failed. Please try again.');
      setUploadState('error');
      return;
    }

    // 5. Run analysis in parallel
    setUploadState('analyzing');
    let bpmResult, keyResult, dropsResult;
    try {
      [bpmResult, keyResult, dropsResult] = await Promise.all([
        detectBPM(audioBuffer),
        detectKey(audioBuffer),
        Promise.resolve(detectDrops(audioBuffer)),
      ]);
    } catch (err) {
      // Analysis failure is non-fatal — continue with null values
      bpmResult = { bpm: null };
      keyResult = { key: null, keyPc: null };
      dropsResult = [];
    }

    // 6. Update track with analysis results (preserve file reference for renderFlow)
    setTrack(slot, {
      file,
      name: file.name,
      buffer: audioBuffer,
      duration: audioBuffer.duration,
      bpm: bpmResult.bpm,
      key: keyResult.key,
      keyPc: keyResult.keyPc,
      size: file.size,
      uploadKey,
    });
    setDrops(slot, dropsResult);
    setUploadState('done');

    // 7. If both roles are assigned, trigger sync
    const currentRoles = useMashupState.getState().roles;
    if (currentRoles.vocal && currentRoles.instr) {
      applySync(
        useMashupState.getState,
        { setProcessedVocal, setSyncApplied, setSyncProcessing, setPlannedSync }
      ).catch(() => {});
    }
  }, [token, apiBase, slot, uploadIds, setTrack, setDrops, setUploadId, setProcessedVocal, setSyncApplied, setSyncProcessing, setPlannedSync]);

  // ---------------------------------------------------------------------------
  // Drag-drop handlers
  // ---------------------------------------------------------------------------

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [processFile]);

  // ---------------------------------------------------------------------------
  // Cancel upload
  // ---------------------------------------------------------------------------

  const handleCancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploadState('idle');
    setUploadProgress(0);
    setTrack(slot, null);
  }, [slot, setTrack]);

  // ---------------------------------------------------------------------------
  // Role assignment
  // ---------------------------------------------------------------------------

  const handleRoleClick = useCallback((role) => {
    const currentRoles = useMashupState.getState().roles;
    // If this slot already has this role, unassign
    if (currentRoles[role] === slot) {
      setRole(role, null);
      return;
    }
    setRole(role, slot);

    // Trigger sync if both roles now assigned
    const newRoles = useMashupState.getState().roles;
    if (newRoles.vocal && newRoles.instr) {
      applySync(
        useMashupState.getState,
        { setProcessedVocal, setSyncApplied, setSyncProcessing, setPlannedSync }
      ).catch(() => {});
    }
  }, [slot, setRole, setProcessedVocal, setSyncApplied, setSyncProcessing, setPlannedSync]);

  // ---------------------------------------------------------------------------
  // Determine current view state
  // ---------------------------------------------------------------------------

  const isLoaded = track && (uploadState === 'done' || (track.buffer && uploadState === 'idle'));
  const isUploading = uploadState === 'uploading' || uploadState === 'decoding' || uploadState === 'analyzing';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`${styles.panel} ${isVocal ? styles.panelVocal : ''} ${isInstr ? styles.panelInstr : ''}`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.aiff,.aif,.flac,.ogg,.m4a"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        aria-label={`Select audio file for ${slotLabel}`}
      />

      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.colorDot}
            style={{ background: slotColor }}
            aria-hidden="true"
          />
          <span className={styles.trackLabel}>{slotLabel}</span>
        </div>
        {(isLoaded || isUploading) && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label={`Remove ${slotLabel}`}
          >
            X
          </button>
        )}
      </div>

      {/* Error message */}
      {uploadState === 'error' && (
        <div className={styles.errorMsg} role="alert">
          {errorMsg}
        </div>
      )}

      {/* Empty state */}
      {!isLoaded && !isUploading && uploadState !== 'error' && (
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBrowseClick(); }}
          aria-label={`Drop audio file or click to browse for ${slotLabel}`}
        >
          <span className={styles.dropZoneTitle}>{dropZoneText}</span>
          <span className={styles.dropZoneHint}>or BROWSE FILES</span>
          <span className={styles.dropZoneFormats}>MP3 / WAV / AIFF / FLAC</span>
        </div>
      )}

      {/* Error state — show drop zone with error */}
      {uploadState === 'error' && (
        <div
          className={`${styles.dropZone} ${styles.dropZoneError}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBrowseClick(); }}
          aria-label={`Try again — drop audio file or click to browse for ${slotLabel}`}
        >
          <span className={styles.dropZoneTitle}>TRY AGAIN</span>
          <span className={styles.dropZoneHint}>BROWSE FILES</span>
        </div>
      )}

      {/* Uploading state */}
      {isUploading && (
        <div className={styles.uploadingState}>
          <div className={styles.uploadFileName}>
            {track?.name ?? 'Loading...'}
          </div>
          <div className={styles.uploadMeta}>
            {track?.size ? formatFileSize(track.size) : ''}
            {uploadState === 'decoding' && (
              <span className={styles.uploadPhase}>DECODING</span>
            )}
            {uploadState === 'uploading' && (
              <span className={styles.uploadPhase}>UPLOADING</span>
            )}
            {uploadState === 'analyzing' && (
              <span className={styles.uploadPhase}>ANALYZING</span>
            )}
          </div>

          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadProgress}
            aria-label="Upload progress"
          >
            <div
              className={styles.progressFill}
              style={{ width: `${uploadState === 'analyzing' ? 100 : uploadProgress}%` }}
            />
          </div>
          {uploadState === 'uploading' && (
            <div className={styles.uploadProgressLabel}>
              {uploadProgress}%
            </div>
          )}

          {uploadState === 'uploading' && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancelUpload}
            >
              CANCEL UPLOAD
            </button>
          )}
        </div>
      )}

      {/* Loaded state */}
      {isLoaded && (
        <div className={styles.loadedState}>
          <div className={styles.loadedFileName}>
            {track.name}
          </div>
          <div className={styles.loadedMeta}>
            {track.size ? formatFileSize(track.size) : ''}
            {track.duration ? ` — ${Math.floor(track.duration / 60)}:${String(Math.round(track.duration % 60)).padStart(2, '0')}` : ''}
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <StatTile
              value={track.bpm ? track.bpm.toFixed(1) : '--'}
              label="BPM"
              color="#00E5FF"
            />
            <StatTile
              value={formatKey(track.key)}
              label="KEY"
              color={slot === 'a' ? '#00E5FF' : '#BB86FC'}
            />
            <StatTile
              value={useMashupState.getState().drops[slot]?.length ?? 0}
              label="DROPS DETECTED"
              color="rgba(255,255,255,0.6)"
            />
          </div>

          {/* Role assignment */}
          <div className={styles.roleRow}>
            <button
              type="button"
              className={`${styles.roleBtn} ${isVocal ? styles.roleBtnVocalActive : styles.roleBtnVocalOutline}`}
              onClick={() => handleRoleClick('vocal')}
              aria-pressed={isVocal}
              aria-label={`${isVocal ? 'Unassign' : 'Assign'} vocal role to ${slotLabel}`}
            >
              VOCAL
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${isInstr ? styles.roleBtnInstrActive : styles.roleBtnInstrOutline}`}
              onClick={() => handleRoleClick('instr')}
              aria-pressed={isInstr}
              aria-label={`${isInstr ? 'Unassign' : 'Assign'} instrumental role to ${slotLabel}`}
            >
              INSTR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
