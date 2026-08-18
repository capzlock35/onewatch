import { useEffect, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";

import { HeroBanner } from "@/components/movie/HeroBanner";
import { MovieCard } from "@/components/movie/MovieCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GENRE_NAMES } from "@/lib/genres";
import { useSeo } from "@/lib/seo";
import { movieService } from "@/services/movie.service";
import { tvService } from "@/services/tv.service";
import type { MediaType, TmdbMovie, TmdbTvShow } from "@/types";

type SortKey = "popular" | "newest" | "top";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "top", label: "Top Rated" },
];

function sortParam(type: MediaType, key: SortKey): string {
  if (key === "popular") return "popularity.desc";
  if (key === "top") return "vote_average.desc";
  return type === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
}

export default function GenrePage() {
  const { type, id } = useParams({ from: "/genre/$type/$id" });
  const mediaType: MediaType = type === "tv" ? "tv" : "movie";
  const genreId = Number(id);
  const genreName = GENRE_NAMES[genreId] ?? "Genre";

  const genreLabel = mediaType === "tv" ? "TV Shows" : "Movies";

  useSeo({
    title: `${genreName} ${genreLabel} - Onewatch | Free ${genreLabel} Streaming`,
    description: `Watch the best ${genreName} ${genreLabel.toLowerCase()} online free on Onewatch. Stream popular ${genreName} titles in HD without signup.`,
    path: `/genre/${type}/${id}`,
  });

  const [sort, setSort] = useState<SortKey>("popular");
  const [items, setItems] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [hero, setHero] = useState<TmdbMovie | TmdbTvShow | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const service = useMemo(
    () => (mediaType === "tv" ? tvService : movieService),
    [mediaType],
  );

  // Pick a hero from the most popular titles in this genre (needs a backdrop).
  useEffect(() => {
    let cancelled = false;
    setHero(null);
    void service.byGenre(genreId, 1, "popularity.desc").then((list) => {
      if (cancelled) return;
      setHero(list.find((m) => m.backdrop_path) ?? list[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [service, genreId]);

  // Load the grid for the active sort.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    void service
      .byGenre(genreId, 1, sortParam(mediaType, sort))
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setHasMore(list.length >= 20);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [service, genreId, mediaType, sort]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const more = await service.byGenre(genreId, next, sortParam(mediaType, sort));
      setItems((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...more.filter((m) => !seen.has(m.id))];
      });
      setPage(next);
      if (more.length < 20) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="pb-16">
      {hero ? (
        <HeroBanner item={hero} mediaType={mediaType} />
      ) : (
        <div className="h-[70vh] min-h-[420px] w-full animate-pulse bg-white/5 sm:h-[80vh] sm:min-h-[480px]" />
      )}

      <section className="mx-auto mt-8 max-w-none px-4 sm:mt-12 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {genreName} {mediaType === "tv" ? "Shows" : "Movies"}
          </h1>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 min-w-[10rem]" aria-label="Sort titles">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORTS.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video w-full rounded" />
              ))
            : items.length === 0
              ? (
                <p className="col-span-full text-white/60">
                  No titles found in this category.
                </p>
              )
              : items.map((m) => (
                  <MovieCard
                    key={m.id}
                    item={m}
                    mediaType={mediaType}
                    className="w-full"
                  />
                ))}
        </div>

        {!loading && items.length > 0 && hasMore && (
          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={loadMore}
              disabled={loadingMore}
              className="px-10"
            >
              {loadingMore ? "Loading…" : "Show more"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
