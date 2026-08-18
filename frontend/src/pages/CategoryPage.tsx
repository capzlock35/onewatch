import { useEffect, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";

import { MovieCard } from "@/components/movie/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useSeo } from "@/lib/seo";
import { movieService } from "@/services/movie.service";
import type { TmdbGenre, TmdbMovie } from "@/types";

export default function CategoryPage() {
  const [genres, setGenres] = useState<TmdbGenre[]>([]);

  useSeo({
    title: "Browse Movies by Genre - Onewatch | Free Movie Categories",
    description:
      "Find movies by category on Onewatch. Browse all movie genres — action, comedy, drama, horror, romance, sci-fi and more — and watch free online.",
    path: "/category",
  });

  const [activeId, setActiveId] = useState<number | null>(null);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void movieService.genres().then((g) => {
      if (cancelled) return;
      setGenres(g);
      if (g.length > 0) setActiveId(g[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeId == null) return;
    let cancelled = false;
    setLoading(true);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    movieService
      .byGenre(activeId, 1)
      .then((m) => {
        if (cancelled) return;
        setMovies(m);
        setHasMore(m.length >= 20);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const loadMore = async () => {
    if (activeId == null || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const more = await movieService.byGenre(activeId, nextPage);
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const fresh = more.filter((m) => !seen.has(m.id));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
      if (more.length < 20) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const activeGenre = genres.find((g) => g.id === activeId);

  return (
    <div className="mx-auto max-w-none px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-6 lg:px-12">
      <header className="mb-4 flex items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Categories
        </h1>

        <div className="sm:hidden">
          <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded border border-white/40 bg-black/40 pl-3 pr-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              <SlidersHorizontal className="h-4 w-4 text-white/80" />
              <span>{activeGenre ? activeGenre.name : "Pick a category"}</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="px-4 pb-6 pt-4">
              <h2 className="mb-4 text-base font-semibold text-white">Categories</h2>
              <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                {genres.length === 0
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-11 w-full rounded" />
                    ))
                  : genres.map((g) => {
                      const isActive = g.id === activeId;
                      return (
                        <DrawerClose asChild key={g.id}>
                          <button
                            type="button"
                            onClick={() => setActiveId(g.id)}
                            className={cn(
                              "flex w-full items-center justify-between rounded px-4 py-3 text-left text-sm transition",
                              isActive
                                ? "bg-white/10 font-semibold text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white",
                            )}
                          >
                            <span>{g.name}</span>
                            {isActive && <Check className="h-4 w-4 text-white" />}
                          </button>
                        </DrawerClose>
                      );
                    })}
              </div>
            </div>
          </DrawerContent>
          </Drawer>
        </div>
      </header>

      {/* Desktop: Netflix underline segmented control (no brand-red on controls). */}
      <div className="hidden border-b border-white/10 sm:block">
        <div className="scrollbar-hide -mb-px flex flex-wrap gap-x-6 gap-y-1 overflow-x-auto">
          {genres.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="my-2 h-6 w-20 shrink-0 rounded" />
              ))
            : genres.map((g) => {
                const isActive = g.id === activeId;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveId(g.id)}
                    className={cn(
                      "shrink-0 border-b-2 pb-3 pt-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-white text-white"
                        : "border-transparent text-white/60 hover:text-white",
                    )}
                  >
                    {g.name}
                  </button>
                );
              })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded" />
            ))
          : movies.length === 0
            ? (
              <p className="col-span-full py-16 text-center text-white/60">No titles found in this category.</p>
            )
            : movies.map((m) => (
                <MovieCard key={m.id} item={m} mediaType="movie" className="w-full" />
              ))}
      </div>

      {!loading && movies.length > 0 && hasMore && (
        <div className="mt-12 flex justify-center">
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
    </div>
  );
}
