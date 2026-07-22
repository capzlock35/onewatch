import { useCallback, useEffect, useRef, useState } from "react";

import { getServer, moviePlayerUrl, tvPlayerUrl } from "@/lib/servers";
import { backdropUrl, posterUrl } from "@/lib/tmdb";
import { parseVidkingMessage } from "@/lib/vidking";
import { usePlayerStore } from "@/store/player.store";

const CONTROLS_HIDE_MS = 3000;

export function InlinePlayer() {
  const {
    isOpen,
    mediaType,
    tmdbId,
    title,
    posterPath,
    season,
    episode,
    serverId,
    close,
    handleVidkingEvent,
  } = usePlayerStore();

  const server = getServer(serverId);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  // Gate the iframe behind a play overlay: only mount the embed after the user
  // taps the play icon. Reset whenever the content (title/episode) changes.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
  }, [tmdbId, season, episode]);

  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isOpen, showControls]);

  useEffect(() => {
    if (!isOpen) return;
    const onBlur = () => {
      if (document.activeElement !== iframeRef.current) return;
      showControls();
      setTimeout(() => {
        iframeRef.current?.blur();
        window.focus();
      }, 300);
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [isOpen, showControls]);

  const toggleFullscreen = () => {
    showControls();
    const el = containerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    if (!el) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }
    const active = !!(doc.fullscreenElement ?? doc.webkitFullscreenElement);
    if (active) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
    if (request) {
      try {
        const result = request.call(el) as Promise<void> | undefined;
        result?.catch(() => setIsPseudoFullscreen(true));
      } catch {
        setIsPseudoFullscreen(true);
      }
    } else {
      setIsPseudoFullscreen(true);
    }
  };

  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPseudoFullscreen]);

  useEffect(() => {
    if (!isOpen) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== server.origin) return;
      const parsed = parseVidkingMessage(event.data);
      if (!parsed) return;
      if (parsed.data.event !== "timeupdate") showControls();
      handleVidkingEvent(parsed.data);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isOpen, handleVidkingEvent, showControls, server.origin]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isPseudoFullscreen) {
        setIsPseudoFullscreen(false);
        return;
      }
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const active = !!(doc.fullscreenElement ?? doc.webkitFullscreenElement);
      if (active) {
        const d = document as Document & { webkitExitFullscreen?: () => Promise<void> };
        (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d);
      } else {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, isPseudoFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const active = !!(doc.fullscreenElement ?? doc.webkitFullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  if (!isOpen || !tmdbId || !mediaType) return null;

  const fullscreenActive = isFullscreen || isPseudoFullscreen;

  const src =
    mediaType === "movie"
      ? moviePlayerUrl(server, tmdbId)
      : tvPlayerUrl(server, tmdbId, season ?? 1, episode ?? 1);

  return (
    <div
      ref={containerRef}
      onPointerMove={showControls}
      onPointerDown={showControls}
      className={
        isPseudoFullscreen
          ? "fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-black"
          : "group relative aspect-video w-full overflow-hidden rounded-lg bg-black"
      }
    >
      <button
        type="button"
        onClick={toggleFullscreen}
        className={`absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20 ${
          started && controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {fullscreenActive ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
        {fullscreenActive ? "Exit" : "Fullscreen"}
      </button>
      {started ? (
        <iframe
          key={src}
          ref={iframeRef}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title ?? "player"}

        />
      ) : (
        <button
          type="button"
          onClick={() => setStarted(true)}
          aria-label={`Play ${title ?? "video"}`}
          className="group/play absolute inset-0 flex items-center justify-center"
        >
          {posterPath && (
            <img
              src={backdropUrl(posterPath) || posterUrl(posterPath)}
              alt={title ?? "poster"}
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl transition-transform duration-200 group-hover/play:scale-110 sm:h-20 sm:w-20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-8 w-8 sm:h-10 sm:w-10">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
