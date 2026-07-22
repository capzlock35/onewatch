import { createFileRoute } from "@tanstack/react-router";

import TvShowsPage from "@/pages/TvShowsPage";

export const Route = createFileRoute("/tv-shows")({
  component: TvShowsPage,
});
