import { createFileRoute } from "@tanstack/react-router";

import GenrePage from "@/pages/GenrePage";

export const Route = createFileRoute("/genre/$type/$id")({
  component: GenrePage,
});
