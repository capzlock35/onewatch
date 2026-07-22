import { useParams } from "@tanstack/react-router";

import { DiscoverPage } from "./DiscoverPage";
import { languageLabel } from "@/lib/languages";

export default function LanguagePage() {
  const { code } = useParams({ from: "/language/$code" });
  const label = languageLabel(code);
  return (
    <DiscoverPage
      // key forces a fresh fetch when switching between languages.
      key={code}
      title={`${label} Movies`}
      kind="movie"
      filters={{ with_original_language: code }}
      documentTitle={`${label} Movies - Onewatch | Free Streaming`}
    />
  );
}
