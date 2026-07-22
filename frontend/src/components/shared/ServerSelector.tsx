import { EMBED_SERVERS } from "@/lib/servers";
import { usePlayerStore } from "@/store/player.store";

export function ServerSelector() {
  const isOpen = usePlayerStore((s) => s.isOpen);
  const serverId = usePlayerStore((s) => s.serverId);
  const setServer = usePlayerStore((s) => s.setServer);

  if (!isOpen) return null;

  return (
    <div className="mx-auto max-w-6xl px-0 sm:px-6">
      <div className="mt-1.5 rounded border border-white/10 bg-[#181818] px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-white/70">
            Video not loading? Try a different server
          </p>
          <div className="flex flex-wrap gap-2">
            {EMBED_SERVERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServer(s.id)}
                className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  serverId === s.id
                    ? "bg-[#e50914] text-white hover:bg-[#f40612]"
                    : "bg-[#2a2a2a] text-white/70 hover:bg-[#3a3a3a] hover:text-white"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
