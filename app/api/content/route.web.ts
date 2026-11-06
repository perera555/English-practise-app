import { dbGet } from "@/lib/db";
import { cors, preflight } from "@/lib/cors";

export const OPTIONS = preflight;

/** New content added by the admin. The app downloads it and saves it for offline use. */
export async function GET(req: Request) {
  const content = await dbGet("content");
  return cors(req, Response.json(content, { headers: { "Cache-Control": "public, max-age=60" } }));
}
