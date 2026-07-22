import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronDown,
  Download,
  Flame,
  Globe,
  House,
  Menu,
  Plus,
  Search,
  Share,
  Clapperboard,
  Tv,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { posterUrl } from "@/lib/tmdb";
import { movieService } from "@/services/movie.service";
import { tvService } from "@/services/tv.service";
import { personService } from "@/services/person.service";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { CommunityBanner, DiscordMark } from "@/components/layout/CommunityBanner";
import { DISCORD_INVITE_URL } from "@/lib/community";
import { LANGUAGES } from "@/lib/languages";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { cn } from "@/lib/utils";
import type { TmdbMovie, TmdbPerson, TmdbTvShow } from "@/types";

const desktopNavLinks = [
  { to: "/", label: "Home", icon: House },
  { to: "/tv-shows", label: "TV Shows", icon: Tv },
  { to: "/movies", label: "Movies", icon: Clapperboard },
  { to: "/anime", label: "Anime", icon: Flame },
  { to: "/watchlist", label: "My List", icon: Bookmark },
] as const;

const mobileNavLinks = [
  { to: "/", label: "Home", icon: House },
  { to: "/tv-shows", label: "TV Shows", icon: Tv },
  { to: "/movies", label: "Movies", icon: Clapperboard },
  { to: "/anime", label: "Anime", icon: Flame },
  { to: "/search", label: "Search", icon: Search },
  { to: "/watchlist", label: "My List", icon: Bookmark },
] as const;

