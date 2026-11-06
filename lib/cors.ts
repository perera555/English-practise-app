/** CORS for the phone app, which runs on capacitor://localhost (iOS) or https://localhost (Android). */
const ALLOWED = new Set(["capacitor://localhost", "https://localhost", "http://localhost", "ionic://localhost"]);

function headersFor(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const h = new Headers();
  if (ALLOWED.has(origin)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
    h.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    h.set("Access-Control-Allow-Headers", "Content-Type");
    h.set("Access-Control-Max-Age", "86400");
  }
  return h;
}

export function cors(req: Request, res: Response) {
  headersFor(req).forEach((v, k) => res.headers.set(k, v));
  return res;
}

export function preflight(req: Request) {
  return new Response(null, { status: 204, headers: headersFor(req) });
}
