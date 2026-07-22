import { createFileRoute } from "@tanstack/react-router";

import MoviesPage from "@/pages/MoviesPage";

export const Route = createFileRoute("/movies")({
  component: MoviesPage,
});
