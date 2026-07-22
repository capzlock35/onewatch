import { useEffect, useState } from "react";

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
import {
  discoverService,
  type DiscoverMovieParams,
  type DiscoverTvParams,
} from "@/services/discover.service";
import type { MediaType, TmdbMovie, TmdbTvShow } from "@/types";

type SortKey = "popular" | "newest" | "top";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "top", label: "Top Rated" },
];

function sortBy(kind: MediaType, key: SortKey): string {
  if (key === "popular") return "popularity.desc";
  if (key === "top") return "vote_average.desc";
  return kind === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
}

const PER_PAGE = 20;

export interface DiscoverPageProps {
  title: string;
  kind: MediaType;
  /** Extra discover filters (e.g. { with_genres: 16, with_original_language: "ja" }). */
  filters?: Record<string, string | number>;
  documentTitle?: string;
}

/**
 * Shared Netflix-style discover page: billboard hero + sort dropdown + poster
 * grid + "Show more" pagination. Powers Movies, TV Shows, Anime, and language
 * browse pages — all real TMDB content.
 */
export function DiscoverPage({ title, kind, filters, documentTitle }: DiscoverPageProps) {
  const [sort, setSort] = useState<SortKey>("popular");
  const [items, setItems] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [hero, setHero] = useState<TmdbMovie | TmdbTvShow | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filtersKey = JSON.stringify(filters ?? {});

  useEffect(() => {
    document.title = documentTitle ?? `${title} - Onewatch | Free Streaming`;
  }, [title, documentTitle]);

  async function fetchPage(p: number, key: SortKey): Promise<(TmdbMovie | TmdbTvShow)[]> {
    const base = {
      ...(filters ?? {}),
      sort_by: sortBy(kind, key),
      page: p,
      ...(key === "top" ? { "vote_count.gte": 200 } : {}),
    };
    const res =
      kind === "tv"
        ? await discoverService.tv(base as unknown as DiscoverTvParams)
        : await discoverService.movies(base as unknown as DiscoverMovieParams);
    return res.results ?? [];
  }

  // Hero: most popular title with a backdrop.
  useEffect(() => {
    let cancelled = false;
    setHero(null);
    void fetchPage(1, "popular").then((list) => {
      if (!cancelled) setHero(list.find((m) => m.backdrop_path) ?? list[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, filtersKey]);

  // Grid on sort/filter change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);
    setPage(1);
    setHasMore(true);
    void fetchPage(1, sort)
      .then((list) => {
        if (cancelled) return;
        setItems(list);
        setHasMore(list.length >= PER_PAGE);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, filtersKey, sort]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setLoadingMore(true);
    try {
      const more = await fetchPage(next, sort);
      setItems((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...more.filter((m) => !seen.has(m.id))];
      });
      setPage(next);
      if (more.length < PER_PAGE) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="pb-16">
      {hero ? (
        <HeroBanner item={hero} mediaType={kind} />
      ) : (
        <div className="h-[70vh] min-h-[420px] w-full animate-pulse bg-white/5 sm:h-[80vh] sm:min-h-[480px]" />
      )}

      <section className="mx-auto mt-8 max-w-none px-4 sm:mt-12 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>

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
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded" />
            ))
          ) : items.length === 0 ? (
            <p className="col-span-full text-white/60">No titles found.</p>
          ) : (
            items.map((m) => (
              <MovieCard key={m.id} item={m} mediaType={kind} className="w-full" />
            ))
          )}
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
