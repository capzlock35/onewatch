import { createFileRoute } from "@tanstack/react-router";

import AnimePage from "@/pages/AnimePage";

export const Route = createFileRoute("/anime")({
  component: AnimePage,
});
