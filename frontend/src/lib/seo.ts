import { useEffect } from "react";

export const SITE_URL = "https://onewatch.site";
export const SITE_NAME = "Onewatch";
export const DEFAULT_IMAGE = "/meta_tag.png";

export interface SeoOptions {
  /** Full page title shown in the browser tab and search results. */
  title: string;
  /** Meta description, ideally 50–160 characters. */
  description?: string;
  /** Absolute path of the page, e.g. "/movies" or "/movie/123". */
  path?: string;
  /** Canonical / OG image URL or a path under the site root. */
  image?: string;
  /** Indexing directive, defaults to "index, follow". */
  robots?: string;
  /** og:type, defaults to "website". */
  ogType?: "website" | "article" | "video.movie" | "video.tv_show" | "profile";
  /** Optional JSON-LD structured data injected as <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function toAbsolute(src?: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

/**
 * Client-side SEO manager. Because the app is a CSR SPA, meta tags, the
 * canonical link, Open Graph / Twitter cards, and JSON-LD must be written to
 * <head> at runtime — every route calls this hook on mount.
 */
export function useSeo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  robots = "index, follow",
  ogType = "website",
  jsonLd,
}: SeoOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    const absoluteImage = toAbsolute(image);

    document.title = title;
    upsertLink("canonical", url);
    upsertMeta("name", "description", description ?? "");
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description ?? "");
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:image", absoluteImage ?? "");
    upsertMeta("property", "og:image:alt", title);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description ?? "");
    upsertMeta("name", "twitter:image", absoluteImage ?? "");

    // JSON-LD structured data lives in a single, replaceable script tag.
    const scriptId = "onewatch-jsonld";
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Restore static defaults from index.html so the next page starts clean.
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, path, image, robots, ogType, jsonLd]);
}