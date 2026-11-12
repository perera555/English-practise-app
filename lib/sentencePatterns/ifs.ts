import { ifLevel, type Book, type IfFrame } from "./engine";

/* ---------------- If I were ---------------- */
// [condition, Sinhala condition (before "නම්"), result, Sinhala result "-න්න", options]

const WERE_1: IfFrame[] = [
  ["you", "", "see a doctor", "දොස්තර කෙනෙක්ව හමුවෙන්න", "who"],
  ["rich", "පොහොසත්", "buy a big house", "ලොකු ගෙයක් ගන්න"],
  ["a bird", "කුරුල්ලෙක්", "fly over the mountains", "කඳු උඩින් පියාඹන්න", "sg"],
  ["you", "", "say sorry", "සමාව ඉල්ලන්න", "who"],
  ["taller", "තව උස", "play basketball", "බාස්කට්බෝල් ගහන්න"],
  ["hungry", "බඩගිනි", "eat something", "මොනවා හරි කන්න"],
  ["free today", "අද නිදහස්", "come to the party", "සාදයට එන්න"],
  ["at home", "ගෙදර හිටියා", "cook dinner", "රෑ කෑම උයන්න"],
  ["a teacher", "ගුරුවරයෙක්", "give less homework", "අඩුවෙන් ගෙදර වැඩ දෙන්න", "sg"],
  ["you", "", "take the job", "ඒ රැකියාව භාරගන්න", "who"],
  ["not so tired", "මෙච්චර මහන්සි නැත්නම්", "help more at home", "ගෙදරදී තව උදව් කරන්න"],
  ["older", "වයසින් වැඩි", "drive a car", "කාර් එකක් පදවන්න"],
  ["the class leader", "පන්ති නායකයා", "change the rules", "නීති වෙනස් කරන්න", "sg"],
  ["in Kandy", "මහනුවර හිටියා", "visit the Temple of the Tooth", "දළදා මාළිගාව වඳින්න යන්න"],
  ["less busy", "මෙච්චර කාර්යබහුල නැත්නම්", "visit {poss} grandparents more", "{sposs} ආච්චි සීයා බලන්න තව යන්න"],
];
const WERE_2: IfFrame[] = [
  ["you", "", "tell the teacher", "ගුරුතුමියට කියන්න", "who"],
  ["a famous singer", "ප්‍රසිද්ධ ගායකයෙක්", "sing on TV", "ටීවී එකේ සිංදු කියන්න", "sg"],
  ["on holiday", "නිවාඩුවක හිටියා", "sleep until ten", "දහය වෙනකම් නිදාගන්න"],
  ["a little braver", "තව ටිකක් නිර්භීත", "speak in front of the class", "පන්තිය ඉදිරියේ කතා කරන්න"],
  ["better at maths", "ගණිතයට තව දක්ෂ", "become an engineer", "ඉංජිනේරුවෙක් වෙන්න", "sg"],
  ["you", "", "study more", "තව පාඩම් කරන්න", "who"],
  ["in the city", "නගරයේ හිටියා", "go to the cinema every week", "හැම සතියෙම සිනමා ශාලාවට යන්න"],
  ["good at cooking", "උයන්න දක්ෂ", "open a restaurant", "අවන්හලක් විවෘත කරන්න"],
  ["the boss", "ලොක්කා", "give everyone a day off", "හැමෝටම නිවාඩු දවසක් දෙන්න", "sg"],
  ["a doctor", "දොස්තර කෙනෙක්", "work in a village hospital", "ගමේ රෝහලක වැඩ කරන්න", "sg"],
  ["stronger", "තව ශක්තිමත්", "carry the heavy box", "බර පෙට්ටිය උස්සන්න"],
  ["at the beach now", "දැන් මුහුදු වෙරළේ හිටියා", "swim in the sea", "මුහුදේ පීනන්න"],
  ["more patient", "තව ඉවසීම තියෙන කෙනෙක්", "teach small children", "පොඩි ළමයින්ට උගන්වන්න", "sg"],
  ["a cricket player", "ක්‍රිකට් ක්‍රීඩකයෙක්", "play for Sri Lanka", "ශ්‍රී ලංකාව වෙනුවෙන් ක්‍රීඩා කරන්න", "sg"],
  ["awake", "ඇහැරිලා හිටියා", "answer the phone", "ෆෝන් එකට උත්තර දෙන්න"],
];
const WERE_3: IfFrame[] = [
  ["you", "", "book the tickets now", "දැන්ම ටිකට් වෙන් කරන්න", "who"],
  ["the manager", "කළමනාකරු", "hire more staff", "තව සේවකයින් බඳවාගන්න", "sg"],
  ["a tourist here", "මෙහෙ සංචාරකයෙක්", "visit Sigiriya first", "මුලින්ම සීගිරිය බලන්න යන්න", "sg"],
  ["healthier", "තව නිරෝගී", "climb Adam's Peak", "ශ්‍රී පාදය නගින්න"],
  ["you", "", "ask for a refund", "සල්ලි ආපහු ඉල්ලන්න", "who"],
  ["in charge", "භාරව හිටියා", "fix the roads first", "මුලින්ම පාරවල් හදන්න"],
  ["more confident", "තව ආත්ම විශ්වාසයෙන් හිටියා", "ask for a promotion", "උසස්වීමක් ඉල්ලන්න"],
  ["a pilot", "ගුවන් නියමුවෙක්", "fly around the world", "ලෝකය වටේ පියාඹන්න", "sg"],
  ["closer to the office", "කාර්යාලයට ළඟින් හිටියා", "walk to work", "ඇවිදගෙන වැඩට යන්න"],
  ["you", "", "check the contract again", "ගිවිසුම ආයෙත් බලන්න", "who"],
  ["the principal", "විදුහල්පති", "build a new library", "අලුත් පුස්තකාලයක් හදන්න", "sg"],
  ["a millionaire", "කෝටිපතියෙක්", "help poor families", "දුප්පත් පවුල්වලට උදව් කරන්න", "sg"],
  ["more organised", "තව පිළිවෙළකට වැඩ කරන කෙනෙක්", "finish work on time", "වෙලාවට වැඩ ඉවර කරන්න", "sg"],
  ["at the meeting", "රැස්වීමේ හිටියා", "share the idea", "අදහස බෙදාගන්න"],
  ["a chef", "සූපවේදියෙක්", "cook Sri Lankan food abroad", "විදේශයක ලංකාවේ කෑම උයන්න", "sg"],
];
const WERE_4: IfFrame[] = [
  ["you", "", "save money every month", "හැම මාසෙම සල්ලි ඉතුරු කරන්න", "who"],
  ["the prime minister", "අගමැති", "improve public transport", "පොදු ප්‍රවාහනය දියුණු කරන්න", "sg"],
  ["a journalist", "මාධ්‍යවේදියෙක්", "write about the environment", "පරිසරය ගැන ලියන්න", "sg"],
  ["better with money", "සල්ලි පාලනයට තව දක්ෂ", "buy land", "ඉඩමක් ගන්න"],
  ["you", "", "talk to a lawyer", "නීතිඥයෙක් එක්ක කතා කරන්න", "who"],
  ["younger", "වයසින් අඩු", "study abroad", "විදේශයක ඉගෙන ගන්න"],
  ["a police officer", "පොලිස් නිලධාරියෙක්", "stop careless drivers", "නොසැලකිලිමත් රියදුරන්ව නවත්වන්න", "sg"],
  ["less shy", "මෙච්චර ලැජ්ජාශීලී නැත්නම්", "make new friends easily", "ලේසියෙන් අලුත් යාළුවෝ හොයාගන්න"],
  ["in a better mood", "මීට වඩා හොඳ මානසිකත්වයකින් හිටියා", "join the celebration", "සැමරුමට එකතු වෙන්න"],
  ["you", "", "think about it carefully", "ඒ ගැන හොඳින් හිතන්න", "who"],
  ["a scientist", "විද්‍යාඥයෙක්", "look for a cure for cancer", "පිළිකාවට ප්‍රතිකාරයක් හොයන්න", "sg"],
  ["the owner of this shop", "මේ කඩේ අයිතිකාරයා", "lower the prices", "මිල අඩු කරන්න", "sg"],
  ["fluent in French", "ප්‍රංශ භාෂාව චතුරව කතා කරනවා", "work in Paris", "පැරිසියේ වැඩ කරන්න"],
  ["on the committee", "කමිටුවේ හිටියා", "vote against the plan", "සැලැස්මට විරුද්ධව ඡන්දය දෙන්න"],
  ["more careful", "තව පරිස්සම්", "make fewer mistakes", "අඩුවෙන් වැරදි කරන්න"],
];
const WERE_5: IfFrame[] = [
  ["you", "", "accept the offer without hesitation", "පැකිලීමකින් තොරව යෝජනාව භාරගන්න", "who"],
  ["the minister of education", "අධ්‍යාපන ඇමති", "make English classes free", "ඉංග්‍රීසි පන්ති නොමිලේ ලබා දෙන්න", "sg"],
  ["in a position to help", "උදව් කරන්න පුළුවන් තත්ත්වයක හිටියා", "donate to the children's hospital", "ළමා රෝහලට පරිත්‍යාග කරන්න"],
  ["responsible for the budget", "අයවැය භාරව හිටියා", "invest more in research", "පර්යේෂණවලට වැඩිපුර ආයෝජනය කරන්න"],
  ["you", "", "consider all the options", "සියලු විකල්ප සලකා බලන්න", "who"],
  ["the head of the company", "සමාගමේ ප්‍රධානියා", "introduce flexible working hours", "නම්‍යශීලී වැඩ කරන වේලාවන් හඳුන්වා දෙන්න", "sg"],
  ["better prepared", "තව හොඳින් සූදානම් වෙලා හිටියා", "do better in interviews", "සම්මුඛ පරීක්ෂණවලදී තව හොඳින් කරන්න"],
  ["a member of parliament", "පාර්ලිමේන්තු මන්ත්‍රීවරයෙක්", "fight corruption", "දූෂණයට එරෙහිව සටන් කරන්න", "sg"],
  ["financially independent", "මූල්‍යමය වශයෙන් ස්වාධීන", "travel for a whole year", "මුළු අවුරුද්දක්ම සංචාරය කරන්න"],
  ["you", "", "negotiate a higher salary", "වැඩි වැටුපක් ගැන සාකච්ඡා කරන්න", "who"],
  ["an expert in this field", "මේ ක්ෂේත්‍රයේ විශේෂඥයෙක්", "write a guide for beginners", "ආරම්භකයින් සඳහා මාර්ගෝපදේශයක් ලියන්න", "sg"],
  ["under less pressure", "මීට වඩා අඩු පීඩනයක් යටතේ හිටියා", "enjoy the job more", "රැකියාව තවත් රසවිඳින්න"],
  ["the judge", "විනිසුරු", "give the young man a second chance", "තරුණයාට තවත් අවස්ථාවක් දෙන්න", "sg"],
  ["in a quieter neighbourhood", "මීට වඩා නිස්කලංක ප්‍රදේශයක හිටියා", "sleep much better", "ගොඩක් හොඳට නිදාගන්න"],
  ["aware of the risks", "අවදානම් ගැන දැනුවත්", "plan more carefully", "තව පරිස්සමෙන් සැලසුම් කරන්න"],
];

