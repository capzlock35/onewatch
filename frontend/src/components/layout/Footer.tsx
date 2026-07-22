import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import { CommunityBanner } from "@/components/layout/CommunityBanner";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/category", label: "Category" },
  { to: "/watchlist", label: "My List" },
  { to: "/search", label: "Search" },
] as const;

export function Footer() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="mt-16 border-t border-white/10 bg-[#141414] text-white/50">
      <div className="mx-auto max-w-none px-4 sm:px-8">
        <CommunityBanner variant="compact" className="mt-10 sm:mt-12" />

        {/* nav grid + back to top */}
        <div className="flex flex-col gap-8 pt-10 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pt-12">
          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-white/50 transition-colors hover:text-white hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 self-start text-xs text-white/40 transition-colors hover:text-white sm:self-auto"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/40">
              <ArrowUp className="h-4 w-4" />
            </span>
            Back to top
          </button>
        </div>

        {/* disclaimer (fine print) */}
        <div className="mt-8 border-t border-white/10 py-6">
          <p className="max-w-3xl text-xs leading-relaxed text-white/40">
            <span className="text-white/60">ONEWATCH</span> does not host any files,
            it merely pulls streams from 3rd party services. Legal issues should be taken up with
            the file hosts and providers.{" "}
            <span className="text-white/60">ONEWATCH</span> is not responsible for any
            media files shown by the video providers.
          </p>
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="text-xs text-white/40">
            © {new Date().getFullYear()} Onewatch
          </div>
        </div>

        {/* TMDB attribution (required, fine print) */}
        <div className="border-t border-white/5 py-4 text-[11px] text-white/30">
          Uses the TMDB API but is not endorsed or certified by TMDB
        </div>
      </div>
    </footer>
  );
}
