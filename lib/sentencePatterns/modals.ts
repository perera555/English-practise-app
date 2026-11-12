import { modalLevel, siNeg, siNq, siPres, siQ, type Book, type Form, type ModalFrame, type ModalRule } from "./engine";

/* ---------------- Rules ---------------- */

/** must / should / would + base verb. */
function simple(word: string, siRule: ModalRule["si"], options: ModalRule["options"]): ModalRule {
  const W = word.charAt(0).toUpperCase() + word.slice(1);
  return {
    en: (form: Form, S, s, v) =>
      form === "pos" ? [`${S} `, word, ` ${v}.`] : form === "neg" ? [`${S} `, `${word} not`, ` ${v}.`] : form === "q" ? ["", W, ` ${s} ${v}?`] : ["", W, ` ${s} not ${v}?`],
    options: { ...options, nq: options.q },
    si: siRule,
  };
}

const MUST = simple(
  "must",
  (f, S, v) => (f === "pos" ? `${S} ${v}ම ඕනේ.` : f === "neg" ? `${S} කිසිසේත්ම ${v} හොඳ නැහැ.` : f === "q" ? `${S} ${v}ම ඕනෙද?` : `${S} ${v} ඕනේ නැද්ද?`),
  {
    pos: ["must", "musts", "must to", "is must"],
    neg: ["must not", "don't must", "must to not", "not must"],
    q: ["Must", "Musts", "Must to", "Do must"],
    nq: ["Mustn't", "Don't must", "Mustn't to", "Not must"],
  },
);

const SHOULD = simple(
  "should",
  (f, S, v) => (f === "pos" ? `${S} ${v} ඕනේ.` : f === "neg" ? `${S} ${v} හොඳ නැහැ.` : f === "q" ? `${S} ${v} ඕනෙද?` : `${S} ${v} ඕනේ නැද්ද?`),
  {
    pos: ["should", "shoulds", "should to", "is should"],
    neg: ["should not", "don't should", "should to not", "not should"],
    q: ["Should", "Shoulds", "Should to", "Do should"],
    nq: ["Shouldn't", "Don't should", "Shouldn't to", "Not should"],
  },
);

const SHOULD_HAVE: ModalRule = {
  en: (form, S, s, v) =>
    form === "pos"
      ? [`${S} `, "should have", ` ${v}.`]
      : form === "neg"
        ? [`${S} `, "shouldn't have", ` ${v}.`]
        : form === "q"
          ? ["", "Should", ` ${s} have ${v}?`]
          : ["", "Should", ` ${s} not have ${v}?`],
  options: {
    pos: ["should have", "should has", "should of", "should had"],
    neg: ["shouldn't have", "shouldn't has", "shouldn't of", "shouldn't had"],
    q: ["Should", "Shoulds", "Did should", "Do should"],
    nq: ["Should", "Shoulds", "Did should", "Do should"],
  },
  si: (f, S, v) => (f === "pos" ? `${S} ${v} තිබුණා.` : f === "neg" ? `${S} ${v} තිබුණේ නැහැ.` : f === "q" ? `${S} ${v} තිබුණාද?` : `${S} ${v} තිබුණේ නැද්ද?`),
};

const WOULD_Q = {
  q: ["Would", "Woulds", "Would to", "Does would"],
  nq: ["Would", "Woulds", "Would to", "Does would"],
};

/** would like to / would love to (the negative is always "wouldn't like to"). */
function wouldVerb(verb: "like" | "love", si: [string, string, string, string]): ModalRule {
  return {
    en: (form, S, s, v) =>
      form === "pos"
        ? [`${S} `, `would ${verb}`, ` to ${v}.`]
        : form === "neg"
          ? [`${S} `, `wouldn't like`, ` to ${v}.`]
          : form === "q"
            ? ["", "Would", ` ${s} ${verb} to ${v}?`]
            : ["", "Would", ` ${s} not ${verb} to ${v}?`],
    options: {
      pos: [`would ${verb}`, `would ${verb}s`, `would ${verb.replace(/e$/, "")}ing`, `will ${verb}s`],
      neg: ["wouldn't like", "wouldn't likes", "won't likes", "wouldn't liking"],
      ...WOULD_Q,
    },
    si: (f, S, v) => `${S} ${v} ${si[["pos", "neg", "q", "nq"].indexOf(f)]}`,
  };
}

