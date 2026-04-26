import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { trackAudioPreview } from "../lib/analytics/events";

/**
 * ShopPlayerContext — single audio engine for the Shop sticky player.
 *
 * Context value:
 *   currentTrack  — null | { id, title, subtitle, audioUrl, coverUrl }
 *   isPlaying     — boolean
 *   currentTime   — number (seconds)
 *   duration      — number (seconds)
 *   playTrack(track) — load + play a track (switches if different)
 *   pauseTrack()     — pause current track
 *   closeTrack()     — stop + clear (hides the bar)
 *   seek(t)          — seek to t seconds
 */

const ShopPlayerContext = createContext(null);

export function ShopPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Phase 2: audio preview threshold tracking (refs avoid stale closures in once-mounted effect)
  const audioThresholds = useRef(new Set());
  const activeTrackData = useRef(null);

  // Wire up audio element listeners once on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // O(1) threshold checks
      const pct = audio.duration ? audio.currentTime / audio.duration : 0;
      const td = activeTrackData.current;
      if (td) {
        const marks = [['25', 0.25], ['50', 0.5], ['75', 0.75]];
        for (const [label, threshold] of marks) {
          if (pct >= threshold && !audioThresholds.current.has(label)) {
            audioThresholds.current.add(label);
            trackAudioPreview(label, { track_id: td.id, track_name: td.title, genre: td.genre });
          }
        }
      }
    };
    const onLoadedMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      const td = activeTrackData.current;
      if (td && !audioThresholds.current.has('complete')) {
        audioThresholds.current.add('complete');
        trackAudioPreview('complete', { track_id: td.id, track_name: td.title, genre: td.genre });
      }
      audioThresholds.current = new Set();
    };
    const onPause = () => setIsPlaying(false);
    const onPlay = () => {
      setIsPlaying(true);
      const td = activeTrackData.current;
      if (td && !audioThresholds.current.has('start')) {
        audioThresholds.current.add('start');
        trackAudioPreview('start', { track_id: td.id, track_name: td.title, genre: td.genre });
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  const playTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If same track — just resume
    if (currentTrack && currentTrack.id === track.id) {
      audio.play();
      return;
    }

    // Different track — switch; CRITICAL: reset threshold Set before new track loads
    audioThresholds.current = new Set();
    activeTrackData.current = { id: track.id, title: track.title, genre: track.genre };
    audio.pause();
    audio.src = track.audioUrl;
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(track);

    audio.play().catch(() => {
      // Autoplay blocked — still show bar, user clicks play again
      setIsPlaying(false);
    });
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
  }, []);

  const closeTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = useCallback((t) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  return (
    <ShopPlayerContext.Provider value={{ currentTrack, isPlaying, currentTime, duration, playTrack, pauseTrack, closeTrack, seek }}>
      {children}
      {/* Single shared audio element — lives here, never re-mounts */}
      <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />
    </ShopPlayerContext.Provider>
  );
}

export function useShopPlayer() {
  const ctx = useContext(ShopPlayerContext);
  if (!ctx) throw new Error("useShopPlayer must be used inside <ShopPlayerProvider>");
  return ctx;
}
