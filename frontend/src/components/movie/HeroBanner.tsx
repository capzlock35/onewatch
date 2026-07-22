import { useEffect, useRef, useState } from "react";
import { Info, Play } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { genreNames } from "@/lib/genres";
import { backdropUrl, logoUrl } from "@/lib/tmdb";
import { movieService } from "@/services/movie.service";
import { tvService } from "@/services/tv.service";
import { usePlayerStore } from "@/store/player.store";
import type { MediaType, TmdbImage, TmdbMovie, TmdbTvShow, TmdbVideo } from "@/types";

interface HeroBannerProps {
  item: TmdbMovie | TmdbTvShow;
  mediaType: MediaType;
}

// Minimal typing for the bits of the YouTube IFrame Player API we use.
interface YTPlayer {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
}

// Start covering with the banner this many seconds before the trailer's real
// end. We DON'T pause (that pops YouTube's center play button) — the video
// keeps playing behind the fully-opaque banner and is unmounted before it
// ever reaches its replay/end screen.
const END_GUARD_SEC = 2;

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          width?: string | number;
          height?: string | number;
          videoId?: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load the IFrame API script once and resolve when YT.Player is ready.
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

// YT player state codes.
const YT_UNSTARTED = -1;
const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_BUFFERING = 3;

// Keep the banner image up until the trailer has actually started, then wait
// long enough for YouTube's whole player UI to clear: the center play-button
// vanishes the moment playback begins, and the title/branding overlay
// auto-hides a few seconds in. Only then do we fade the banner away.
// Fallback reveals it anyway if no state events arrive.
const REVEAL_AFTER_PLAY_MS = 3200;
const REVEAL_FALLBACK_MS = 6000;
// Only unveil the trailer once it has genuinely played this many seconds, so
// no buffering spinner or play button is ever caught on screen.
const MIN_PLAY_SEC = 2;
// Require PLAYING to hold continuously this long (no BUFFERING/PAUSED) before
// revealing — proves the frames on screen are clean, not a spinner/button.
const STABLE_HOLD_MS = 900;
// How often we re-sample player time/state while gating the reveal.
const TIME_SAMPLE_MS = 250;

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  const yt = videos.filter((v) => v.site === "YouTube");
  return (
    yt.find((v) => v.type === "Trailer" && v.official) ??
    yt.find((v) => v.type === "Trailer") ??
    yt.find((v) => v.type === "Teaser") ??
    yt[0] ??
    null
  );
}

// Prefer an English logo, fall back to a language-less one, then the most
// voted. A wordmark logo reads far more cinematic than uppercase plain text.
function pickLogo(logos: TmdbImage[]): TmdbImage | null {
  if (!logos.length) return null;
  const en = logos.filter((l) => l.iso_639_1 === "en");
  const neutral = logos.filter((l) => l.iso_639_1 === null);
  const pool = en.length ? en : neutral.length ? neutral : logos;
  return [...pool].sort((a, b) => b.vote_average - a.vote_average)[0] ?? null;
}

