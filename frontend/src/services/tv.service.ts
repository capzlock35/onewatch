import { tmdb } from "./api";
import type {
  TmdbContentRatings,
  TmdbCredits,
  TmdbEpisodeDetails,
  TmdbExternalIds,
  TmdbGenre,
  TmdbImages,
  TmdbKeywordsResult,
  TmdbPaginated,
  TmdbReview,
  TmdbSeasonDetails,
  TmdbTvDetails,
  TmdbTvShow,
  TmdbVideo,
  TmdbWatchProviders,
} from "@/types";

export const tvService = {
  // Lists
  async trending(timeWindow: "day" | "week" = "week", page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>(`/trending/tv/${timeWindow}`, { params: { page } });
    return data.results;
  },

  async popular(page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/tv/popular", { params: { page } });
    return data.results;
  },

  async topRated(page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/tv/top_rated", { params: { page } });
    return data.results;
  },

  async airingToday(page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/tv/airing_today", { params: { page } });
    return data.results;
  },

  async onTheAir(page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/tv/on_the_air", { params: { page } });
    return data.results;
  },

  async byGenre(genreId: number, page = 1, sortBy = "popularity.desc"): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/discover/tv", {
      params: { with_genres: genreId, page, sort_by: sortBy, include_adult: false },
    });
    return data.results;
  },

  async byNetwork(networkId: number, page = 1, sortBy = "popularity.desc"): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/discover/tv", {
      params: { with_networks: networkId, page, sort_by: sortBy },
    });
    return data.results;
  },

  async byProvider(providerId: number, region = "US", page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/discover/tv", {
      params: {
        with_watch_providers: providerId,
        watch_region: region,
        sort_by: "popularity.desc",
        page,
      },
    });
    return data.results;
  },

  // Details
  async details(id: number, appendToResponse?: string): Promise<TmdbTvDetails> {
    const { data } = await tmdb.get<TmdbTvDetails>(`/tv/${id}`, {
      params: appendToResponse ? { append_to_response: appendToResponse } : undefined,
    });
    return data;
  },

  async season(id: number, season: number): Promise<TmdbSeasonDetails> {
    const { data } = await tmdb.get<TmdbSeasonDetails>(`/tv/${id}/season/${season}`);
    return data;
  },

  async episode(id: number, season: number, episode: number): Promise<TmdbEpisodeDetails> {
    const { data } = await tmdb.get<TmdbEpisodeDetails>(`/tv/${id}/season/${season}/episode/${episode}`);
    return data;
  },

  async credits(id: number): Promise<TmdbCredits> {
    const { data } = await tmdb.get<TmdbCredits>(`/tv/${id}/credits`);
    return data;
  },

  async aggregateCredits(id: number): Promise<TmdbCredits> {
    const { data } = await tmdb.get<TmdbCredits>(`/tv/${id}/aggregate_credits`);
    return data;
  },

  async similar(id: number, page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>(`/tv/${id}/similar`, { params: { page } });
    return data.results;
  },

  async recommendations(id: number, page = 1): Promise<TmdbTvShow[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>(`/tv/${id}/recommendations`, { params: { page } });
    return data.results;
  },

  async images(id: number): Promise<TmdbImages> {
    const { data } = await tmdb.get<TmdbImages>(`/tv/${id}/images`, { params: { include_image_language: "en,null" } });
    return data;
  },

  async videos(id: number): Promise<TmdbVideo[]> {
    const { data } = await tmdb.get<{ results: TmdbVideo[] }>(`/tv/${id}/videos`);
    return data.results;
  },

  async reviews(id: number, page = 1): Promise<TmdbReview[]> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbReview>>(`/tv/${id}/reviews`, { params: { page } });
    return data.results;
  },

  async externalIds(id: number): Promise<TmdbExternalIds> {
    const { data } = await tmdb.get<TmdbExternalIds>(`/tv/${id}/external_ids`);
    return data;
  },

  async watchProviders(id: number): Promise<TmdbWatchProviders> {
    const { data } = await tmdb.get<TmdbWatchProviders>(`/tv/${id}/watch/providers`);
    return data;
  },

  async contentRatings(id: number): Promise<TmdbContentRatings> {
    const { data } = await tmdb.get<TmdbContentRatings>(`/tv/${id}/content_ratings`);
    return data;
  },

  async keywords(id: number): Promise<TmdbKeywordsResult> {
    const { data } = await tmdb.get<TmdbKeywordsResult>(`/tv/${id}/keywords`);
    return data;
  },

  async alternativeTitles(id: number): Promise<{ id: number; results: { iso_3166_1: string; title: string; type: string }[] }> {
    const { data } = await tmdb.get(`/tv/${id}/alternative_titles`);
    return data;
  },

  async translations(id: number): Promise<{ id: number; translations: unknown[] }> {
    const { data } = await tmdb.get(`/tv/${id}/translations`);
    return data;
  },

  async latest(): Promise<TmdbTvDetails> {
    const { data } = await tmdb.get<TmdbTvDetails>("/tv/latest");
    return data;
  },

  // Search
  async search(query: string, page = 1): Promise<TmdbTvShow[]> {
    if (!query.trim()) return [];
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/search/tv", {
      params: { query, page, include_adult: false },
    });
    return data.results;
  },

  // Genres
  async genres(): Promise<TmdbGenre[]> {
    const { data } = await tmdb.get<{ genres: TmdbGenre[] }>("/genre/tv/list");
    return data.genres;
  },
};
