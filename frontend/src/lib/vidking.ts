export type VidkingEventName = "timeupdate" | "play" | "pause" | "ended" | "seeked";

export interface VidkingPlayerEventData {
  event: VidkingEventName;
  currentTime: number;
  duration: number;
  progress: number;
  id: string;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
  timestamp: number;
}

export interface VidkingPlayerMessage {
  type: "PLAYER_EVENT";
  data: VidkingPlayerEventData;
}

export function parseVidkingMessage(raw: unknown): VidkingPlayerMessage | null {
  let payload: unknown = raw;
  if (typeof raw === "string") {
    try {
      payload = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as { type?: unknown; data?: unknown };
  if (obj.type !== "PLAYER_EVENT" || typeof obj.data !== "object" || obj.data === null) return null;
  const d = obj.data as VidkingPlayerEventData;
  if (
    typeof d.event !== "string" ||
    typeof d.currentTime !== "number" ||
    typeof d.duration !== "number" ||
    typeof d.id !== "string" ||
    (d.mediaType !== "movie" && d.mediaType !== "tv")
  ) {
    return null;
  }
  return obj as VidkingPlayerMessage;
}

// localStorage helpers — keep isolated per content so configurations don't conflict
const STORAGE_PREFIX = "vidking_progress";

export interface StoredProgress {
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: number;
  season?: number;
  episode?: number;
}

function storageKey(mediaType: "movie" | "tv", tmdbId: number | string, season?: number, episode?: number): string {
  if (mediaType === "tv") {
    return `${STORAGE_PREFIX}:tv:${tmdbId}:s${season ?? 1}e${episode ?? 1}`;
  }
  return `${STORAGE_PREFIX}:movie:${tmdbId}`;
}

export function readProgress(
  mediaType: "movie" | "tv",
  tmdbId: number | string,
  season?: number,
  episode?: number,
): StoredProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(mediaType, tmdbId, season, episode));
    return raw ? (JSON.parse(raw) as StoredProgress) : null;
  } catch {
    return null;
  }
}

export function writeProgress(
  mediaType: "movie" | "tv",
  tmdbId: number | string,
  data: StoredProgress,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(mediaType, tmdbId, data.season, data.episode),
      JSON.stringify(data),
    );
  } catch {
    // Storage full — ignore
  }
}

export function clearProgress(
  mediaType: "movie" | "tv",
  tmdbId: number | string,
  season?: number,
  episode?: number,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(mediaType, tmdbId, season, episode));
  } catch {
    // Ignore
  }
}
