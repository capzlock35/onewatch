import { createFileRoute } from "@tanstack/react-router";

import LanguagePage from "@/pages/LanguagePage";

export const Route = createFileRoute("/language/$code")({
  component: LanguagePage,
});
