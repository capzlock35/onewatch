import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MovieCard } from "./MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MediaType, TmdbMovie, TmdbTvShow } from "@/types";

interface MovieRowProps {
  title: string;
  items: (TmdbMovie | TmdbTvShow)[];
  mediaType: MediaType;
  loading?: boolean;
  /** When provided, a Movies | Series toggle is shown and switches the row content. */
  tvItems?: TmdbTvShow[];
}

export function MovieRow({ title, items, mediaType, loading, tvItems }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const dual = Array.isArray(tvItems);
  const [active, setActive] = useState<MediaType>(mediaType);

  const activeItems = dual && active === "tv" ? tvItems! : items;
  const activeType: MediaType = dual ? active : mediaType;

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  const switchTo = (t: MediaType) => {
    setActive(t);
    rowRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <section className="group/row relative mx-auto max-w-none">
      <div className="mb-2 flex items-center justify-between gap-4 px-4 sm:px-8">
        <h2 className="group/title flex w-fit cursor-pointer items-center gap-2 text-lg font-bold text-white sm:text-xl">
          <span>{title}</span>
          <span className="flex items-center text-sm font-medium text-white/70 opacity-0 -translate-x-1 transition-all duration-300 group-hover/row:translate-x-0 group-hover/row:opacity-100">
            Explore All
            <ChevronRight className="h-4 w-4" />
          </span>
        </h2>

        {dual && (
          <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
            {(["movie", "tv"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTo(t)}
                className="relative pb-1.5 transition-colors duration-200"
              >
                <span
                  className={cn(
                    active === t ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {t === "movie" ? "Movies" : "Series"}
                </span>
                {active === t && (
                  <span className="absolute -bottom-px left-0 h-0.5 w-full bg-white" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        {/* Left edge chevron panel — desktop only, on row hover. */}
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute inset-y-4 left-0 z-30 hidden w-12 items-center justify-center bg-black/40 text-white opacity-0 transition-all duration-200 hover:bg-black/60 group-hover/row:opacity-100 md:inset-y-8 md:flex"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div
          ref={rowRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth px-4 py-4 sm:gap-4 sm:px-8 md:py-8"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-video w-60 shrink-0 rounded sm:w-64 md:w-80 lg:w-96"
                />
              ))
            : activeItems.map((item) => (
                <MovieCard key={`${activeType}-${item.id}`} item={item} mediaType={activeType} />
              ))}
        </div>

        {/* Right edge chevron panel — desktop only, on row hover. */}
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute inset-y-4 right-0 z-30 hidden w-12 items-center justify-center bg-black/40 text-white opacity-0 transition-all duration-200 hover:bg-black/60 group-hover/row:opacity-100 md:inset-y-8 md:flex"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
}
