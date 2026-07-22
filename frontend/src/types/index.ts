export * from "./tmdb";

export type MediaType = "movie" | "tv";

export interface WatchlistItem {
  id: number;
  media_type: MediaType;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  created_at: string;
}

export interface WatchHistoryItem {
  id: number;
  media_type: MediaType;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  season: number | null;
  episode: number | null;
  progress_seconds: number;
  duration_seconds: number;
  last_watched_at: string;
}

/** @deprecated Use TmdbPaginated from ./tmdb */
export type TmdbList<T> = import("./tmdb").TmdbPaginated<T>;