const WOULD_LIKE = wouldVerb("like", ["කැමතියි.", "කැමති නැහැ.", "කැමතිද?", "කැමති නැද්ද?"]);
const WOULD_LOVE = wouldVerb("love", ["හරිම ආසයි.", "කැමති නැහැ.", "ආසද?", "ආස නැද්ද?"]);

const WOULD_RATHER: ModalRule = {
  en: (form, S, s, v) =>
    form === "pos"
      ? [`${S} `, "would rather", ` ${v}.`]
      : form === "neg"
        ? [`${S} `, "would rather not", ` ${v}.`]
        : form === "q"
          ? ["", "Would", ` ${s} rather ${v}?`]
          : ["", "Would", ` ${s} not rather ${v}?`],
  options: {
    pos: ["would rather", "would rather to", "would rathers", "will rather to"],
    neg: ["would rather not", "wouldn't rather to", "would rather not to", "would not rather to"],
    ...WOULD_Q,
  },
  si: (f, S, v) => (f === "pos" ? `${S} ${v} තමයි වඩා කැමති.` : f === "neg" ? `${S} ${v} එච්චර කැමති නැහැ.` : f === "q" ? `${S} ${v} වඩා කැමතිද?` : `${S} ${v} වඩා කැමති නැද්ද?`),
};

const WOULD = simple(
  "would",
  (f, S, v) => (f === "pos" ? `${S} ${siPres(v)}.` : f === "neg" ? `${S} ${siNeg(v)}.` : f === "q" ? `${S} ${siQ(v)}` : `${S} ${siNq(v)}`),
  {
    pos: ["would", "woulds", "would to", "would can"],
    neg: ["would not", "would not to", "don't would", "not would"],
    ...WOULD_Q,
  },
);

/* ---------------- Must ---------------- */

