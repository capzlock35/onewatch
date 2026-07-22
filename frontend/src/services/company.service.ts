import { tmdb } from "./api";
import type { TmdbCompany, TmdbMovie, TmdbPaginated } from "@/types";

export const companyService = {
  async details(id: number): Promise<TmdbCompany> {
    const { data } = await tmdb.get<TmdbCompany>(`/company/${id}`);
    return data;
  },

  async alternativeNames(id: number): Promise<{ id: number; results: { name: string; type: string }[] }> {
    const { data } = await tmdb.get(`/company/${id}/alternative_names`);
    return data;
  },

  async images(id: number): Promise<{ id: number; logos: { aspect_ratio: number; file_path: string; height: number; width: number; id: string; file_type: string }[] }> {
    const { data } = await tmdb.get(`/company/${id}/images`);
    return data;
  },

  async movies(id: number, page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/discover/movie", {
      params: { with_companies: id, page },
    });
    return data.results;
  },
};
