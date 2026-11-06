/**
 * Where the server API lives.
 * - Website: same origin ("/api/...").
 * - Phone app (bundled offline build): the hosted site, e.g. https://speakup-english.vercel.app
 */
export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
  return base.replace(/\/$/, "") + path;
}
