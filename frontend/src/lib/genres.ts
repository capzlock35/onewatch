// Static TMDB genre id → name map (movie + TV). These ids are stable, so we
// resolve genre chips locally instead of paying a fetch just to label them.
export const GENRE_NAMES: Record<number, string> = {
  // Movie genres
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  // TV genres (ids that don't collide with movie ids above)
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

export function genreNames(ids: number[] | undefined, limit = 3): string[] {
  if (!ids?.length) return [];
  return ids
    .map((id) => GENRE_NAMES[id])
    .filter((n): n is string => Boolean(n))
    .slice(0, limit);
}
