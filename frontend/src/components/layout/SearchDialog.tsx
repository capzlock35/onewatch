import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import {
  Clapperboard,
  LayoutGrid,
  Search as SearchIcon,
  Star,
  Tv,
  User,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { posterUrl, profileUrl } from "@/lib/tmdb";
import { searchService } from "@/services/search.service";
import { trendingService } from "@/services/trending.service";
import { cn } from "@/lib/utils";
import type { TmdbMultiSearchResult } from "@/types";

type Filter = "all" | "movie" | "tv" | "person";

const FILTERS: { key: Filter; label: string; icon: typeof LayoutGrid }[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "movie", label: "Movies", icon: Clapperboard },
  { key: "tv", label: "TV Shows", icon: Tv },
  { key: "person", label: "People", icon: User },
];

interface RowInfo {
  title: string;
  meta: string;
  rating: number | null;
  image: string;
  rounded: boolean;
  to: string;
  search?: { q: string };
}

function rowInfo(r: TmdbMultiSearchResult): RowInfo {
  if (r.media_type === "person") {
    return {
      title: r.name ?? "Unknown",
      meta: r.known_for_department ?? "Person",
      rating: null,
      image: profileUrl(r.profile_path, "w185"),
      rounded: true,
      to: `/person/${r.id}`,
    };
  }
  if (r.media_type === "tv") {
    const year = r.first_air_date?.slice(0, 4);
    return {
      title: r.name ?? "Untitled",
      meta: year ? `TV Show · ${year}` : "TV Show",
      rating: r.vote_average ?? null,
      image: posterUrl(r.poster_path, "w342"),
      rounded: false,
      to: `/tv/${r.id}`,
    };
  }
  const year = r.release_date?.slice(0, 4);
  return {
    title: r.title ?? "Untitled",
    meta: year ? `Movie · ${year}` : "Movie",
    rating: r.vote_average ?? null,
    image: posterUrl(r.poster_path, "w342"),
    rounded: false,
    to: `/movie/${r.id}`,
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return useMemo(() => debounced, [debounced]);
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [results, setResults] = useState<TmdbMultiSearchResult[]>([]);
  const [trending, setTrending] = useState<TmdbMultiSearchResult[]>([]);
  const [trendingPeople, setTrendingPeople] = useState<TmdbMultiSearchResult[]>([]);
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [trendingPeopleLoaded, setTrendingPeopleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounced = useDebounce(query, 300);
  const term = debounced.trim();

  // Reset transient state each time the dialog is opened.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("all");
      setResults([]);
    }
  }, [open]);

  // Load "Trending Today" (movies + TV) once for the empty state.
  useEffect(() => {
    if (!open || trendingLoaded) return;
    let cancelled = false;
    trendingService
      .all("day")
      .then((items) => {
        if (!cancelled) setTrending(items.filter((i) => i.media_type !== "person"));
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setTrendingLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [open, trendingLoaded]);

  // Load trending people for the empty state's "People" filter.
  useEffect(() => {
    if (!open || trendingPeopleLoaded) return;
    let cancelled = false;
    trendingService
      .people("day")
      .then((people) => {
        if (cancelled) return;
        setTrendingPeople(
          people.map((p) => ({
            id: p.id,
            media_type: "person" as const,
            popularity: p.popularity,
            name: p.name,
            profile_path: p.profile_path,
            known_for_department: p.known_for_department,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setTrendingPeopleLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [open, trendingPeopleLoaded]);

  // Live search.
  useEffect(() => {
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchService
      .multi(term)
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [term]);

  const filtered = useMemo(() => {
    if (filter === "all") return results;
    return results.filter((r) => r.media_type === filter);
  }, [results, filter]);

  const trendingFiltered = useMemo(() => {
    if (filter === "person") return trendingPeople;
    if (filter === "all") return trending;
    return trending.filter((r) => r.media_type === filter);
  }, [filter, trending, trendingPeople]);

  const trendingReady = filter === "person" ? trendingPeopleLoaded : trendingLoaded;
  const filterNoun =
    filter === "movie"
      ? "movies"
      : filter === "tv"
        ? "TV shows"
        : filter === "person"
          ? "people"
          : "results";

  const select = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-[#141414] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:inset-x-1/2 sm:left-1/2 sm:top-[6vh] sm:h-[88vh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:rounded sm:border sm:border-white/10 sm:bg-[#181818] sm:shadow-[0_8px_28px_rgba(0,0,0,0.8)]">
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search movies, series, and people
          </DialogPrimitive.Description>

          {/* Header: Netflix field, no wordmark */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
            <div className="flex h-11 flex-1 items-center gap-3 rounded border border-white/20 bg-[#333333] px-4 focus-within:border-white/60">
              <SearchIcon className="h-5 w-5 shrink-0 text-white/50" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, series, and people..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 text-white/40 transition hover:text-white"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <DialogPrimitive.Close
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Filter chips — active chip stays red */}
          <div className="scrollbar-hide flex gap-2 overflow-x-auto px-5">
            {FILTERS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded px-3.5 py-1.5 text-xs font-semibold transition",
                  filter === key
                    ? "bg-[#e50914] text-white hover:bg-[#f40612]"
                    : "bg-[#2a2a2a] text-white/70 hover:bg-white/15 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div
            data-lenis-prevent
            className="scrollbar-hide mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {!term ? (
              <>
                <h2 className="mb-3 text-base font-bold text-white sm:text-lg">
                  Trending Today
                </h2>
                {!trendingReady && trendingFiltered.length === 0 ? (
                  <ResultGridSkeleton />
                ) : trendingFiltered.length === 0 ? (
                  <p className="py-10 text-center text-sm text-white/50">
                    Nothing trending right now.
                  </p>
                ) : (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {trendingFiltered.map((r, i) => (
                      <ResultTile key={`${r.media_type}-${r.id}`} item={r} index={i + 1} onSelect={select} />
                    ))}
                  </ul>
                )}
              </>
            ) : loading && filtered.length === 0 ? (
              <ResultGridSkeleton />
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/50">
                No {filterNoun} for "{term}".
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map((r) => (
                  <ResultTile key={`${r.media_type}-${r.id}`} item={r} onSelect={select} />
                ))}
              </ul>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ResultGridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="space-y-2">
          <Skeleton className="aspect-video w-full rounded" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </li>
      ))}
    </ul>
  );
}

function ResultTile({
  item,
  index,
  onSelect,
}: {
  item: TmdbMultiSearchResult;
  index?: number;
  onSelect: () => void;
}) {
  const info = rowInfo(item);
  return (
    <li>
      <Link
        to={info.to}
        search={info.search as never}
        onClick={onSelect}
        className="group block overflow-hidden rounded bg-[#181818] transition hover:bg-[#242424]"
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-white/5",
            info.rounded ? "aspect-square" : "aspect-video",
          )}
        >
          {info.image ? (
            <img
              src={info.image}
              alt=""
              className={cn(
                "h-full w-full transition duration-300 group-hover:scale-105",
                info.rounded ? "object-cover object-top" : "object-cover",
              )}
              loading="lazy"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-white/20">
              {info.rounded ? <User className="h-8 w-8" /> : <Clapperboard className="h-8 w-8" />}
            </span>
          )}
          {index != null && (
            <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-white">
              {String(index).padStart(2, "0")}
            </span>
          )}
        </div>
        <div className="min-w-0 px-2.5 py-2">
          <div className="truncate text-sm font-semibold text-white">{info.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/55">
            <span className="truncate">{info.meta}</span>
            {info.rating != null && info.rating > 0 && (
              <span className="flex shrink-0 items-center gap-0.5">
                <span className="text-white/30">·</span>
                <Star className="h-3 w-3 fill-[#f5c518] text-[#f5c518]" />
                {info.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
