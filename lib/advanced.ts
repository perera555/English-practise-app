import type { Line } from "./types";

/**
 * Advanced / Native English programme (C1–C2).
 * All content is original. Sinhala explanations are for learners; please have them reviewed by a native speaker.
 */

export type Expr = { en: string; meaning: string; si: string; example: string; emoji: string; note?: string };

const X = (emoji: string, en: string, meaning: string, si: string, example: string, note?: string): Expr => ({ emoji, en, meaning, si, example, note });

/* ---------------- 💡 Idioms ---------------- */
export const IDIOMS: Expr[] = [
  X("🍰", "a piece of cake", "very easy", "ඉතා පහසු දෙයක්", "The exam was a piece of cake."),
  X("☔", "under the weather", "feeling a little ill", "ටිකක් අසනීපෙන්", "I'm feeling a bit under the weather today."),
  X("🧊", "break the ice", "to start a conversation and make people feel relaxed", "මුල් නිහඬ බව බිඳ කතාබහ ආරම්භ කිරීම", "He told a joke to break the ice."),
  X("💸", "cost an arm and a leg", "to be very expensive", "ඉතා මිල අධික වීම", "That new phone costs an arm and a leg."),
  X("🎯", "hit the nail on the head", "to describe exactly what is causing a problem", "නිවැරදිම කාරණය කීම", "You hit the nail on the head: we need more time."),
  X("🛏️", "hit the sack", "to go to bed", "නින්දට යනවා", "I'm exhausted. I'm going to hit the sack."),
  X("🐱", "let the cat out of the bag", "to tell a secret by mistake", "රහස අහම්බෙන් හෙළි කිරීම", "Who let the cat out of the bag about the party?"),
  X("🌧️", "it's raining cats and dogs", "it's raining very heavily", "දැඩි ලෙස වැසි වැටෙනවා", "Take an umbrella; it's raining cats and dogs."),
  X("🦵", "break a leg", "good luck (before a performance)", "සුබ පැතුම් (ප්‍රසංගයකට පෙර)", "Your speech is tonight? Break a leg!"),
  X("🕐", "better late than never", "it's better to do something late than not at all", "කවදාවත් නොකරනවාට වඩා පමා වී කිරීම හොඳයි", "You finally called! Better late than never."),
  X("🐦", "kill two birds with one stone", "to do two things with one action", "එක ගලෙන් කුරුල්ලන් දෙදෙනෙක්", "I'll visit Mum and buy groceries on the way: two birds with one stone."),
  X("🌊", "in hot water", "in trouble", "කරදරයක පැටලී", "He's in hot water for missing the meeting."),
  X("🎂", "once in a blue moon", "very rarely", "ඉතා කලාතුරකින්", "I eat fast food once in a blue moon."),
  X("🗣️", "speak of the devil", "said when the person you're talking about appears", "කතා කරද්දීම එනවා", "Speak of the devil, here's Nimal now!"),
  X("👂", "all ears", "listening carefully and eagerly", "මහත් උනන්දුවෙන් අහගෙන ඉන්නවා", "Tell me your plan; I'm all ears."),
  X("🚪", "on the fence", "unable to decide", "තීරණයක් ගත නොහැකිව", "I'm still on the fence about the job offer."),
  X("🔥", "add fuel to the fire", "to make a bad situation worse", "ගින්නට පිදුරු දැමීම", "Shouting at him will just add fuel to the fire."),
  X("🧠", "on the same page", "agreeing and understanding the same thing", "එකම අදහසින් සිටීම", "Let's meet so everyone is on the same page."),
  X("⏳", "the ball is in your court", "it's your decision or your turn to act", "දැන් තීරණය ඔබ අතේ", "I've made my offer. The ball is in your court."),
  X("🐘", "the elephant in the room", "an obvious problem nobody wants to talk about", "කවුරුත් කතා නොකරන පැහැදිලි ගැටලුව", "Let's talk about the elephant in the room: the budget."),
  X("💡", "think outside the box", "to think in a creative, new way", "නව නිර්මාණශීලී ලෙස සිතීම", "We need to think outside the box to win more customers."),
  X("🤐", "keep it under your hat", "keep it secret", "රහසක් ලෙස තබා ගන්න", "I'm getting promoted, but keep it under your hat."),
  X("🎢", "ups and downs", "good times and bad times", "හොඳ නරක දෙකම", "Every business has its ups and downs."),
  X("🧩", "cut corners", "to do something badly to save time or money", "කෙටි මාර්ග ගෙන ගුණාත්මකභාවය අඩු කිරීම", "Don't cut corners on safety."),
  X("🌱", "learn the ropes", "to learn how to do a new job", "නව රැකියාවක වැඩ ඉගෙන ගැනීම", "It took me a month to learn the ropes."),
  X("🏃", "on the go", "very busy and active", "නොනවත්වා කාර්යබහුලව", "I've been on the go all day."),
  X("😴", "sleep on it", "to wait until tomorrow before deciding", "හෙට වන තුරු සිතා බලා තීරණය කරන්න", "Don't decide now; sleep on it."),
  X("🍎", "the apple of my eye", "a person you love very much", "ඉතා ආදරණීය කෙනා", "My daughter is the apple of my eye."),
  X("🚀", "go the extra mile", "to do more than is expected", "අපේක්ෂාවට වඩා වැඩිපුර උත්සාහ කිරීම", "Great hotels go the extra mile for their guests."),
  X("💰", "pay through the nose", "to pay far too much", "අධික මිලක් ගෙවීම", "We paid through the nose for those tickets."),
  X("🤞", "fingers crossed", "hoping for good luck", "සුබ ප්‍රතිඵලයක් බලාපොරොත්තුවෙන්", "My exam results come out tomorrow. Fingers crossed!"),
  X("🏁", "call it a day", "to stop working for the day", "අද වැඩ නවත්වනවා", "It's eight o'clock. Let's call it a day."),
  X("📏", "by the book", "following the rules exactly", "නීතිරීති අනුව හරියටම", "Our manager does everything by the book."),
  X("🔔", "ring a bell", "to sound familiar", "මතකයට එන ගතියක්", "His name rings a bell."),
  X("🧂", "take it with a pinch of salt", "don't believe it completely", "සම්පූර්ණයෙන් විශ්වාස නොකරන්න", "He exaggerates, so take it with a pinch of salt."),
  X("🌍", "it's not the end of the world", "it's not a very serious problem", "ලෝකය අවසන් වෙන තරම් දෙයක් නෙවෙයි", "You missed the bus. It's not the end of the world."),
  X("🍵", "not my cup of tea", "not something I like", "මගේ රුචිකත්වයට නොගැලපේ", "Horror films are not my cup of tea."),
  X("🎈", "over the moon", "extremely happy", "අතිශයින් සතුටින්", "She was over the moon about her new job."),
];