const WERE_F = {
  pos: "If + subject + were + …, subject + would + verb",
  neg: "If + subject + were + …, subject + wouldn't + verb",
  q: "If + subject + were + …, would + subject + verb?",
  nq: "If + subject + were + …, wouldn't + subject + verb?",
};
const WERE_TIP = "If I were … talks about something that is NOT true now (imagined). Use were for every person (If I were, If she were), and would in the other half.";
const WERE_SI = "If I were … = දැනට ඇත්ත නොවන (සිතාගත්) තත්ත්වයක්. හැම පුද්ගලයෙකුටම were (If I were, If she were), අනෙක් කොටසට would.";
const WERE_TIPS = [
  "If I were you … = my advice to you. ",
  "",
  "",
  "",
  "",
];

export const IF_WERE_BOOK: Book = {
  id: "if-i-were",
  title: "If I were …",
  emoji: "🌈",
  color: "from-fuchsia-500 to-purple-700",
  blurb: "If I were you … · If she were rich … · would / wouldn't",
  blurbSi: "සිතාගත් තත්ත්ව: මම ... නම් (If I were)",
  levels: [
    ["🌱 Beginner: If I were you / rich", WERE_1],
    ["🌿 Elementary: dreams & jobs", WERE_2],
    ["🌳 Intermediate: work & travel", WERE_3],
    ["🚀 Upper-intermediate: society & choices", WERE_4],
    ["🎓 Advanced: leadership & big decisions", WERE_5],
  ].map(([title, frames], i) => ifLevel({ title: title as string, formula: WERE_F, tip: WERE_TIPS[i] + WERE_TIP, tipSi: WERE_SI }, frames as IfFrame[], "were")),
};

