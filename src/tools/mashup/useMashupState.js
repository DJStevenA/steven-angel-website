/**
 * useMashupState.js — Zustand store for the Mashup Generator
 *
 * Phase 1 fields + Phase 2A extensions.
 *
 * Phase 2A additions:
 *   - Transport slice: isPlaying, scrubAt
 *   - Volume per role: volumeVocal, volumeInstr
 *   - Stage 2 sync slice: processedVocal, syncApplied, syncProcessing, plannedSync
 *   - Chat persistence: chatMessages, addChatMessage, clearChatMessages
 *   - Zustand persist middleware (localStorage, subset of state only)
 *
 * Persist strategy:
 *   AudioBuffers and server-side job state are NOT persisted (cannot serialize).
 *   Persisted: roles, regions, effects, mute, solo, volumeVocal, volumeInstr,
 *              plannedSync, chatMessages.
 *   Storage key: "mashup_default_project"
 *   Phase 2B/2C will switch to a per-project key derived from
 *   hash(trackA.name + trackA.size + trackB.name + trackB.size + roles).
 *
 * Zustand version: v5 — uses named import { create } and persist middleware
 * from "zustand/middleware".
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const defaultRegion = { start: 0, end: 1 };
const defaultVocalRegion = { start: 0.25, end: 0.75 };

const initialState = {
  // ── Phase 1 ──────────────────────────────────────────────────────────────

  /**
   * tracks: { a: Track | null, b: Track | null }
   * Track = { name, buffer, bpm, key, keyPc, duration }
   * NOTE: not persisted (AudioBuffers are not serialisable)
   */
  tracks: { a: null, b: null },

  /**
   * roles: { vocal: 'a'|'b'|null, instr: 'a'|'b'|null }
   * Which slot is assigned to each role.
   */
  roles: { vocal: null, instr: null },

  /**
   * drops: { a: Drop[], b: Drop[] }
   * Drop = { at: 0..1, atSec, valleyAt, valleyAtSec, strength }
   */
  drops: { a: [], b: [] },

  /**
   * regions: { vocal: { start, end }, instr: { start, end } }
   * 0..1 normalised coordinates.
   */
  regions: { vocal: defaultVocalRegion, instr: defaultRegion },

  /**
   * effects: Effect[]
   * Effect = { type: 'reverb'|'fadeout'|'filter', anchorAtSec? }
   * Chat-driven effect queue.
   */
  effects: [],

  /**
   * mute / solo per role.
   */
  mute: { vocal: false, instr: false },
  solo: { vocal: false, instr: false },

  /**
   * uploadIds: track R2 upload IDs so re-render skips re-upload.
   * NOT persisted (tied to a specific session upload).
   */
  uploadIds: { a: undefined, b: undefined },

  /**
   * job: server-side render job state.
   * NOT persisted.
   */
  job: null,

  /**
   * uploadProgress: { a: number, b: number }
   * Upload percent (0-100) per track slot. Updated by renderFlow.js.
   * NOT persisted — resets on page reload.
   */
  uploadProgress: { a: 0, b: 0 },

  // ── Phase 2A — Transport ──────────────────────────────────────────────────

  /** Whether playback is currently active. */
  isPlaying: false,

  /** Normalised playhead position (0..1). */
  scrubAt: 0,

  // ── Phase 2A — Volume ─────────────────────────────────────────────────────

  /** Vocal track gain (0..1). */
  volumeVocal: 1.0,

  /** Instrumental track gain (0..1). */
  volumeInstr: 1.0,

  // ── Phase 2A — Stage 2 Sync ───────────────────────────────────────────────

  /**
   * processedVocal: AudioBuffer | null
   * The vocal AudioBuffer after SoundTouch pitch+tempo processing.
   * NOT persisted.
   */
  processedVocal: null,

  /** True when processedVocal reflects the current vocal/instr pair. */
  syncApplied: false,

  /** True while the OfflineAudioContext render is running. */
  syncProcessing: false,

  /**
   * plannedSync: { semitones: number, tempo: number } | null
   * The last computed sync plan. Persisted (just numbers, not the buffer).
   */
  plannedSync: null,

  // ── Phase 2A — Chat ───────────────────────────────────────────────────────

  /**
   * chatMessages: Message[]
   * Message = { role: 'user'|'ai', text: string, ts: number }
   * Persisted per Q3 decision.
   */
  chatMessages: [],
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const useMashupState = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Phase 1 setters ────────────────────────────────────────────────────

      /**
       * setTrack(slot: 'a'|'b', track: Track | null)
       */
      setTrack: (slot, track) =>
        set((s) => ({ tracks: { ...s.tracks, [slot]: track } })),

      /**
       * setRole(role: 'vocal'|'instr', slot: 'a'|'b'|null)
       * Assigns a slot to a role. Automatically clears the opposing assignment
       * if the same slot is being assigned to the other role.
       */
      setRole: (role, slot) =>
        set((s) => {
          const otherRole = role === "vocal" ? "instr" : "vocal";
          const newRoles = { ...s.roles, [role]: slot };
          if (newRoles[otherRole] === slot) newRoles[otherRole] = null;
          return { roles: newRoles };
        }),

      /**
       * setDrops(slot: 'a'|'b', drops: Drop[])
       */
      setDrops: (slot, drops) =>
        set((s) => ({ drops: { ...s.drops, [slot]: drops } })),

      /**
       * setRegion(which: 'vocal'|'instr', region: { start, end })
       */
      setRegion: (which, region) =>
        set((s) => ({ regions: { ...s.regions, [which]: region } })),

      /**
       * addEffect(effect: Effect)
       */
      addEffect: (effect) =>
        set((s) => ({ effects: [...s.effects, effect] })),

      /**
       * clearEffects()
       */
      clearEffects: () => set({ effects: [] }),

      /**
       * toggleMute(which: 'vocal'|'instr')
       */
      toggleMute: (which) =>
        set((s) => ({ mute: { ...s.mute, [which]: !s.mute[which] } })),

      /**
       * toggleSolo(which: 'vocal'|'instr')
       */
      toggleSolo: (which) =>
        set((s) => ({ solo: { ...s.solo, [which]: !s.solo[which] } })),

      /**
       * setUploadId(slot: 'a'|'b', id: string)
       */
      setUploadId: (slot, id) =>
        set((s) => ({ uploadIds: { ...s.uploadIds, [slot]: id } })),

      /**
       * setJob(job: Job | null)
       */
      setJob: (job) => set({ job }),

      /**
       * reset()
       * Resets the entire store to initial state.
       * uploadIds are preserved so already-uploaded R2 keys survive reset.
       * Keeps tracks so "Try Again" flow can re-render with the same files.
       */
      reset: () =>
        set((s) => ({
          ...initialState,
          uploadIds: s.uploadIds,
          tracks: s.tracks,
        })),

      /**
       * resetAll()
       * Full reset including tracks and uploadIds — used by "New Mashup".
       */
      resetAll: () => set({ ...initialState }),

      /**
       * clearJob()
       * Clears the active render job without touching tracks or roles.
       * Used by "Try Again" after a failed/cancelled render.
       */
      clearJob: () => set({ job: null }),

      /**
       * clearUploadIds()
       * Clears stored upload IDs so next render re-uploads both tracks.
       * Called together with clearJob() for a clean retry.
       */
      clearUploadIds: () => set({ uploadIds: { a: undefined, b: undefined } }),

      // ── Phase 2D — Upload progress ────────────────────────────────────────

      /**
       * uploadProgress: { a: number, b: number }
       * Percent (0-100) per track during upload. Not persisted.
       */
      // (Field is in initialState below after this block — see Phase 2D note)

      /**
       * setUploadProgress(slot: 'a'|'b', percent: number)
       * Called by renderFlow.js on each XHR progress tick.
       */
      setUploadProgress: (slot, percent) =>
        set((s) => ({
          uploadProgress: { ...s.uploadProgress, [slot]: Math.min(100, percent) },
        })),

      // ── Phase 2A — Transport setters ──────────────────────────────────────

      /**
       * setIsPlaying(v: boolean)
       */
      setIsPlaying: (v) => set({ isPlaying: !!v }),

      /**
       * setScrubAt(n: number) — clamped to 0..1
       */
      setScrubAt: (n) => set({ scrubAt: Math.max(0, Math.min(1, n)) }),

      // ── Phase 2A — Volume setters ─────────────────────────────────────────

      /**
       * setVolumeVocal(v: number) — clamped to 0..1
       */
      setVolumeVocal: (v) => set({ volumeVocal: Math.max(0, Math.min(1, v)) }),

      /**
       * setVolumeInstr(v: number) — clamped to 0..1
       */
      setVolumeInstr: (v) => set({ volumeInstr: Math.max(0, Math.min(1, v)) }),

      // ── Phase 2A — Sync setters ───────────────────────────────────────────

      /**
       * setProcessedVocal(buf: AudioBuffer | null)
       */
      setProcessedVocal: (buf) => set({ processedVocal: buf }),

      /**
       * setSyncApplied(v: boolean)
       */
      setSyncApplied: (v) => set({ syncApplied: !!v }),

      /**
       * setSyncProcessing(v: boolean)
       */
      setSyncProcessing: (v) => set({ syncProcessing: !!v }),

      /**
       * setPlannedSync(plan: { semitones: number, tempo: number } | null)
       */
      setPlannedSync: (plan) => set({ plannedSync: plan }),

      // ── Phase 2A — Chat setters ───────────────────────────────────────────

      /**
       * addChatMessage(msg: { role: 'user'|'ai', text: string, ts?: number })
       * Appends a message to the chat history.
       */
      addChatMessage: (msg) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { ...msg, ts: msg.ts ?? Date.now() },
          ],
        })),

      /**
       * clearChatMessages()
       */
      clearChatMessages: () => set({ chatMessages: [] }),

      // ── Phase 2B — Drop editor ────────────────────────────────────────────

      /**
       * updateDrop(slot: 'a'|'b', index: number, patch: Partial<Drop>)
       * Updates a single drop marker's position after user drag.
       * NOTE: drops are excluded from persist (they're recomputed on upload),
       * so drag edits only survive the session. If you want them to persist,
       * add drops to partialize() — but they can then desync if the track is
       * re-uploaded.
       */
      updateDrop: (slot, index, patch) =>
        set((state) => ({
          drops: {
            ...state.drops,
            [slot]: state.drops[slot].map((d, i) =>
              i === index ? { ...d, ...patch } : d
            ),
          },
        })),
    }),

    // ── Persist config ───────────────────────────────────────────────────────
    {
      name: "mashup_default_project",
      storage: createJSONStorage(() => localStorage),

      /**
       * partialize: only persist the subset of state that is safe to
       * serialise and meaningful to restore across page reloads.
       *
       * Excluded (not serialisable or session-only):
       *   tracks         — AudioBuffers
       *   drops          — derived from tracks; recomputed on next upload
       *   processedVocal — AudioBuffer
       *   uploadIds      — R2 upload session identifiers
       *   job            — server-side render job
       *   isPlaying      — transport state (stop on reload)
       *   scrubAt        — transport state (reset to 0 on reload)
       *   syncProcessing — transient flag
       */
      partialize: (state) => ({
        roles: state.roles,
        regions: state.regions,
        effects: state.effects,
        mute: state.mute,
        solo: state.solo,
        volumeVocal: state.volumeVocal,
        volumeInstr: state.volumeInstr,
        plannedSync: state.plannedSync,
        chatMessages: state.chatMessages,
      }),
    }
  )
);

export default useMashupState;
