import { tmdb } from "./api";
import type {
  TmdbCredits,
  TmdbExternalIds,
  TmdbGenre,
  TmdbImages,
  TmdbKeywordsResult,
  TmdbMovie,
  TmdbMovieDetails,
  TmdbPaginated,
  TmdbReleaseDates,
  TmdbReview,
  TmdbVideo,
  TmdbWatchProviders,
} from "@/types";

export const movieService = {
  // Lists
  async trending(timeWindow: "day" | "week" = "week", page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>(`/trending/movie/${timeWindow}`, { params: { page } });
    return data.results;
  },

  async popular(page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/movie/popular", { params: { page } });
    return data.results;
  },

  async topRated(page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/movie/top_rated", { params: { page } });
    return data.results;
  },

  async upcoming(page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/movie/upcoming", { params: { page } });
    return data.results;
  },

  async nowPlaying(page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/movie/now_playing", { params: { page } });
    return data.results;
  },

  async byGenre(genreId: number, page = 1, sortBy = "popularity.desc"): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/discover/movie", {
      params: { with_genres: genreId, page, sort_by: sortBy, include_adult: false },
    });
    return data.results;
  },

  async byProvider(providerId: number, region = "US", page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/discover/movie", {
      params: {
        with_watch_providers: providerId,
        watch_region: region,
        sort_by: "popularity.desc",
        page,
        include_adult: false,
      },
    });
    return data.results;
  },

  // Details
  async details(id: number, appendToResponse?: string): Promise<TmdbMovieDetails> {
    const { data } = await tmdb.get<TmdbMovieDetails>(`/movie/${id}`, {
      params: appendToResponse ? { append_to_response: appendToResponse } : undefined,
    });
    return data;
  },

  async credits(id: number): Promise<TmdbCredits> {
    const { data } = await tmdb.get<TmdbCredits>(`/movie/${id}/credits`);
    return data;
  },

  async similar(id: number, page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>(`/movie/${id}/similar`, { params: { page } });
    return data.results;
  },

  async recommendations(id: number, page = 1): Promise<TmdbMovie[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>(`/movie/${id}/recommendations`, { params: { page } });
    return data.results;
  },

  async images(id: number): Promise<TmdbImages> {
    const { data } = await tmdb.get<TmdbImages>(`/movie/${id}/images`, { params: { include_image_language: "en,null" } });
    return data;
  },

  async videos(id: number): Promise<TmdbVideo[]> {
    const { data } = await tmdb.get<{ results: TmdbVideo[] }>(`/movie/${id}/videos`);
    return data.results;
  },

  async reviews(id: number, page = 1): Promise<TmdbReview[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbReview>>(`/movie/${id}/reviews`, { params: { page } });
    return data.results;
  },

  async externalIds(id: number): Promise<TmdbExternalIds> {
    const { data } = await tmdb.get<TmdbExternalIds>(`/movie/${id}/external_ids`);
    return data;
  },

  async watchProviders(id: number): Promise<TmdbWatchProviders> {
    const { data } = await tmdb.get<TmdbWatchProviders>(`/movie/${id}/watch/providers`);
    return data;
  },

  async releaseDates(id: number): Promise<TmdbReleaseDates> {
    const { data } = await tmdb.get<TmdbReleaseDates>(`/movie/${id}/release_dates`);
    return data;
  },

  async keywords(id: number): Promise<TmdbKeywordsResult> {
    const { data } = await tmdb.get<TmdbKeywordsResult>(`/movie/${id}/keywords`);
    return data;
  },

  async alternativeTitles(id: number): Promise<{ id: number; titles: { iso_3166_1: string; title: string; type: string }[] }> {
    const { data } = await tmdb.get(`/movie/${id}/alternative_titles`);
    return data;
  },

  async translations(id: number): Promise<{ id: number; translations: unknown[] }> {
    const { data } = await tmdb.get(`/movie/${id}/translations`);
    return data;
  },

  async latest(): Promise<TmdbMovieDetails> {
    const { data } = await tmdb.get<TmdbMovieDetails>("/movie/latest");
    return data;
  },

  // Search
  async search(query: string, page = 1): Promise<TmdbMovie[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/search/movie", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  // Genres
  async genres(): Promise<TmdbGenre[]> {
    const { data } = await tmdb.get<{ genres: TmdbGenre[] }>("/genre/movie/list");
    return data.genres;
  },
};
