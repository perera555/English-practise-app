import { photosAll, photoSet } from "@/lib/db";
import { cors, preflight } from "@/lib/cors";
import { pexelsEnabled, searchPhotos } from "@/lib/mediaServer";
import { PHOTO_QUERIES } from "@/lib/photoQueries";

export const OPTIONS = preflight;

/**
 * GET /api/photos            → all saved real photos { key: PhotoInfo }
 * GET /api/photos?key=ch:x   → that photo; if missing, finds one on Pexels first and saves it.
 * Only keys from PHOTO_QUERIES are accepted, so nobody can use this to search anything else.
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) {
    return cors(req, Response.json(await photosAll(), { headers: { "Cache-Control": "public, max-age=300" } }));
  }
  const query = PHOTO_QUERIES[key];
  if (!query) return cors(req, Response.json({ error: "Unknown picture" }, { status: 404 }));

  const all = await photosAll();
  if (all[key]) return cors(req, Response.json(all[key]));
  if (!pexelsEnabled()) return cors(req, Response.json({ error: "Real photos are not set up" }, { status: 404 }));

  try {
    const [first] = await searchPhotos(query, 1);
    if (!first) return cors(req, Response.json({ error: "No photo found" }, { status: 404 }));
    await photoSet(key, first);
    return cors(req, Response.json(first));
  } catch {
    return cors(req, Response.json({ error: "Photo service unavailable" }, { status: 502 }));
  }
}