/* ---------------- 🔗 Phrasal verbs ---------------- */
export const PHRASAL: Expr[] = [
  X("🔍", "look up", "to search for information, e.g. in a dictionary", "සොයා බලනවා", "Look up the word in the dictionary."),
  X("🔎", "look for", "to try to find", "සොයනවා", "I'm looking for my keys."),
  X("👀", "look after", "to take care of", "රැකබලා ගන්නවා", "Can you look after my cat this weekend?"),
  X("⏩", "look forward to", "to be excited about something in the future", "උනන්දුවෙන් බලාපොරොත්තු වෙනවා", "I'm looking forward to the holiday."),
  X("🙅", "give up", "to stop trying", "අත්හරිනවා", "Never give up on your dreams."),
  X("🛑", "put off", "to delay to a later time", "කල් දමනවා", "Don't put off your homework."),
  X("🤝", "get along (with)", "to have a friendly relationship", "හොඳින් එකඟව සිටිනවා", "I get along well with my colleagues."),
  X("🧗", "get over", "to recover from something bad", "සුවය ලබනවා / අමතක කරනවා", "It took weeks to get over the flu."),
  X("📞", "call back", "to return a phone call", "නැවත ඇමතුම් දෙනවා", "I'll call you back in ten minutes."),
  X("🗣️", "bring up", "to start talking about a subject", "කතාවට ගෙන එනවා", "Don't bring up politics at dinner."),
  X("🎒", "pick up", "to collect someone or something; to learn without studying", "රැගෙන එනවා / ඉබේ ඉගෙන ගන්නවා", "I'll pick you up at six. / I picked up some French in Paris."),
  X("🚗", "drop off", "to take someone somewhere and leave them", "බස්සවනවා", "Can you drop me off at the station?"),
  X("🧩", "figure out", "to understand or solve", "තේරුම් ගන්නවා / විසඳනවා", "I can't figure out this puzzle."),
  X("🏃", "run out of", "to have no more left", "අවසන් වෙනවා", "We've run out of milk."),
  X("🔄", "turn down", "to refuse; to lower the volume", "ප්‍රතික්ෂේප කරනවා / ශබ්දය අඩු කරනවා", "She turned down the job offer. / Turn down the music, please."),
  X("💡", "come up with", "to think of an idea", "අදහසක් ඉදිරිපත් කරනවා", "She came up with a great plan."),
  X("✋", "hold on", "to wait a short time", "මොහොතක් ඉන්න", "Hold on, I'll get a pen."),
  X("🏠", "settle down", "to start living a calm life in one place", "ස්ථාවර ජීවිතයක් ගත කරනවා", "He wants to settle down and start a family."),
  X("📉", "break down", "to stop working (a machine); to start crying", "කැඩෙනවා / හඬා වැටෙනවා", "My car broke down on the highway."),
  X("🌅", "set off", "to start a journey", "ගමන ආරම්භ කරනවා", "We set off early to avoid traffic."),
  X("👔", "dress up", "to wear smart or special clothes", "හොඳින් ඇඳ පැළඳ ගන්නවා", "We dressed up for the wedding."),
  X("📋", "fill in", "to complete a form", "පුරවනවා (පෝරමයක්)", "Please fill in this form."),
  X("🧹", "clean up", "to make a place tidy", "පිරිසිදු කරනවා", "Let's clean up after the party."),
  X("🤔", "make up", "to invent a story; to become friends again", "ගොතනවා / සමාදාන වෙනවා", "He made up an excuse. / They argued but made up later."),
  X("📣", "speak up", "to speak louder or say your opinion", "හයියෙන් කතා කරනවා / අදහස් ප්‍රකාශ කරනවා", "Could you speak up, please?"),
  X("👋", "show up", "to arrive, often late or unexpectedly", "පැමිණෙනවා", "He showed up an hour late."),
  X("🔚", "end up", "to finally be in a place or situation", "අවසානයේ සිදුවෙනවා", "We got lost and ended up in the next town."),
  X("🕵️", "find out", "to discover information", "සොයා ගන්නවා", "I found out the truth yesterday."),
  X("🚶", "carry on", "to continue", "දිගටම කරගෙන යනවා", "Carry on, you're doing great."),
  X("📈", "catch up (with)", "to reach the same level; to talk about news", "අල්ලා ගන්නවා / තොරතුරු කතා කරනවා", "Let's catch up over coffee."),
];