export function HeroBanner({ item, mediaType }: HeroBannerProps) {
  const title = "title" in item ? item.title : item.name;
  const detailRoute = mediaType === "movie" ? "/movie/$id" : "/tv/$id";
  const openPlayer = usePlayerStore((s) => s.open);
  const navigate = useNavigate();

  const handlePlay = () => {
    // Start the session, then go to the detail page where it plays inline.
    openPlayer({ mediaType, tmdbId: item.id, title, posterPath: item.poster_path });
    void navigate({ to: detailRoute, params: { id: String(item.id) } });
  };

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [trailerEnded, setTrailerEnded] = useState(false);
  // When true the banner covers instantly (no fade) — used when the player is
  // paused/backgrounded so its play button never peeks through a slow fade.
  const [snapCover, setSnapCover] = useState(false);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTrailerKey(null);
    setTrailerPlaying(false);
    setTrailerEnded(false);
    setSnapCover(false);
    const fetcher = mediaType === "movie" ? movieService.videos(item.id) : tvService.videos(item.id);
    void fetcher.then((vids) => {
      if (cancelled) return;
      const t = pickTrailer(vids);
      setTrailerKey(t?.key ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [item.id, mediaType]);

  useEffect(() => {
    let cancelled = false;
    setLogoPath(null);
    const fetcher = mediaType === "movie" ? movieService.images(item.id) : tvService.images(item.id);
    void fetcher
      .then((imgs) => {
        if (cancelled) return;
        setLogoPath(pickLogo(imgs.logos ?? [])?.file_path ?? null);
      })
      .catch(() => {
        // no logo — the text title fallback covers this
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, mediaType]);

  useEffect(() => {
    const host = playerHostRef.current;
    if (!trailerKey || !host) return;
    let destroyed = false;
    let revealTimer: number | undefined;
    let endTimer: number | undefined;
    let pollTimer: number | undefined;
    let fadeGuard: number | undefined;
    let ending = false;
    let revealedOnce = false;
    // Timestamp of the last unstable moment (buffering/paused/unstarted). The
    // reveal gate waits until PLAYING has held past this for STABLE_HOLD_MS.
    let lastUnstableAt = performance.now();
    let prevSampleTime = -1;

    const clearFadeGuard = () => {
      if (fadeGuard !== undefined) {
        window.clearInterval(fadeGuard);
        fadeGuard = undefined;
      }
    };

    // After the banner fades out, keep watching: if the player stalls mid-fade
    // (re-buffer/pause) it would paint chrome through the half-faded banner —
    // snap the banner back instantly if so.
    const startFadeGuard = () => {
      clearFadeGuard();
      let elapsed = 0;
      fadeGuard = window.setInterval(() => {
        if (destroyed || ending) return clearFadeGuard();
        elapsed += 150;
        const p = playerRef.current;
        if (!p || p.getPlayerState() !== YT_PLAYING) {
          clearFadeGuard();
          cover();
          return;
        }
        if (elapsed >= 900) clearFadeGuard();
      }, 150);
    };

    // Reveal (fade the banner out) only when the player has been PLAYING
    // continuously for STABLE_HOLD_MS AND its time is advancing across two
    // samples AND past MIN_PLAY_SEC — i.e. clean frames, no spinner/button.
    const tryReveal = () => {
      if (destroyed || ending) return;
      const p = playerRef.current;
      if (!p || p.getPlayerState() !== YT_PLAYING) {
        prevSampleTime = -1;
        revealTimer = window.setTimeout(tryReveal, TIME_SAMPLE_MS);
        return;
      }
      const ct = p.getCurrentTime();
      const heldStable = performance.now() - lastUnstableAt >= STABLE_HOLD_MS;
      const advancing = prevSampleTime >= 0 && ct > prevSampleTime + 0.02;
      if (ct >= MIN_PLAY_SEC && heldStable && advancing) {
        revealedOnce = true;
        setSnapCover(false); // restore the fade for the next cover/reveal
        setTrailerPlaying(true);
        startFadeGuard();
        return;
      }
      prevSampleTime = ct;
      revealTimer = window.setTimeout(tryReveal, TIME_SAMPLE_MS);
    };
    // Re-entrant: a later pause/buffer can cover again and a resume re-reveals.
    const reveal = (delay: number) => {
      if (destroyed || ending) return;
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      prevSampleTime = -1;
      revealTimer = window.setTimeout(tryReveal, delay);
    };

    // Instantly drop the banner over the player (no fade) so a paused/
    // buffering/backgrounded player's controls never show through.
    const cover = () => {
      if (destroyed || ending) return;
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      clearFadeGuard();
      prevSampleTime = -1;
      lastUnstableAt = performance.now();
      setSnapCover(true);
      setTrailerPlaying(false);
    };

    // Cover with the banner (fade it back in), then unmount the player once
    // the crossfade has finished. Triggered just before the real end so the
    // replay/end screen never shows.
    const beginEnd = () => {
      if (ending || destroyed) return;
      ending = true;
      if (pollTimer !== undefined) window.clearInterval(pollTimer);
      // Fade the banner over the still-playing video (no pause → no play
      // button), then unmount once it's fully covered — before the real end.
      setTrailerPlaying(false);
      endTimer = window.setTimeout(() => setTrailerEnded(true), 750);
    };

    // The API replaces its target element with an <iframe>, so hand it a
    // throwaway child node rather than a React-owned one.
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.appendChild(mount);

    // Safety net: reveal anyway if the playing event never arrives (but not if
    // a real reveal already happened).
    const fallback = window.setTimeout(() => {
      if (!revealedOnce) reveal(0);
    }, REVEAL_FALLBACK_MS);

    // Returning to the tab: if the browser paused the trailer while it was
    // backgrounded, cover instantly and resume so no play button shows.
    const onVisibility = () => {
      if (document.visibilityState !== "visible" || ending) return;
      const p = playerRef.current;
      if (!p) return;
      try {
        if (p.getPlayerState() !== YT_PLAYING) {
          cover();
          p.playVideo();
        }
      } catch {
        // player not ready
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    void loadYouTubeApi().then(() => {
      if (destroyed || !window.YT) return;
      playerRef.current = new window.YT.Player(mount, {
        width: "100%",
        height: "100%",
        videoId: trailerKey,
        // NB: modestbranding is a no-op since 2023 and controls:0 only hides
        // the bottom bar — the top title band and center button can't be
        // suppressed by params, so we handle those via crop + gated reveal.
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (e) => {
            // The API-built iframe doesn't reliably carry autoplay permission;
            // without it a scripted play() can be rejected and stall paused
            // (which shows the center play button).
            host.querySelector("iframe")?.setAttribute(
              "allow",
              "autoplay; encrypted-media; picture-in-picture",
            );
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e) => {
            const s = e.data;
            if (s === YT_PLAYING) {
              // Gate the reveal until playback is provably stable. After a
              // hiccup we re-reveal quickly; the gate still vets it.
              reveal(revealedOnce ? 0 : REVEAL_AFTER_PLAY_MS);
              // Watch for the approaching end and cover before it gets there.
              if (pollTimer === undefined) {
                pollTimer = window.setInterval(() => {
                  const p = playerRef.current;
                  if (!p) return;
                  const dur = p.getDuration();
                  if (dur > 0 && dur - p.getCurrentTime() <= END_GUARD_SEC) {
                    beginEnd();
                  }
                }, 200);
              }
            } else if (
              s === YT_BUFFERING ||
              s === YT_PAUSED ||
              s === YT_UNSTARTED
            ) {
              // Any unstable state resets the stability clock so the next
              // reveal waits it out. If we'd already revealed, snap the banner
              // over the spinner/button this would paint.
              lastUnstableAt = performance.now();
              if (!ending && revealedOnce) cover();
              // A real pause (e.g. tab backgrounded) — resume it.
              if (s === YT_PAUSED && !ending) {
                try {
                  e.target.playVideo();
                } catch {
                  // ignore
                }
              }
            }
            // Natural end is a backstop in case polling missed it.
            if (s === YT_ENDED) beginEnd();
          },
        },
      });
    });

    return () => {
      destroyed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(fallback);
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      if (endTimer !== undefined) window.clearTimeout(endTimer);
      if (pollTimer !== undefined) window.clearInterval(pollTimer);
      clearFadeGuard();
      try {
        playerRef.current?.destroy();
      } catch {
        // player may not have been created yet
      }
      playerRef.current = null;
      // If the API never replaced it (created async, cancelled early), drop
      // the leftover node so StrictMode's re-run doesn't stack duplicates.
      mount.remove();
    };
  }, [trailerKey]);

  const showTrailer = !!trailerKey && !trailerEnded;
  const coverVisible = !trailerPlaying || trailerEnded;

  const releaseDate = "release_date" in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? releaseDate.slice(0, 4) : null;
  const matchPct = item.vote_average ? Math.round(item.vote_average * 10) : null;
  const genres = genreNames(item.genre_ids);

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-black sm:h-[80vh] sm:min-h-[480px]">
      {showTrailer && (
        // Cover the box (16:9), then scale up so the YT title bar (top) and
        // controls/branding (bottom) are cropped out by the section's
        // overflow-hidden — leaving only clean video on screen. The IFrame
        // API fills this host with its <iframe>.
        <div
          ref={playerHostRef}
          className="pointer-events-none absolute left-1/2 top-1/2 hidden overflow-hidden md:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
          style={{
            width: "max(100vw, 142.23vh)",
            height: "max(80vh, 56.25vw)",
            transform: "translate(-50%, -50%) scale(1.45)",
          }}
        />
      )}
      {/* Opaque top scrim — masks YouTube's title/channel band (not removable
          via params since modestbranding was dropped) and any residual top
          chrome the crop doesn't reach. */}
      {showTrailer && (
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[16%] bg-gradient-to-b from-[#141414] to-transparent md:block" />
      )}
      {item.backdrop_path && (
        <img
          src={backdropUrl(item.backdrop_path)}
          alt={title}
          aria-hidden={!coverVisible}
          className={`absolute inset-0 h-full w-full object-cover ${
            snapCover ? "" : "transition-opacity duration-700"
          } ${coverVisible ? "opacity-100" : "opacity-100 md:opacity-0"}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent sm:h-3/5" />

      <div className="relative z-10 mx-auto flex h-full max-w-none flex-col justify-end px-4 pb-12 sm:px-8 sm:pb-24">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <span className="h-5 w-[3px] rounded-full bg-[#16a34a] sm:h-6" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 text-shadow-hero sm:text-xs">
            {mediaType === "movie" ? "C Film" : "C Series"}
          </span>
        </div>
        {logoPath ? (
          <img
            src={logoUrl(logoPath, "w500")}
            alt={title}
            className="max-h-28 w-auto max-w-[70%] object-contain object-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:max-h-44 sm:max-w-lg"
          />
        ) : (
          <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-white text-shadow-hero sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            {title}
          </h1>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-white/90 text-shadow-hero sm:mt-5">
          {matchPct !== null && (
            <span className="font-bold text-[#46d369]">{matchPct}% Match</span>
          )}
          {year && <span className="text-white/80">{year}</span>}
          <span className="rounded border border-white/40 px-1.5 py-px text-[11px] font-medium uppercase tracking-wide text-white/70">
            HD
          </span>
          {genres.length > 0 && (
            <span className="hidden text-white/70 sm:inline">{genres.join(" • ")}</span>
          )}
        </div>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 text-shadow-hero sm:mt-5 md:text-base">
          {item.overview?.length > 220 ? `${item.overview.slice(0, 220)}…` : item.overview}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-7 sm:gap-3">
          <Button
            size="lg"
            onClick={handlePlay}
            className="bg-white text-black hover:bg-white/80"
          >
            <Play className="h-5 w-5 fill-current" />
            Play
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to={detailRoute} params={{ id: String(item.id) }}>
              <Info className="h-5 w-5" />
              More Info
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
