export interface EmbedServer {
  id: string;
  name: string;
  origin: string;
}

export const EMBED_SERVERS: EmbedServer[] = [
  { id: "zxc",       name: "ZxcStream", origin: "https://embed.zxcstream.xyz" },
  { id: "vidlink",   name: "VidLink",   origin: "https://vidlink.pro" },
  { id: "vidsrcto",  name: "Vidsrc.to", origin: "https://vidsrc.to" },
  { id: "vidsrccc",  name: "Vidsrc.cc", origin: "https://vidsrc.cc" },
  { id: "2embed",    name: "2Embed",     origin: "https://www.2embed.cc" },
  { id: "vidsrcpm",  name: "Vidsrc.pm", origin: "https://vidsrc.pm" },
];

export function getServer(id: string): EmbedServer {
  return EMBED_SERVERS.find((s) => s.id === id) ?? EMBED_SERVERS[0];
}

function baseUrl(server: EmbedServer): string {
  if (server.id === "zxc")       return "https://embed.zxcstream.xyz";
  if (server.id === "vidlink")   return "https://vidlink.pro";
  if (server.id === "vidsrcto")  return "https://vidsrc.to";
  if (server.id === "vidsrccc")  return "https://vidsrc.cc/v2";
  if (server.id === "2embed")    return "https://www.2embed.cc";
  if (server.id === "vidsrcpm")  return "https://vidsrc.pm";
  return server.origin;
}

function movieUrl(server: EmbedServer, tmdbId: number): string {
  const base = baseUrl(server);
  switch (server.id) {
    case "zxc":      return `${base}/player/movie/${tmdbId}`;
    case "vidlink":  return `${base}/movie/${tmdbId}`;
    case "vidsrcto": return `${base}/embed/movie/${tmdbId}`;
    case "vidsrccc": return `${base}/embed/movie/${tmdbId}`;
    case "2embed":   return `${base}/embed/${tmdbId}`;
    case "vidsrcpm": return `${base}/embed/movie/${tmdbId}`;
    default:         return `${base}/movie/${tmdbId}`;
  }
}

function tvUrl(server: EmbedServer, tmdbId: number, season: number, episode: number): string {
  const base = baseUrl(server);
  switch (server.id) {
    case "zxc":      return `${base}/player/tv/${tmdbId}/${season}/${episode}`;
    case "vidlink":  return `${base}/tv/${tmdbId}/${season}/${episode}`;
    case "vidsrcto": return `${base}/embed/tv/${tmdbId}/${season}/${episode}`;
    case "vidsrccc": return `${base}/embed/tv/${tmdbId}/${season}/${episode}`;
    case "2embed":   return `${base}/embedtv/${tmdbId}&s=${season}&e=${episode}`;
    case "vidsrcpm": return `${base}/embed/tv/${tmdbId}/${season}/${episode}`;
    default:         return `${base}/tv/${tmdbId}/${season}/${episode}`;
  }
}

export function moviePlayerUrl(server: EmbedServer, tmdbId: number): string {
  return movieUrl(server, tmdbId);
}

export function tvPlayerUrl(
  server: EmbedServer,
  tmdbId: number,
  season: number,
  episode: number,
): string {
  return tvUrl(server, tmdbId, season, episode);
}
