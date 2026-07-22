import { useEffect, useState } from "react";

import { CONTINUE_EVENT, listContinue, type ContinueEntry } from "@/lib/continueWatching";
import type { WatchHistoryItem } from "@/types";

/**
 * Watch history is stored ENTIRELY in localStorage (no account/backend). Titles
 * are recorded by the player as you watch (see lib/continueWatching) and read
 * back here for the "Continue Watching" row. Updates live via the CONTINUE_EVENT.
 */
function toItem(e: ContinueEntry, i: number): WatchHistoryItem {
  return {
    id: i,
    media_type: e.mediaType,
    tmdb_id: e.tmdbId,
    title: e.title,
    poster_path: e.posterPath,
    season: e.season,
    episode: e.episode,
    progress_seconds: e.currentTime,
    duration_seconds: e.duration,
    last_watched_at: new Date(e.updatedAt).toISOString(),
  };
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const refresh = () =>
      setHistory(
        listContinue()
          .filter((e) => e.progress < 0.95)
          .map(toItem),
      );
    refresh();
    window.addEventListener(CONTINUE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(CONTINUE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return { history, loading: false };
}
