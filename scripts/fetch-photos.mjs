// Downloads freely-licensed real photos from Wikimedia Commons for every picture key,
// resizes them to small WebP files in public/photos/, and writes lib/bundledPhotos.ts
// (with photographer credit + licence, as the licences require).
//
// Usage: node scripts/fetch-photos.mjs            (only missing photos)
//        node scripts/fetch-photos.mjs --force    (re-download all)
//        node scripts/fetch-photos.mjs ch:cafe     (re-download one key)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import sharp from "sharp";

const UA = "SpeakUpEnglishPhotoFetcher/1.0 (https://github.com/perera555/English-practise-app)";
const OUT = "public/photos";
const MANIFEST = "scripts/photo-manifest.json";
mkdirSync(OUT, { recursive: true });

// Read the queries from lib/photoQueries.ts (+ stories/speeches) without a TS compiler.
const src = readFileSync("lib/photoQueries.ts", "utf8");
const queries = {};
for (const m of src.matchAll(/"([a-z]+:[\w-]+)":\s*"([^"]+)"/g)) queries[m[1]] = m[2];
for (const [file, prefix] of [
  ["lib/stories.ts", "story"],
  ["lib/motivation.ts", "speech"],
]) {
  const t = readFileSync(file, "utf8");
  for (const m of t.matchAll(/id: "([\w-]+)",[\s\S]*?photo: "([^"]+)"/g)) queries[`${prefix}:${m[1]}`] = m[2];
}

// Shorter, Commons-friendly search terms where the stock-photo phrasing finds little.
const COMMONS = JSON.parse(readFileSync("scripts/commons-queries.json", "utf8"));

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => a.includes(":"));

const BAD =
  /(\bmap\b|logo|diagram|chart|flag|coat of arms|icon|seal|svg|drawing|painting|paintings|oil on canvas|artwork|illustration|engraving|lithograph|poster|stamp|banknote|coin|\bplan\b|text|screenshot|document|manuscript|infographic|nude|naked|corpse|bikini|swimwear|swimsuit|lingerie|president|prime minister|minister|senator|politician|ambassador|parliament|congress|white house|celebrit|red carpet|actor|actress|steve jobs|trump|zelensky|black and white|black-and-white|\b1[0-8]\d\d\b|\b19[0-6]\d\b)/i;

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  const url =
    "https://commons.wikimedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `${q} filetype:bitmap`,
      gsrlimit: "25",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "1280",
    });
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return pages
    .map((p) => ({ title: p.title, info: p.imageinfo?.[0] }))
    .filter(({ title, info }) => {
      if (!info || info.mime !== "image/jpeg") return false;
      if (info.width < 1000 || info.width < info.height * 1.15) return false; // landscape photos only
      const cats = strip(info.extmetadata?.Categories?.value) + " " + strip(info.extmetadata?.ImageDescription?.value).slice(0, 300);
      if (BAD.test(title) || BAD.test(cats)) return false;
      const lic = info.extmetadata?.LicenseShortName?.value ?? "";
      return /^(cc0|public domain|pd|cc[ -]by)/i.test(lic) && !/nc|nd/i.test(lic);
    });
}

async function fetchOne(key) {
  const tries = [COMMONS[key], queries[key], queries[key]?.split(" ").slice(0, 2).join(" ")].filter(Boolean);
  const used = new Set(Object.values(manifest).map((m) => m.sourceUrl));
  for (const q of tries) {
    const results = await search(q);
    const pick = results.find((r) => !used.has(r.info.descriptionurl)) ?? results[0];
    if (!pick) continue;
    const img = await fetch(pick.info.thumburl, { headers: { "User-Agent": UA } });
    if (!img.ok) continue;
    const buf = Buffer.from(await img.arrayBuffer());
    const file = `${key.replace(":", "-")}.webp`;
    await sharp(buf).resize(1024, 576, { fit: "cover", position: "attention" }).webp({ quality: 68 }).toFile(`${OUT}/${file}`);
    const meta = pick.info.extmetadata ?? {};
    manifest[key] = {
      src: `/photos/${file}`,
      author: strip(meta.Artist?.value) || "Unknown",
      license: meta.LicenseShortName?.value ?? "",
      sourceUrl: pick.info.descriptionurl,
      title: pick.title.replace(/^File:/, "").replace(/\.\w+$/, ""),
      query: q,
    };
    return true;
  }
  return false;
}

const keys = Object.keys(queries).filter((k) => (only.length ? only.includes(k) : force || !manifest[k] || !existsSync(`public${manifest[k].src}`)));
console.log(`Fetching ${keys.length} photos…`);
let ok = 0;
const failed = [];
for (const k of keys) {
  try {
    if (await fetchOne(k)) ok++;
    else failed.push(k);
  } catch (e) {
    failed.push(`${k} (${e.message})`);
  }
  await sleep(250);
  process.stdout.write(".");
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

const lines = Object.entries(manifest)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, m]) => `  ${JSON.stringify(k)}: ${JSON.stringify({ src: m.src, author: m.author.slice(0, 80), license: m.license, sourceUrl: m.sourceUrl })},`);
writeFileSync(
  "lib/bundledPhotos.ts",
  `// AUTO-GENERATED by scripts/fetch-photos.mjs. Real photos from Wikimedia Commons (free licences).\n` +
    `export type BundledPhoto = { src: string; author: string; license: string; sourceUrl: string };\n\n` +
    `export const BUNDLED_PHOTOS: Record<string, BundledPhoto> = {\n${lines.join("\n")}\n};\n`,
);
console.log(`\n✅ ${ok} downloaded. ${failed.length ? "❌ Failed: " + failed.join(", ") : ""}`);
