import type { MediaType } from "@/types";

/**
 * Continue-watching history — stored ENTIRELY in localStorage (no account/backend).
 * The per-title resume position lives in lib/vidking; this richer index also keeps
 * the title + poster so the "Continue Watching" row can render real cards.
 */
export interface ContinueEntry {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  season: number | null;
  episode: number | null;
  currentTime: number;
  duration: number;
  progress: number; // 0..1
  updatedAt: number;
}

const KEY = "onewatch_continue";
const MAX = 20;
/** Fired on the window whenever the list changes, so hooks can refresh live. */
export const CONTINUE_EVENT = "onewatch:continue";

export function listContinue(): ContinueEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ContinueEntry[];
    if (!Array.isArray(arr)) return [];
    return arr.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function persist(list: ContinueEntry[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event(CONTINUE_EVENT));
  } catch {
    // storage full — ignore
  }
}

/** Upsert a title (one entry per movie / per show) with its latest position. */
export function recordContinue(entry: ContinueEntry): void {
  if (typeof window === "undefined") return;
  if (!entry.tmdbId || !entry.title) return;
  const list = listContinue().filter(
    (e) => !(e.mediaType === entry.mediaType && e.tmdbId === entry.tmdbId),
  );
  list.unshift(entry);
  persist(list);
}

export function removeContinue(mediaType: MediaType, tmdbId: number): void {
  if (typeof window === "undefined") return;
  const list = listContinue().filter(
    (e) => !(e.mediaType === mediaType && e.tmdbId === tmdbId),
  );
  persist(list);
}
