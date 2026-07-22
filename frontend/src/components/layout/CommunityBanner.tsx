import { useEffect, useState } from "react";
import { ExternalLink, Globe, Megaphone, MessageCircleWarning, X } from "lucide-react";

import { DISCORD_BANNER_DISMISSED_KEY, DISCORD_INVITE_URL } from "@/lib/community";
import { cn } from "@/lib/utils";

const perks = [
  { icon: Megaphone, label: "Site updates" },
  { icon: MessageCircleWarning, label: "Report issues" },
  { icon: Globe, label: "New domains" },
] as const;

export function DiscordMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("h-5 w-5 shrink-0", className)}
      fill="currentColor"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

type CommunityBannerProps = {
  variant?: "hero" | "compact";
  className?: string;
  /** Hide the homepage banner after the user dismisses it (stored in localStorage). */
  dismissible?: boolean;
};

export function DiscordNavLink() {
  return (
    <a
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white/80 transition hover:text-white active:scale-95 md:inline-flex"
      aria-label="Join Onewatch on Discord"
    >
      <DiscordMark className="h-4 w-4" />
      Discord
    </a>
  );
}

export function CommunityBanner({
  variant = "hero",
  className,
  dismissible = false,
}: CommunityBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissible) return;
    setDismissed(localStorage.getItem(DISCORD_BANNER_DISMISSED_KEY) === "1");
  }, [dismissible]);

  const dismiss = () => {
    localStorage.setItem(DISCORD_BANNER_DISMISSED_KEY, "1");
    setDismissed(true);
  };

  if (dismissible && dismissed) return null;

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded border border-white/10 bg-[#181818] p-4 sm:p-5",
          className,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white/10 text-white">
              <DiscordMark className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Join our Discord</p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                Get updates, report issues, and find new site links.
              </p>
            </div>
          </div>
          <DiscordButton size="sm" />
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn("relative mx-auto max-w-none px-4 sm:px-8", className)}
      aria-labelledby="community-banner-title"
    >
      <div className="mb-4 flex justify-end gap-4">
        {dismissible && (
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Dismiss community banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative overflow-hidden rounded border border-white/10 bg-[#181818] shadow-[0_8px_28px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
          <div className="min-w-0 flex-1">
            <p className="max-w-2xl text-sm leading-relaxed text-white/70">
              Join our Discord for announcements, backup domains when the site moves, and help with
              playback or broken links.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded bg-[#2a2a2a] px-3 py-1.5 text-xs text-white/80"
                >
                  <Icon className="h-3 w-3 text-white/70" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <DiscordButton size="lg" className="w-full sm:w-auto" />
            <p className="text-center text-[10px] uppercase tracking-[0.18em] text-white/40 sm:text-right">
              Free · Open to everyone
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscordButton({
  size = "lg",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <a
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-md bg-white font-semibold text-black transition hover:bg-white/90 active:scale-[0.98]",
        size === "lg" ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs",
        className,
      )}
    >
      <DiscordMark className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      Join Discord
      <ExternalLink
        className={cn(
          "opacity-50 transition group-hover:opacity-80",
          size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3",
        )}
        aria-hidden
      />
    </a>
  );
}
