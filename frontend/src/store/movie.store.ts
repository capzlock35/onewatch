import { create } from "zustand";

import { movieService } from "@/services/movie.service";
import { tvService } from "@/services/tv.service";
import type { TmdbMovie, TmdbTvShow } from "@/types";

interface MovieState {
  topToday: TmdbMovie[];
  trending: TmdbMovie[];
  popular: TmdbMovie[];
  topRated: TmdbMovie[];
  nowPlaying: TmdbMovie[];
  upcoming: TmdbMovie[];
  trendingTv: TmdbTvShow[];
  popularTv: TmdbTvShow[];
  topRatedTv: TmdbTvShow[];
  byGenre: Record<number, TmdbMovie[]>;
  loaded: boolean;
  loading: boolean;

  loadHome: () => Promise<void>;
  loadGenre: (id: number) => Promise<void>;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  topToday: [],
  trending: [],
  popular: [],
  topRated: [],
  nowPlaying: [],
  upcoming: [],
  trendingTv: [],
  popularTv: [],
  topRatedTv: [],
  byGenre: {},
  loaded: false,
  loading: false,

  async loadHome() {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      const [topToday, trending, popular, topRated, nowPlaying, upcoming, trendingTv, popularTv, topRatedTv] = await Promise.all([
        movieService.trending("day"),
        movieService.trending("week"),
        movieService.popular(),
        movieService.topRated(),
        movieService.nowPlaying(),
        movieService.upcoming(),
        tvService.trending(),
        tvService.popular(),
        tvService.topRated(),
      ]);
      set({
        topToday: topToday.slice(0, 10),
        trending,
        popular,
        topRated,
        nowPlaying,
        upcoming,
        trendingTv,
        popularTv,
        topRatedTv,
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  async loadGenre(id) {
    if (get().byGenre[id]) return;
    const results = await movieService.byGenre(id);
    set((state) => ({ byGenre: { ...state.byGenre, [id]: results } }));
  },
}));