const MUST_1: ModalFrame[] = [
  ["study hard", "හොඳට පාඩම් කරන්න"],
  ["drink more water", "තව වතුර බොන්න"],
  ["go to bed early", "කලින් නිදාගන්න"],
  ["wash {poss} hands", "{sposs} අත් හෝදන්න"],
  ["eat breakfast", "උදේ කෑම කන්න"],
  ["brush {poss} teeth twice a day", "දවසට දෙපාරක් දත් මදින්න"],
  ["be home before six", "හයට කලින් ගෙදර ඉන්න"],
  ["finish {poss} homework", "{sposs} ගෙදර වැඩ ඉවර කරන්න"],
  ["call {poss} mother", "{sposs} අම්මාට කතා කරන්න"],
  ["clean the room", "කාමරය පිරිසිදු කරන්න"],
  ["wake up at six", "හයට ඇහැරෙන්න"],
  ["take the medicine", "බෙහෙත බොන්න"],
  ["wear a helmet", "හෙල්මට් එකක් දාන්න"],
  ["listen to the teacher", "ගුරුතුමිය කියන දේ අහන්න"],
  ["be quiet in the library", "පුස්තකාලයේදී නිශ්ශබ්දව ඉන්න"],
];
const MUST_2: ModalFrame[] = [
  ["wear a uniform to school", "පාසලට නිල ඇඳුම අඳින්න"],
  ["arrive on time", "වෙලාවට එන්න"],
  ["switch off {poss} phone in class", "පන්තියේදී {sposs} ෆෝන් එක ඕෆ් කරන්න"],
  ["do the exercise again", "අභ්‍යාසය ආයෙත් කරන්න"],
  ["pay at the counter", "කවුන්ටරයේ සල්ලි ගෙවන්න"],
  ["wait for the green light", "කොළ එළිය එනකම් ඉන්න"],
  ["lock the door at night", "රෑට දොර අගුලු දාන්න"],
  ["keep the kitchen clean", "කුස්සිය පිරිසිදුව තියාගන්න"],
  ["feed the dog", "බල්ලාට කන්න දෙන්න"],
  ["return the books by Friday", "සිකුරාදට කලින් පොත් ආපහු දෙන්න"],
  ["practise English every day", "හැමදාම ඉංග්‍රීසි පුහුණු වෙන්න"],
  ["help {poss} parents at home", "ගෙදරදී {sposs} දෙමාපියන්ට උදව් කරන්න"],
  ["ask the teacher for help", "ගුරුතුමියගෙන් උදව් ඉල්ලන්න"],
  ["cross the road carefully", "පරිස්සමෙන් පාර පනින්න"],
  ["save some money", "ටිකක් සල්ලි ඉතුරු කරන්න"],
];
const MUST_3: ModalFrame[] = [
  ["show {poss} passport at the gate", "ගේට්ටුවේදී {sposs} ගමන් බලපත්‍රය පෙන්නන්න"],
  ["check in two hours before the flight", "ගුවන් ගමනට පැය දෙකකට කලින් චෙක් ඉන් කරන්න"],
  ["fill in this form", "මේ පෝරමය පුරවන්න"],
  ["see a doctor about that cough", "ඒ කැස්ස ගැන දොස්තර කෙනෙක්ව හමුවෙන්න"],
  ["finish the report today", "අද වාර්තාව ඉවර කරන්න"],
  ["wear a seatbelt in the car", "කාරයේදී ආසන පටිය දාන්න"],
  ["book the hotel early", "කලින්ම හෝටලය වෙන් කරන්න"],
  ["follow the safety rules", "ආරක්ෂක නීති පිළිපදින්න"],
  ["answer the customer's email", "පාරිභෝගිකයාගේ ඊමේල් එකට උත්තර දෙන්න"],
  ["keep {poss} ticket until the end of the trip", "ගමන ඉවර වෙනකම් {sposs} ටිකට් එක තියාගන්න"],
  ["exercise three times a week", "සතියට තුන් පාරක් ව්‍යායාම කරන්න"],
  ["tell the manager about the problem", "ප්‍රශ්නය ගැන කළමනාකරුට කියන්න"],
  ["change trains at Colombo Fort", "කොළඹ කොටුවෙන් කෝච්චිය මාරු කරන්න"],
  ["eat less sugar", "සීනි අඩුවෙන් කන්න"],
  ["renew {poss} visa before it expires", "ඉවර වෙන්න කලින් {sposs} වීසා එක අලුත් කරන්න"],
];
const MUST_4: ModalFrame[] = [
  ["pay the electricity bill this week", "මේ සතියේ විදුලි බිල ගෙවන්න"],
  ["respect other people's opinions", "අනිත් අයගේ අදහස්වලට ගරු කරන්න"],
  ["protect the environment", "පරිසරය ආරක්ෂා කරන්න"],
  ["recycle plastic bottles", "ප්ලාස්ටික් බෝතල් ප්‍රතිචක්‍රීකරණය කරන්න"],
  ["vote in the election", "මැතිවරණයේදී ඡන්දය දෙන්න"],
  ["keep {poss} password secret", "{sposs} මුරපදය රහසිගතව තියාගන්න"],
  ["read the contract carefully", "ගිවිසුම හොඳින් කියවන්න"],
  ["report the accident to the police", "අනතුර ගැන පොලිසියට වාර්තා කරන්න"],
  ["think about the future", "අනාගතය ගැන හිතන්න"],
  ["apologise for the mistake", "වැරැද්දට සමාව ඉල්ලන්න"],
  ["obey the speed limit", "වේග සීමාව පිළිපදින්න"],
  ["make a decision soon", "ඉක්මනට තීරණයක් ගන්න"],
  ["control {poss} spending", "{sposs} වියදම් පාලනය කරන්න"],
  ["take care of {poss} health", "{sposs} සෞඛ්‍යය ගැන සැලකිලිමත් වෙන්න"],
  ["learn from {poss} mistakes", "{sposs} වැරදිවලින් ඉගෙන ගන්න"],
];
const MUST_5: ModalFrame[] = [
  ["submit the application before the deadline", "අවසන් දිනයට පෙර අයදුම්පත ඉදිරිපත් කරන්න"],
  ["comply with the new regulations", "නව රෙගුලාසිවලට අනුකූල වෙන්න"],
  ["provide proof of address", "ලිපිනය සනාථ කරන ලියවිල්ලක් ඉදිරිපත් කරන්න"],
  ["attend the training session", "පුහුණු සැසියට සහභාගී වෙන්න"],
  ["declare all goods at customs", "රේගුවේදී සියලු භාණ්ඩ ප්‍රකාශ කරන්න"],
  ["maintain accurate records", "නිවැරදි වාර්තා පවත්වාගෙන යන්න"],
  ["obtain permission from the principal", "විදුහල්පතිගෙන් අවසර ගන්න"],
  ["inform the bank of any changes", "ඕනෑම වෙනසක් ගැන බැංකුවට දැනුම් දෙන්න"],
  ["sign the agreement in front of a witness", "සාක්ෂිකරුවෙක් ඉදිරියේ ගිවිසුමට අත්සන් කරන්න"],
  ["keep all receipts for tax purposes", "බදු කටයුතු සඳහා සියලු රිසිට්පත් තියාගන්න"],
  ["treat every customer with respect", "හැම පාරිභෝගිකයෙකුටම ගෞරවයෙන් සලකන්න"],
  ["wear protective equipment on site", "වැඩබිමේදී ආරක්ෂක උපකරණ පළඳින්න"],
  ["meet the sales targets this quarter", "මේ කාර්තුවේ විකුණුම් ඉලක්ක සපුරන්න"],
  ["respond to complaints within 24 hours", "පැය 24ක් ඇතුළත පැමිණිලිවලට ප්‍රතිචාර දක්වන්න"],
  ["protect customers' personal data", "පාරිභෝගිකයින්ගේ පෞද්ගලික දත්ත ආරක්ෂා කරන්න"],
];

