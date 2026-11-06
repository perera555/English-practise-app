import "server-only";
import type { PhotoInfo } from "./db";

/* ---------------- Pexels (free real photos) ----------------
 * Licence: free for commercial use, no attribution required (we still credit the photographer).
 * Get a free key: https://www.pexels.com/api/  →  PEXELS_API_KEY
 */

type PexelsPhoto = {
  url: string;
  alt: string;
  photographer: string;
  photographer_url: string;
  src: { landscape: string; large: string; medium: string };
};

export function pexelsEnabled() {
  return !!process.env.PEXELS_API_KEY;
}

export async function searchPhotos(query: string, perPage = 12): Promise<PhotoInfo[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY is not set.");
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: key }, cache: "no-store" });
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);
  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  return (data.photos ?? []).map((p) => ({
    url: p.src.landscape || p.src.large,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    pageUrl: p.url,
    alt: p.alt || query,
  }));
}

/* ---------------- YouTube search (real videos) ----------------
 * Only embeddable, safe-search videos. Get a free key in Google Cloud Console
 * (enable "YouTube Data API v3")  →  YOUTUBE_API_KEY
 */

export type YouTubeResult = { id: string; title: string; channel: string; thumb: string };

export function youtubeEnabled() {
  return !!process.env.YOUTUBE_API_KEY;
}

function decodeEntities(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

export async function searchYouTube(query: string, opts: { captionsOnly?: boolean; max?: number } = {}): Promise<YouTubeResult[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set.");
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
    maxResults: String(opts.max ?? 12),
    q: query,
    key,
  });
  if (opts.captionsOnly) params.set("videoCaption", "closedCaption");
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube error ${res.status}`);
  const data = (await res.json()) as {
    items?: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string } } } }[];
  };
  return (data.items ?? []).map((it) => ({
    id: it.id.videoId,
    title: decodeEntities(it.snippet.title),
    channel: it.snippet.channelTitle,
    thumb: it.snippet.thumbnails.medium?.url ?? `https://i.ytimg.com/vi/${it.id.videoId}/mqdefault.jpg`,
  }));
}
