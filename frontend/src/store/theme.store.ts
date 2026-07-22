import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme(t) {
        document.documentElement.classList.toggle("dark", t === "dark");
        set({ theme: t });
      },
      toggle() {
        get().setTheme(get().theme === "dark" ? "light" : "dark");
      },
    }),
    { name: "theme" },
  ),
);
