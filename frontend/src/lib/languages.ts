/** Languages surfaced in the "Browse by Languages" nav dropdown (TMDB ISO 639-1 codes). */
export const LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "tr", label: "Turkish" },
  { code: "th", label: "Thai" },
  { code: "tl", label: "Filipino" },
  { code: "id", label: "Indonesian" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
];

export function languageLabel(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}
