import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { EpisodeListSkeleton } from "@/components/shared/Skeletons";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tvService } from "@/services/tv.service";
import { posterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import type { TmdbEpisode, TmdbSeason } from "@/types";

interface EpisodeSelectorProps {
  tvId: number;
  seasons: TmdbSeason[];
  selectedSeason: number;
  selectedEpisode: number;
  onSelect: (season: number, episode: number) => void;
  /** Fill the parent's height as a flex column with an internally-scrolling
   *  list — used by the boxed side panel so the list scrolls in place. */
  fill?: boolean;
}

export function EpisodeSelector({
  tvId,
  seasons,
  selectedSeason,
  selectedEpisode,
  onSelect,
  fill,
}: EpisodeSelectorProps) {
  const [season, setSeason] = useState(selectedSeason);
  const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  // Spoiler protection: when on, every episode's still + title + overview is
  // hidden and must be revealed one at a time. Toggling it off shows all.
  const [spoilerProtection, setSpoilerProtection] = useState(true);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // New season → re-hide everything so freshly loaded episodes stay covered.
    setRevealed(new Set());
    tvService
      .season(tvId, season)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes ?? []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tvId, season]);

  const realSeasons = seasons.filter((s) => s.season_number > 0);

  const setProtection = (on: boolean) => {
    setSpoilerProtection(on);
    if (on) setRevealed(new Set()); // turning protection back on re-hides all
  };

  const reveal = (episodeNumber: number) =>
    setRevealed((prev) => new Set(prev).add(episodeNumber));

  return (
    <div
      className={cn(
        "space-y-3",
        // Fill + internal scroll only on xl+ (the boxed side panel). Below xl the
        // list flows naturally and the page scrolls — no nested scroll on
        // mobile/tablet portrait (incl. iPad Pro portrait at 1024px).
        fill && "xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:gap-3 xl:space-y-0",
      )}
    >
      {/* Spoiler Protection master toggle */}
      <div className="flex shrink-0 items-center justify-between gap-3 rounded bg-[#181818] px-4 py-3">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
          <Lock className={cn("h-4 w-4", spoilerProtection ? "text-white" : "text-white/40")} />
          Spoiler Protection
        </span>
        <Switch
          checked={spoilerProtection}
          onCheckedChange={setProtection}
          aria-label="Toggle spoiler protection"
        />
      </div>

      {/* Season picker */}
      <div className="shrink-0">
        <Select value={String(season)} onValueChange={(v) => setSeason(Number(v))}>
          <SelectTrigger aria-label="Select season">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {realSeasons.map((s) => (
              <SelectItem key={s.id} value={String(s.season_number)}>
                Season {s.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <EpisodeListSkeleton />
      ) : (
        <ul
          // data-lenis-prevent: stop the global Lenis smooth-scroll from
          // hijacking the wheel here so this list scrolls on hover/wheel
          // instead of only by dragging the scrollbar.
          data-lenis-prevent
          className={cn("space-y-0", fill && "xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1")}
        >
          {episodes.map((ep) => {
            const isActive = season === selectedSeason && ep.episode_number === selectedEpisode;
            const hidden = spoilerProtection && !revealed.has(ep.episode_number);

            if (hidden) {
              // Locked row: blurred still, redacted title, tap anywhere to reveal.
              return (
                <li key={ep.id} className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => reveal(ep.episode_number)}
                    aria-label={`Reveal episode ${ep.episode_number}`}
                    className="flex w-full items-center gap-4 rounded px-2 py-4 text-left transition hover:bg-white/10"
                  >
                    <span className="w-6 shrink-0 text-center text-lg font-semibold text-white/60">
                      {ep.episode_number}
                    </span>
                    <div className="relative flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded bg-black sm:w-32">
                      {ep.still_path && (
                        <img
                          src={posterUrl(ep.still_path, "w342")}
                          alt=""
                          aria-hidden
                          className="h-full w-full scale-110 object-cover blur-md"
                        />
                      )}
                      <Lock className="absolute h-4 w-4 text-white/70" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-32 max-w-full rounded bg-white/15" />
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/80">
                        <Lock className="h-3 w-3" />
                        Tap to reveal
                      </span>
                    </div>
                  </button>
                </li>
              );
            }

            return (
              <li key={ep.id} className="border-b border-white/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => onSelect(season, ep.episode_number)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded px-2 py-4 text-left transition hover:bg-white/10",
                    isActive && "bg-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 shrink-0 text-center text-lg font-semibold",
                      isActive ? "text-white" : "text-white/60",
                    )}
                  >
                    {ep.episode_number}
                  </span>
                  <div className="flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded bg-black sm:w-32">
                    {ep.still_path ? (
                      <img
                        src={posterUrl(ep.still_path, "w342")}
                        alt={ep.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-white/40">No image</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {ep.name}
                      </p>
                      {ep.runtime ? (
                        <span className="shrink-0 text-xs text-white/60">{ep.runtime}m</span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/60">
                      {ep.overview}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
