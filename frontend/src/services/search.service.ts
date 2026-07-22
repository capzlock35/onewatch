import { tmdb } from "./api";
import type {
  TmdbCollectionShort,
  TmdbCompany,
  TmdbKeyword,
  TmdbMovie,
  TmdbMultiSearchResult,
  TmdbPaginated,
  TmdbPerson,
  TmdbTvShow,
} from "@/types";

export const searchService = {
  async multi(query: string, page = 1): Promise<TmdbMultiSearchResult[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbMultiSearchResult>>("/search/multi", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  async movies(query: string, page = 1): Promise<TmdbMovie[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/search/movie", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  async tv(query: string, page = 1): Promise<TmdbTvShow[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/search/tv", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  async people(query: string, page = 1): Promise<TmdbPerson[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbPerson>>("/search/person", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  async keywords(query: string, page = 1): Promise<TmdbKeyword[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbKeyword>>("/search/keyword", {
      params: { query, page },
    });
    return data.results;
  },

  async companies(query: string, page = 1): Promise<TmdbCompany[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbCompany>>("/search/company", {
      params: { query, page },
    });
    return data.results;
  },

  async collections(query: string, page = 1): Promise<TmdbCollectionShort[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbCollectionShort>>("/search/collection", {
      params: { query, page },
    });
    return data.results;
  },
};
