import { useEffect, useMemo, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { Search as SearchIcon, User } from "lucide-react";

import { MovieCard } from "@/components/movie/MovieCard";
import { CardGridSkeleton } from "@/components/shared/Skeletons";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileUrl } from "@/lib/tmdb";
import { movieService } from "@/services/movie.service";
import { personService } from "@/services/person.service";
import { tvService } from "@/services/tv.service";
import type { TmdbMovie, TmdbPerson, TmdbTvShow } from "@/types";

const searchRoute = getRouteApi("/search");

export default function SearchPage() {
  const { q: initialQ } = searchRoute.useSearch();
  const [query, setQuery] = useState(initialQ ?? "");

  useEffect(() => {
    document.title = initialQ
      ? `"${initialQ}" - Search Movies & TV Shows | Onewatch`
      : "Search Movies & TV Shows - Onewatch";
    if (typeof initialQ === "string") setQuery(initialQ);
  }, [initialQ]);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [people, setPeople] = useState<TmdbPerson[]>([]);
  const [loading, setLoading] = useState(false);

  const debounced = useDebounce(query, 350);

  useEffect(() => {
    if (!debounced.trim()) {
      setMovies([]);
      setShows([]);
      setPeople([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      movieService.search(debounced),
      tvService.search(debounced),
      personService.search(debounced),
    ])
      .then(([m, t, p]) => {
        if (cancelled) return;
        setMovies(m);
        setShows(t);
        setPeople(p);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const totalCount = movies.length + shows.length + people.length;

  return (
    <div className="min-h-screen bg-[#141414] px-4 pb-16 pt-[calc(5.5rem+env(safe-area-inset-top))] sm:px-8 lg:px-12">
      <div className="relative mx-auto max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
        <Input
          autoFocus
          placeholder="Search movies and TV shows…"
          className="h-12 rounded-none border-transparent bg-[#333333] pl-12 text-base text-white placeholder:text-white/50 focus-visible:border-white/60"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mx-auto mt-8 max-w-[1800px]">
        {!debounced.trim() ? (
          <p className="text-white/60">Start typing to find titles.</p>
        ) : loading ? (
          <CardGridSkeleton />
        ) : totalCount === 0 ? (
          <p className="text-white/60">No results for "{debounced}".</p>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
              <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
              <TabsTrigger value="movies">Movies ({movies.length})</TabsTrigger>
              <TabsTrigger value="tv">TV Shows ({shows.length})</TabsTrigger>
              <TabsTrigger value="people">People ({people.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {people.length > 0 && (
                <>
                  <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">People</h2>
                  <PeopleGrid people={people} />
                  <h2 className="mb-4 mt-10 text-lg font-bold text-white sm:text-xl">
                    Movies &amp; TV Shows
                  </h2>
                </>
              )}
              <ResultsGrid movies={movies} shows={shows} />
            </TabsContent>
            <TabsContent value="movies">
              <ResultsGrid movies={movies} shows={[]} />
            </TabsContent>
            <TabsContent value="tv">
              <ResultsGrid movies={[]} shows={shows} />
            </TabsContent>
            <TabsContent value="people">
              {people.length === 0 ? (
                <p className="text-white/60">No people found.</p>
              ) : (
                <PeopleGrid people={people} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function ResultsGrid({ movies, shows }: { movies: TmdbMovie[]; shows: TmdbTvShow[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-8 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {movies.map((m) => (
        <MovieCard key={`m-${m.id}`} item={m} mediaType="movie" className="w-full" />
      ))}
      {shows.map((s) => (
        <MovieCard key={`t-${s.id}`} item={s} mediaType="tv" className="w-full" />
      ))}
    </div>
  );
}

function PeopleGrid({ people }: { people: TmdbPerson[] }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {people.map((p) => (
        <Link
          key={p.id}
          to="/person/$id"
          params={{ id: String(p.id) }}
          className="group block text-center"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-[#181818] ring-white/0 transition duration-300 group-hover:ring-2 group-hover:ring-white/60">
            {p.profile_path ? (
              <img
                src={profileUrl(p.profile_path)}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-white/30" />
              </div>
            )}
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-white/90 transition-colors group-hover:text-white">
            {p.name}
          </p>
          {p.known_for_department && (
            <p className="truncate text-xs text-white/50">{p.known_for_department}</p>
          )}
        </Link>
      ))}
    </div>
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