const MUST_F = {
  pos: "Subject + must + verb",
  neg: "Subject + must not (mustn't) + verb",
  q: "Must + subject + verb …?",
  nq: "Must + subject + not + verb …?",
};
const MUST_TIP = "Must = it is necessary (a strong rule). Must not = it is not allowed. The verb after must has no 'to' and no 's'.";
const MUST_SI = "Must = අනිවාර්යයෙන්ම කළ යුතුයි. Must not = කිසිසේත්ම නොකළ යුතුයි. must පසු ක්‍රියාපදයට 'to' හෝ 's' එකතු නොවේ.";

export const MUST_BOOK: Book = {
  id: "must",
  title: "Must",
  emoji: "⚠️",
  color: "from-rose-500 to-red-700",
  blurb: "must · must not · Must I …? · Mustn't we …?",
  blurbSi: "අනිවාර්යයෙන්ම කළ යුතු දේ (Must)",
  levels: [
    modalLevel({ title: "🌱 Beginner: everyday musts", formula: MUST_F, tip: MUST_TIP, tipSi: MUST_SI }, MUST_1, MUST),
    modalLevel({ title: "🌿 Elementary: home & school rules", formula: MUST_F, tip: MUST_TIP, tipSi: MUST_SI }, MUST_2, MUST),
    modalLevel({ title: "🌳 Intermediate: work, travel & health", formula: MUST_F, tip: MUST_TIP, tipSi: MUST_SI }, MUST_3, MUST),
    modalLevel({ title: "🚀 Upper-intermediate: money & society", formula: MUST_F, tip: MUST_TIP, tipSi: MUST_SI }, MUST_4, MUST),
    modalLevel({ title: "🎓 Advanced: formal rules", formula: MUST_F, tip: MUST_TIP, tipSi: MUST_SI }, MUST_5, MUST),
  ],
};

/* ---------------- Should ---------------- */

