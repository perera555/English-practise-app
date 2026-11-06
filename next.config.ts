import type { NextConfig } from "next";

/**
 * Two builds:
 * - Website (default): full server with the AI chat, premium checks and admin.
 *   Server-only files are named `*.web.ts(x)`.
 * - Phone app (MOBILE_BUILD=1): a static export bundled into the Android/iPhone app,
 *   so everything works offline. `*.web.*` files are left out, and API calls go to
 *   NEXT_PUBLIC_API_BASE (your hosted website).
 */
const mobile = process.env.MOBILE_BUILD === "1";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // Cache Components (PPR) needs a server, so it is off for the static phone build.
  cacheComponents: !mobile,
  partialPrefetching: !mobile,
  pageExtensions: mobile ? ["tsx", "ts"] : ["tsx", "ts", "web.tsx", "web.ts"],
  ...(mobile ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true }, distDir: ".next-mobile" } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
