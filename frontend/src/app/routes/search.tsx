import { createFileRoute } from "@tanstack/react-router";

import SearchPage from "@/pages/SearchPage";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
});
