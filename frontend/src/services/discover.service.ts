import { tmdb } from "./api";
import type { TmdbMovie, TmdbPaginated, TmdbTvShow } from "@/types";

export interface DiscoverMovieParams {
  page?: number;
  sort_by?:
    | "popularity.desc"
    | "popularity.asc"
    | "vote_average.desc"
    | "vote_average.asc"
    | "release_date.desc"
    | "release_date.asc"
    | "revenue.desc"
    | "revenue.asc"
    | "primary_release_date.desc"
    | "primary_release_date.asc"
    | "title.asc"
    | "title.desc"
    | "vote_count.desc"
    | "vote_count.asc"
    | "original_title.asc"
    | "original_title.desc";
  with_genres?: string | number;
  without_genres?: string | number;
  with_cast?: string | number;
  with_crew?: string | number;
  with_people?: string | number;
  with_keywords?: string | number;
  without_keywords?: string | number;
  with_companies?: string | number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  primary_release_year?: number;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  "release_date.gte"?: string;
  "release_date.lte"?: string;
  region?: string;
  with_release_type?: number;
  certification_country?: string;
  certification?: string;
  "certification.lte"?: string;
  "certification.gte"?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "vote_count.gte"?: number;
  "vote_count.lte"?: number;
  with_original_language?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_watch_monetization_types?: "flatrate" | "free" | "ads" | "rent" | "buy";
  include_adult?: boolean;
  include_video?: boolean;
  language?: string;
  year?: number;
}

export interface DiscoverTvParams {
  page?: number;
  sort_by?:
    | "popularity.desc"
    | "popularity.asc"
    | "vote_average.desc"
    | "vote_average.asc"
    | "first_air_date.desc"
    | "first_air_date.asc"
    | "name.asc"
    | "name.desc";
  with_genres?: string | number;
  without_genres?: string | number;
  with_networks?: string | number;
  with_companies?: string | number;
  with_keywords?: string | number;
  without_keywords?: string | number;
  with_status?: string;
  with_type?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  first_air_date_year?: number;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "vote_count.gte"?: number;
  "vote_count.lte"?: number;
  with_original_language?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_watch_monetization_types?: "flatrate" | "free" | "ads" | "rent" | "buy";
  include_adult?: boolean;
  language?: string;
  timezone?: string;
  screened_theatrically?: boolean;
}

export const discoverService = {
  async movies(params: DiscoverMovieParams = {}): Promise<TmdbPaginated<TmdbMovie>> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbMovie>>("/discover/movie", {
      params: { sort_by: "popularity.desc", include_adult: false, ...params },
    });
    return data;
  },

  async tv(params: DiscoverTvParams = {}): Promise<TmdbPaginated<TmdbTvShow>> {
    const { data } = await tmdb.get<TmdbPaginated<TmdbTvShow>>("/discover/tv", {
      params: { sort_by: "popularity.desc", include_adult: false, ...params },
    });
    return data;
  },
};
