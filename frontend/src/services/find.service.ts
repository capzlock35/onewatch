import { tmdb } from "./api";
import type { TmdbMovie, TmdbPerson, TmdbTvShow, TmdbEpisode, TmdbSeason } from "@/types";

export type TmdbExternalSource = "imdb_id" | "freebase_mid" | "freebase_id" | "tvdb_id" | "tvrage_id" | "wikidata_id" | "facebook_id" | "instagram_id" | "twitter_id";

interface TmdbFindResult {
  movie_results: TmdbMovie[];
  person_results: TmdbPerson[];
  tv_results: TmdbTvShow[];
  tv_episode_results: TmdbEpisode[];
  tv_season_results: TmdbSeason[];
}

export const findService = {
  async byExternalId(externalId: string, source: TmdbExternalSource): Promise<TmdbFindResult> {
    const { data } = await tmdb.get<TmdbFindResult>(`/find/${externalId}`, {
      params: { external_source: source },
    });
    return data;
  },
};
