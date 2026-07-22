import { tmdb } from "./api";
import type { TmdbMovie, TmdbMultiSearchResult, TmdbPaginated, TmdbPerson, TmdbTimeWindow, TmdbTvShow } from "@/types";

export const trendingService = {
  async all(timeWindow: TmdbTimeWindow = "week", page = 1): Promise<TmdbMultiSearchResult[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMultiSearchResult>>(`/trending/all/${timeWindow}`, { params: { page } });
    return data.results;
  },

  async movies(timeWindow: TmdbTimeWindow = "week", page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>(`/trending/movie/${timeWindow}`, { params: { page } });
    return data.results;
  },

  async tv(timeWindow: TmdbTimeWindow = "week", page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>(`/trending/tv/${timeWindow}`, { params: { page } });
    return data.results;
  },

  async people(timeWindow: TmdbTimeWindow = "week", page = 1): Promise<TmdbPerson[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbPerson>>(`/trending/person/${timeWindow}`, { params: { page } });
    return data.results;
  },
};
