import { tmdb } from "./api";
import type {
  TmdbExternalIds,
  TmdbPaginated,
  TmdbPerson,
  TmdbPersonCombinedCredits,
  TmdbPersonDetails,
  TmdbPersonMovieCredits,
  TmdbPersonTvCredits,
} from "@/types";

interface TmdbPersonImages {
  id?: number;
  profiles: { aspect_ratio: number; file_path: string; height: number; width: number; iso_639_1: string | null; vote_average: number; vote_count: number }[];
}

export const personService = {
  async popular(page = 1): Promise<TmdbPerson[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbPerson>>("/person/popular", { params: { page } });
    return data.results;
  },

  async details(id: number, appendToResponse?: string): Promise<TmdbPersonDetails> {
    const { data } = await tmdb.get<TmdbPersonDetails>(`/person/${id}`, {
      params: appendToResponse ? { append_to_response: appendToResponse } : undefined,
    });
    return data;
  },

  async movieCredits(id: number): Promise<TmdbPersonMovieCredits> {
    const { data } = await tmdb.get<TmdbPersonMovieCredits>(`/person/${id}/movie_credits`);
    return data;
  },

  async tvCredits(id: number): Promise<TmdbPersonTvCredits> {
    const { data } = await tmdb.get<TmdbPersonTvCredits>(`/person/${id}/tv_credits`);
    return data;
  },

  async combinedCredits(id: number): Promise<TmdbPersonCombinedCredits> {
    const { data } = await tmdb.get<TmdbPersonCombinedCredits>(`/person/${id}/combined_credits`);
    return data;
  },

  async images(id: number): Promise<TmdbPersonImages> {
    const { data } = await tmdb.get<TmdbPersonImages>(`/person/${id}/images`);
    return data;
  },

  async externalIds(id: number): Promise<TmdbExternalIds> {
    const { data } = await tmdb.get<TmdbExternalIds>(`/person/${id}/external_ids`);
    return data;
  },

  async taggedImages(id: number, page = 1): Promise<TmdbPaginated<unknown>> {
    const { data } = await tmdb.get<TmdbPaginated<unknown>>(`/person/${id}/tagged_images`, { params: { page } });
    return data;
  },

  async translations(id: number): Promise<{ id: number; translations: unknown[] }> {
    const { data } = await tmdb.get(`/person/${id}/translations`);
    return data;
  },

  async latest(): Promise<TmdbPersonDetails> {
    const { data } = await tmdb.get<TmdbPersonDetails>("/person/latest");
    return data;
  },

  async search(query: string, page = 1): Promise<TmdbPerson[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbPerson>>("/search/person", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },
};
