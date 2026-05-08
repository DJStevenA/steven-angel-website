/**
 * regexDirector.js — Phase 2C
 *
 * Pure-function regex parser ported verbatim from the prototype's processCommand()
 * in AI-DAW/mashup-generator/index.html.
 *
 * I/O shape is designed to be swappable with an LLM implementation in Stage 3:
 *   processCommand(text, snapshot) -> { mutations, replyText, unrecognized }
 *
 * Stage 3 hook (same signature, async fetch instead):
 *   export async function processCommandLLM(text, snapshot) { ... }
 *
 * No emoji anywhere per platform directive.
 */

// ---------------------------------------------------------------------------
// Helpers (ported from prototype)
// ---------------------------------------------------------------------------

/**
 * fmtTime(s) — seconds to "M:SS"
 */
function fmtTime(s) {
  if (!isFinite(s) || s == null) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/**
 * regionAroundDrop(dropAtSec, secs, totalDuration)
 * Returns a 0..1 normalised region starting at the drop, spanning secs.
 * Mirrors prototype's regionAroundDrop(); receives totalDuration explicitly
 * instead of reading from state.buffers.instr.
 */
function regionAroundDrop(dropAtSec, secs, totalDuration) {
  if (!totalDuration) return { start: 0.45, end: 0.85 };
  const start = Math.max(0, dropAtSec / totalDuration);
  const end = Math.min(1, (dropAtSec + secs) / totalDuration);
  return { start, end };
}

/**
 * getDropsFromSnapshot(snapshot)
 * Mirrors prototype's getInstrDrops(): reads drops for the instr-assigned slot.
 */
function getDropsFromSnapshot(snapshot) {
  const { roles, drops } = snapshot;
  const slot = roles && roles.instr;
  if (!slot) return [];
  return (drops && drops[slot]) || [];
}

/**
 * getInstrDuration(snapshot)
 * Returns the duration of the instrumental track buffer, or 0 if not loaded.
 * snapshot.tracks[slot].duration is a number, or snapshot.tracks[slot].buffer.duration.
 */
function getInstrDuration(snapshot) {
  const { roles, tracks } = snapshot;
  const slot = roles && roles.instr;
  if (!slot || !tracks || !tracks[slot]) return 0;
  const t = tracks[slot];
  // Track object shape: { name, buffer, bpm, key, duration }
  if (t.duration != null) return t.duration;
  if (t.buffer && t.buffer.duration != null) return t.buffer.duration;
  return 0;
}

// ---------------------------------------------------------------------------
// processCommand — regex parser (Stage 1)
// ---------------------------------------------------------------------------

/**
 * processCommand(text, snapshot)
 *
 * @param {string} text  — raw user input
 * @param {Object} snapshot — { roles, drops, regions, effects, tracks }
 * @returns {{ mutations: Object, replyText: string, unrecognized: boolean }}
 *
 * mutations shape:
 *   {
 *     regions?: {
 *       vocal?: { start: number, end: number },
 *       instr?: { start: number, end: number },
 *     },
 *     effects?: Effect[] | 'clear',
 *     clearRegions?: boolean,   // true means reset both regions to defaults
 *   }
 *
 * effects: 'clear' means clearEffects(); an array means addEffect() for each.
 */
export function processCommand(text, snapshot) {
  const c = text.toLowerCase();
  const instrDrops = getDropsFromSnapshot(snapshot);
  const hasDrops = instrDrops.length > 0;
  const totalDuration = getInstrDuration(snapshot);

  let replyText = '';
  let mutations = {};
  let acted = false;

  // ── VOCAL ON DROP / CHORUS ─────────────────────────────────────────────────
  if (
    /(vocal).*(drop|chorus)/.test(c) ||
    /(drop|chorus).*(vocal)/.test(c)
  ) {
    if (hasDrops) {
      const drop = instrDrops[0];
      const region = regionAroundDrop(drop.atSec, 16, totalDuration);
      mutations = { regions: { vocal: region } };
      replyText =
        `Vocal placed on the detected drop at ${fmtTime(drop.atSec)}, running 16s.` +
        (instrDrops.length > 1
          ? ` (Found ${instrDrops.length} drops; using the first.)`
          : '');
    } else {
      mutations = { regions: { vocal: { start: 0.45, end: 0.85 } } };
      replyText =
        'No drops detected yet — placed vocal on estimated drop region (45% to 85%). Load an instrumental for accurate placement.';
    }
    acted = true;

  // ── VOCAL ON BREAK / BREAKDOWN ─────────────────────────────────────────────
  } else if (
    /(vocal).*(break|breakdown)/.test(c) ||
    /(break|breakdown).*(vocal)/.test(c)
  ) {
    if (hasDrops) {
      const drop = instrDrops[0];
      const valleyStart = drop.valleyAtSec;
      const valleyEnd = drop.atSec;
      if (totalDuration) {
        mutations = {
          regions: {
            vocal: {
              start: Math.max(0, valleyStart / totalDuration),
              end: Math.min(1, valleyEnd / totalDuration),
            },
          },
        };
        replyText =
          `Vocal placed on the breakdown before drop ${fmtTime(drop.atSec)} ` +
          `(${fmtTime(valleyStart)} to ${fmtTime(valleyEnd)}). ` +
          'The exposed section before the energy lift.';
      } else {
        mutations = { regions: { vocal: { start: 0.30, end: 0.55 } } };
        replyText = 'No drops detected — placed vocal on estimated break (30% to 55%).';
      }
    } else {
      mutations = { regions: { vocal: { start: 0.30, end: 0.55 } } };
      replyText = 'No drops detected — placed vocal on estimated break (30% to 55%).';
    }
    acted = true;

  // ── VOCAL INTRO ─────────────────────────────────────────────────────────────
  } else if (/(vocal).*(intro|start|beginning)/.test(c)) {
    mutations = { regions: { vocal: { start: 0.05, end: 0.30 } } };
    replyText = 'Vocal placed at the intro (5% to 30%). Listeners will hear the vocal hook first.';
    acted = true;

  // ── VOCAL OUTRO ─────────────────────────────────────────────────────────────
  } else if (/(vocal).*(outro|end|ending)/.test(c)) {
    mutations = { regions: { vocal: { start: 0.70, end: 0.95 } } };
    replyText = 'Vocal moved to the outro (70% to 95%). Final hook before track ends.';
    acted = true;

  // ── VOCAL CHOPS ─────────────────────────────────────────────────────────────
  } else if (/(chops|chopped)/.test(c)) {
    if (hasDrops) {
      const drop = instrDrops[0];
      const region = regionAroundDrop(drop.atSec, 4, totalDuration);
      mutations = { regions: { vocal: region } };
      replyText =
        `Vocal chops queued for drop at ${fmtTime(drop.atSec)}. ` +
        'Short, rhythmic stab in the heart of the drop.';
    } else {
      mutations = { regions: { vocal: { start: 0.45, end: 0.55 } } };
      replyText = 'No drops detected yet — chops placed on estimated drop region.';
    }
    acted = true;

  // ── REVERB BUILDUP ──────────────────────────────────────────────────────────
  } else if (
    /(reverb|verb).*(buildup|build|drop)/.test(c) ||
    /buildup/.test(c)
  ) {
    if (hasDrops) {
      const drop = instrDrops[0];
      mutations = { effects: [{ type: 'reverb', anchorAtSec: drop.atSec }] };
      replyText =
        `Reverb tail queued for the buildup before drop at ${fmtTime(drop.atSec)}. ` +
        'Will apply on render.';
    } else {
      mutations = { effects: [{ type: 'reverb' }] };
      replyText =
        'Reverb tail queued for the buildup. Will apply on render — adds space and tension before the drop.';
    }
    acted = true;

  // ── FADEOUT ─────────────────────────────────────────────────────────────────
  } else if (/(fade|fadeout|fade out)/.test(c)) {
    mutations = { effects: [{ type: 'fadeout' }] };
    replyText =
      'Vocal fadeout queued. Vocal will gracefully fade in the last 2 seconds of its region on render.';
    acted = true;

  // ── FILTER SWEEP ────────────────────────────────────────────────────────────
  } else if (/(filter|sweep|hi-?pass|low-?pass)/.test(c)) {
    mutations = { effects: [{ type: 'filter' }] };
    replyText =
      'Filter sweep queued — lowpass closing from 20kHz down to 400Hz across the track. Adds movement.';
    acted = true;

  // ── CLEAR / RESET ────────────────────────────────────────────────────────────
  } else if (/clear|reset|undo/.test(c)) {
    mutations = {
      effects: 'clear',
      clearRegions: true,
    };
    replyText = 'Cleared all effects and reset vocal section to the middle 50%.';
    acted = true;
  }

  // ── NO MATCH ────────────────────────────────────────────────────────────────
  if (!acted) {
    return {
      mutations: {},
      replyText:
        "I'm not sure I caught that. Try: 'vocal on the drop', 'vocal chops', 'reverb buildup', 'fadeout vocal', or 'filter sweep'.",
      unrecognized: true,
    };
  }

  // Append active-effects summary to reply (mirrors prototype behaviour)
  const currentEffects = (snapshot.effects || []);
  const pendingEffects =
    mutations.effects === 'clear'
      ? []
      : [
          ...currentEffects,
          ...(Array.isArray(mutations.effects) ? mutations.effects : []),
        ];

  if (pendingEffects.length > 0) {
    replyText +=
      ` Active effects: ${pendingEffects.map((f) => f.type).join(', ')}.`;
  }

  return { mutations, replyText, unrecognized: false };
}
