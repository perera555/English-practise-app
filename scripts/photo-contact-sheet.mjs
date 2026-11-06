// Makes labelled contact sheets of the bundled photos for review.
import { readFileSync } from "fs";
import sharp from "sharp";

const m = JSON.parse(readFileSync("scripts/photo-manifest.json", "utf8"));
const out = process.argv[2];
const groups = { ch: [], daily: [], misc: [], story: [] };
for (const k of Object.keys(m).sort()) {
  const p = k.split(":")[0];
  (p === "ch" ? groups.ch : p === "daily" ? groups.daily : p === "story" || p === "speech" ? groups.story : groups.misc).push(k);
}
const W = 256, H = 144, L = 18, COLS = 6;
for (const [name, keys] of Object.entries(groups)) {
  const rows = Math.ceil(keys.length / COLS);
  const comps = [];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const x = (i % COLS) * W, y = Math.floor(i / COLS) * (H + L);
    comps.push({ input: await sharp(`public${m[k].src}`).resize(W, H).toBuffer(), left: x, top: y });
    const label = Buffer.from(`<svg width="${W}" height="${L}"><rect width="100%" height="100%" fill="black"/><text x="3" y="13" font-size="12" fill="white" font-family="Arial">${k.replace(/&/g, "&amp;").slice(0, 38)}</text></svg>`);
    comps.push({ input: label, left: x, top: y + H });
  }
  await sharp({ create: { width: COLS * W, height: rows * (H + L), channels: 3, background: "#222" } }).composite(comps).jpeg({ quality: 70 }).toFile(`${out}/sheet-${name}.jpg`);
  console.log(name, keys.length);
}
