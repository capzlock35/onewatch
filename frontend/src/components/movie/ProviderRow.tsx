import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { movieService } from "@/services/movie.service";
import { tvService } from "@/services/tv.service";
import { cn } from "@/lib/utils";
import type { MediaType, TmdbMovie, TmdbTvShow } from "@/types";

interface Provider {
  id: number;
  label: string;
}

// TMDB watch-provider ids (US region)
const PROVIDERS: Provider[] = [
  { id: 8, label: "Netflix" },
  { id: 337, label: "Disney+" },
  { id: 9, label: "Prime Video" },
  { id: 350, label: "Apple TV+" },
  { id: 1899, label: "Max" },
];

interface MixedItem {
  item: TmdbMovie | TmdbTvShow;
  mediaType: MediaType;
}

export function ProviderRow() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [provider, setProvider] = useState<Provider>(PROVIDERS[0]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MixedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const cache = useRef<Record<number, MixedItem[]>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cache.current[provider.id]) {
        setItems(cache.current[provider.id]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [movies, shows] = await Promise.all([
          movieService.byProvider(provider.id),
          tvService.byProvider(provider.id),
        ]);
        const merged: MixedItem[] = [
          ...movies.map((item) => ({ item, mediaType: "movie" as const })),
          ...shows.map((item) => ({ item, mediaType: "tv" as const })),
        ]
          .sort((a, b) => b.item.popularity - a.item.popularity)
          .slice(0, 20);
        cache.current[provider.id] = merged;
        if (!cancelled) setItems(merged);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  return (
    <section className="group/row relative mx-auto max-w-none px-4 sm:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
            <span>Only on</span>

            {/* Provider dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-white transition-colors hover:text-white/70"
                aria-haspopup="listbox"
                aria-expanded={open}
              >
                <span className="border-b-2 border-white/80 pb-0.5">{provider.label}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open && (
                <>
                  {/* click-away backdrop */}
                  <button
                    type="button"
                    className="fixed inset-0 z-20 cursor-default"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setOpen(false)}
                  />
                  <ul
                    role="listbox"
                    className="absolute left-0 top-full z-30 mt-2 min-w-[160px] overflow-hidden rounded border border-white/15 bg-[#181818] py-1 shadow-[0_8px_28px_rgba(0,0,0,0.8)]"
                  >
                    {PROVIDERS.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={p.id === provider.id}
                          onClick={() => {
                            setProvider(p);
                            setOpen(false);
                            rowRef.current?.scrollTo({ left: 0 });
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-normal transition-colors",
                            p.id === provider.id
                              ? "text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          {p.id === provider.id && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#e50914]" />
                          )}
                          <span className={p.id === provider.id ? "" : "ml-3.5"}>{p.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </h2>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center text-white/60 transition-all duration-200 hover:scale-110 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center text-white/60 transition-all duration-200 hover:scale-110 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth pb-4 pr-4 sm:gap-4"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="aspect-video w-60 shrink-0 rounded sm:w-64 md:w-80 lg:w-96"
              />
            ))
          : items.map(({ item, mediaType }) => (
              <MovieCard key={`${mediaType}-${item.id}`} item={item} mediaType={mediaType} />
            ))}
      </div>
    </section>
  );
}
