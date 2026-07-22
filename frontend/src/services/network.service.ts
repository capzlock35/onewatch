import { tmdb } from "./api";
import type { TmdbNetworkDetails, TmdbPaginated, TmdbTvShow } from "@/types";

export const networkService = {
  async details(id: number): Promise<TmdbNetworkDetails> {
    const { data } = await tmdb.get<TmdbNetworkDetails>(`/network/${id}`);
    return data;
  },

  async alternativeNames(id: number): Promise<{ id: number; results: { name: string; type: string }[] }> {
    const { data } = await tmdb.get(`/network/${id}/alternative_names`);
    return data;
  },

  async images(id: number): Promise<{ id: number; logos: { file_path: string; aspect_ratio: number; height: number; width: number }[] }> {
    const { data } = await tmdb.get(`/network/${id}/images`);
    return data;
  },

  async shows(id: number, page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/discover/tv", {
      params: { with_networks: id, page },
    });
    return data.results;
  },
};
