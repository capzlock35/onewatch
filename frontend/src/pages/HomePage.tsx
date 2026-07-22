import { useEffect, useMemo } from "react";

import { ContinueWatchingRow } from "@/components/movie/ContinueWatchingRow";
import { HeroBanner } from "@/components/movie/HeroBanner";
import { MovieRow } from "@/components/movie/MovieRow";
import { ProviderRow } from "@/components/movie/ProviderRow";
import { TopTenRow } from "@/components/movie/TopTenRow";
import { useMovieStore } from "@/store/movie.store";

export default function HomePage() {
  const {
    topToday,
    trending,
    popular,
    topRated,
    nowPlaying,
    trendingTv,
    popularTv,
    topRatedTv,
    loadHome,
    loading,
  } = useMovieStore();

  useEffect(() => {
    document.title = "Onewatch — Watch Free Movies & TV Shows Online | Free Streaming";
    void loadHome();
  }, [loadHome]);

  const hero = useMemo(() => trending[Math.floor(Math.random() * Math.min(5, trending.length))], [trending]);

  return (
    <div className="min-h-screen bg-[#141414] pb-16">
      {hero ? (
        <HeroBanner item={hero} mediaType="movie" />
      ) : (
        <div className="relative h-[80vh] min-h-[480px] w-full overflow-hidden bg-[#181818]">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.06] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </div>
      )}

      <div className="relative z-10 mt-6 space-y-8 sm:mt-8 sm:space-y-10 md:mt-10 lg:mt-12">
        <ContinueWatchingRow />
        <TopTenRow items={topToday} loading={loading} />
        <MovieRow
          title="Trending Today"
          items={trending}
          tvItems={trendingTv}
          mediaType="movie"
          loading={loading}
        />
        <ProviderRow />
        <MovieRow
          title="Popular"
          items={popular}
          tvItems={popularTv}
          mediaType="movie"
          loading={loading}
        />
        <MovieRow
          title="Top Rated"
          items={topRated}
          tvItems={topRatedTv}
          mediaType="movie"
          loading={loading}
        />
        <MovieRow title="Now Playing" items={nowPlaying} mediaType="movie" loading={loading} />
      </div>
    </div>
  );
}