const SHOULD_1: ModalFrame[] = [
  ["drink more water", "තව වතුර බොන්න"],
  ["sleep eight hours", "පැය අටක් නිදාගන්න"],
  ["eat more fruit", "තව පළතුරු කන්න"],
  ["ask for help", "උදව් ඉල්ලන්න"],
  ["take an umbrella", "කුඩයක් අරන් යන්න"],
  ["call {poss} grandmother", "{sposs} ආච්චිට කතා කරන්න"],
  ["read more books", "තව පොත් කියවන්න"],
  ["go for a walk", "ඇවිදින්න යන්න"],
  ["tell the truth", "ඇත්ත කියන්න"],
  ["wear a jacket", "ජැකට් එකක් අඳින්න"],
  ["rest today", "අද විවේක ගන්න"],
  ["say sorry", "සමාව ඉල්ලන්න"],
  ["tidy {poss} room", "{sposs} කාමරය අස්පස් කරන්න"],
  ["learn to swim", "පීනන්න ඉගෙන ගන්න"],
  ["watch less TV", "ටීවී අඩුවෙන් බලන්න"],
];
const SHOULD_2: ModalFrame[] = [
  ["leave now", "දැන් පිටත් වෙන්න"],
  ["practise speaking English", "ඉංග්‍රීසි කතා කරන්න පුහුණු වෙන්න"],
  ["bring some snacks", "කෑම ටිකක් ගේන්න"],
  ["buy a new phone", "අලුත් ෆෝන් එකක් ගන්න"],
  ["visit the museum", "කෞතුකාගාරය බලන්න යන්න"],
  ["try the local food", "දේශීය කෑම රස බලන්න"],
  ["study for the test", "පරීක්ෂණයට පාඩම් කරන්න"],
  ["talk to the teacher", "ගුරුතුමිය එක්ක කතා කරන්න"],
  ["invite {poss} relatives", "{sposs} ඥාතීන්ට ආරාධනා කරන්න"],
  ["get up earlier", "තව කලින් නැගිටින්න"],
  ["write it down", "ඒක ලියාගන්න"],
  ["check the weather first", "මුලින්ම කාලගුණය බලන්න"],
  ["take the bus", "බස් එකේ යන්න"],
  ["join the English club", "ඉංග්‍රීසි සමාජයට බැඳෙන්න"],
  ["save {poss} work", "{sposs} වැඩේ සේව් කරන්න"],
];
const SHOULD_3: ModalFrame[] = [
  ["see a dentist", "දන්ත වෛද්‍යවරයෙක් හමුවෙන්න"],
  ["apply for that job", "ඒ රැකියාවට අයදුම් කරන්න"],
  ["book the tickets online", "ඔන්ලයින් ටිකට් වෙන් කරන්න"],
  ["ask the receptionist", "පිළිගැනීමේ නිලධාරියාගෙන් අහන්න"],
  ["change {poss} password", "{sposs} මුරපදය වෙනස් කරන්න"],
  ["compare the prices", "මිල ගණන් සසඳන්න"],
  ["update {poss} CV", "{sposs} CV එක යාවත්කාලීන කරන්න"],
  ["arrive at the airport early", "කලින්ම ගුවන්තොටුපළට එන්න"],
  ["drink less coffee", "කෝපි අඩුවෙන් බොන්න"],
  ["take a short break", "පොඩි විවේකයක් ගන්න"],
  ["back up the files", "ෆයිල්වල බැකප් එකක් ගන්න"],
  ["read the reviews first", "මුලින්ම විචාර කියවන්න"],
  ["speak to the manager", "කළමනාකරු එක්ක කතා කරන්න"],
  ["carry some cash", "ටිකක් මුදල් ළඟ තියාගන්න"],
  ["exchange money at the bank", "බැංකුවෙන් මුදල් මාරු කරන්න"],
];
const SHOULD_4: ModalFrame[] = [
  ["spend less on clothes", "ඇඳුම්වලට අඩුවෙන් වියදම් කරන්න"],
  ["start a savings account", "ඉතුරුම් ගිණුමක් පටන් ගන්න"],
  ["listen to both sides", "දෙපැත්තම අහන්න"],
  ["take the job offer", "රැකියා යෝජනාව භාරගන්න"],
  ["discuss it with {poss} family", "ඒ ගැන {sposs} පවුලේ අය එක්ක කතා කරන්න"],
  ["avoid fast food", "ක්ෂණික ආහාර මඟහරින්න"],
  ["volunteer at the hospital", "රෝහලේ ස්වේච්ඡාවෙන් වැඩ කරන්න"],
  ["complain to the company", "සමාගමට පැමිණිලි කරන්න"],
  ["trust {poss} instincts", "{sposs} හැඟීම් විශ්වාස කරන්න"],
  ["plan the budget carefully", "හොඳින් අයවැය සැලසුම් කරන්න"],
  ["get a second opinion", "තවත් කෙනෙකුගේ අදහසක් ගන්න"],
  ["invest in education", "අධ්‍යාපනයට ආයෝජනය කරන්න"],
  ["reduce {poss} screen time", "{sposs} තිරය බලන කාලය අඩු කරන්න"],
  ["keep calm in an emergency", "හදිසියකදී සන්සුන්ව ඉන්න"],
  ["forgive {poss} friend", "{sposs} යාළුවාට සමාව දෙන්න"],
];
/** should have + past participle */
const SHOULD_5: ModalFrame[] = [
  ["told the truth", "ඇත්ත කියන්න"],
  ["left earlier", "තව කලින් පිටත් වෙන්න"],
  ["called the police", "පොලිසියට කතා කරන්න"],
  ["studied harder", "තව හොඳට පාඩම් කරන්න"],
  ["listened to the doctor", "දොස්තර කියපු දේ අහන්න"],
  ["brought an umbrella", "කුඩයක් ගේන්න"],
  ["saved more money", "තව සල්ලි ඉතුරු කරන්න"],
  ["checked the address", "ලිපිනය බලන්න"],
  ["asked for directions", "පාර අහන්න"],
  ["read the instructions", "උපදෙස් කියවන්න"],
  ["booked a table", "මේසයක් වෙන් කරන්න"],
  ["apologised immediately", "වහාම සමාව ඉල්ලන්න"],
  ["accepted the offer", "යෝජනාව භාරගන්න"],
  ["charged {poss} phone", "{sposs} ෆෝන් එක චාජ් කරන්න"],
  ["taken a taxi", "ටැක්සියක යන්න"],
];

