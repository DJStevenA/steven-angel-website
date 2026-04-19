import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   Brand tokens
───────────────────────────────────────────── */
const CYAN    = "#00E5FF";
const PURPLE  = "#BB86FC";
const BG      = "#080810";
const BG_ALT  = "#04040f";

/* ─────────────────────────────────────────────
   Track data
───────────────────────────────────────────── */
const TRACKS = [
  // Afro Latin (5)
  { id: "el-barrio",         title: "El Barrio",          genre: "Afro Latin",  file: "/audio/el-barrio.mp3",               support: "Supported by Claptone, Hugel, Roger Sanchez", label: "MTGD" },
  { id: "la-chingada",       title: "La Chingada",        genre: "Afro Latin",  file: "/audio/la-chingada.mp3",             support: "Supported by Oscar G",                        label: "MADE IN MIAMI" },
  { id: "fuego-en-tus-ojos", title: "Fuego En Tus Ojos",  genre: "Afro Latin",  file: "/audio/fuego-en-tus-ojos.mp3",       support: "Supported by Pauza, MESTIZA",                 label: "Sony / Orianna", badge: "Beatport Top 10" },
  { id: "kante",             title: "Kante",               genre: "Afro Latin",  file: "/audio/kante.mp3",                   support: "Supported by DJ Chus",                        label: "REDOLENT" },
  { id: "body-dancin",       title: "Body Dancin",         genre: "Afro Latin",  file: "/audio/body-dancin-remix.mp3",       support: "",                                            label: "" },

  // Afro House (4)
  { id: "the-way-i-like-it", title: "The Way I Like It",  genre: "Afro House",  file: "/audio/afro-house-i-like-it.mp3",    support: "with Eran Hersh",                             label: "Godeeva" },
  { id: "jungle-walk",       title: "Jungle Walk",         genre: "Afro House",  file: "/audio/jungle-walk.mp3",             support: "Supported by Joeski, DJ Chus, Matador",       label: "Godeeva", badge: "Beatport Top 10" },
  { id: "bebe",              title: "Bebe",                genre: "Afro House",  file: "/audio/bebe.mp3",                    support: "Supported by Francis Mercier",                label: "Deep Root Records" },
  { id: "maria-maria",       title: "Maria Maria",         genre: "Afro House",  file: "/audio/maria-maria.mp3",             support: "",                                            label: "" },

  // Afro Tec (2)
  { id: "mandala-remix",     title: "Mandala (Remix)",     genre: "Afro Tec",    file: "/audio/mandala-remix.mp3",           support: "",                                            label: "MoBlack" },
  { id: "nipate-moyo",       title: "Nipate Moyo",         genre: "Afro Tec",    file: "/audio/nipate-moyo.mp3",             support: "",                                            label: "" },

  // Tech House (1)
  { id: "body-moving",       title: "Body Moving",         genre: "Tech House",  file: "/audio/body-moving.mp3",             support: "",                                            label: "" },

  // Indie Dance (2)
  { id: "disco-vibe",        title: "Disco Vibe",          genre: "Indie Dance", file: "/audio/indie-dance-disco-vibe.mp3",  support: "",                                            label: "" },
  { id: "indie-dance-hard",  title: "Indie Dance Hard",    genre: "Indie Dance", file: "/audio/indie-dance-hard.mp3",        support: "",                                            label: "" },

  // Mastering (2)
  {
    id: "la-cantadora",
    title: "Dole & Kom — La Cantadora",
    genre: "Mastering",
    file: "/audio/la-cantadora-master.mp3",
    preMasterFile: "/audio/la-cantadora-premaster.mp3",
    masterFile: "/audio/la-cantadora-master.mp3",
    support: "Feat. Cristina Escamilla Garces",
    label: "HMWL",
    hasComparison: true,
  },
  {
    id: "hernan-cattaneo",
    title: "Hernan Cattaneo & Kevin Di Serna",
    genre: "Mastering",
    file: "/audio/hernan-cattaneo-master.mp3",
    preMasterFile: "/audio/hernan-cattaneo-premaster.mp3",
    masterFile: "/audio/hernan-cattaneo-master.mp3",
    support: "",
    label: "",
    hasComparison: true,
  },
];

const GENRES = [...new Set(TRACKS.map((t) => t.genre))]; // preserves insertion order