/* ---------------- 😎 Slang & informal ---------------- */
export const SLANG: Expr[] = [
  X("👍", "cool", "good, fine, great", "හොඳයි / නියමයි", "“Can we meet at six?” “Cool.”", "Everywhere"),
  X("🤙", "no worries", "it's okay; you're welcome", "කමක් නැහැ", "“Sorry I'm late.” “No worries!”", "UK / Australia"),
  X("😮", "no way!", "I can't believe it!", "විශ්වාස කරන්න බැහැ!", "“I won the lottery.” “No way!”", "Everywhere"),
  X("🫡", "gotcha", "I understand (got you)", "තේරුණා", "“Turn left at the bank.” “Gotcha.”", "US"),
  X("☕", "cuppa", "a cup of tea", "තේ කෝප්පයක්", "Fancy a cuppa?", "UK"),
  X("🍻", "cheers", "thanks; also said when drinking together", "ස්තූතියි / සුබ පැතුම්", "Cheers for your help!", "UK"),
  X("👬", "mate", "friend", "යාළුවා", "Alright, mate?", "UK / Australia"),
  X("🧑‍🤝‍🧑", "buddy", "friend", "යාළුවා", "Thanks, buddy!", "US"),
  X("😴", "knackered", "very tired", "දැඩි ලෙස මහන්සියි", "I'm knackered after that run.", "UK"),
  X("🤩", "awesome", "very good, amazing", "විශිෂ්ටයි", "The concert was awesome!", "US"),
  X("💯", "for real", "really? / seriously", "ඇත්තටම?", "You're moving to Canada? For real?", "US"),
  X("🙄", "whatever", "I don't care (can be rude)", "මට වැඩක් නැහැ (අකාරුණික විය හැක)", "“You're wrong.” “Whatever.”", "Everywhere"),
  X("🤑", "quid", "pound (money)", "පවුම", "It cost me twenty quid.", "UK"),
  X("💵", "bucks", "dollars", "ඩොලර්", "It's only five bucks.", "US / Australia"),
  X("🍽️", "grab a bite", "get something quick to eat", "ඉක්මනින් මොනවා හරි කන්න", "Let's grab a bite before the movie.", "Everywhere"),
  X("🏃", "I'm off", "I'm leaving now", "මම යනවා", "Right, I'm off. See you tomorrow!", "UK"),
  X("😅", "my bad", "my mistake, sorry", "මගේ වැරැද්ද", "Oops, my bad. I'll fix it.", "US"),
  X("🔥", "lit", "exciting, amazing (young people)", "නියමයි (තරුණ භාෂාව)", "The party was lit!", "US"),
  X("🤷", "dunno", "I don't know", "මම දන්නේ නැහැ", "“Where's Sam?” “Dunno.”", "Everywhere"),
  X("👋", "catch you later", "see you later", "පස්සේ හමුවෙමු", "I've got to go. Catch you later!", "Everywhere"),
];