const SHOULD_F = {
  pos: "Subject + should + verb",
  neg: "Subject + should not (shouldn't) + verb",
  q: "Should + subject + verb …?",
  nq: "Should + subject + not + verb …?",
};
const SHOULD_TIP = "Should = good advice (a good idea). It is softer than must. The verb after should has no 'to' and no 's'.";
const SHOULD_SI = "Should = කරන එක හොඳයි / කළ යුතුයි (උපදෙසක්). Must වලට වඩා මෘදුයි. should පසු ක්‍රියාපදයට 'to' හෝ 's' නැත.";

export const SHOULD_BOOK: Book = {
  id: "should",
  title: "Should",
  emoji: "💡",
  color: "from-amber-500 to-orange-700",
  blurb: "should · shouldn't · Should I …? · should have done",
  blurbSi: "උපදෙස් දීම (Should)",
  levels: [
    modalLevel({ title: "🌱 Beginner: simple advice", formula: SHOULD_F, tip: SHOULD_TIP, tipSi: SHOULD_SI }, SHOULD_1, SHOULD),
    modalLevel({ title: "🌿 Elementary: plans & school", formula: SHOULD_F, tip: SHOULD_TIP, tipSi: SHOULD_SI }, SHOULD_2, SHOULD),
    modalLevel({ title: "🌳 Intermediate: work & travel", formula: SHOULD_F, tip: SHOULD_TIP, tipSi: SHOULD_SI }, SHOULD_3, SHOULD),
    modalLevel({ title: "🚀 Upper-intermediate: life decisions", formula: SHOULD_F, tip: SHOULD_TIP, tipSi: SHOULD_SI }, SHOULD_4, SHOULD),
    modalLevel(
      {
        title: "🎓 Advanced: should have + done",
        formula: { pos: "Subject + should have + past participle", neg: "Subject + shouldn't have + past participle", q: "Should + subject + have + past participle …?", nq: "Should + subject + not have + past participle …?" },
        tip: "Should have done = it was a good idea, but it did not happen (a regret about the past).",
        tipSi: "Should have done = කරන්න තිබුණා, නමුත් කළේ නැහැ (අතීතය ගැන පසුතැවීම).",
      },
      SHOULD_5,
      SHOULD_HAVE,
    ),
  ],
};

/* ---------------- Would ---------------- */

