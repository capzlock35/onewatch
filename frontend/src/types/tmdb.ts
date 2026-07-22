export interface TmdbPaginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCountry {
  iso_3166_1: string;
  english_name: string;
  native_name?: string;
}

export interface TmdbLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TmdbProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbSpokenLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

export interface TmdbNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  genre_ids?: number[];
  video?: boolean;
}

export interface TmdbMovieDetails extends TmdbMovie {
  belongs_to_collection: TmdbCollectionShort | null;
  budget: number;
  genres: TmdbGenre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string | null;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country?: string[];
  original_language: string;
  genre_ids?: number[];
}

export interface TmdbTvDetails extends TmdbTvShow {
  created_by: TmdbCreator[];
  episode_run_time: number[];
  genres: TmdbGenre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string | null;
  last_episode_to_air: TmdbEpisode | null;
  next_episode_to_air: TmdbEpisode | null;
  networks: TmdbNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  seasons: TmdbSeason[];
  spoken_languages: TmdbSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
}

export interface TmdbSeason {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average?: number;
}

export interface TmdbSeasonDetails extends TmdbSeason {
  _id?: string;
  episodes: TmdbEpisode[];
}

export interface TmdbEpisode {
  id: number;
  air_date: string | null;
  episode_number: number;
  name: string;
  overview: string;
  production_code?: string;
  runtime: number | null;
  season_number: number;
  show_id?: number;
  still_path: string | null;
  vote_average: number;
  vote_count?: number;
}

export interface TmdbEpisodeDetails extends TmdbEpisode {
  crew?: TmdbCrewMember[];
  guest_stars?: TmdbCastMember[];
}

export interface TmdbCastMember {
  id: number;
  cast_id?: number;
  credit_id: string;
  character: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  order: number;
  gender?: number;
  known_for_department?: string;
}

export interface TmdbCrewMember {
  id: number;
  credit_id: string;
  department: string;
  job: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  gender?: number;
}

export interface TmdbCredits {
  id?: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  official: boolean;
  published_at: string;
  site: "YouTube" | "Vimeo" | string;
  size: number;
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes" | "Bloopers" | string;
}

export interface TmdbImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
}

export interface TmdbImages {
  id?: number;
  backdrops: TmdbImage[];
  logos: TmdbImage[];
  posters: TmdbImage[];
}

export interface TmdbReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TmdbExternalIds {
  id?: number;
  imdb_id: string | null;
  wikidata_id?: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  freebase_mid?: string | null;
  freebase_id?: string | null;
  tvdb_id?: number | null;
  tvrage_id?: number | null;
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbKeywordsResult {
  id?: number;
  keywords?: TmdbKeyword[];
  results?: TmdbKeyword[];
}

export interface TmdbWatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface TmdbWatchProviderRegion {
  link: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
  ads?: TmdbWatchProvider[];
  free?: TmdbWatchProvider[];
}

export interface TmdbWatchProviders {
  id?: number;
  results: Record<string, TmdbWatchProviderRegion>;
}

export interface TmdbReleaseDate {
  certification: string;
  iso_639_1: string;
  note?: string;
  release_date: string;
  type: number;
}

export interface TmdbReleaseDatesResult {
  iso_3166_1: string;
  release_dates: TmdbReleaseDate[];
}

export interface TmdbReleaseDates {
  id?: number;
  results: TmdbReleaseDatesResult[];
}

export interface TmdbContentRating {
  descriptors?: string[];
  iso_3166_1: string;
  rating: string;
}

export interface TmdbContentRatings {
  id?: number;
  results: TmdbContentRating[];
}

export interface TmdbCollectionShort {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbCollection extends TmdbCollectionShort {
  overview: string;
  parts: TmdbMovie[];
}

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  gender: number;
  adult: boolean;
  known_for?: (TmdbMovie | TmdbTvShow)[];
}

export interface TmdbPersonDetails extends TmdbPerson {
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  homepage: string | null;
  imdb_id: string | null;
  place_of_birth: string | null;
}

export interface TmdbPersonMovieCredits {
  id?: number;
  cast: (TmdbMovie & { character: string; credit_id: string; order: number })[];
  crew: (TmdbMovie & { department: string; job: string; credit_id: string })[];
}

export interface TmdbPersonTvCredits {
  id?: number;
  cast: (TmdbTvShow & { character: string; credit_id: string; episode_count: number })[];
  crew: (TmdbTvShow & { department: string; job: string; credit_id: string; episode_count: number })[];
}

export interface TmdbPersonCombinedCredits {
  id?: number;
  cast: (Record<string, unknown> & { media_type: "movie" | "tv" })[];
  crew: (Record<string, unknown> & { media_type: "movie" | "tv" })[];
}

export interface TmdbMultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  popularity: number;
  // Movie fields
  title?: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  // TV fields
  name?: string;
  first_air_date?: string;
  // Person fields
  profile_path?: string | null;
  known_for_department?: string;
  known_for?: TmdbMultiSearchResult[];
}

export interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
}

export interface TmdbCertification {
  certification: string;
  meaning: string;
  order: number;
}

export interface TmdbCertifications {
  certifications: Record<string, TmdbCertification[]>;
}

export interface TmdbCompany {
  id: number;
  name: string;
  description: string;
  headquarters: string;
  homepage: string;
  logo_path: string | null;
  origin_country: string;
  parent_company: { id: number; name: string; logo_path: string | null } | null;
}

export interface TmdbNetworkDetails extends TmdbNetwork {
  headquarters: string;
  homepage: string;
}

export type TmdbTimeWindow = "day" | "week";
export type TmdbMediaType = "movie" | "tv" | "all" | "person";
