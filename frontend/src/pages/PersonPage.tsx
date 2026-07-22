import { useEffect, useMemo, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Clapperboard, LayoutGrid, Tv, User } from "lucide-react";

import { MovieCard } from "@/components/movie/MovieCard";
import { CardGridSkeleton } from "@/components/shared/Skeletons";
import { profileUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { personService } from "@/services/person.service";
import type {
  TmdbMovie,
  TmdbPersonCombinedCredits,
  TmdbPersonDetails,
  TmdbTvShow,
} from "@/types";

interface Credit {
  key: string;
  mediaType: "movie" | "tv";
  item: TmdbMovie | TmdbTvShow;
}

/** Flatten combined credits into a de-duped, popularity-ranked film/TV list. */
function buildFilmography(credits: TmdbPersonCombinedCredits | null): Credit[] {
  if (!credits?.cast) return [];
  const seen = new Set<string>();
  const ranked: { credit: Credit; popularity: number }[] = [];
  for (const entry of credits.cast) {
    const mediaType = entry.media_type;
    if (mediaType !== "movie" && mediaType !== "tv") continue;
    const raw = entry as unknown as (TmdbMovie | TmdbTvShow) & {
      media_type: "movie" | "tv";
      popularity?: number;
      poster_path?: string | null;
      backdrop_path?: string | null;
    };
    if (!raw.poster_path && !raw.backdrop_path) continue;
    const key = `${mediaType}-${raw.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ranked.push({ credit: { key, mediaType, item: raw }, popularity: raw.popularity ?? 0 });
  }
  ranked.sort((a, b) => b.popularity - a.popularity);
  return ranked.map((r) => r.credit);
}

function calcAge(birthday: string | null, deathday: string | null): number | null {
  if (!birthday) return null;
  const start = new Date(birthday);
  if (Number.isNaN(start.getTime())) return null;
  // TMDB dates ("YYYY-MM-DD") parse as UTC midnight, so compare in UTC to avoid
  // an off-by-one age for users in negative-UTC-offset timezones.
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getUTCFullYear() - start.getUTCFullYear();
  const monthDiff = end.getUTCMonth() - start.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getUTCDate() < start.getUTCDate())) age--;
  return age >= 0 ? age : null;
}

export default function PersonPage() {
  const { id } = useParams({ from: "/person/$id" });
  const personId = Number(id);
  const validId = Number.isFinite(personId);
  const [person, setPerson] = useState<TmdbPersonDetails | null>(null);
  const [credits, setCredits] = useState<TmdbPersonCombinedCredits | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!validId) {
      setError(true);
      return;
    }
    let cancelled = false;
    setPerson(null);
    setCredits(null);
    setError(false);
    personService
      .details(personId)
      .then((p) => {
        if (cancelled) return;
        setPerson(p);
        document.title = `${p.name} - Movies & TV Shows Filmography | Onewatch`;
      })
      .catch(() => !cancelled && setError(true));
    // Credits failing shouldn't block the whole page — fall back to an empty
    // filmography so "Known For" shows an empty state instead of a stuck skeleton.
    personService
      .combinedCredits(personId)
      .then((c) => !cancelled && setCredits(c))
      .catch(() => !cancelled && setCredits({ cast: [], crew: [] }));
    return () => {
      cancelled = true;
    };
  }, [personId, validId]);

  const filmography = useMemo(() => buildFilmography(credits), [credits]);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");

  const movieCount = useMemo(
    () => filmography.filter((c) => c.mediaType === "movie").length,
    [filmography],
  );
  const tvCount = filmography.length - movieCount;
  const hasMix = movieCount > 0 && tvCount > 0;
  const shown = useMemo(
    () => (filter === "all" ? filmography : filmography.filter((c) => c.mediaType === filter)),
    [filmography, filter],
  );

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-none flex-col items-center justify-center px-4 pt-[calc(6rem+env(safe-area-inset-top))] text-center sm:px-8">
        <User className="h-12 w-12 text-white/30" />
        <h1 className="mt-4 text-2xl font-bold text-white">Person not found</h1>
        <p className="mt-2 text-white/60">
          We couldn&apos;t load this profile. It may have been removed.
        </p>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="mx-auto max-w-none px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]">
          <div className="mx-auto aspect-[2/3] w-full max-w-[260px] animate-pulse rounded bg-[#181818]" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-[#181818]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[#181818]" />
            <div className="h-28 w-full animate-pulse rounded bg-[#181818]" />
          </div>
        </div>
      </div>
    );
  }

  const age = calcAge(person.birthday, person.deathday);

  return (
    <div className="mx-auto max-w-none px-4 pb-16 pt-[calc(6rem+env(safe-area-inset-top))] sm:px-8">
      <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-full max-w-[260px]">
          {person.profile_path ? (
            <img
              src={profileUrl(person.profile_path, "h632")}
              alt={person.name}
              className="aspect-[2/3] w-full rounded object-cover shadow-[0_8px_28px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded bg-[#181818]">
              <User className="h-16 w-16 text-white/30" />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {person.name}
          </h1>
          {person.known_for_department && (
            <p className="mt-3 text-sm font-medium text-white/70 sm:text-base">
              {person.known_for_department}
            </p>
          )}

          <dl className="mt-6 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            {person.birthday && (
              <div>
                <dt className="text-white/50">Born</dt>
                <dd className="mt-1 text-white/90">
                  {person.birthday}
                  {age != null && !person.deathday ? ` (age ${age})` : ""}
                </dd>
              </div>
            )}
            {person.deathday && (
              <div>
                <dt className="text-white/50">Died</dt>
                <dd className="mt-1 text-white/90">
                  {person.deathday}
                  {age != null ? ` (aged ${age})` : ""}
                </dd>
              </div>
            )}
            {person.place_of_birth && (
              <div>
                <dt className="text-white/50">Place of Birth</dt>
                <dd className="mt-1 text-white/90">{person.place_of_birth}</dd>
              </div>
            )}
          </dl>

          {person.biography && (
            <section className="mt-8 max-w-3xl">
              <h2 className="text-lg font-bold text-white">Biography</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
                {person.biography}
              </p>
            </section>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Known For</h2>

        {hasMix && (
          <div className="mb-6 flex flex-wrap gap-6 border-b border-white/10">
            {(
              [
                { key: "all", label: `All (${filmography.length})`, icon: LayoutGrid },
                { key: "movie", label: `Movies (${movieCount})`, icon: Clapperboard },
                { key: "tv", label: `TV Shows (${tvCount})`, icon: Tv },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 -mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                  filter === key
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}

        {!credits ? (
          <CardGridSkeleton />
        ) : filmography.length === 0 ? (
          <p className="text-white/70">No titles found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((c) => (
              <MovieCard key={c.key} item={c.item} mediaType={c.mediaType} className="w-full" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