const WOULD_1: ModalFrame[] = [
  ["drink some tea", "තේ ටිකක් බොන්න"],
  ["eat rice and curry", "බත් කරි කන්න"],
  ["go home", "ගෙදර යන්න"],
  ["sit here", "මෙතන ඉඳගන්න"],
  ["watch a film", "චිත්‍රපටයක් බලන්න"],
  ["learn English", "ඉංග්‍රීසි ඉගෙන ගන්න"],
  ["visit Kandy", "මහනුවර බලන්න යන්න"],
  ["buy a new bag", "අලුත් බෑග් එකක් ගන්න"],
  ["play cricket", "ක්‍රිකට් ගහන්න"],
  ["listen to music", "සංගීතය අහන්න"],
  ["have a cup of coffee", "කෝපි කෝප්පයක් බොන්න"],
  ["meet {poss} friends", "{sposs} යාළුවන්ව හමුවෙන්න"],
  ["go to the beach", "මුහුදු වෙරළට යන්න"],
  ["read this book", "මේ පොත කියවන්න"],
  ["take a photo", "ෆොටෝ එකක් ගන්න"],
];
const WOULD_2: ModalFrame[] = [
  ["book a room for two nights", "රාත්‍රී දෙකකට කාමරයක් වෙන් කරන්න"],
  ["order a pizza", "පීසා එකක් ඇණවුම් කරන්න"],
  ["open a bank account", "බැංකු ගිණුමක් විවෘත කරන්න"],
  ["try this dress on", "මේ ඇඳුම ඇඳලා බලන්න"],
  ["make an appointment", "හමුවීමක් වෙන් කරන්න"],
  ["change {poss} seat", "{sposs} ආසනය මාරු කරන්න"],
  ["see the menu", "මෙනු එක බලන්න"],
  ["pay by card", "කාඩ් එකෙන් ගෙවන්න"],
  ["send this parcel to Jaffna", "මේ පාර්සලය යාපනයට යවන්න"],
  ["join the gym", "ජිම් එකට බැඳෙන්න"],
  ["speak to the doctor", "දොස්තර එක්ක කතා කරන්න"],
  ["borrow a pen", "පෑනක් ඉල්ලගන්න"],
  ["rent a car for a week", "සතියකට කාරයක් කුලියට ගන්න"],
  ["travel by train", "කෝච්චියෙන් ගමන් කරන්න"],
  ["return these shoes", "මේ සපත්තු ආපහු දෙන්න"],
];
const WOULD_3: ModalFrame[] = [
  ["visit Japan", "ජපානයට යන්න"],
  ["meet a famous actor", "ප්‍රසිද්ධ නළුවෙක්ව හමුවෙන්න"],
  ["live by the sea", "මුහුද ළඟ ජීවත් වෙන්න"],
  ["learn to play the guitar", "ගිටාර් වාදනය කරන්න ඉගෙන ගන්න"],
  ["see snow", "හිම දකින්න"],
  ["work abroad", "විදේශයක වැඩ කරන්න"],
  ["run a marathon", "මැරතන් එකක් දුවන්න"],
  ["write a book", "පොතක් ලියන්න"],
  ["own a small café", "පොඩි කැෆේ එකක් අයිති කරගන්න"],
  ["fly in a hot-air balloon", "උණුසුම් වායු බැලූනයකින් පියාඹන්න"],
  ["cook for {poss} family", "{sposs} පවුලට උයන්න"],
  ["speak English fluently", "චතුර ලෙස ඉංග්‍රීසි කතා කරන්න"],
  ["watch a match at Lord's", "ලෝඩ්ස් පිටියේදී තරගයක් බලන්න"],
  ["go on a safari in Yala", "යාලේ සෆාරියක් යන්න"],
  ["start {poss} own business", "තමන්ගේම ව්‍යාපාරයක් පටන් ගන්න"],
];
const WOULD_4: ModalFrame[] = [
  ["walk", "ඇවිදගෙන යන්න"],
  ["stay at home tonight", "අද රෑ ගෙදර ඉන්න"],
  ["eat at home", "ගෙදර කන්න"],
  ["take the train", "කෝච්චියේ යන්න"],
  ["work from home", "ගෙදර ඉඳන් වැඩ කරන්න"],
  ["pay now", "දැන්ම ගෙවන්න"],
  ["sit near the window", "ජනේලය ළඟ ඉඳගන්න"],
  ["wait outside", "එළියේ ඉන්න"],
  ["watch a comedy", "විකට චිත්‍රපටයක් බලන්න"],
  ["drink juice", "ජූස් බොන්න"],
  ["do it {self}", "ඒක තනියම කරන්න"],
  ["go by bus", "බස් එකේ යන්න"],
  ["study in the morning", "උදේ පාඩම් කරන්න"],
  ["live in the countryside", "ගම්බද පළාතක ජීවත් වෙන්න"],
  ["talk about it later", "ඒ ගැන පස්සේ කතා කරන්න"],
];
const WOULD_5: ModalFrame[] = [
  ["help the old lady", "මහලු කාන්තාවට උදව් කරන්න"],
  ["lend money to a friend", "යාළුවෙකුට සල්ලි ණයට දෙන්න"],
  ["accept that job", "ඒ රැකියාව භාරගන්න"],
  ["move to another country", "වෙනත් රටකට පදිංචියට යන්න"],
  ["sell the old car", "පරණ කාරය විකුණන්න"],
  ["report the problem", "ප්‍රශ්නය වාර්තා කරන්න"],
  ["tell the boss", "ලොක්කාට කියන්න"],
  ["forgive a friend like that", "එහෙම යාළුවෙකුට සමාව දෙන්න"],
  ["pay that much for a phone", "ෆෝන් එකකට ඒ තරම් සල්ලි ගෙවන්න"],
  ["change the plan", "සැලැස්ම වෙනස් කරන්න"],
  ["marry for love", "ආදරය නිසා විවාහ වෙන්න"],
  ["support the new rule", "නව නීතියට සහාය දෙන්න"],
  ["share the prize", "ත්‍යාගය බෙදාගන්න"],
  ["wait another year", "තව අවුරුද්දක් බලාගෙන ඉන්න"],
  ["buy a house in the city", "නගරයේ ගෙයක් ගන්න"],
];

