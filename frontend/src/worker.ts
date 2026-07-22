interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  TMDB_API_KEY?: string;
}

const BOT_PATTERN = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|twitterbot|whatsapp|telegrambot|ia_archiver|facebookexternalhit|discordbot/i;

const TMDB_BASE = "https://api.themoviedb.org/3";
const DEFAULT_TITLE = "Onewatch — Watch Free Movies & TV Shows Online | Free Streaming";
const DEFAULT_DESC = "Onewatch - the best free movie website to watch movies and TV shows online without signup. Stream trending movies, popular series, and new releases in HD instantly.";

const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESC },
  "/browse": {
    title: "Browse Movies & TV Shows - Onewatch | Free Streaming",
    description: "Browse trending movies, popular TV shows, and top-rated titles. Watch free movies online by genre.",
  },
  "/category": {
    title: "Browse Movies by Genre - Onewatch | Free Movie Categories",
    description: "Explore movies by genre on Onewatch. Browse action, comedy, horror, drama, romance, sci-fi and more.",
  },
  "/search": {
    title: "Search Movies & TV Shows - Onewatch",
    description: "Search for movies and TV shows on Onewatch and watch them online for free.",
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function metaBlock(title: string, description: string, image?: string, canonical?: string): string {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  }
  return tags.join("\n    ");
}

async function tmdbFetch(path: string, apiKey: string): Promise<Record<string, unknown> | null> {
  try {
    const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json<Record<string, unknown>>();
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get("User-Agent") || "";

    // Serve static assets directly — never transform them
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|webp)$/) || url.pathname.startsWith("/assets/")) {
      return env.ASSETS.fetch(request);
    }

    // Regular users get the SPA as-is
    if (!BOT_PATTERN.test(userAgent)) {
      return env.ASSETS.fetch(request);
    }

    // ─── Bot handling: inject SEO meta tags into index.html ───
    const path = url.pathname;

    // Fetch index.html from assets
    const assetUrl = new URL(url.origin);
    assetUrl.pathname = "/index.html";
    const indexRes = await env.ASSETS.fetch(new Request(assetUrl));
    const html = await indexRes.text();

    // Determine the meta tags to inject
    let title = DEFAULT_TITLE;
    let desc = DEFAULT_DESC;
    let image: string | undefined;
    let canonical = `${url.origin}${path}`;

    // Check static routes first
    const routeMeta = ROUTE_META[path];
    if (routeMeta) {
      title = routeMeta.title;
      desc = routeMeta.description;
    } else {
      const apiKey = env.TMDB_API_KEY || "";

      // /movie/:id
      const movieMatch = path.match(/^\/movie\/(\d+)$/);
      if (movieMatch) {
        const data = await tmdbFetch(`/movie/${movieMatch[1]}`, apiKey);
        if (data) {
          const name = String(data.title || "");
          const year = String(data.release_date || "").slice(0, 4);
          title = `${escapeHtml(name)}${year ? ` (${year})` : ""} - Watch Free Online | Onewatch`;
          desc = String(data.overview || "").slice(0, 200) || `Watch ${escapeHtml(name)} online for free.`;
          if (data.poster_path) image = `https://image.tmdb.org/t/p/w500${String(data.poster_path)}`;
        }
      }

      // /tv/:id
      const tvMatch = path.match(/^\/tv\/(\d+)$/);
      if (tvMatch && !movieMatch) {
        const data = await tmdbFetch(`/tv/${tvMatch[1]}`, apiKey);
        if (data) {
          const name = String(data.name || "");
          const year = String(data.first_air_date || "").slice(0, 4);
          title = `${escapeHtml(name)}${year ? ` (${year})` : ""} - Watch Free Online | Onewatch`;
          desc = String(data.overview || "").slice(0, 200) || `Watch ${escapeHtml(name)} online for free.`;
          if (data.poster_path) image = `https://image.tmdb.org/t/p/w500${String(data.poster_path)}`;
        }
      }

      // /genre/:type/:id
      const genreMatch = path.match(/^\/genre\/(movie|tv)\/(\d+)$/);
      if (genreMatch && !movieMatch && !tvMatch) {
        const label = genreMatch[1] === "tv" ? "TV Shows" : "Movies";
        title = `${label} - Onewatch | Free ${label} Streaming`;
        desc = `Browse ${label.toLowerCase()} by genre on Onewatch. Watch free ${label.toLowerCase()} online instantly.`;
      }

      // /person/:id
      const personMatch = path.match(/^\/person\/(\d+)$/);
      if (personMatch && !movieMatch && !tvMatch && !genreMatch) {
        const data = await tmdbFetch(`/person/${personMatch[1]}`, apiKey);
        if (data) {
          const name = String(data.name || "");
          title = `${escapeHtml(name)} - Movies & TV Shows Filmography | Onewatch`;
          desc = `Watch movies and TV shows featuring ${escapeHtml(name)}. Browse filmography and stream online for free.`;
          if (data.profile_path) image = `https://image.tmdb.org/t/p/h632${String(data.profile_path)}`;
        }
      }
    }

    // Inject the meta tags into the HTML
    const metaHtml = metaBlock(title, desc, image, canonical);
    const out = html.replace(
      /(<!-- SEO -->)[\s\S]*?(<!-- \/SEO -->)/,
      `$1\n    ${metaHtml}\n    $2`,
    );

    return new Response(out, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
