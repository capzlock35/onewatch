import { createFileRoute } from "@tanstack/react-router";

import TvShowPage from "@/pages/TvShowPage";

export const Route = createFileRoute("/tv/$id")({
  component: TvShowPage,
});
