import { tmdb } from "./api";
import type { TmdbKeyword, TmdbMovie, TmdbPaginated } from "@/types";

export const keywordService = {
  async details(id: number): Promise<TmdbKeyword> {
    const { data } = await tmdb.get<TmdbKeyword>(`/keyword/${id}`);
    return data;
  },

  async movies(id: number, page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>(`/keyword/${id}/movies`, {
      params: { page, include_adult: false },
    });
    return data.results;
  },
};