/* ---------------- 🧲 Collocations (words that go together) ---------------- */
export const COLLOCATIONS: Expr[] = [
  X("🛠️", "make a mistake", "do something wrong (not “do a mistake”)", "වැරැද්දක් කරනවා", "Everyone makes mistakes.", "make"),
  X("📞", "make a phone call", "call someone", "දුරකථන ඇමතුමක් ගන්නවා", "I need to make a quick phone call.", "make"),
  X("🗓️", "make a decision", "decide", "තීරණයක් ගන්නවා", "We have to make a decision today.", "make"),
  X("💵", "make money", "earn money", "මුදල් උපයනවා", "He makes money selling fruit.", "make"),
  X("📚", "do homework", "finish school work at home (not “make homework”)", "ගෙදර වැඩ කරනවා", "Have you done your homework?", "do"),
  X("🧺", "do the shopping", "buy food and things for the home", "සාප්පු සවාරි යනවා", "I do the shopping on Saturdays.", "do"),
  X("🙏", "do someone a favour", "help someone", "කෙනෙකුට උදව්වක් කරනවා", "Could you do me a favour?", "do"),
  X("🏋️", "do exercise", "be physically active", "ව්‍යායාම කරනවා", "I do exercise three times a week.", "do"),
  X("📸", "take a photo", "photograph something", "ඡායාරූපයක් ගන්නවා", "Can you take a photo of us?", "take"),
  X("🚿", "take a shower", "wash your body (US); UK also: have a shower", "නාගන්නවා", "I take a shower every morning.", "take"),
  X("⏸️", "take a break", "rest for a short time", "විවේකයක් ගන්නවා", "Let's take a ten-minute break.", "take"),
  X("💪", "take a risk", "do something that might not succeed", "අවදානමක් ගන්නවා", "Sometimes you have to take a risk.", "take"),
  X("☀️", "have a good time", "enjoy yourself", "විනෝද වෙනවා", "Have a good time at the party!", "have"),
  X("🍳", "have breakfast", "eat breakfast (not “eat a breakfast”)", "උදේ කෑම කනවා", "We had breakfast at the hotel.", "have"),
  X("🌧️", "heavy rain", "a lot of rain (not “strong rain”)", "දැඩි වැස්ස", "Heavy rain caused flooding.", "adjective + noun"),
  X("☕", "strong coffee", "coffee with a lot of flavour (not “heavy coffee”)", "සැර කෝපි", "I need a strong coffee.", "adjective + noun"),
  X("🚦", "heavy traffic", "a lot of cars (not “big traffic”)", "දැඩි රථවාහන තදබදය", "There's heavy traffic on Galle Road.", "adjective + noun"),
  X("🗣️", "pay attention", "listen or watch carefully", "අවධානය යොමු කරනවා", "Please pay attention to the instructions.", "verb + noun"),
];

