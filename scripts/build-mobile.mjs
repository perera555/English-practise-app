// Builds the offline phone bundle and copies it into the Android and iOS projects.
// Usage: npm run build:mobile
import { execSync } from "child_process";

if (!process.env.NEXT_PUBLIC_API_BASE) {
  console.warn(
    "\n⚠️  NEXT_PUBLIC_API_BASE is not set. Set it to your hosted website (e.g. https://speakup-english.vercel.app)\n" +
      "   in .env.local so the phone app can reach the AI robot, Premium checks and new content.\n",
  );
}

const env = { ...process.env, MOBILE_BUILD: "1" };
execSync("npx next build", { stdio: "inherit", env });
execSync("npx cap sync", { stdio: "inherit", env });
console.log("\n✅ Phone app updated. Open it with:  npx cap open android   (or on your Mac: npx cap open ios)\n");
