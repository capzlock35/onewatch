import { tmdb } from "./api";
import type {
  TmdbCertifications,
  TmdbConfiguration,
  TmdbCountry,
  TmdbGenre,
  TmdbLanguage,
  TmdbWatchProvider,
} from "@/types";

interface TmdbWatchProvidersResponse {
  results: (TmdbWatchProvider & { display_priorities?: Record<string, number> })[];
}

export const configService = {
  async configuration(): Promise<TmdbConfiguration> {
    const { data } = await tmdb.get<TmdbConfiguration>("/configuration");
    return data;
  },

  async countries(): Promise<TmdbCountry[]> {
    const { data } = await tmdb.get<TmdbCountry[]>("/configuration/countries");
    return data;
  },

  async jobs(): Promise<{ department: string; jobs: string[] }[]> {
    const { data } = await tmdb.get<{ department: string; jobs: string[] }[]>("/configuration/jobs");
    return data;
  },

  async languages(): Promise<TmdbLanguage[]> {
    const { data } = await tmdb.get<TmdbLanguage[]>("/configuration/languages");
    return data;
  },

  async primaryTranslations(): Promise<string[]> {
    const { data } = await tmdb.get<string[]>("/configuration/primary_translations");
    return data;
  },

  async timezones(): Promise<{ iso_3166_1: string; zones: string[] }[]> {
    const { data } = await tmdb.get<{ iso_3166_1: string; zones: string[] }[]>("/configuration/timezones");
    return data;
  },

  // Genres
  async movieGenres(): Promise<TmdbGenre[]> {
    const { data } = await tmdb.get<{ genres: TmdbGenre[] }>("/genre/movie/list");
    return data.genres;
  },

  async tvGenres(): Promise<TmdbGenre[]> {
    const { data } = await tmdb.get<{ genres: TmdbGenre[] }>("/genre/tv/list");
    return data.genres;
  },

  // Certifications
  async movieCertifications(): Promise<TmdbCertifications> {
    const { data } = await tmdb.get<TmdbCertifications>("/certification/movie/list");
    return data;
  },

  async tvCertifications(): Promise<TmdbCertifications> {
    const { data } = await tmdb.get<TmdbCertifications>("/certification/tv/list");
    return data;
  },

  // Watch providers (regions / catalogs)
  async watchProviderRegions(): Promise<TmdbCountry[]> {
    const { data } = await tmdb.get<{ results: TmdbCountry[] }>("/watch/providers/regions");
    return data.results;
  },

  async movieWatchProviders(watchRegion = "US"): Promise<TmdbWatchProvider[]> {
    const { data } = await tmdb.get<TmdbWatchProvidersResponse>("/watch/providers/movie", {
      params: { watch_region: watchRegion },
    });
    return data.results;
  },

  async tvWatchProviders(watchRegion = "US"): Promise<TmdbWatchProvider[]> {
    const { data } = await tmdb.get<TmdbWatchProvidersResponse>("/watch/providers/tv", {
      params: { watch_region: watchRegion },
    });
    return data.results;
  },
};
