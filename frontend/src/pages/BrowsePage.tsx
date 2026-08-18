import { useEffect } from "react";

import { MovieRow } from "@/components/movie/MovieRow";
import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
import { useSeo } from "@/lib/seo";
import { useMovieStore } from "@/store/movie.store";

const GENRES = [
  { id: 28, label: "Action" },
  { id: 35, label: "Comedy" },
  { id: 27, label: "Horror" },
  { id: 18, label: "Drama" },
  { id: 10749, label: "Romance" },
  { id: 878, label: "Sci-Fi" },
  { id: 16, label: "Animation" },
];

export default function BrowsePage() {
  const { trending, popular, topRated, byGenre, loadHome, loadGenre, loading } = useMovieStore();

  useSeo({
    title: "Browse Movies & TV Shows - Onewatch | Free Streaming",
    description:
      "Browse and watch the latest trending movies and TV shows on Onewatch for free. Explore action, comedy, horror, drama, romance, sci-fi and more.",
    path: "/browse",
  });

  useEffect(() => {
    void loadHome();
    GENRES.forEach((g) => void loadGenre(g.id));
  }, [loadHome, loadGenre]);

  return (
    <div className="min-h-screen bg-[#141414] pb-16 pt-[calc(5rem+env(safe-area-inset-top))]">
      <header className="mx-auto mb-2 max-w-none px-4 sm:px-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Browse</h1>
      </header>

      <div className="space-y-2 md:space-y-4">
        <ContinueWatchingRow />

        <MovieRow title="Trending Now" items={trending} mediaType="movie" loading={loading} />
        <MovieRow title="Popular on Onewatch" items={popular} mediaType="movie" loading={loading} />
        <MovieRow title="Top Rated" items={topRated} mediaType="movie" loading={loading} />

        {GENRES.map((g) => (
          <MovieRow
            key={g.id}
            title={g.label}
            items={byGenre[g.id] ?? []}
            mediaType="movie"
            loading={!byGenre[g.id]}
          />
        ))}
      </div>
    </div>
  );
}
