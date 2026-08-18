import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Play, Plus, Check, User } from "lucide-react";

import { InlinePlayer } from "@/components/shared/InlinePlayer";
import { ServerSelector } from "@/components/shared/ServerSelector";
import { DetailPageSkeleton } from "@/components/shared/Skeletons";
import { MovieRow } from "@/components/movie/MovieRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { backdropUrl, posterUrl, profileUrl } from "@/lib/tmdb";
import { formatRuntime, formatYear } from "@/lib/utils";
import { useSeo } from "@/lib/seo";
import { movieService } from "@/services/movie.service";
import { usePlayerStore } from "@/store/player.store";
import { useWatchlistStore } from "@/store/watchlist.store";
import type { TmdbCastMember, TmdbCrewMember, TmdbMovie, TmdbMovieDetails } from "@/types";

export default function MoviePage() {
  const { id } = useParams({ from: "/movie/$id" });
  const movieId = Number(id);
  const [movie, setMovie] = useState<TmdbMovieDetails | null>(null);
  const [cast, setCast] = useState<TmdbCastMember[]>([]);
  const [crew, setCrew] = useState<TmdbCrewMember[]>([]);
  const [suggestions, setSuggestions] = useState<TmdbMovie[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const openPlayer = usePlayerStore((s) => s.open);
  const isPlaying = usePlayerStore(
    (s) => s.isOpen && s.mediaType === "movie" && s.tmdbId === movieId,
  );

  const watchlistItem = useWatchlistStore((s) => s.find("movie", movieId));
  const addToList = useWatchlistStore((s) => s.add);
  const removeFromList = useWatchlistStore((s) => s.remove);

  useSeo({
    title: movie
      ? `${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : ""}) - Watch Free Online | Onewatch`
      : "Watch Movies Free Online | Onewatch",
    description: movie?.overview?.slice(0, 160) || undefined,
    path: `/movie/${id}`,
    image: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
    ogType: "video.movie",
    jsonLd: movie
      ? {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: movie.title,
          url: `https://onewatch.site/movie/${id}`,
          description: movie.overview,
          image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
          datePublished: movie.release_date || undefined,
          duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
          aggregateRating: movie.vote_average
            ? { "@type": "AggregateRating", ratingValue: movie.vote_average.toFixed(1), bestRating: "10", ratingCount: movie.vote_count }
            : undefined,
          genre: movie.genres?.map((g) => g.name) || undefined,
        }
      : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    setMovie(null);
    setCast([]);
    setCrew([]);
    setSuggestions([]);
    setSuggestionsLoading(true);
    void movieService.details(movieId).then((m) => {
      if (cancelled) return;
      setMovie(m);
    });
    void movieService.credits(movieId).then((c) => {
      if (cancelled) return;
      setCast(c.cast.slice(0, 16));
      setCrew(c.crew);
    });
    void movieService
      .recommendations(movieId)
      .then((recs) => (recs.length ? recs : movieService.similar(movieId)))
      .then((items) => {
        if (cancelled) return;
        setSuggestions(items.filter((m) => m.id !== movieId && m.backdrop_path));
        setSuggestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (!movie) {
    return <DetailPageSkeleton />;
  }

  const handleToggleList = async () => {
    if (watchlistItem) {
      await removeFromList(watchlistItem.id);
    } else {
      await addToList({
        media_type: "movie",
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      });
    }
  };

  const directors = crew.filter((c) => c.job === "Director");
  const writers = crew.filter((c) => c.department === "Writing").slice(0, 3);

  const matchScore = movie.vote_average ? Math.round(movie.vote_average * 10) : 0;

  return (
    <article className="bg-[#141414] pb-16">
      {isPlaying ? (
        <>
          <section className="w-full bg-black pt-[calc(5rem+env(safe-area-inset-top))]">
            <div className="mx-auto max-w-6xl px-0 sm:px-6">
              <InlinePlayer />
            </div>
          </section>
          <ServerSelector />
        </>
      ) : (
        <section className="relative h-[62vh] min-h-[380px] w-full overflow-hidden sm:h-[75vh] sm:min-h-[460px]">
          {movie.backdrop_path && (
            <img src={backdropUrl(movie.backdrop_path)} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </section>
      )}

      <div
        className={`relative z-10 mx-auto grid max-w-none grid-cols-1 gap-6 px-4 sm:gap-8 sm:px-8 md:grid-cols-[280px_1fr] ${
          isPlaying ? "mt-8" : "-mt-32 sm:-mt-56"
        }`}
      >
        {movie.poster_path && (
          <img
            src={posterUrl(movie.poster_path)}
            alt={movie.title}
            className="hidden w-full max-w-[280px] rounded shadow-[0_8px_28px_rgba(0,0,0,0.8)] md:block"
          />
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:text-4xl md:text-5xl">
            {movie.title}
          </h1>
          {movie.tagline && (
            <p className="mt-2 text-sm text-white/60 sm:text-base">{movie.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
            {matchScore > 0 && (
              <span className="font-semibold text-[#46d369]">{matchScore}% Match</span>
            )}
            <span>{formatYear(movie.release_date)}</span>
            {movie.runtime ? <span>{formatRuntime(movie.runtime)}</span> : null}
            <span className="rounded border border-white/40 px-1.5 py-px text-xs font-medium text-white/80">HD</span>
            <span className="rounded border border-white/40 px-1.5 py-px text-xs font-medium text-white/80">
              {movie.adult ? "18+" : "13+"}
            </span>
            {movie.status && movie.status !== "Released" ? (
              <span className="text-white/60">{movie.status}</span>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() =>
                openPlayer({ mediaType: "movie", tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path })
              }
              aria-label={`Play ${movie.title}`}
              className="bg-white text-black hover:bg-white/80"
            >
              <Play className="h-5 w-5 fill-current" />
              Play
            </Button>
            <Button size="lg" variant="secondary" onClick={handleToggleList}>
              {watchlistItem ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {watchlistItem ? "In My List" : "Add to My List"}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {movie.genres?.map((g) => (
              <Badge key={g.id} className="border-white/20 bg-white/10 text-white/80">
                {g.name}
              </Badge>
            ))}
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-white/80">{movie.overview}</p>

          <dl className="mt-6 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {directors.length > 0 && (
              <div>
                <dt className="text-white/50">Director</dt>
                <dd className="mt-0.5 text-white/90">{directors.map((d) => d.name).join(", ")}</dd>
              </div>
            )}
            {writers.length > 0 && (
              <div>
                <dt className="text-white/50">Writers</dt>
                <dd className="mt-0.5 text-white/90">{writers.map((w) => w.name).join(", ")}</dd>
              </div>
            )}
            {movie.production_countries?.length > 0 && (
              <div>
                <dt className="text-white/50">Country</dt>
                <dd className="mt-0.5 text-white/90">
                  {movie.production_countries.map((c) => c.name).join(", ")}
                </dd>
              </div>
            )}
            {movie.production_companies?.length > 0 && (
              <div>
                <dt className="text-white/50">Production</dt>
                <dd className="mt-0.5 text-white/90">
                  {movie.production_companies.slice(0, 3).map((c) => c.name).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {cast.length > 0 && (
        <section className="mx-auto mt-12 max-w-none px-4 sm:px-8">
          <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Cast</h2>
          <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-4">
            {cast.map((actor) => (
              <Link
                key={actor.credit_id}
                to="/person/$id"
                params={{ id: String(actor.id) }}
                className="group w-28 shrink-0 text-center sm:w-32"
              >
                {actor.profile_path ? (
                  <img
                    src={profileUrl(actor.profile_path)}
                    alt={actor.name}
                    loading="lazy"
                    className="aspect-[2/3] w-full rounded object-cover transition group-hover:opacity-80"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-white/5">
                    <User className="h-10 w-10 text-white/30" />
                  </div>
                )}
                <p
                  className="mt-2 truncate text-sm font-medium text-white transition-colors group-hover:text-white/70"
                  title={actor.name}
                >
                  {actor.name}
                </p>
                <p className="truncate text-xs text-white/50" title={actor.character}>
                  {actor.character}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(suggestionsLoading || suggestions.length > 0) && (
        <div className="mt-12">
          <MovieRow
            title="You May Also Like"
            items={suggestions}
            mediaType="movie"
            loading={suggestionsLoading}
          />
        </div>
      )}
    </article>
  );
}