const PREVIEW_LIMIT = 4;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { canInstall, iosInstall, promptInstall } = usePwaInstall();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 32);
      // Hide when scrolling down past the header, show when scrolling up.
      if (y > lastScrollY.current && y > 80) {
        setHidden(true);
      } else if (y < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-all duration-300 will-change-transform",
        scrolled
          ? "bg-[#141414]"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent",
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-none items-center justify-between gap-6 px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            aria-label="Onewatch"
            className="text-2xl font-black uppercase tracking-[-0.02em] text-[#16a34a] transition-opacity hover:opacity-90 sm:text-[26px]"
          >
            Onewatch
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {desktopNavLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="text-sm text-white/80 transition-colors hover:text-white"
                activeProps={{
                  className: "text-white font-semibold",
                }}
              >
                {l.label}
              </Link>
            ))}
            <LanguagesMenu />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NavbarSearch />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-white transition hover:bg-white/10 active:scale-95 xl:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our community on Discord"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-white/20 md:inline-flex"
          >
            <DiscordMark className="h-4 w-4" />
            <span className="hidden lg:inline">Join our community</span>
            <span className="lg:hidden">Community</span>
          </a>

          {canInstall && (
            <button
              type="button"
              onClick={() => void promptInstall()}
              aria-label="Install app"
              className="hidden h-9 w-9 items-center justify-center rounded text-white transition hover:bg-white/10 md:inline-flex"
            >
              <Download className="h-5 w-5" />
            </button>
          )}

          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded text-white transition hover:bg-white/10 active:scale-95 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex flex-col bg-[#141414] pb-[max(1.5rem,env(safe-area-inset-bottom))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[max(1.5rem,env(safe-area-inset-top))]"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">
                Browse Onewatch and install the app
              </SheetDescription>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="mb-8 mt-1 shrink-0 text-2xl font-black uppercase tracking-[-0.02em] text-[#16a34a]"
              >
                Onewatch
              </Link>

              <nav className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
                {mobileNavLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center py-3 text-base font-medium text-white/70 transition-colors hover:text-white"
                    activeProps={{ className: "text-white" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <MobileLanguages onNavigate={() => setMenuOpen(false)} />
              </nav>

              <div className="mt-4 shrink-0" onClick={() => setMenuOpen(false)}>
                <CommunityBanner variant="compact" />
              </div>

              {canInstall && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void promptInstall();
                  }}
                  className="group mt-4 flex shrink-0 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#16a34a]/25 via-[#16a34a]/10 to-transparent p-4 text-left transition active:scale-[0.98]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16a34a] text-white shadow-lg shadow-[#16a34a]/30 transition group-hover:scale-105">
                    <Download className="h-6 w-6" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-base font-semibold text-white">
                      Install App
                    </span>
                    <span className="text-xs text-white/60">
                      Add Onewatch to your home screen
                    </span>
                  </span>
                </button>
              )}

              {iosInstall && (
                <div className="mt-4 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#16a34a]/25 via-[#16a34a]/10 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16a34a] text-white shadow-lg shadow-[#16a34a]/30">
                      <Download className="h-6 w-6" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-base font-semibold text-white">
                        Install App
                      </span>
                      <span className="text-xs text-white/60">
                        Add Onewatch to your home screen
                      </span>
                    </span>
                  </div>
                  <ol className="mt-3 space-y-1.5 text-xs text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="text-white/45">1.</span>
                      Tap the
                      <Share className="h-3.5 w-3.5 text-[#16a34a]" />
                      Share button below
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-white/45">2.</span>
                      Choose
                      <Plus className="h-3.5 w-3.5 text-[#16a34a]" />
                      <span className="font-medium text-white/90">Add to Home Screen</span>
                    </li>
                  </ol>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}


function LanguagesMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 text-sm transition-colors",
          open ? "text-white" : "text-white/80 hover:text-white",
        )}
      >
        <Globe className="h-4 w-4" />
        Browse by Languages
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full z-50 mt-3 w-[420px] max-w-[calc(100vw-2rem)] origin-top overflow-hidden rounded-xl border border-white/10 bg-[#141414]/95 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="grid grid-cols-2 gap-1 p-3 sm:grid-cols-3">
          {LANGUAGES.map((l) => (
            <Link
              key={l.code}
              to="/language/$code"
              params={{ code: l.code }}
              onClick={() => setOpen(false)}
              className="rounded px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileLanguages({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="mt-2 border-t border-white/10 pt-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
        Browse by Languages
      </p>
      <div className="grid grid-cols-2 gap-1">
        {LANGUAGES.map((l) => (
          <Link
            key={l.code}
            to="/language/$code"
            params={{ code: l.code }}
            onClick={onNavigate}
            className="rounded px-2 py-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavbarSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [people, setPeople] = useState<TmdbPerson[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const debounced = useDebounce(query, 250);

  useEffect(() => {
    const term = debounced.trim();
    if (!term) {
      setMovies([]);
      setShows([]);
      setPeople([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      movieService.search(term),
      tvService.search(term),
      personService.search(term),
    ])
      .then(([m, t, p]) => {
        if (cancelled) return;
        setMovies(m.slice(0, PREVIEW_LIMIT));
        setShows(t.slice(0, PREVIEW_LIMIT));
        setPeople(p.slice(0, PREVIEW_LIMIT));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    if (!open && !expanded) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        if (!query.trim()) setExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, expanded, query]);

  const term = debounced.trim();
  const showDropdown = open && term.length > 0;
  const totalCount = movies.length + shows.length + people.length;

  const goToFullSearch = () => {
    if (!query.trim()) return;
    setOpen(false);
    setExpanded(false);
    navigate({ to: "/search", search: { q: query.trim() } });
  };

  return (
    <div ref={containerRef} className="relative hidden xl:block">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToFullSearch();
        }}
        className={cn(
          "flex h-9 items-center text-sm text-white/80 transition-all duration-300",
          expanded
            ? "gap-2 border border-white/40 bg-black/60 px-3"
            : "w-9 justify-center border border-transparent",
        )}
      >
        <button
          type="button"
          onClick={() => {
            if (expanded) {
              if (query.trim()) {
                goToFullSearch();
              } else {
                setExpanded(false);
                setOpen(false);
              }
            } else {
              setExpanded(true);
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }
          }}
          className="flex h-9 w-5 shrink-0 items-center justify-center text-white transition-colors hover:text-white/70"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Titles, people, genres"
          tabIndex={expanded ? 0 : -1}
          className={cn(
            "bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none",
            expanded ? "w-52 lg:w-64" : "w-0",
          )}
        />
      </form>

      {showDropdown && (
        <div
          data-lenis-prevent
          className="absolute right-0 top-11 w-[420px] overflow-hidden rounded border border-white/10 bg-[#181818]/95 shadow-[0_8px_28px_rgba(0,0,0,0.8)] backdrop-blur-md"
        >
          {loading && totalCount === 0 ? (
            <ul className="divide-y divide-white/5">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-14 w-10 shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </li>
              ))}
            </ul>
          ) : totalCount === 0 ? (
            <div className="px-4 py-6 text-sm text-white/60">No results for "{term}".</div>
          ) : (
            <>
              <ul className="max-h-[60vh] divide-y divide-white/5 overflow-y-auto overscroll-contain">
                {people.map((p) => (
                  <ResultRow
                    key={`p-${p.id}`}
                    posterPath={p.profile_path}
                    title={p.name}
                    subtitle={p.known_for_department || "Person"}
                    to={`/person/${p.id}`}
                    onSelect={() => setOpen(false)}
                  />
                ))}
                {movies.map((m) => (
                  <ResultRow
                    key={`m-${m.id}`}
                    posterPath={m.poster_path}
                    title={m.title}
                    subtitle={
                      m.release_date ? `Movie · ${m.release_date.slice(0, 4)}` : "Movie"
                    }
                    to={`/movie/${m.id}`}
                    onSelect={() => setOpen(false)}
                  />
                ))}
                {shows.map((s) => (
                  <ResultRow
                    key={`t-${s.id}`}
                    posterPath={s.poster_path}
                    title={s.name}
                    subtitle={
                      s.first_air_date
                        ? `TV · ${s.first_air_date.slice(0, 4)}`
                        : "TV"
                    }
                    to={`/tv/${s.id}`}
                    onSelect={() => setOpen(false)}
                  />
                ))}
              </ul>
              <button
                type="button"
                onClick={goToFullSearch}
                className="block w-full border-t border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
              >
                View all results for "{term}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  posterPath,
  title,
  subtitle,
  to,
  onSelect,
}: {
  posterPath: string | null | undefined;
  title: string;
  subtitle: string;
  to: string;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onSelect}
        className="flex items-center gap-3 px-3 py-2 transition hover:bg-white/5"
      >
        <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-white/5">
          {posterPath ? (
            <img
              src={posterUrl(posterPath, "w185") ?? ""}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{title}</div>
          <div className="text-xs text-white/60">{subtitle}</div>
        </div>
      </Link>
    </li>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return useMemo(() => debounced, [debounced]);
}