/* ---------------- If I could ---------------- */
// [ability (after could), Sinhala ability "-න්න", result, Sinhala result "-න්න"]

const COULD_1: IfFrame[] = [
  ["fly", "පියාඹන්න", "visit every country", "හැම රටකටම යන්න"],
  ["swim", "පීනන්න", "join the swimming team", "පිහිනුම් කණ්ඩායමට බැඳෙන්න"],
  ["drive", "වාහන පදවන්න", "take {poss} parents to the temple", "{sposs} දෙමාපියන්ව පන්සලට එක්කගෙන යන්න"],
  ["cook well", "හොඳට උයන්න", "make dinner every day", "හැමදාම රෑ කෑම හදන්න"],
  ["speak French", "ප්‍රංශ කතා කරන්න", "work in France", "ප්‍රංශයේ වැඩ කරන්න"],
  ["sing well", "හොඳට සිංදු කියන්න", "sing at the concert", "ප්‍රසංගයේ සිංදු කියන්න"],
  ["come early", "කලින් එන්න", "help with the cooking", "උයන්න උදව් කරන්න"],
  ["stay longer", "තව ටිකක් ඉන්න", "see the fireworks", "ගිනිකෙළි බලන්න"],
  ["read faster", "ඉක්මනට කියවන්න", "finish the book today", "අද පොත ඉවර කරන්න"],
  ["run fast", "වේගයෙන් දුවන්න", "win the race", "තරගය දිනන්න"],
  ["play the piano", "පියානෝ වාදනය කරන්න", "play at the wedding", "මගුල් ගෙදර වාදනය කරන්න"],
  ["sleep more", "තව නිදාගන්න", "feel much better", "ගොඩක් හොඳට ඉන්න"],
  ["draw well", "හොඳට චිත්‍ර අඳින්න", "draw a picture of the sea", "මුහුදේ චිත්‍රයක් අඳින්න"],
  ["go out", "එළියට යන්න", "meet {poss} friends", "{sposs} යාළුවන්ව හමුවෙන්න"],
  ["choose any food", "ඕනෑම කෑමක් තෝරගන්න", "eat pizza every day", "හැමදාම පීසා කන්න"],
];
const COULD_2: IfFrame[] = [
  ["speak English well", "හොඳට ඉංග්‍රීසි කතා කරන්න", "talk to tourists", "සංචාරකයින් එක්ක කතා කරන්න"],
  ["take a holiday", "නිවාඩුවක් ගන්න", "go to Ella", "ඇල්ලට යන්න"],
  ["buy any car", "ඕනෑම කාර් එකක් ගන්න", "buy an electric car", "විදුලි කාර් එකක් ගන්න"],
  ["live anywhere", "ඕනෑම තැනක ජීවත් වෙන්න", "live near the beach", "මුහුදු වෙරළ ළඟ ජීවත් වෙන්න"],
  ["change one thing at school", "පාසලේ එක දෙයක් වෙනස් කරන්න", "start classes later", "පන්ති පරක්කු කරලා පටන් ගන්න"],
  ["meet anyone", "ඕනෑම කෙනෙක්ව හමුවෙන්න", "meet the president", "ජනාධිපතිව හමුවෙන්න"],
  ["get a ticket", "ටිකට් එකක් ගන්න", "see the final match", "අවසන් තරගය බලන්න"],
  ["work from home", "ගෙදර ඉඳන් වැඩ කරන්න", "spend more time with {poss} family", "{sposs} පවුලත් එක්ක වැඩි කාලයක් ගත කරන්න"],
  ["play any sport", "ඕනෑම ක්‍රීඩාවක් කරන්න", "play tennis", "ටෙනිස් ගහන්න"],
  ["leave work early", "කලින් වැඩ ඇරලා යන්න", "pick up the children", "ළමයින්ව එක්කගෙන එන්න"],
  ["fix computers", "පරිගණක හදන්න", "start a repair shop", "අලුත්වැඩියා කඩයක් පටන් ගන්න"],
  ["save more money", "තව සල්ලි ඉතුරු කරන්න", "buy a small house", "පොඩි ගෙයක් ගන්න"],
  ["find a cheaper flat", "ලාභ ෆ්ලැට් එකක් හොයාගන්න", "move next month", "ලබන මාසේ ගෙදර මාරු කරන්න"],
  ["type faster", "ඉක්මනට ටයිප් කරන්න", "finish the work in an hour", "පැයකින් වැඩේ ඉවර කරන්න"],
  ["remember names", "නම් මතක තියාගන්න", "greet everyone by name", "හැමෝටම නමින් ආචාර කරන්න"],
];
const COULD_3: IfFrame[] = [
  ["travel anywhere", "ඕනෑම තැනකට ගමන් කරන්න", "visit New Zealand", "නවසීලන්තයට යන්න"],
  ["choose any job", "ඕනෑම රැකියාවක් තෝරගන්න", "become a wildlife photographer", "වනජීවී ඡායාරූප ශිල්පියෙක් වෙන්න", "sg"],
  ["work fewer hours", "අඩු පැය ගණනක් වැඩ කරන්න", "learn a new skill", "අලුත් හැකියාවක් ඉගෙන ගන්න"],
  ["get a scholarship", "ශිෂ්‍යත්වයක් ලබාගන්න", "study medicine in Australia", "ඕස්ට්‍රේලියාවේ වෛද්‍ය විද්‍යාව හදාරන්න"],
  ["speak to the manager", "කළමනාකරු එක්ක කතා කරන්න", "ask for a better schedule", "වඩා හොඳ කාලසටහනක් ඉල්ලන්න"],
  ["cancel the booking", "වෙන් කිරීම අවලංගු කරන්න", "get the money back", "සල්ලි ආපහු ගන්න"],
  ["move closer to the city", "නගරයට ළඟින් පදිංචියට යන්න", "save time every day", "හැමදාම කාලය ඉතුරු කරන්න"],
  ["find a good teacher", "හොඳ ගුරුවරයෙක් හොයාගන්න", "take lessons twice a week", "සතියට දෙපාරක් පාඩම් ගන්න"],
  ["borrow some money", "ටිකක් සල්ලි ණයට ගන්න", "pay the rent on time", "වෙලාවට කුලිය ගෙවන්න"],
  ["use a computer", "පරිගණකයක් පාවිච්චි කරන්න", "send the documents by email", "ඊමේල් එකෙන් ලේඛන යවන්න"],
  ["understand the instructions", "උපදෙස් තේරුම්ගන්න", "set up the machine", "යන්ත්‍රය සකස් කරන්න"],
  ["get a day off", "නිවාඩු දවසක් ගන්න", "go to a relative's wedding", "ඥාතියෙකුගේ මගුලට යන්න"],
  ["sleep on the train", "කෝච්චියේදී නිදාගන්න", "arrive less tired", "අඩු මහන්සියකින් එන්න"],
  ["change {poss} job", "{sposs} රැකියාව මාරු කරන්න", "work in tourism", "සංචාරක ක්ෂේත්‍රයේ වැඩ කරන්න"],
  ["give {poss} younger self one piece of advice", "තරුණ කාලයේ තමන්ට එක උපදෙසක් දෙන්න", "say 'study English early'", "'කලින්ම ඉංග්‍රීසි ඉගෙන ගන්න' කියලා කියන්න"],
];
const COULD_4: IfFrame[] = [
  ["change one law", "එක නීතියක් වෙනස් කරන්න", "ban plastic bags", "ප්ලාස්ටික් බෑග් තහනම් කරන්න"],
  ["go back in time", "අතීතයට යන්න", "spend more time with {poss} grandparents", "{sposs} ආච්චි සීයා එක්ක වැඩි කාලයක් ගත කරන්න"],
  ["speak five languages", "භාෂා පහක් කතා කරන්න", "work in translation", "පරිවර්තන ක්ෂේත්‍රයේ වැඩ කරන්න"],
  ["afford a bigger house", "ලොකු ගෙයක් ගන්න", "give each child a room", "හැම ළමයෙකුටම කාමරයක් දෙන්න"],
  ["retire early", "කලින් විශ්‍රාම යන්න", "grow vegetables in the village", "ගමේ එළවළු වවන්න"],
  ["meet any person from history", "ඉතිහාසයේ ඕනෑම කෙනෙක්ව හමුවෙන්න", "ask Gandhi about peace", "ගාන්ධිතුමාගෙන් සාමය ගැන අහන්න"],
  ["solve one world problem", "ලෝකයේ එක ප්‍රශ්නයක් විසඳන්න", "end hunger", "කුසගින්න නැති කරන්න"],
  ["build any machine", "ඕනෑම යන්ත්‍රයක් හදන්න", "build one that cleans the ocean", "සාගරය පිරිසිදු කරන එකක් හදන්න"],
  ["work for any company", "ඕනෑම සමාගමක වැඩ කරන්න", "work for a space agency", "අභ්‍යවකාශ ආයතනයක වැඩ කරන්න"],
  ["have any superpower", "ඕනෑම සුපිරි බලයක් ලබාගන්න", "become invisible", "නොපෙනී ඉන්න"],
  ["start again", "ආයෙත් මුල ඉඳන් පටන් ගන්න", "study harder at school", "පාසලේදී තව හොඳට පාඩම් කරන්න"],
  ["make one wish", "එක පැතුමක් පතන්න", "wish for good health", "හොඳ සෞඛ්‍යයක් පතන්න"],
  ["earn more", "වැඩිපුර උපයන්න", "help {poss} parents with their bills", "{sposs} දෙමාපියන්ට බිල් ගෙවන්න උදව් කරන්න"],
  ["avoid the traffic", "වාහන තදබදය මඟහරින්න", "get to work in twenty minutes", "විනාඩි විස්සකින් වැඩට යන්න"],
  ["live in another century", "වෙනත් සියවසක ජීවත් වෙන්න", "choose the future", "අනාගතය තෝරගන්න"],
];
const COULD_5: IfFrame[] = [
  ["reform the education system", "අධ්‍යාපන ක්‍රමය ප්‍රතිසංස්කරණය කරන්න", "focus on practical skills", "ප්‍රායෝගික කුසලතා කෙරෙහි අවධානය යොමු කරන්න"],
  ["negotiate the contract again", "ආයෙත් ගිවිසුම ගැන සාකච්ඡා කරන්න", "ask for better terms", "වඩා හොඳ කොන්දේසි ඉල්ලන්න"],
  ["speak at the United Nations", "එක්සත් ජාතීන්ගේ සංවිධානයේ කතා කරන්න", "talk about climate change", "දේශගුණික විපර්යාස ගැන කතා කරන්න"],
  ["dedicate more time to research", "පර්යේෂණවලට වැඩි කාලයක් කැප කරන්න", "publish more papers", "තවත් පර්යේෂණ පත්‍රිකා පළ කරන්න"],
  ["influence government policy", "රජයේ ප්‍රතිපත්තිවලට බලපෑම් කරන්න", "support small businesses", "කුඩා ව්‍යාපාරවලට සහාය දෙන්න"],
  ["redesign the city", "නගරය නැවත සැලසුම් කරන්න", "create more green spaces", "තවත් හරිත ප්‍රදේශ නිර්මාණය කරන්න"],
  ["predict the future", "අනාගතය කලින් කියන්න", "prepare for every crisis", "හැම අර්බුදයකටම සූදානම් වෙන්න"],
  ["work with any organisation", "ඕනෑම සංවිධානයක් එක්ක වැඩ කරන්න", "volunteer with the Red Cross", "රතු කුරුස සංවිධානය එක්ක ස්වේච්ඡාවෙන් වැඩ කරන්න"],
  ["interview any world leader", "ඕනෑම ලෝක නායකයෙක් එක්ක සම්මුඛ සාකච්ඡාවක් කරන්න", "ask about their hardest decision", "එයාගේ අමාරුම තීරණය ගැන අහන්න"],
  ["manage {poss} time better", "{sposs} කාලය වඩා හොඳින් කළමනාකරණය කරන්න", "achieve much more", "ගොඩක් වැඩිපුර දේවල් සාක්ෂාත් කරගන්න"],
  ["get into any university", "ඕනෑම විශ්වවිද්‍යාලයකට ඇතුළු වෙන්න", "study economics at Oxford", "ඔක්ස්ෆර්ඩ්හි ආර්ථික විද්‍යාව හදාරන්න"],
  ["eliminate one disease", "එක රෝගයක් තුරන් කරන්න", "eliminate malaria", "මැලේරියාව තුරන් කරන්න"],
  ["communicate with animals", "සතුන් එක්ක සන්නිවේදනය කරන්න", "ask elephants what they need", "අලින්ගෙන් ඔවුන්ට ඕනේ මොනවද කියලා අහන්න"],
  ["run the company", "සමාගම පාලනය කරන්න", "share the profits with the staff", "ලාභය සේවකයින් එක්ක බෙදාගන්න"],
  ["rewrite history", "ඉතිහාසය නැවත ලියන්න", "prevent the world wars", "ලෝක යුද්ධ වළක්වන්න"],
];

