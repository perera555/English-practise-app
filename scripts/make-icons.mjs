// Renders assets/logo.svg into the PNGs that @capacitor/assets turns into app icons + splash screens.
// Usage: node scripts/make-icons.mjs && npx @capacitor/assets generate --android --ios
import { copyFileSync, readFileSync } from "fs";
import sharp from "sharp";

const logo = readFileSync("assets/logo.svg");

// Website / installable web app icons
copyFileSync("assets/logo.svg", "public/logo.svg");
copyFileSync("assets/logo.svg", "app/icon.svg");
for (const size of [192, 512]) await sharp(logo).resize(size, size).png().toFile(`public/icon-${size}.png`);
await sharp(logo).resize(180, 180).png().toFile("app/apple-icon.png");

// App icon (full square, stores round the corners themselves)
const square = Buffer.from(
  logo.toString().replaceAll('rx="230"', 'rx="0"'),
);
await sharp(square).resize(1024, 1024).png().toFile("assets/icon-only.png");

// Android adaptive icon: background gradient + foreground bubble (with safe-zone padding)
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0ea5e9"/><stop offset="0.55" stop-color="#6366f1"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/></svg>`;
await sharp(Buffer.from(bg)).png().toFile("assets/icon-background.png");
const fg = logo
  .toString()
  .replace(/<rect width="1024" height="1024"[^>]*\/>/, "")
  .replace(/<circle[^>]*\/>/g, "");
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await sharp(Buffer.from(fg)).resize(680, 680).png().toBuffer(), gravity: "center" }])
  .png()
  .toFile("assets/icon-foreground.png");

// Splash screens: logo in the middle of the gradient
for (const [name, color] of [
  ["splash", "#f5f7fb"],
  ["splash-dark", "#0b1020"],
]) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: color } })
    .composite([{ input: await sharp(logo).resize(700, 700).png().toBuffer(), gravity: "center" }])
    .png()
    .toFile(`assets/${name}.png`);
}
console.log("✅ assets/*.png created");
