import { create } from "zustand";

import { readProgress, writeProgress, type VidkingPlayerEventData } from "@/lib/vidking";
import { recordContinue, removeContinue } from "@/lib/continueWatching";
import type { MediaType } from "@/types";

interface PlayerSession {
  isOpen: boolean;
  mediaType: MediaType | null;
  tmdbId: number | null;
  title: string | null;
  posterPath: string | null;
  season: number | null;
  episode: number | null;
  serverId: string;
  /** Initial position to resume from (seconds). Passed to Vidking via ?progress. */
  resumeAt: number;
  /** Player options */
  color: string;
  autoPlay: boolean;
  nextEpisode: boolean;
  episodeSelector: boolean;
  /** Live runtime state, updated from postMessage events */
  currentTime: number;
  duration: number;
  progressPct: number;
  lastEvent: VidkingPlayerEventData["event"] | null;
  /** Throttle */
  _lastTrackedAt: number;
  _trackInflight: boolean;
}

interface PlayerActions {
  open: (params: {
    mediaType: MediaType;
    tmdbId: number;
    title: string;
    posterPath?: string | null;
    season?: number;
    episode?: number;
    serverId?: string;
    color?: string;
    autoPlay?: boolean;
    nextEpisode?: boolean;
    episodeSelector?: boolean;
    resumeAt?: number;
  }) => void;
  close: () => void;
  setServer: (id: string) => void;
  setEpisode: (season: number, episode: number) => void;
  goToNextEpisode: () => void;
  handleVidkingEvent: (data: VidkingPlayerEventData) => void;
}

type PlayerState = PlayerSession & PlayerActions;

const SERVER_STORAGE_KEY = "onewatch_server";

function loadSavedServer(): string {
  if (typeof window === "undefined") return "zxc";
  try {
    return localStorage.getItem(SERVER_STORAGE_KEY) ?? "zxc";
  } catch {
    return "zxc";
  }
}

const initial: PlayerSession = {
  isOpen: false,
  mediaType: null,
  tmdbId: null,
  title: null,
  posterPath: null,
  season: null,
  episode: null,
  serverId: loadSavedServer(),
  resumeAt: 0,
  color: "9146ff",
  autoPlay: true,
  nextEpisode: true,
  episodeSelector: true,
  currentTime: 0,
  duration: 0,
  progressPct: 0,
  lastEvent: null,
  _lastTrackedAt: 0,
  _trackInflight: false,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...initial,

  open({ mediaType, tmdbId, title, posterPath = null, season, episode, serverId, color, autoPlay, nextEpisode, episodeSelector, resumeAt }) {
    const resolvedSeason = season ?? (mediaType === "tv" ? 1 : null);
    const resolvedEpisode = episode ?? (mediaType === "tv" ? 1 : null);

    const saved = readProgress(mediaType, tmdbId, resolvedSeason ?? undefined, resolvedEpisode ?? undefined);
    let resume = resumeAt ?? 0;
    if (resume === 0 && saved && saved.currentTime > 5 && saved.progress < 0.95) {
      resume = Math.floor(saved.currentTime);
    }

    set({
      ...initial,
      isOpen: true,
      mediaType,
      tmdbId,
      title,
      posterPath,
      season: resolvedSeason,
      episode: resolvedEpisode,
      serverId: serverId ?? initial.serverId,
      color: color ?? initial.color,
      autoPlay: autoPlay ?? initial.autoPlay,
      nextEpisode: nextEpisode ?? initial.nextEpisode,
      episodeSelector: episodeSelector ?? initial.episodeSelector,
      resumeAt: resume,
    });

    // Add to "Continue Watching" as soon as playback starts. Embed providers do
    // not all emit progress events, so we can't rely solely on handleVidkingEvent.
    if (!(saved && saved.progress >= 0.95)) {
      recordContinue({
        mediaType,
        tmdbId,
        title,
        posterPath,
        season: resolvedSeason,
        episode: resolvedEpisode,
        currentTime: saved?.currentTime ?? resume,
        duration: saved?.duration ?? 0,
        progress: saved?.progress ?? 0,
        updatedAt: Date.now(),
      });
    }
  },

  close() {
    set({ ...initial, serverId: get().serverId });
  },

  setServer(id: string) {
    set({ serverId: id });
    try { localStorage.setItem(SERVER_STORAGE_KEY, id); } catch { /* ignore */ }
  },

  setEpisode(season, episode) {
    const s = get();
    if (!s.mediaType || !s.tmdbId) return;
    const saved = readProgress(s.mediaType, s.tmdbId, season, episode);
    set({
      season,
      episode,
      resumeAt: saved && saved.progress < 0.95 ? Math.floor(saved.currentTime) : 0,
      currentTime: 0,
      duration: 0,
      progressPct: 0,
      lastEvent: null,
      _lastTrackedAt: 0,
    });
  },

  goToNextEpisode() {
    const s = get();
    if (s.mediaType !== "tv" || s.season === null || s.episode === null) return;
    get().setEpisode(s.season, s.episode + 1);
  },

  handleVidkingEvent(data) {
    const s = get();
    if (!s.mediaType || !s.tmdbId) return;
    if (String(s.tmdbId) !== String(data.id)) return;

    set({
      currentTime: data.currentTime,
      duration: data.duration,
      progressPct: data.progress,
      lastEvent: data.event,
    });

    // Resume position is persisted locally (no backend account required).
    writeProgress(s.mediaType, s.tmdbId, {
      currentTime: data.currentTime,
      duration: data.duration,
      progress: data.progress,
      updatedAt: data.timestamp ?? Date.now(),
      season: data.season,
      episode: data.episode,
    });

    // Maintain the localStorage "Continue Watching" index: keep in-progress
    // titles, drop finished ones (>=95%).
    if (data.duration > 0) {
      if (data.progress >= 0.95) {
        removeContinue(s.mediaType, s.tmdbId);
      } else if (data.currentTime > 3) {
        recordContinue({
          mediaType: s.mediaType,
          tmdbId: s.tmdbId,
          title: s.title ?? "",
          posterPath: s.posterPath,
          season: data.season ?? s.season ?? null,
          episode: data.episode ?? s.episode ?? null,
          currentTime: data.currentTime,
          duration: data.duration,
          progress: data.progress,
          updatedAt: data.timestamp ?? Date.now(),
        });
      }
    }

    if (data.event === "ended" && s.mediaType === "tv" && s.nextEpisode) {
      get().goToNextEpisode();
    }
  },
}));