const COULD_F = {
  pos: "If + subject + could + verb, subject + would + verb",
  neg: "If + subject + could + verb, subject + wouldn't + verb",
  q: "If + subject + could + verb, would + subject + verb?",
  nq: "If + subject + could + verb, wouldn't + subject + verb?",
};
const COULD_TIP = "If I could … = imagine you had this ability or chance (you don't now). Use could in the if-part and would in the other part. No 'to' after could.";
const COULD_SI = "If I could … = මට ... පුළුවන් නම් (දැනට බැහැ, සිතාගන්න). if කොටසට could, අනෙක් කොටසට would. could පසු 'to' නැත.";

export const IF_COULD_BOOK: Book = {
  id: "if-i-could",
  title: "If I could …",
  emoji: "✨",
  color: "from-violet-500 to-indigo-700",
  blurb: "If I could fly … · If she could drive … · would / wouldn't",
  blurbSi: "මට ... පුළුවන් නම් (If I could)",
  levels: [
    ["🌱 Beginner: simple abilities", COULD_1],
    ["🌿 Elementary: everyday chances", COULD_2],
    ["🌳 Intermediate: work, study & travel", COULD_3],
    ["🚀 Upper-intermediate: dreams & wishes", COULD_4],
    ["🎓 Advanced: changing the world", COULD_5],
  ].map(([title, frames]) => ifLevel({ title: title as string, formula: COULD_F, tip: COULD_TIP, tipSi: COULD_SI }, frames as IfFrame[], "could")),
};