/* ---------------- 🎩 Formal vs informal ---------------- */
export const REGISTER: { informal: string; formal: string; si: string }[] = [
  { informal: "Hi! What's up?", formal: "Good morning. How are you?", si: "ආයුබෝවන් / කොහොමද?" },
  { informal: "Can you…?", formal: "Would you mind…? / Could you possibly…?", si: "කරුණාකර…?" },
  { informal: "I want…", formal: "I would like…", si: "මට … අවශ්‍යයි" },
  { informal: "Thanks a lot!", formal: "Thank you very much. I really appreciate it.", si: "බොහොම ස්තූතියි" },
  { informal: "Sorry!", formal: "I do apologise for any inconvenience.", si: "සමාවන්න" },
  { informal: "Get back to me.", formal: "I look forward to hearing from you.", si: "ඔබගේ පිළිතුර බලාපොරොත්තු වෙමි" },
  { informal: "Tell me about…", formal: "Could you give me some information about…?", si: "… ගැන තොරතුරු දිය හැකිද?" },
  { informal: "I think you're wrong.", formal: "I'm afraid I see it differently.", si: "මම වෙනස් ලෙස සිතනවා" },
  { informal: "Bye! See ya!", formal: "Goodbye. Have a pleasant day.", si: "ගිහින් එන්නම් / සුබ දවසක්" },
  { informal: "Got it.", formal: "Understood. Thank you for clarifying.", si: "තේරුණා" },
  { informal: "Wanna grab lunch?", formal: "Would you like to join me for lunch?", si: "දවල් කෑමට එකතු වෙන්න කැමතිද?" },
  { informal: "No problem.", formal: "You're most welcome. It was my pleasure.", si: "කමක් නැහැ / සතුටක්" },
];

/* ---------------- 🗣️ How natives really speak (connected speech) ---------------- */
export const CONNECTED: { written: string; spoken: string; example: string; tip: string }[] = [
  { written: "going to", spoken: "gonna", example: "I'm going to call her later.", tip: "In fast speech, “going to” (future) sounds like “gonna”. Write “going to”." },
  { written: "want to", spoken: "wanna", example: "Do you want to come with us?", tip: "“Want to” becomes “wanna” in casual speech." },
  { written: "have got to", spoken: "gotta", example: "I've got to go now.", tip: "“Got to” sounds like “gotta”." },
  { written: "do you", spoken: "d'ya / dʒə", example: "Do you know what I mean?", tip: "“Do you” often sounds like “d'ya” or “dʒə”." },
  { written: "did you", spoken: "didja", example: "Did you see the match last night?", tip: "The d + y join together to make a “j” sound: “didja”." },
  { written: "what are you", spoken: "whatcha / wotcha", example: "What are you doing this weekend?", tip: "“What are you” → “whatcha”." },
  { written: "let me", spoken: "lemme", example: "Let me help you with that.", tip: "“Let me” → “lemme”." },
  { written: "give me", spoken: "gimme", example: "Give me a second, please.", tip: "“Give me” → “gimme”." },
  { written: "don't know", spoken: "dunno", example: "I don't know where he is.", tip: "“I don't know” → “I dunno”." },
  { written: "kind of", spoken: "kinda", example: "I'm kind of tired today.", tip: "“Kind of” → “kinda”." },
  { written: "a lot of", spoken: "a lotta", example: "There are a lot of people here.", tip: "“A lot of” → “a lotta”." },
  { written: "an apple (linking)", spoken: "a-napple", example: "I'd like an apple and an orange.", tip: "A consonant at the end of a word joins the vowel of the next word: “a-napple, a-norange”." },
  { written: "turn it off (linking)", spoken: "tur-ni-toff", example: "Can you turn it off, please?", tip: "Words flow together: “tur-ni-toff”." },
  { written: "next day (dropped t)", spoken: "nex day", example: "We left the next day.", tip: "The “t” between two consonants often disappears." },
  { written: "water (US flap t)", spoken: "wadder", example: "Can I have some water?", tip: "In American English, “t” between vowels sounds like a soft “d”." },
  { written: "I would have", spoken: "I'd've / I'da", example: "I would have helped if you'd asked.", tip: "“Would have” → “would've” (never write “would of”)." },
];

/* ---------------- 🎬 Native conversations ---------------- */
export type NativeConvo = {
  id: string;
  n: number;
  title: string;
  emoji: string;
  setting: string;
  photo: string;
  learnerRole: string;
  lines: Line[];
  /** Expressions used in the conversation, explained. */
  expressions: { en: string; meaning: string; si: string }[];
  robot: string;
  opener: string;
};

