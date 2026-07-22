import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, ListVideo, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { posterUrl } from "@/lib/tmdb";
import { useWatchlistStore } from "@/store/watchlist.store";

export default function WatchlistPage() {
  const { items, load, loaded, remove } = useWatchlistStore();

  useEffect(() => {
    document.title = "My Watchlist - Onewatch | Save Movies & TV Shows";
    if (!loaded) void load();
  }, [loaded, load]);

  return (
    <div className="mx-auto max-w-none px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-8">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">My List</h1>

      {!loaded ? (
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <ListVideo className="h-9 w-9 text-white/80" />
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Your list is empty
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Add movies and shows to your list to keep track of what you want to
            watch and pick up right where you left off.
          </p>
          <Link
            to="/browse"
            className="mt-7 inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80 active:scale-95"
          >
            <Compass className="h-4 w-4" />
            Browse titles
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {items.map((item) => {
            const to = item.media_type === "movie" ? "/movie/$id" : "/tv/$id";
            return (
              <div
                key={item.id}
                className="group relative aspect-[2/3] overflow-hidden rounded bg-[#181818] transition-transform duration-200 hover:z-10 md:hover:scale-105"
              >
                <Link
                  to={to}
                  params={{ id: String(item.tmdb_id) }}
                  className="block h-full w-full"
                >
                  {item.poster_path ? (
                    <img
                      src={posterUrl(item.poster_path)}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs font-medium text-white/70">
                      {item.title}
                    </div>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/70 text-white opacity-100 backdrop-blur-sm transition hover:border-white hover:bg-black/90 active:scale-90 md:opacity-0 md:group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
