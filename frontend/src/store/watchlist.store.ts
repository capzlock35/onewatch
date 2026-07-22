import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

import type { MediaType, WatchlistItem } from "@/types";

interface WatchlistState {
  items: WatchlistItem[];
  loaded: boolean;
  loading: boolean;

  load: () => Promise<void>;
  add: (item: Omit<WatchlistItem, "id" | "created_at">) => Promise<void>;
  remove: (id: number) => Promise<void>;
  isInWatchlist: (mediaType: MediaType, tmdbId: number) => boolean;
  find: (mediaType: MediaType, tmdbId: number) => WatchlistItem | undefined;
  reset: () => void;
}

/**
 * "My List" is stored entirely in localStorage (no account required) via
 * zustand's persist middleware, so saved titles survive reloads.
 */
export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loaded: true,
      loading: false,

      // Persisted store hydrates itself — nothing to fetch.
      async load() {
        set({ loaded: true });
      },

      async add(item) {
        if (get().isInWatchlist(item.media_type, item.tmdb_id)) return;
        const created: WatchlistItem = {
          ...item,
          id: Date.now() + Math.floor(performance.now()),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ items: [created, ...state.items] }));
        toast.success("Added to My List", { description: item.title });
      },

      async remove(id) {
        const existing = get().items.find((i) => i.id === id);
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        toast("Removed from My List", { description: existing?.title });
      },

      isInWatchlist(mediaType, tmdbId) {
        return get().items.some((i) => i.media_type === mediaType && i.tmdb_id === tmdbId);
      },

      find(mediaType, tmdbId) {
        return get().items.find((i) => i.media_type === mediaType && i.tmdb_id === tmdbId);
      },

      reset() {
        set({ items: [] });
      },
    }),
    {
      name: "watchlist",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