const W_LIKE = {
  pos: "Subject + would like to + verb",
  neg: "Subject + wouldn't like to + verb",
  q: "Would + subject + like to + verb …?",
  nq: "Would + subject + not like to + verb …?",
};

export const WOULD_BOOK: Book = {
  id: "would",
  title: "Would",
  emoji: "🙏",
  color: "from-teal-500 to-emerald-700",
  blurb: "would like to · would love to · would rather · would",
  blurbSi: "කැමැත්ත, ආශාව සහ ආචාරශීලී ඉල්ලීම් (Would)",
  levels: [
    modalLevel(
      { title: "🌱 Beginner: would like to", formula: W_LIKE, tip: "Would like to = want to, but more polite. Use it to ask for things and to offer.", tipSi: "Would like to = කැමතියි (want වලට වඩා ආචාරශීලී ක්‍රමය)." },
      WOULD_1,
      WOULD_LIKE,
      true,
    ),
    modalLevel(
      { title: "🌿 Elementary: would like to (shops & services)", formula: W_LIKE, tip: "In shops, hotels and banks, say I would like to … instead of I want to …", tipSi: "කඩවල, හෝටලවල, බැංකුවල I want වෙනුවට I would like to භාවිතා කරන්න." },
      WOULD_2,
      WOULD_LIKE,
      true,
    ),
    modalLevel(
      {
        title: "🌳 Intermediate: would love to",
        formula: { pos: "Subject + would love to + verb", neg: "Subject + wouldn't like to + verb", q: "Would + subject + love to + verb …?", nq: "Would + subject + not love to + verb …?" },
        tip: "Would love to = would like to, very much. Use it for dreams and happy plans.",
        tipSi: "Would love to = හරිම ආසයි (සිහින සහ සතුටු සැලසුම් ගැන).",
      },
      WOULD_3,
      WOULD_LOVE,
      true,
    ),
    modalLevel(
      {
        title: "🚀 Upper-intermediate: would rather",
        formula: { pos: "Subject + would rather + verb", neg: "Subject + would rather not + verb", q: "Would + subject + rather + verb …?", nq: "Would + subject + not rather + verb …?" },
        tip: "Would rather = prefer. No 'to' after would rather. The negative is would rather not.",
        tipSi: "Would rather = වඩා කැමතියි. would rather පසු 'to' නැත. නිෂේධනය would rather not.",
      },
      WOULD_4,
      WOULD_RATHER,
      true,
    ),
    modalLevel(
      {
        title: "🎓 Advanced: would (imagined situations)",
        formula: { pos: "Subject + would + verb", neg: "Subject + would not (wouldn't) + verb", q: "Would + subject + verb …?", nq: "Would + subject + not + verb …?" },
        tip: "Would + verb talks about an imagined situation: what you would do (not what you will do).",
        tipSi: "Would + verb = සිතාගත් තත්ත්වයක කරන දේ (ඇත්තටම කරන දේ නොවේ).",
      },
      WOULD_5,
      WOULD,
      true,
    ),
  ],
};
