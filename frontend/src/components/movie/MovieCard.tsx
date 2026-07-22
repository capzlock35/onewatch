import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, Play, Plus, ThumbsUp } from "lucide-react";

import { backdropUrl, posterUrl } from "@/lib/tmdb";
import { genreNames } from "@/lib/genres";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player.store";
import { useWatchlistStore } from "@/store/watchlist.store";
import type { MediaType, TmdbMovie, TmdbTvShow } from "@/types";

interface MovieCardProps {
  item: TmdbMovie | TmdbTvShow;
  mediaType: MediaType;
  className?: string;
}

/** How much bigger the hover-preview is than the resting card. */
const EXPAND = 1.4;
/** Delay before the Netflix-style hover preview pops (ms). */
const OPEN_DELAY = 350;

export function MovieCard({ item, mediaType, className }: MovieCardProps) {
  const title = "title" in item ? item.title : item.name;
  const detailRoute = mediaType === "movie" ? "/movie/$id" : "/tv/$id";
  const openPlayer = usePlayerStore((s) => s.open);
  const navigate = useNavigate();
  const watchlistItem = useWatchlistStore((s) => s.find(mediaType, item.id));
  const addToList = useWatchlistStore((s) => s.add);
  const removeFromList = useWatchlistStore((s) => s.remove);
  const inList = !!watchlistItem;

  const goDetail = useCallback(() => {
    void navigate({ to: detailRoute, params: { id: String(item.id) } });
  }, [navigate, detailRoute, item.id]);

  const handlePlay = (e: React.MouseEvent) => {
    // Stop the wrapping <Link>, then open the session AND navigate to the detail
    // page where the InlinePlayer actually renders (the homepage has no player).
    e.preventDefault();
    e.stopPropagation();
    openPlayer({ mediaType, tmdbId: item.id, title, posterPath: item.poster_path });
    goDetail();
  };

  const handleToggleList = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (watchlistItem) {
      await removeFromList(watchlistItem.id);
    } else {
      await addToList({
        media_type: mediaType,
        tmdb_id: item.id,
        title,
        poster_path: item.poster_path,
      });
    }
  };

  const handleDetail = (e: React.MouseEvent) => {
    // Chevron mirrors the wrapping <Link> target; prevent the outer navigation
    // from firing twice, then route to the detail page explicitly.
    e.preventDefault();
    e.stopPropagation();
    goDetail();
  };

  const imgSrc = item.backdrop_path
    ? backdropUrl(item.backdrop_path, "w780")
    : item.poster_path
      ? posterUrl(item.poster_path, "w500")
      : null;

  const dateStr = "release_date" in item ? item.release_date : item.first_air_date;
  const year = dateStr ? dateStr.slice(0, 4) : null;
  const rating = item.vote_average && item.vote_average > 0
    ? item.vote_average.toFixed(1)
    : null;
  const typeLabel = mediaType === "movie" ? "Movie" : "TV Show";
  const matchPct = item.vote_average && item.vote_average > 0
    ? Math.round(item.vote_average * 10)
    : null;
  const maturity = "adult" in item && item.adult ? "18+" : "13+";
  const genres = genreNames(item.genre_ids);

  // --- Netflix hover-preview (desktop only), portaled to <body> so no row's
  // overflow can ever clip it. Nothing is cut; the whole card is always visible.
  const cardRef = useRef<HTMLAnchorElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [preview, setPreview] = useState<{ left: number; top: number; width: number } | null>(null);
  const [shown, setShown] = useState(false); // drives the grow-in transition

  const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    window.innerWidth >= 768;

  const computePlacement = useCallback(() => {
    const el = cardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const width = r.width * EXPAND;
    const imgH = width * (r.height / r.width); // preserve 16:9
    const estPanel = 150; // controls + meta + genres
    const totalH = imgH + estPanel;
    const margin = 12;
    // Center the expanded image over the resting card, then clamp to viewport.
    let left = r.left - (width - r.width) / 2;
    let top = r.top - (imgH - r.height) / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - totalH - margin));
    return { left, top, width };
  }, []);

  const open = useCallback(() => {
    if (!canHover()) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => {
      const p = computePlacement();
      if (!p) return;
      setPreview(p);
      requestAnimationFrame(() => setShown(true));
    }, OPEN_DELAY);
  }, [computePlacement]);

  const close = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => {
      setShown(false);
      setPreview(null);
    }, 120);
  }, []);

  // Close on any scroll/resize — a fixed preview can't track a moving card.
  useEffect(() => {
    if (!preview) return;
    const hide = () => {
      setShown(false);
      setPreview(null);
    };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [preview]);

  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const ControlBtn = ({
    onClick,
    label,
    children,
    filled,
  }: {
    onClick?: (e: React.MouseEvent) => void;
    label: string;
    children: React.ReactNode;
    filled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        filled
          ? "bg-white text-black hover:bg-white/80"
          : "border-2 border-white/50 text-white hover:border-white",
      )}
    >
      {children}
    </button>
  );

  return (
    <Link
      ref={cardRef}
      to={detailRoute}
      params={{ id: String(item.id) }}
      onMouseEnter={open}
      onMouseLeave={close}
      className={cn("group relative block w-60 shrink-0 sm:w-64 md:w-80 lg:w-96", className)}
    >
      {/* Resting boxart: clean 16:9, rounded, no persistent controls. */}
      <div className="relative aspect-video overflow-hidden rounded bg-white/5">
        {imgSrc ? (
          <img src={imgSrc} alt={title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm text-white/60">
            {title}
          </div>
        )}
      </div>

      {/* Touch/mobile meta: image + title + tiny meta. Hidden on md+ (hover preview takes over). */}
      <div className="mt-2 px-1 md:hidden">
        <p className="line-clamp-1 text-sm font-semibold text-white">{title}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
          {rating && (
            <>
              <span className="font-semibold text-[#46d369]">{rating}</span>
              <span className="text-white/30">·</span>
            </>
          )}
          {year && (
            <>
              <span>{year}</span>
              <span className="text-white/30">·</span>
            </>
          )}
          <span>{typeLabel}</span>
        </div>
      </div>

      {/* Portaled hover preview — fixed to the viewport, so no overflow clips it. */}
      {preview &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (closeTimer.current) clearTimeout(closeTimer.current);
            }}
            onMouseLeave={close}
            style={{ left: preview.left, top: preview.top, width: preview.width }}
            className={cn(
              "fixed z-[100] origin-center overflow-hidden rounded-md bg-[#181818] shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all duration-200",
              shown ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            {/* Expanded image — clicking navigates to detail. */}
            <button
              type="button"
              onClick={handleDetail}
              aria-label={`More info about ${title}`}
              className="block w-full"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                {imgSrc ? (
                  <img src={imgSrc} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm text-white/60">
                    {title}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#181818] via-[#181818]/60 to-transparent" />
                <p className="absolute inset-x-0 bottom-0 z-10 line-clamp-2 px-3 pb-2 text-left text-sm font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {title}
                </p>
              </div>
            </button>

            <div className="p-4">
              <div className="flex items-center gap-2">
                <ControlBtn onClick={handlePlay} label={`Play ${title}`} filled>
                  <Play className="h-4 w-4 fill-current" />
                </ControlBtn>
                <ControlBtn
                  onClick={handleToggleList}
                  label={inList ? `Remove ${title} from my list` : `Add ${title} to my list`}
                >
                  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </ControlBtn>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/50 text-white"
                >
                  <ThumbsUp className="h-4 w-4" />
                </span>
                <span className="flex-1" />
                <ControlBtn onClick={handleDetail} label={`More info about ${title}`}>
                  <ChevronDown className="h-4 w-4" />
                </ControlBtn>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {matchPct !== null && (
                  <span className="font-semibold text-[#46d369]">{matchPct}% Match</span>
                )}
                <span className="rounded border border-white/40 px-1 text-[10px] text-white/70">HD</span>
                <span className="rounded border border-white/40 px-1 text-[10px] text-white/70">
                  {maturity}
                </span>
                {year && <span className="text-white/70">{year}</span>}
                <span className="text-white/40">·</span>
                <span className="text-white/70">{typeLabel}</span>
              </div>

              {genres.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs text-white/80">
                  {genres.map((g, i) => (
                    <span key={g} className="flex items-center gap-x-1.5">
                      {i > 0 && <span className="text-white/40">•</span>}
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </Link>
  );
}