const L = (speaker: string, text: string): Line => ({ speaker, text });

export const NATIVE_CONVOS: NativeConvo[] = [
  {
    id: "catching-up", n: 1, title: "Catching Up with an Old Friend", emoji: "☕", setting: "A café in London", photo: "friends coffee",
    learnerRole: "Sam",
    lines: [
      L("Jess", "Oh my gosh, Sam! Long time no see! How've you been?"),
      L("Sam", "Jess! I've been good, thanks, been flat out with work, to be honest. You?"),
      L("Jess", "Same old, same old. Actually, I've just started a new job, so I'm still learning the ropes."),
      L("Sam", "No way! Good on you. What's it like?"),
      L("Jess", "Bit of a rollercoaster, but the team's lovely. Anyway, we should grab a bite sometime."),
      L("Sam", "Definitely. Let's not leave it so long next time. I'll drop you a message."),
    ],
    expressions: [
      { en: "Long time no see", meaning: "I haven't seen you for a long time", si: "ගොඩක් කාලෙකින් දැක්කේ" },
      { en: "flat out", meaning: "extremely busy", si: "ඉතා කාර්යබහුල" },
      { en: "same old, same old", meaning: "nothing has changed", si: "කිසිම වෙනසක් නැහැ" },
      { en: "learning the ropes", meaning: "learning how to do a new job", si: "අලුත් රැකියාවේ වැඩ ඉගෙන ගන්නවා" },
      { en: "Good on you", meaning: "well done (UK / Australia)", si: "හොඳයි, ශාබාශ්" },
      { en: "drop you a message", meaning: "send you a short message", si: "කෙටි පණිවිඩයක් එවන්නම්" },
    ],
    robot: "an old friend from London who speaks fast, natural British English with idioms",
    opener: "Oh wow, long time no see! How've you been? Still flat out with work?",
  },
  {
    id: "office-banter", n: 2, title: "Office Small Talk", emoji: "💼", setting: "Monday morning at the office", photo: "office coworkers talking",
    learnerRole: "Priya",
    lines: [
      L("Tom", "Morning! Good weekend?"),
      L("Priya", "Not bad, cheers. I didn't do much, just chilled out. How about you?"),
      L("Tom", "Went hiking. I'm absolutely knackered now. Mondays, eh?"),
      L("Priya", "Tell me about it. Oh, by the way, the client meeting's been pushed back to Thursday."),
      L("Tom", "Brilliant, that buys us some time. Shall we touch base after lunch?"),
      L("Priya", "Sounds like a plan. I'll book a room."),
    ],
    expressions: [
      { en: "chilled out", meaning: "relaxed", si: "විවේකීව ගත කළා" },
      { en: "knackered", meaning: "very tired (UK)", si: "ඉතා මහන්සියි" },
      { en: "Tell me about it", meaning: "I completely agree (often about something bad)", si: "හරියටම, මටත් එහෙමයි" },
      { en: "pushed back", meaning: "moved to a later time", si: "කල් දැම්මා" },
      { en: "buys us some time", meaning: "gives us more time", si: "අපට තව කාලයක් ලැබෙනවා" },
      { en: "touch base", meaning: "talk briefly to check progress", si: "කෙටියෙන් කතා කර තත්වය බලනවා" },
    ],
    robot: "a friendly British office colleague who uses natural workplace English",
    opener: "Morning! Good weekend? Did you get up to anything fun?",
  },
  {
    id: "restaurant-complaint", n: 3, title: "Complaining Politely", emoji: "🍽️", setting: "A busy restaurant", photo: "restaurant waiter customer",
    learnerRole: "Customer",
    lines: [
      L("Waiter", "Is everything all right with your meal?"),
      L("Customer", "I'm sorry to be a pain, but my steak's a bit overdone. I did ask for medium rare."),
      L("Waiter", "Oh, I do apologise. I'll get that sorted for you straight away."),
      L("Customer", "Thanks, I appreciate it. No rush."),
      L("Waiter", "And to make up for it, dessert's on the house."),
      L("Customer", "Oh, that's very kind of you. You didn't have to do that!"),
    ],
    expressions: [
      { en: "sorry to be a pain", meaning: "a polite way to start a complaint", si: "කරදරයක් කරනවාට සමාවන්න" },
      { en: "overdone", meaning: "cooked too much", si: "අධිකව පිසූ" },
      { en: "get that sorted", meaning: "fix the problem", si: "එය විසඳා දෙනවා" },
      { en: "No rush", meaning: "take your time", si: "ඉක්මන් වෙන්න එපා" },
      { en: "make up for it", meaning: "do something good because of a mistake", si: "වැරැද්දට වන්දියක් ලෙස" },
      { en: "on the house", meaning: "free, paid by the restaurant", si: "නොමිලේ" },
    ],
    robot: "a polite restaurant waiter in the UK handling a guest's complaint",
    opener: "Hi there! Is everything all right with your meal this evening?",
  },
  {
    id: "cricket-pub", n: 4, title: "Talking Cricket at the Pub", emoji: "🏏", setting: "Watching a match with friends", photo: "friends watching cricket",
    learnerRole: "Dilan",
    lines: [
      L("Mark", "Did you catch the game last night? What a nail-biter!"),
      L("Dilan", "I know! When they needed twelve off the last over, I couldn't watch."),
      L("Mark", "That last six was out of this world. The kid's got nerves of steel."),
      L("Dilan", "Totally. Mind you, the bowling was all over the place at the death."),
      L("Mark", "Fair point. Still, a win's a win. Fancy watching the final here on Sunday?"),
      L("Dilan", "Count me in! First round's on me."),
    ],
    expressions: [
      { en: "catch the game", meaning: "watch the match", si: "තරගය බැලුවාද" },
      { en: "a nail-biter", meaning: "a very exciting, tense game", si: "ඉතා ආතතිමත් තරගයක්" },
      { en: "out of this world", meaning: "amazing", si: "විශිෂ්ටයි" },
      { en: "nerves of steel", meaning: "very calm under pressure", si: "පීඩනය යටතේ ඉතා සන්සුන්" },
      { en: "all over the place", meaning: "not controlled, messy", si: "අවුල් සහගතයි" },
      { en: "Count me in", meaning: "I want to join", si: "මාත් එකතු වෙනවා" },
    ],
    robot: "a cricket-loving friend at the pub who speaks natural, informal English",
    opener: "Mate, did you catch the game last night? What a nail-biter!",
  },
  {
    id: "flatmates", n: 5, title: "Sorting Things Out with a Flatmate", emoji: "🏠", setting: "A shared flat", photo: "roommates talking kitchen",
    learnerRole: "Anu",
    lines: [
      L("Chris", "Hey, have you got a sec? There's something I wanted to run by you."),
      L("Anu", "Sure, what's up?"),
      L("Chris", "It's about the dishes. They've been piling up a bit lately."),
      L("Anu", "Ah, fair enough. I've been snowed under with exams, but that's no excuse."),
      L("Chris", "No worries. How about we take turns? You do weekdays, I'll do weekends?"),
      L("Anu", "Deal. Sorry about that. I'll pull my weight from now on."),
    ],
    expressions: [
      { en: "got a sec?", meaning: "do you have a moment?", si: "තත්පරයක් තියෙනවාද?" },
      { en: "run something by you", meaning: "tell you an idea to get your opinion", si: "ඔබේ අදහස අහන්න" },
      { en: "piling up", meaning: "increasing, getting more and more", si: "ගොඩගැසෙනවා" },
      { en: "snowed under", meaning: "having too much work", si: "වැඩ ගොඩකින් පිරිලා" },
      { en: "take turns", meaning: "do something one after the other", si: "මාරුවෙන් මාරුවට කරනවා" },
      { en: "pull my weight", meaning: "do my fair share of work", si: "මගේ කොටස හරියට කරනවා" },
    ],
    robot: "a friendly flatmate who solves house problems in natural English",
    opener: "Hey, have you got a sec? There's something I wanted to run by you.",
  },
  {
    id: "job-negotiation", n: 6, title: "Negotiating a Job Offer", emoji: "🤝", setting: "A phone call with HR", photo: "business handshake office",
    learnerRole: "Candidate",
    lines: [
      L("Manager", "So, we'd love to have you on board. How does the offer sound?"),
      L("Candidate", "Thank you, I'm thrilled. I was hoping, though, that there might be some flexibility on the salary."),
      L("Manager", "I see. What did you have in mind?"),
      L("Candidate", "Given my experience, something in the region of ten percent higher would be more in line with the market."),
      L("Manager", "Let me run that past my director and get back to you by Friday."),
      L("Candidate", "That would be great. I really appreciate you going the extra mile."),
    ],
    expressions: [
      { en: "have you on board", meaning: "have you join the team", si: "ඔබව කණ්ඩායමට එක් කර ගැනීම" },
      { en: "some flexibility", meaning: "a possibility to change", si: "වෙනස් කිරීමට ඉඩක්" },
      { en: "in the region of", meaning: "approximately", si: "ආසන්න වශයෙන්" },
      { en: "in line with", meaning: "similar to, matching", si: "අනුකූලව" },
      { en: "run that past", meaning: "ask someone for their opinion or approval", si: "අනුමැතිය අහන්න" },
      { en: "go the extra mile", meaning: "make a special effort", si: "අමතර උත්සාහයක් ගන්නවා" },
    ],
    robot: "a hiring manager negotiating a job offer with a candidate, professional and natural",
    opener: "So, we'd love to have you on board. How does the offer sound to you?",
  },
  {
    id: "travel-mishap", n: 7, title: "A Travel Mishap", emoji: "✈️", setting: "Missed connection at the airport", photo: "airport departure board",
    learnerRole: "Traveller",
    lines: [
      L("Traveller", "Hi, I'm in a bit of a bind. My flight was delayed and I've missed my connection to Sydney."),
      L("Agent", "Oh no, that's rotten luck. Let me see what I can do. Bear with me a moment."),
      L("Agent", "Right, the next flight's fully booked, I'm afraid, but I can put you on standby."),
      L("Traveller", "And if that falls through?"),
      L("Agent", "Then you're guaranteed a seat on the morning flight, and the hotel's on us."),
      L("Traveller", "That's a weight off my mind. Thanks for bending over backwards for me."),
    ],
    expressions: [
      { en: "in a bit of a bind", meaning: "in a difficult situation", si: "අපහසු තත්වයක" },
      { en: "rotten luck", meaning: "very bad luck", si: "ඉතා අවාසනාවයි" },
      { en: "Bear with me", meaning: "please be patient for a moment", si: "මොහොතක් ඉවසන්න" },
      { en: "fall through", meaning: "fail, not happen", si: "අසාර්ථක වෙනවා" },
      { en: "a weight off my mind", meaning: "a big relief", si: "සිතට ලොකු සහනයක්" },
      { en: "bend over backwards", meaning: "try very hard to help", si: "උදව් කිරීමට ඉතා උත්සාහ කරනවා" },
    ],
    robot: "a helpful airline agent who speaks natural, idiomatic English",
    opener: "Hi there, you look a bit stressed. What seems to be the problem?",
  },
  {
    id: "giving-opinions", n: 8, title: "Debating an Idea", emoji: "💭", setting: "A university discussion group", photo: "students discussion group",
    learnerRole: "Nimal",
    lines: [
      L("Sara", "Personally, I reckon working from home is here to stay."),
      L("Nimal", "I see where you're coming from, but I'm not entirely convinced."),
      L("Sara", "Go on, what's your take on it?"),
      L("Nimal", "Well, on the one hand it saves time; on the other hand, you miss out on the team spirit."),
      L("Sara", "That's a fair point. Maybe a mix of both is the way forward."),
      L("Nimal", "Exactly. I think we're on the same page after all."),
    ],
    expressions: [
      { en: "I reckon", meaning: "I think (informal)", si: "මම හිතන්නේ" },
      { en: "here to stay", meaning: "permanent, not going to disappear", si: "ස්ථිරවම පවතිනවා" },
      { en: "I see where you're coming from", meaning: "I understand your opinion", si: "ඔබේ අදහස මට තේරෙනවා" },
      { en: "what's your take on it?", meaning: "what's your opinion?", si: "ඔබේ අදහස මොකක්ද?" },
      { en: "on the one hand… on the other hand", meaning: "showing two sides of an argument", si: "එක් අතකින්… අනෙක් අතින්" },
      { en: "the way forward", meaning: "the best plan for the future", si: "ඉදිරියට යා යුතු මාර්ගය" },
    ],
    robot: "a university student who debates ideas politely using advanced, natural English",
    opener: "Here's a question for you: do you reckon working from home is here to stay?",
  },
];

export const FREE_NATIVE = 8; // first 8 items of each list (and conversation 1) are free
