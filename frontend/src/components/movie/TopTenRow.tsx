import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { posterUrl } from "@/lib/tmdb";
import { useWatchlistStore } from "@/store/watchlist.store";
import type { TmdbMovie } from "@/types";

interface TopTenRowProps {
  items: TmdbMovie[];
  loading?: boolean;
}

export function TopTenRow({ items, loading }: TopTenRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  return (
    <section className="group/row relative mx-auto max-w-none px-4 sm:px-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white sm:text-xl">Top 10 Today</h2>

        <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth pb-4 sm:gap-4"
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex shrink-0 items-end">
                <div className="w-[38%] min-w-[3.5rem] sm:min-w-[4.5rem]" />
                <Skeleton className="aspect-[2/3] w-28 shrink-0 rounded-md sm:w-36 md:w-40" />
              </div>
            ))
          : items.slice(0, 10).map((item, idx) => (
              <TopTenCard key={item.id} item={item} rank={idx + 1} />
            ))}
      </div>
    </section>
  );
}

function TopTenCard({ item, rank }: { item: TmdbMovie; rank: number }) {
  const watchlistItem = useWatchlistStore((s) => s.find("movie", item.id));
  const addToList = useWatchlistStore((s) => s.add);
  const removeFromList = useWatchlistStore((s) => s.remove);
  const inList = !!watchlistItem;

  const handleToggleList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (watchlistItem) {
      await removeFromList(watchlistItem.id);
    } else {
      await addToList({
        media_type: "movie",
        tmdb_id: item.id,
        title: item.title,
        poster_path: item.poster_path,
      });
    }
  };

  return (
    <Link
      to="/movie/$id"
      params={{ id: String(item.id) }}
      className="group flex shrink-0 items-end"
    >
      {/* Giant outlined rank numeral */}
      <span
        aria-hidden="true"
        className="select-none font-black leading-[0.75] text-[7rem] tracking-tighter sm:text-[9rem] md:text-[10rem]"
        style={{ color: "#141414", WebkitTextStroke: "2px #5a5a5a" }}
      >
        {rank}
      </span>

      <div className="relative -ml-4 aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-md sm:-ml-6 sm:w-36 md:w-40">
        {item.poster_path ? (
          <img
            src={posterUrl(item.poster_path, "w500")}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 px-3 text-center text-sm text-white/60">
            {item.title}
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleList}
          aria-label={inList ? `Remove ${item.title} from my list` : `Add ${item.title} to my list`}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-white hover:bg-black/80"
        >
          {inList ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </div>
    </Link>
  );
}
