// Builds public/data/words.json: ~5000 English words, Beginner → Advanced, with simple English definitions
// (NGSL) and Sinhala where available (hand-written list, then Wiktionary). Run: node scripts/build-wordlist.mjs <ngsl folder>
// Sources: New General Service List 1.2 + NAWL (Browne, Culligan & Phillips, CC BY-SA 4.0),
//          Wiktionary via kaikki.org (CC BY-SA). The output file is therefore CC BY-SA.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import XLSX from "xlsx";

const dir = process.argv[2];
const TARGET = 5000;

const defsSheet = XLSX.readFile(`${dir}/NGSL_12_with_English_definitions.xlsx`);
const defs = new Map(
  XLSX.utils
    .sheet_to_json(defsSheet.Sheets[defsSheet.SheetNames[0]])
    .map((r) => [String(r.Word).toLowerCase(), String(r.Definitons ?? r.Definitions ?? "").trim()]),
);

const big = XLSX.readFile(`${dir}/NGSLwithSFI-31K.xlsx`);
const rows = XLSX.utils.sheet_to_json(big.Sheets["SFI adj"]).sort((a, b) => a.RawFreq_Rank - b.RawFreq_Rank);

// Words we never want in a learner dictionary (offensive, names, fragments, very technical).
const BLOCK = new Set(
  "fuck fucking shit damn bitch ass bastard crap dick piss sex sexy porn nigger cunt slut whore gay lesbian ph mi ok uh um oh hmm yeah ah eh mr mrs ms dr st vs etc ie eg co inc ltd tv pc cd dvd ad pm am uk usa us eu oocyte embryo sperm".split(" "),
);

const picked = [];
const seen = new Set();
for (const r of rows) {
  const w = String(r.Lemma ?? "").trim().toLowerCase();
  if (!w || seen.has(w) || BLOCK.has(w)) continue;
  const listed = String(r.Wordlist ?? "");
  const core = listed.includes("NGSL") || listed.includes("Sup") || listed.includes("NAWL");
  if (!core) {
    if (!/^[a-z]{3,16}$/.test(w)) continue; // extras: plain words only
    if (picked.length >= TARGET) continue;
  } else if (!/^[a-z][a-z'-]{0,20}$/.test(w)) continue;
  seen.add(w);
  picked.push({ w, list: core ? (listed.includes("NAWL") ? "NAWL" : "NGSL") : "extra" });
}
// Keep all core words, then fill with the most frequent extras up to TARGET.
const coreWords = picked.filter((p) => p.list !== "extra");
const extras = picked.filter((p) => p.list === "extra").slice(0, Math.max(0, TARGET - coreWords.length));
const finalOrder = picked.filter((p) => p.list !== "extra" || extras.includes(p)).slice(0, TARGET + 200);

const LEVELS = [
  [600, 1], // Beginner
  [1400, 2], // Elementary
  [2400, 3], // Intermediate
  [3600, 4], // Upper-Intermediate
  [Infinity, 5], // Advanced
];
const levelFor = (rank, list) => {
  let lv = LEVELS.find(([max]) => rank <= max)[1];
  if (list !== "NGSL") lv = Math.max(lv, 4); // academic and extra words: at least Upper-Intermediate
  return lv;
};

// Sinhala sources
const hand = existsSync("scripts/sinhala-words.json") ? JSON.parse(readFileSync("scripts/sinhala-words.json", "utf8")) : {};
const wiki = {};
if (existsSync(`${dir}/si.jsonl`)) {
  for (const line of readFileSync(`${dir}/si.jsonl`, "utf8").split("\n").filter(Boolean)) {
    const x = JSON.parse(line);
    for (const s of x.senses ?? []) {
      for (const g of s.glosses ?? []) {
        const k = g.toLowerCase().replace(/^(a|an|the|to) /, "").replace(/[.;,(].*$/, "").trim();
        if (/^[a-z][a-z' -]{1,25}$/.test(k) && !wiki[k] && /[඀-෿]/.test(x.word)) wiki[k] = x.word;
      }
    }
  }
}

const out = finalOrder.slice(0, TARGET).map((p, i) => {
  const rank = i + 1;
  const si = hand[p.w] || wiki[p.w] || "";
  return {
    w: p.w,
    l: levelFor(rank, p.list),
    d: defs.get(p.w) || "",
    s: si,
    src: hand[p.w] ? "h" : wiki[p.w] ? "w" : "",
  };
});

mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/words.json", JSON.stringify(out));
const by = [1, 2, 3, 4, 5].map((l) => out.filter((o) => o.l === l).length);
console.log(`✅ ${out.length} words · levels ${by.join(" / ")} · with definition ${out.filter((o) => o.d).length} · Sinhala hand ${out.filter((o) => o.src === "h").length}, wiki ${out.filter((o) => o.src === "w").length}`);