/* ─────────────────────────────────────────────
   Internal responsive hook
───────────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

/* ─────────────────────────────────────────────
   Helper: format seconds → mm:ss
───────────────────────────────────────────── */
function fmt(secs) {
  if (!secs || !isFinite(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ─────────────────────────────────────────────
   PlayIcon / PauseIcon — tiny inline SVGs
   (no external dep)
───────────────────────────────────────────── */
function PlayIcon({ size = 14, color = CYAN }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon({ size = 14, color = CYAN }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="5" y="3" width="4" height="18" />
      <rect x="15" y="3" width="4" height="18" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   TrackPlayer
───────────────────────────────────────────── */
export default function TrackPlayer({
  defaultGenre = "Afro Latin",
  isMobile: isMobileProp,
}) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileHook;

  /* ── audio state ── */
  const audioRef          = useRef(null);
  const progressBarRef    = useRef(null);
  const [activeId,    setActiveId]    = useState(null);   // currently loaded track id
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [isSeeking,   setIsSeeking]   = useState(false);

  /* ── UI state ── */
  const [activeGenre, setActiveGenre] = useState(
    GENRES.includes(defaultGenre) ? defaultGenre : GENRES[0]
  );
  const [hoveredId, setHoveredId] = useState(null);

  // comparisonVersion: { [trackId]: 'before' | 'after' }
  // Tracks which version is active for mastering comparison tracks.
  const [comparisonVersion, setComparisonVersion] = useState({});

  const filteredTracks = TRACKS.filter((t) => t.genre === activeGenre);
  const activeTrack    = TRACKS.find((t) => t.id === activeId) || null;

  /* ── wire up <audio> events ── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded          = () => { setIsPlaying(false); setCurrentTime(0); };
    const onPlay           = () => setIsPlaying(true);
    const onPause          = () => setIsPlaying(false);

    audio.addEventListener("timeupdate",      onTimeUpdate);
    audio.addEventListener("durationchange",  onDurationChange);
    audio.addEventListener("ended",           onEnded);
    audio.addEventListener("play",            onPlay);
    audio.addEventListener("pause",           onPause);

    return () => {
      audio.removeEventListener("timeupdate",      onTimeUpdate);
      audio.removeEventListener("durationchange",  onDurationChange);
      audio.removeEventListener("ended",           onEnded);
      audio.removeEventListener("play",            onPlay);
      audio.removeEventListener("pause",           onPause);
    };
  }, [isSeeking]);

  /* ── play / pause logic ── */
  const playTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeId === track.id) {
      // toggle play/pause on same track
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
      return;
    }

    // load new track
    audio.src = track.file;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setActiveId(track.id);
    audio.play().catch(() => {});
  }, [activeId, isPlaying]);

  /* ── comparison version toggle (BEFORE / AFTER) ── */
  const playComparison = useCallback((track, version) => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = version === "before" ? track.preMasterFile : track.masterFile;
    const currentVersion = comparisonVersion[track.id];

    // If same track AND same version is already active → toggle pause
    if (activeId === track.id && currentVersion === version) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
      return;
    }

    // Load the chosen version
    audio.src = src;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setActiveId(track.id);
    setComparisonVersion((prev) => ({ ...prev, [track.id]: version }));
    audio.play().catch(() => {});
  }, [activeId, isPlaying, comparisonVersion]);

  /* ── seek bar interaction ── */
  const seek = useCallback((e) => {
    const audio = audioRef.current;
    const bar   = progressBarRef.current;
    if (!audio || !bar || !duration) return;

    const rect  = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const time  = ratio * duration;
    audio.currentTime = time;
    setCurrentTime(time);
  }, [duration]);

  const onProgressMouseDown = (e) => {
    setIsSeeking(true);
    seek(e);

    const onMove = (ev) => seek(ev);
    const onUp   = () => { setIsSeeking(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  /* touch seek */
  const onProgressTouchStart = (e) => {
    setIsSeeking(true);
    const touch = e.touches[0];
    seekTouch(touch);

    const onMove = (ev) => seekTouch(ev.touches[0]);
    const onEnd  = () => { setIsSeeking(false); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend",  onEnd); };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);
  };

  const seekTouch = (touch) => {
    const audio = audioRef.current;
    const bar   = progressBarRef.current;
    if (!audio || !bar || !duration) return;
    const rect  = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (touch.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  /* ── progress fraction (0–1) ── */
  const progress = duration > 0 ? currentTime / duration : 0;

  /* ═══════════════════════════════════════════
     Style helpers (matches project conventions)
  ═══════════════════════════════════════════ */
  const heading = (size) => ({
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1.1,
    letterSpacing: "0.04em",
    fontSize: size,
    color: "#fff",
  });

  const bodyText = {
    fontFamily: "DM Sans, sans-serif",
    fontWeight: 400,
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
  };

  const labelStyle = {
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: CYAN,
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <section
      id="listen"
      style={{
        padding:    isMobile ? "60px 20px" : "80px 60px",
        background: BG,
        borderTop:  "1px solid #0d0d0d",
        boxSizing:  "border-box",
      }}
    >
      {/* Hidden single audio element */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none" style={{ display: "none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── Section heading ── */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 44 }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>DISCOGRAPHY</div>
          <h2 style={{ ...heading(isMobile ? 28 : 40), margin: "0 0 12px" }}>
            LISTEN TO MY{" "}
            <span
              style={{
                background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              WORK
            </span>
          </h2>
          <p style={{ ...bodyText, maxWidth: 520, margin: "0 auto" }}>
            {activeGenre === "Mastering"
              ? "Mastering work for top artists. Click BEFORE and AFTER to hear the difference."
              : "Original Production & Mastering — Played by the world's top DJs."}
          </p>
        </div>

        {/* ── Genre tabs ── */}
        <div
          style={{
            display:        "flex",
            flexWrap:       "wrap",
            gap:            isMobile ? 8 : 10,
            marginBottom:   isMobile ? 24 : 32,
            justifyContent: isMobile ? "center" : "flex-start",
          }}
          role="tablist"
          aria-label="Filter by genre"
        >
          {GENRES.map((genre) => {
            const isActive = genre === activeGenre;
            return (
              <GenreTab
                key={genre}
                genre={genre}
                isActive={isActive}
                isMobile={isMobile}
                onClick={() => setActiveGenre(genre)}
              />
            );
          })}
        </div>

        {/* ── Mastering tip line ── */}
        {activeGenre === "Mastering" && (
          <div
            style={{
              fontFamily:   "DM Sans, sans-serif",
              fontSize:     isMobile ? 11 : 12,
              color:        "rgba(255,255,255,0.38)",
              fontStyle:    "italic",
              textAlign:    isMobile ? "center" : "left",
              marginBottom: isMobile ? 12 : 14,
            }}
          >
            Toggle BEFORE / AFTER on each track to hear Steven's mastering difference.
          </div>
        )}

        {/* ── Track list ── */}
        <div
          style={{
            background:   BG_ALT,
            border:       "1px solid #141420",
            borderRadius: 10,
            overflow:     "hidden",
            marginBottom: 20,
          }}
          role="list"
          aria-label={`${activeGenre} tracks`}
        >
          {filteredTracks.map((track, idx) => {
            const isActive  = activeId === track.id;
            const isHovered = hoveredId === track.id;
            const rowNum    = idx + 1;

            return (
              <TrackRow
                key={track.id}
                track={track}
                rowNum={rowNum}
                isActive={isActive}
                isPlaying={isActive && isPlaying}
                isHovered={isHovered}
                isLast={idx === filteredTracks.length - 1}
                isMobile={isMobile}
                onPlay={() => playTrack(track)}
                onPlayComparison={playComparison}
                activeComparisonVersion={comparisonVersion[track.id] || null}
                onMouseEnter={() => setHoveredId(track.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}
        </div>

        {/* ── Mini-player ── */}
        <MiniPlayer
          track={activeTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          progressBarRef={progressBarRef}
          isMobile={isMobile}
          activeComparisonVersion={activeTrack ? (comparisonVersion[activeTrack.id] || null) : null}
          onToggle={() => {
            if (!activeTrack) return;
            playTrack(activeTrack);
          }}
          onProgressMouseDown={onProgressMouseDown}
          onProgressTouchStart={onProgressTouchStart}
        />

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GenreTab — pill button
───────────────────────────────────────────── */
function GenreTab({ genre, isActive, isMobile, onClick }) {
  const [hovered, setHovered] = useState(false);

  const base = {
    fontFamily:      "Barlow Condensed, sans-serif",
    fontWeight:      700,
    fontSize:        isMobile ? 12 : 13,
    letterSpacing:   "0.18em",
    textTransform:   "uppercase",
    padding:         isMobile ? "7px 14px" : "8px 18px",
    borderRadius:    50,
    border:          isActive
                       ? `2px solid ${CYAN}`
                       : hovered
                         ? `2px solid ${CYAN}`
                         : "2px solid rgba(255,255,255,0.15)",
    background:      isActive ? CYAN : "transparent",
    color:           isActive ? "#000" : hovered ? CYAN : "rgba(255,255,255,0.6)",
    cursor:          "pointer",
    transition:      "border-color 0.18s, color 0.18s, background 0.18s",
    outline:         "none",
    whiteSpace:      "nowrap",
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={`Show ${genre} tracks`}
      style={base}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {genre}
    </button>
  );
}

/* ─────────────────────────────────────────────
   TrackRow — one track in the list
───────────────────────────────────────────── */
function TrackRow({
  track,
  rowNum,
  isActive,
  isPlaying,
  isHovered,
  isLast,
  isMobile,
  onPlay,
  onPlayComparison,
  activeComparisonVersion,
  onMouseEnter,
  onMouseLeave,
}) {
  const rowBg = isActive
    ? "rgba(0, 229, 255, 0.05)"
    : isHovered
      ? "rgba(255,255,255,0.03)"
      : "transparent";

  return (
    <div
      role="listitem"
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           isMobile ? 10 : 16,
        padding:       isMobile ? "14px 14px" : "16px 22px",
        background:    rowBg,
        borderLeft:    isActive ? `3px solid ${CYAN}` : "3px solid transparent",
        borderBottom:  isLast ? "none" : "1px solid #141420",
        cursor:        track.hasComparison ? "default" : "pointer",
        transition:    "background 0.15s, border-left-color 0.15s",
        boxSizing:     "border-box",
      }}
      onClick={track.hasComparison ? undefined : onPlay}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Row number / play-pause toggle */}
      <button
        aria-label={
          isPlaying
            ? `Pause ${track.title}`
            : `Play ${track.title}`
        }
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
        style={{
          width:      isMobile ? 28 : 32,
          height:     isMobile ? 28 : 32,
          flexShrink: 0,
          display:    track.hasComparison ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? `rgba(0,229,255,0.12)` : "transparent",
          border:     isActive ? `1px solid rgba(0,229,255,0.3)` : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          cursor:     "pointer",
          transition: "background 0.15s, border-color 0.15s",
          outline:    "none",
          padding:    0,
        }}
      >
        {isPlaying ? (
          <PauseIcon size={isMobile ? 11 : 13} color={CYAN} />
        ) : (
          isActive ? (
            <PlayIcon  size={isMobile ? 11 : 13} color={CYAN} />
          ) : (
            <span
              style={{
                fontFamily:  "Barlow Condensed, sans-serif",
                fontWeight:  700,
                fontSize:    isMobile ? 11 : 12,
                color:       "rgba(255,255,255,0.35)",
                lineHeight:  1,
                userSelect:  "none",
              }}
            >
              {rowNum}
            </span>
          )
        )}
      </button>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        8,
            flexWrap:   "wrap",
            marginBottom: (track.support || track.label) ? 4 : 0,
          }}
        >
          <span
            style={{
              fontFamily:  "Barlow Condensed, sans-serif",
              fontWeight:  700,
              fontSize:    isMobile ? 14 : 16,
              color:       isActive ? CYAN : "#fff",
              letterSpacing: "0.02em",
              whiteSpace:  "nowrap",
              overflow:    "hidden",
              textOverflow: "ellipsis",
              transition:  "color 0.15s",
            }}
          >
            {track.title}
          </span>

          {/* Label pill */}
          {track.label && (
            <LabelPill text={track.label} isMobile={isMobile} />
          )}

          {/* Beatport badge */}
          {track.badge && (
            <BeatportBadge text={track.badge} isMobile={isMobile} />
          )}
        </div>

        {/* Support / metadata row */}
        {(track.support || track.genre) && (
          <div
            style={{
              display:    "flex",
              alignItems: "center",
              gap:        8,
              flexWrap:   "wrap",
            }}
          >
            {track.support && (
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize:   isMobile ? 10 : 11,
                  color:      "rgba(255,255,255,0.38)",
                  lineHeight: 1.4,
                }}
              >
                {track.support}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Genre tag — right side, desktop only — hidden for mastering rows */}
      {!isMobile && !track.hasComparison && (
        <span
          style={{
            fontFamily:    "Barlow Condensed, sans-serif",
            fontWeight:    700,
            fontSize:      10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color:         "rgba(255,255,255,0.22)",
            whiteSpace:    "nowrap",
            flexShrink:    0,
          }}
        >
          {track.genre}
        </span>
      )}

      {/* BEFORE / AFTER comparison buttons — mastering tracks only */}
      {track.hasComparison && (
        <div
          style={{
            display:    "flex",
            gap:        isMobile ? 6 : 8,
            flexShrink: 0,
            alignItems: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ComparisonButton
            label="BEFORE"
            sublabel="Pre-Master"
            version="before"
            isActive={isActive && activeComparisonVersion === "before"}
            isPlaying={isActive && activeComparisonVersion === "before" && isPlaying}
            isMobile={isMobile}
            onClick={() => onPlayComparison(track, "before")}
          />
          <ComparisonButton
            label="AFTER"
            sublabel="Master"
            version="after"
            isActive={isActive && activeComparisonVersion === "after"}
            isPlaying={isActive && activeComparisonVersion === "after" && isPlaying}
            isMobile={isMobile}
            onClick={() => onPlayComparison(track, "after")}
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ComparisonButton — BEFORE / AFTER pill
───────────────────────────────────────────── */
function ComparisonButton({ label, sublabel, isActive, isPlaying, isMobile, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      aria-label={`${label} (${sublabel})`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            isMobile ? 4 : 5,
        fontFamily:     "Barlow Condensed, sans-serif",
        fontWeight:     700,
        fontSize:       isMobile ? 10 : 11,
        letterSpacing:  "0.18em",
        textTransform:  "uppercase",
        padding:        isMobile ? "5px 10px" : "6px 12px",
        borderRadius:   50,
        border:         isActive ? `2px solid ${CYAN}` : hovered ? `2px solid ${CYAN}` : "2px solid rgba(255,255,255,0.18)",
        background:     isActive ? CYAN : "transparent",
        color:          isActive ? "#000" : hovered ? CYAN : "rgba(255,255,255,0.55)",
        cursor:         "pointer",
        transition:     "border-color 0.15s, color 0.15s, background 0.15s",
        outline:        "none",
        whiteSpace:     "nowrap",
        flexShrink:     0,
      }}
    >
      {isActive && isPlaying ? (
        <PauseIcon size={isMobile ? 9 : 10} color={isActive ? "#000" : CYAN} />
      ) : isActive ? (
        <PlayIcon  size={isMobile ? 9 : 10} color={isActive ? "#000" : CYAN} />
      ) : null}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   LabelPill — cyan small pill
───────────────────────────────────────────── */
function LabelPill({ text, isMobile }) {
  return (
    <span
      style={{
        fontFamily:    "Barlow Condensed, sans-serif",
        fontWeight:    600,
        fontSize:      isMobile ? 9 : 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding:       "2px 8px",
        border:        "1px solid rgba(0,229,255,0.25)",
        borderRadius:  20,
        color:         CYAN,
        background:    "rgba(0,229,255,0.04)",
        whiteSpace:    "nowrap",
        flexShrink:    0,
        cursor:        "default",
        pointerEvents: "none",
      }}
    >
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────
   BeatportBadge — highlighted achievement pill
───────────────────────────────────────────── */
function BeatportBadge({ text, isMobile }) {
  return (
    <span
      style={{
        fontFamily:    "Barlow Condensed, sans-serif",
        fontWeight:    700,
        fontSize:      isMobile ? 9 : 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        padding:       "2px 10px",
        border:        `1px solid ${CYAN}`,
        borderRadius:  20,
        color:         CYAN,
        background:    "rgba(0,229,255,0.12)",
        whiteSpace:    "nowrap",
        flexShrink:    0,
        cursor:        "default",
        pointerEvents: "none",
      }}
    >
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MiniPlayer — bottom-of-section bar
───────────────────────────────────────────── */
function MiniPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  progress,
  progressBarRef,
  isMobile,
  activeComparisonVersion,
  onToggle,
  onProgressMouseDown,
  onProgressTouchStart,
}) {
  const hasTrack = !!track;

  return (
    <div
      style={{
        background:   BG_ALT,
        border:       `1px solid ${hasTrack ? "rgba(0,229,255,0.25)" : "#141420"}`,
        borderRadius: 10,
        padding:      isMobile ? "14px 16px" : "16px 22px",
        transition:   "border-color 0.25s",
        boxSizing:    "border-box",
      }}
      aria-label="Mini audio player"
    >
      {/* Empty state */}
      {!hasTrack && (
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            12,
            color:          "rgba(255,255,255,0.25)",
            fontFamily:     "Barlow Condensed, sans-serif",
            fontWeight:     600,
            fontSize:       12,
            letterSpacing:  "0.2em",
            textTransform:  "uppercase",
          }}
        >
          <PlayIcon size={14} color="rgba(255,255,255,0.2)" />
          Select a track above to listen
        </div>
      )}

      {/* Active state */}
      {hasTrack && (
        <div>
          {/* Top row: play/pause + title + times */}
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            isMobile ? 10 : 14,
              marginBottom:   10,
            }}
          >
            {/* Play / pause button */}
            <button
              aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              onClick={onToggle}
              style={{
                width:          isMobile ? 34 : 38,
                height:         isMobile ? 34 : 38,
                flexShrink:     0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                background:     `linear-gradient(135deg, ${CYAN}, #00b8d4)`,
                border:         "none",
                borderRadius:   "50%",
                cursor:         "pointer",
                boxShadow:      "0 0 18px rgba(0,229,255,0.35)",
                outline:        "none",
                padding:        0,
                transition:     "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(0,229,255,0.55)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 18px rgba(0,229,255,0.35)"; }}
            >
              {isPlaying ? (
                <PauseIcon size={isMobile ? 13 : 15} color="#000" />
              ) : (
                <PlayIcon  size={isMobile ? 13 : 15} color="#000" />
              )}
            </button>

            {/* Track title */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily:    "Barlow Condensed, sans-serif",
                  fontWeight:    700,
                  fontSize:      isMobile ? 14 : 16,
                  color:         "#fff",
                  letterSpacing: "0.02em",
                  overflow:      "hidden",
                  textOverflow:  "ellipsis",
                  whiteSpace:    "nowrap",
                }}
              >
                {track.title}
                {track.hasComparison && activeComparisonVersion && (
                  <span
                    style={{
                      fontFamily:    "DM Sans, sans-serif",
                      fontWeight:    400,
                      fontSize:      isMobile ? 10 : 11,
                      color:         CYAN,
                      marginLeft:    8,
                      letterSpacing: "0.01em",
                      textTransform: "none",
                    }}
                  >
                    {activeComparisonVersion === "before"
                      ? "· BEFORE (Pre-Master)"
                      : "· AFTER (Master)"}
                  </span>
                )}
              </div>
              {track.genre && (
                <div
                  style={{
                    fontFamily:    "Barlow Condensed, sans-serif",
                    fontWeight:    600,
                    fontSize:      10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color:         CYAN,
                    marginTop:     2,
                  }}
                >
                  {track.genre}
                </div>
              )}
            </div>

            {/* Time display */}
            <div
              style={{
                fontFamily:    "Barlow Condensed, sans-serif",
                fontWeight:    600,
                fontSize:      isMobile ? 12 : 13,
                letterSpacing: "0.06em",
                color:         "rgba(255,255,255,0.5)",
                flexShrink:    0,
                whiteSpace:    "nowrap",
              }}
            >
              {fmt(currentTime)}
              <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>/</span>
              {fmt(duration)}
            </div>
          </div>

          {/* Progress bar */}
          <div
            ref={progressBarRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={duration || 100}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${fmt(currentTime)} of ${fmt(duration)}`}
            tabIndex={0}
            style={{
              position:  "relative",
              height:    isMobile ? 5 : 6,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 4,
              cursor:    "pointer",
              userSelect: "none",
              touchAction: "none",
            }}
            onMouseDown={onProgressMouseDown}
            onTouchStart={onProgressTouchStart}
            onKeyDown={(e) => {
              const audio = document.querySelector("audio[style*='display: none']");
              if (!audio || !duration) return;
              if (e.key === "ArrowRight") { audio.currentTime = Math.min(duration, audio.currentTime + 5); }
              if (e.key === "ArrowLeft")  { audio.currentTime = Math.max(0, audio.currentTime - 5); }
            }}
          >
            {/* Filled track */}
            <div
              style={{
                position:     "absolute",
                left:         0,
                top:          0,
                height:       "100%",
                width:        `${progress * 100}%`,
                background:   `linear-gradient(90deg, ${CYAN}, #00b8d4)`,
                borderRadius: 4,
                transition:   "width 0.08s linear",
                pointerEvents: "none",
              }}
            />
            {/* Thumb */}
            <div
              style={{
                position:    "absolute",
                top:         "50%",
                left:        `${progress * 100}%`,
                transform:   "translate(-50%, -50%)",
                width:       isMobile ? 13 : 14,
                height:      isMobile ? 13 : 14,
                borderRadius: "50%",
                background:  CYAN,
                boxShadow:   `0 0 8px rgba(0,229,255,0.6)`,
                pointerEvents: "none",
                transition:  "left 0.08s linear",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
