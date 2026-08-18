import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Check, Play, Plus, User } from "lucide-react";

import { InlinePlayer } from "@/components/shared/InlinePlayer";
import { ServerSelector } from "@/components/shared/ServerSelector";
import { DetailPageSkeleton } from "@/components/shared/Skeletons";
import { MovieRow } from "@/components/movie/MovieRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EpisodeSelector } from "@/components/tv/EpisodeSelector";
import { getLenis } from "@/hooks/useSmoothScroll";
import { backdropUrl, posterUrl, profileUrl } from "@/lib/tmdb";
import { formatYear } from "@/lib/utils";
import { useSeo } from "@/lib/seo";
import { tvService } from "@/services/tv.service";
import { usePlayerStore } from "@/store/player.store";
import { useWatchlistStore } from "@/store/watchlist.store";
import type { TmdbCastMember, TmdbTvDetails, TmdbTvShow } from "@/types";

export default function TvShowPage() {
  const { id } = useParams({ from: "/tv/$id" });
  const tvId = Number(id);
  const [show, setShow] = useState<TmdbTvDetails | null>(null);
  const [cast, setCast] = useState<TmdbCastMember[]>([]);
  const [suggestions, setSuggestions] = useState<TmdbTvShow[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const openPlayer = usePlayerStore((s) => s.open);
  const isPlaying = usePlayerStore(
    (s) => s.isOpen && s.mediaType === "tv" && s.tmdbId === tvId,
  );

  const watchlistItem = useWatchlistStore((s) => s.find("tv", tvId));
  const addToList = useWatchlistStore((s) => s.add);
  const removeFromList = useWatchlistStore((s) => s.remove);

  useSeo({
    title: show
      ? `${show.name} (${show.first_air_date ? show.first_air_date.slice(0, 4) : ""}) - Watch Free Online | Onewatch`
      : "Watch TV Shows Free Online | Onewatch",
    description: show?.overview?.slice(0, 160) || undefined,
    path: `/tv/${id}`,
    image: show?.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
    ogType: "video.tv_show",
    jsonLd: show
      ? {
          "@context": "https://schema.org",
          "@type": "TVSeries",
          name: show.name,
          url: `https://onewatch.site/tv/${id}`,
          description: show.overview,
          image: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
          datePublished: show.first_air_date || undefined,
          numberOfSeasons: show.number_of_seasons,
          numberOfEpisodes: show.number_of_episodes,
          aggregateRating: show.vote_average
            ? { "@type": "AggregateRating", ratingValue: show.vote_average.toFixed(1), bestRating: "10", ratingCount: show.vote_count }
            : undefined,
          genre: show.genres?.map((g) => g.name) || undefined,
        }
      : undefined,
  });

  const playerRef = useRef<HTMLElement>(null);

  // Scroll up to the player whenever it opens or the selected episode changes —
  // the episode list sits far below the player, so a selection there would
  // otherwise leave the user scrolled away from the video.
  useEffect(() => {
    if (!isPlaying) return;
    const el = playerRef.current;
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -80 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isPlaying, season, episode]);

  useEffect(() => {
    let cancelled = false;
    setShow(null);
    setCast([]);
    setSuggestions([]);
    setSuggestionsLoading(true);
    void tvService.details(tvId).then((s) => {
      if (cancelled) return;
      setShow(s);
      const firstReal = s.seasons?.find((sn) => sn.season_number > 0);
      if (firstReal) setSeason(firstReal.season_number);
    });
    void tvService.credits(tvId).then((c) => {
      if (cancelled) return;
      setCast(c.cast.slice(0, 16));
    });
    void tvService
      .recommendations(tvId)
      .then((recs) => (recs.length ? recs : tvService.similar(tvId)))
      .then((items) => {
        if (cancelled) return;
        setSuggestions(items.filter((s) => s.id !== tvId && s.backdrop_path));
        setSuggestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tvId]);

  if (!show) {
    return <DetailPageSkeleton />;
  }

  const handleToggleList = async () => {
    if (watchlistItem) {
      await removeFromList(watchlistItem.id);
    } else {
      await addToList({
        media_type: "tv",
        tmdb_id: show.id,
        title: show.name,
        poster_path: show.poster_path,
      });
    }
  };

  return (
    <article className="pb-16">
      {isPlaying ? (
        <>
          <section ref={playerRef} className="w-full bg-black pt-[calc(5rem+env(safe-area-inset-top))]">
            <div className="mx-auto max-w-6xl px-0 sm:px-6">
              <InlinePlayer />
            </div>
          </section>
          <ServerSelector />
        </>
      ) : (
        <section className="relative h-[62vh] min-h-[380px] w-full overflow-hidden sm:h-[74vh] sm:min-h-[460px]">
          {show.backdrop_path && (
            <img src={backdropUrl(show.backdrop_path)} alt={show.name} className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <button
            type="button"
            onClick={() =>
              openPlayer({
                mediaType: "tv",
                tmdbId: show.id,
                title: show.name,
                posterPath: show.poster_path,
                season,
                episode,
              })
            }
            aria-label={`Play ${show.name}`}
            className="group absolute left-1/2 top-[42%] z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_28px_rgba(0,0,0,0.8)] transition hover:scale-110 hover:bg-white/90 sm:h-[4.5rem] sm:w-[4.5rem]"
          >
            <Play className="ml-0.5 h-7 w-7 fill-current sm:h-8 sm:w-8" />
          </button>
        </section>
      )}

      <div
        className={`relative z-10 mx-auto grid max-w-none grid-cols-1 items-start gap-6 px-4 sm:gap-8 sm:px-8 lg:px-10 xl:gap-10 xl:px-14 md:grid-cols-[280px_1fr] xl:grid-cols-[260px_minmax(0,1fr)_minmax(360px,560px)] ${
          isPlaying ? "mt-8" : "-mt-28 sm:-mt-48"
        }`}
      >
        {show.poster_path && (
          <img
            src={posterUrl(show.poster_path)}
            alt={show.name}
            className="hidden w-full max-w-[280px] rounded shadow-[0_8px_28px_rgba(0,0,0,0.8)] md:block"
          />
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">{show.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
            {show.vote_average ? (
              <span className="font-semibold text-[#46d369]">{Math.round(show.vote_average * 10)}% Match</span>
            ) : null}
            <span>{formatYear(show.first_air_date)}</span>
            <span>
              {show.number_of_seasons} Season{show.number_of_seasons === 1 ? "" : "s"}
            </span>
            <span className="rounded border border-white/40 px-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white/80">
              HD
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {show.genres?.map((g) => (
              <Badge key={g.id} className="border-white/15 bg-white/10 text-white/80">
                {g.name}
              </Badge>
            ))}
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-white/80">{show.overview}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() =>
                openPlayer({
                  mediaType: "tv",
                  tmdbId: show.id,
                  title: show.name,
                  posterPath: show.poster_path,
                  season,
                  episode,
                })
              }
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
        </div>

        {/* Episodes as a boxed side panel. On lg it absolutely fills its grid
            cell, which `items-start` + the stretched row keeps at the same
            height as the poster/info column; the list scrolls inside so the
            page never lengthens. Stacks full-width below the info on smaller
            screens with a viewport-capped height. */}
        <aside className="relative col-span-full mt-4 md:col-span-2 xl:col-span-1 xl:mt-0 xl:self-stretch">
          <div className="rounded border border-white/10 bg-[#181818] p-4 xl:absolute xl:inset-0 xl:flex xl:flex-col xl:overflow-hidden">
            <h2 className="mb-3 text-lg font-bold text-white xl:shrink-0">Episodes</h2>
            <div className="xl:min-h-0 xl:flex-1">
              <EpisodeSelector
                fill
                tvId={show.id}
                seasons={show.seasons}
                selectedSeason={season}
                selectedEpisode={episode}
                onSelect={(s, e) => {
                  setSeason(s);
                  setEpisode(e);
                  openPlayer({
                    mediaType: "tv",
                    tmdbId: show.id,
                    title: show.name,
                    posterPath: show.poster_path,
                    season: s,
                    episode: e,
                  });
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      {cast.length > 0 && (
        <section className="mx-auto mt-12 max-w-none px-4 sm:px-8 lg:px-10 xl:px-14">
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
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-[#181818]">
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
            mediaType="tv"
            loading={suggestionsLoading}
          />
        </div>
      )}
    </article>
  );
}
