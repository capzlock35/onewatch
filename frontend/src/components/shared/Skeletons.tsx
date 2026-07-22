import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full-page skeleton for the movie / TV detail pages. Mirrors the redesigned
 * Netflix layout: a tall backdrop hero with left/bottom gradients, an
 * overlapping portrait poster, the title/meta/CTA column, and the card rows
 * below — so the page doesn't visibly jump when the data lands.
 */
export function DetailPageSkeleton() {
  return (
    <article className="pb-16">
      <section className="relative h-[60vh] min-h-[360px] w-full overflow-hidden sm:h-[70vh] sm:min-h-[420px]">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
      </section>

      <div className="relative z-10 mx-auto -mt-28 grid max-w-none grid-cols-1 gap-6 px-4 sm:-mt-48 sm:gap-8 sm:px-8 md:grid-cols-[280px_1fr]">
        <Skeleton className="hidden aspect-[2/3] w-full max-w-[280px] rounded-lg md:block" />

        <div>
          <Skeleton className="h-10 w-3/4 max-w-md sm:h-12" />

          {/* Meta row: match% · year · runtime · HD/maturity pill */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-5 w-9 rounded-sm" />
          </div>

          {/* CTA row: Play + circular My List */}
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="h-11 w-32 rounded" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>

          {/* Genre chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>

          {/* Overview */}
          <div className="mt-6 max-w-2xl space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Cast row — portrait 2:3 tiles mirroring the detail cast strip. */}
      <section className="mx-auto mt-12 max-w-none px-4 sm:px-8">
        <Skeleton className="mb-4 h-6 w-28" />
        <div className="scrollbar-hide flex gap-4 overflow-x-hidden pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-28 shrink-0 sm:w-32">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </div>
          ))}
        </div>
      </section>

      {/* "More Like This" row — landscape 16:9 cards mirroring MovieRow. */}
      <section className="mx-auto mt-8 max-w-none">
        <Skeleton className="mb-2 ml-4 h-6 w-40 sm:ml-8" />
        <div className="scrollbar-hide flex gap-3 overflow-x-hidden px-4 py-4 sm:gap-4 sm:px-8 md:py-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-video w-60 shrink-0 rounded-lg sm:w-64 md:w-80 lg:w-96"
            />
          ))}
        </div>
      </section>
    </article>
  );
}

/**
 * Grid of card skeletons — used for search / grid pages while querying.
 * Mirrors the redesigned MovieCard: landscape 16:9 boxart with a title +
 * tiny meta line below so the grid doesn't shift when results land.
 */
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** List of episode-row skeletons — matches the redesigned EpisodeSelector rows. */
export function EpisodeListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="flex w-full items-start gap-4 rounded-md border border-white/10 bg-white/5 p-3">
            <Skeleton className="h-20 w-32 shrink-0 rounded" />
            <div className="min-w-0 flex-1 space-y-2 py-1">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
