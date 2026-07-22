import { createFileRoute } from "@tanstack/react-router";

import MoviePage from "@/pages/MoviePage";

export const Route = createFileRoute("/movie/$id")({
  component: MoviePage,
});
