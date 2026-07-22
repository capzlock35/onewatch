import { DiscoverPage } from "./DiscoverPage";

export default function AnimePage() {
  return (
    <DiscoverPage
      title="Anime"
      kind="tv"
      // Animation genre (16) + Japanese original language = anime.
      filters={{ with_genres: 16, with_original_language: "ja" }}
      documentTitle="Anime - Onewatch | Watch Free Anime Online"
    />
  );
}
