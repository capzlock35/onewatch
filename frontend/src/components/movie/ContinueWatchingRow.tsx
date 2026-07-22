import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

import { posterUrl } from "@/lib/tmdb";
import { usePlayerStore } from "@/store/player.store";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { removeContinue } from "@/lib/continueWatching";
import type { WatchHistoryItem } from "@/types";

export function ContinueWatchingRow() {
  const { history } = useWatchHistory();
  const rowRef = useRef<HTMLDivElement>(null);
  const openPlayer = usePlayerStore((s) => s.open);
  const navigate = useNavigate();

  if (history.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth : el.clientWidth, behavior: "smooth" });
  };

  const resume = (h: WatchHistoryItem) => {
    openPlayer({
      mediaType: h.media_type,
      tmdbId: h.tmdb_id,
      title: h.title,
      posterPath: h.poster_path,
      season: h.season ?? undefined,
      episode: h.episode ?? undefined,
      resumeAt: Math.floor(h.progress_seconds),
    });
    void navigate({
      to: h.media_type === "movie" ? "/movie/$id" : "/tv/$id",
      params: { id: String(h.tmdb_id) },
    });
  };

  return (
    <section className="group/row relative mx-auto max-w-none">
      <div className="mb-2 px-4 sm:px-8">
        <h2 className="text-lg font-bold text-white sm:text-xl">Continue Watching</h2>
      </div>

      <div className="relative">
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
          {history.map((h) => {
            const pct =
              h.duration_seconds > 0
                ? Math.min(100, Math.round((h.progress_seconds / h.duration_seconds) * 100))
                : 0;
            const img = h.poster_path ? posterUrl(h.poster_path, "w500") : null;
            const sub =
              h.media_type === "tv" && h.season && h.episode ? ` · S${h.season}:E${h.episode}` : "";
            return (
              <div
                key={`${h.media_type}-${h.tmdb_id}`}
                className="group/cw relative w-60 shrink-0 sm:w-64 md:w-80 lg:w-96"
              >
                <button
                  type="button"
                  onClick={() => resume(h)}
                  className="block w-full text-left"
                  aria-label={`Resume ${h.title}`}
                >
                  <div className="relative aspect-video overflow-hidden rounded bg-white/5">
                    {img ? (
                      <img
                        src={img}
                        alt={h.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm text-white/60">
                        {h.title}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover/cw:opacity-100">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </div>
                    {/* progress bar */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                      <div className="h-full bg-[#e50914]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </button>

                {/* remove — always visible on touch, hover-reveal on desktop */}
                <button
                  type="button"
                  onClick={() => removeContinue(h.media_type, h.tmdb_id)}
                  aria-label={`Remove ${h.title} from Continue Watching`}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition hover:bg-black/90 md:opacity-0 md:group-hover/cw:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>

                <p className="mt-2 line-clamp-1 px-1 text-sm font-semibold text-white">
                  {h.title}
                  {sub && <span className="text-white/60">{sub}</span>}
                </p>
              </div>
            );
          })}
        </div>

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
