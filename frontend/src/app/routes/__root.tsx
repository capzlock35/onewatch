import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Check } from "lucide-react";
import { Toaster } from "sonner";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useThemeStore } from "@/store/theme.store";
import { getLenis, useSmoothScroll } from "@/hooks/useSmoothScroll";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const theme = useThemeStore((s) => s.theme);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useSmoothScroll();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Reset scroll position to the top on every route change.
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#141414] text-white">
      <Navbar />
      <main className="flex-1 pt-0">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="bottom-center"
        theme="dark"
        icons={{ success: <Check className="h-4 w-4 text-[#16a34a]" /> }}
        toastOptions={{
          style: {
            background: "#181818",
            color: "#f5f5f5",
            border: "1px solid rgba(255,255,255,0.12)",
          },
        }}
      />
    </div>
  );
}
