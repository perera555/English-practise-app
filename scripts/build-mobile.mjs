// Builds the offline phone bundle and copies it into the Android and iOS projects.
// Usage: npm run build:mobile
import { execSync } from "child_process";
import { rmSync } from "fs";

if (!process.env.NEXT_PUBLIC_API_BASE) {
  console.warn(
    "\n⚠️  NEXT_PUBLIC_API_BASE is not set. Set it to your hosted website (e.g. https://speakup-english.vercel.app)\n" +
      "   in .env.local so the phone app can reach the AI robot, Premium checks and new content.\n",
  );
}

const env = { ...process.env, MOBILE_BUILD: "1" };
execSync("npx next build", { stdio: "inherit", env });
execSync("npx cap sync", { stdio: "inherit", env });
// The static export leaves phone settings in .next; remove it so `npm start` never serves the website with them.
try {
  rmSync(".next", { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
} catch {
  console.warn("Note: could not fully remove .next. Run `npm run build` before `npm start`.");
}
console.log("\n✅ Phone app updated. Open it with:  npx cap open android   (or on your Mac: npx cap open ios)\n");
