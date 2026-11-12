import { beLevel, type Book, type BeFrame, type LevelInfo } from "./engine";

/**
 * Be verb: each card is ONE sentence in 12 patterns × 4 forms (48 sentences):
 * am/is/are · was/were · will be · have been · had been · used to be · can be · could be ·
 * should be · must be · have to be · might be.  32 cards = 1,536 sentences.
 */

const FORMULA = {
  pos: "I am happy.  ·  I was happy.  ·  I will be happy.  ·  I have been happy …",
  q: "Am I happy?  ·  Was I happy?  ·  Will I be happy?  ·  Have I been happy? …",
  neg: "I am not happy.  ·  I was not happy.  ·  I will not be happy. …",
  nq: "Am I not happy?  ·  Was I not happy?  ·  Will I not be happy? …",
};
const TIP =
  "One sentence, 12 patterns: say it in the present, past and future, with have been / had been, and with can, could, should, must, have to and might. Each pattern has 4 forms: positive, question, negative and negative question.";
const TIP_SI =
  "එක වාක්‍යයක් රටා 12 කින්: වර්තමාන, අතීත, අනාගත, have been / had been සහ can, could, should, must, have to, might. හැම රටාවකටම ධනාත්මක, ප්‍රශ්න, නිෂේධනාත්මක, නිෂේධනාත්මක ප්‍රශ්න යන ආකාර 4ම තියෙනවා.";

const info = (title: string): LevelInfo => ({ title, formula: FORMULA, tip: TIP, tipSi: TIP_SI });

const L1: BeFrame[] = [
  ["happy", "සතුටින්"],
  ["at home", "ගෙදර"],
  ["ready", "ලෑස්තියෙන්"],
  ["busy", "කාර්යබහුලව"],
  ["tired", "මහන්සියෙන්"],
  ["at school", "පාසලේ"],
  ["hungry", "බඩගින්නෙන්"],
];
const L2: BeFrame[] = [
  ["in the garden", "වත්තේ"],
  ["angry", "තරහෙන්"],
  ["in the office", "කාර්යාලයේ"],
  ["sick", "අසනීපෙන්"],
  ["quiet", "නිශ්ශබ්දව"],
  ["careful", "පරිස්සමෙන්"],
  ["nervous", "බයෙන්"],
];
const L3: BeFrame[] = [
  ["on time", "වෙලාවට"],
  ["in Colombo", "කොළඹ"],
  ["free in the evening", "හවසට නිදහසේ"],
  ["at the meeting", "රැස්වීමේ"],
  ["awake early", "කලින්ම ඇහැරගෙන"],
  ["calm", "සන්සුන්ව"],
];
const L4: BeFrame[] = [
  ["at the airport", "ගුවන්තොටුපළේ"],
  ["in hospital", "රෝහලේ"],
  ["alone at night", "රෑට තනියම"],
  ["patient with the children", "ළමයි එක්ක ඉවසීමෙන්"],
  ["with {poss} family", "{sposs} පවුලත් එක්ක"],
  ["confident in interviews", "සම්මුඛ පරීක්ෂණවලදී ආත්ම විශ්වාසයෙන්"],
];
const L5: BeFrame[] = [
  ["in charge of the project", "ව්‍යාපෘතිය භාරව"],
  ["under pressure at work", "වැඩේදී පීඩනයක් යටතේ"],
  ["abroad for a year", "අවුරුද්දක් විදේශයක"],
  ["healthy and strong", "නිරෝගීව සහ ශක්තිමත්ව"],
  ["honest with everyone", "හැමෝටම අවංකව"],
  ["in the front row", "ඉස්සරහ පේළියේ"],
];

export const BE_BOOK: Book = {
  id: "be-verb",
  title: "Be verb",
  emoji: "🧱",
  color: "from-sky-500 to-indigo-700",
  blurb: "One sentence · 12 patterns · am / was / will be / have been / had been …",
  blurbSi: "එක වාක්‍යයක් රටා 12 කින් (am, was, will be, have been, had been …)",
  levels: [
    beLevel(info("🌱 Beginner"), L1, 0),
    beLevel(info("🌿 Elementary"), L2, 7),
    beLevel(info("🌳 Intermediate"), L3, 14),
    beLevel(info("🚀 Upper-intermediate"), L4, 20),
    beLevel(info("🎓 Advanced"), L5, 26),
  ],
};
