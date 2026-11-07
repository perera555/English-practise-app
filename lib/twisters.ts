import { MORE_ITEMS, NEW_GROUPS } from "./twistersMore";

export type TwisterGroup = { id: string; sound: string; emoji: string; tip: string; items: string[] };

export const twisterGroups: TwisterGroup[] = [
  {
    id: "s-sh",
    sound: "S & SH",
    emoji: "🐍",
    tip: "S: teeth close, air hisses. SH: round your lips and push air softly, like 'shhh'.",
    items: [
      "She sells sea shells by the sea shore.",
      "Six slippery snails slid slowly seaward.",
      "Sixty six sick chicks.",
      "Sure the ship's shipshape, sir.",
      "Silly Sally swiftly shooed seven silly sheep.",
      "Shy Shelly says she shall sew sheets.",
      "Selfish shellfish.",
      "Sam's shop stocks short spotted socks.",
      "Seven slick slimy snakes slowly sliding southward.",
      "Sushi chef Sheila sells sushi in Sheffield.",
    ],
  },
  {
    id: "th",
    sound: "TH",
    emoji: "👅",
    tip: "Put the tip of your tongue between your teeth and blow gently.",
    items: [
      "Three free throws.",
      "Thirty three thirsty thieves thought they thrilled the throne.",
      "The thirty three thieves thought that they thrilled the throne throughout Thursday.",
      "Thin sticks, thick bricks.",
      "I thought a thought, but the thought I thought wasn't the thought I thought I thought.",
      "Thank the other three brothers of their father's mother's brother's side.",
      "Theo threw three thick things.",
      "This thistle seems like that thistle.",
      "Thelma thinks thunder is thrilling.",
      "Thousands of thoughtful thinkers think things through.",
    ],
  },
  {
    id: "r-l",
    sound: "R & L",
    emoji: "🦁",
    tip: "R: tongue does not touch the top of your mouth. L: tongue tip touches behind your top teeth.",
    items: [
      "Red lorry, yellow lorry.",
      "Red leather, yellow leather.",
      "Lesser leather never weathered wetter weather better.",
      "Larry sent the latter a letter later.",
      "Rolling red wagons roll right along.",
      "Really leery, rarely Larry.",
      "Lily ladles little Letty's lentil soup.",
      "Rory's lawn rake rarely rakes really right.",
      "Literally literary.",
      "Round and round the rugged rock the ragged rascal ran.",
    ],
  },
  {
    id: "p-b",
    sound: "P & B",
    emoji: "🫧",
    tip: "Close both lips, then pop them open. P has a puff of air; B uses your voice.",
    items: [
      "Peter Piper picked a peck of pickled peppers.",
      "A proper copper coffee pot.",
      "Betty bought a bit of butter.",
      "Big black bugs bleed blue black blood.",
      "Bake big batches of bitter brown bread.",
      "Black background, brown background.",
      "Pad kid poured curd pulled cod.",
      "Pink pigs play ping pong in the park.",
      "Bob brought the bus back to the busy bus stop.",
      "Purple paper people.",
    ],
  },
  {
    id: "v-w",
    sound: "V & W",
    emoji: "🌊",
    tip: "V: top teeth touch your bottom lip and buzz. W: round your lips like 'oo'.",
    items: [
      "Very well, very well, very well.",
      "Vincent vowed vengeance very vehemently.",
      "Which witch is which?",
      "Whether the weather is warm, whether the weather is hot, we have to put up with the weather, whether we like it or not.",
      "Violet waved very wildly at the van.",
      "We will wear warm woolly vests in winter.",
      "Vera's van was very wet.",
      "Wayne went to Wales to watch walruses.",
      "Victor's vivid velvet vest.",
      "Willy's real rear wheel.",
    ],
  },
  {
    id: "f",
    sound: "F",
    emoji: "🐟",
    tip: "Top teeth on your bottom lip, then blow air out softly.",
    items: [
      "Fresh French fried fish.",
      "Five frantic frogs fled from fifty fierce fishes.",
      "Fred fed Ted bread and Ted fed Fred bread.",
      "Friendly fleas and fireflies.",
      "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.",
      "Four furious friends fought for the phone.",
      "Fat frogs flying past fast.",
      "Flash message.",
      "Fifty fine fresh fish for Fanny.",
      "Freshly fried flying fish.",
    ],
  },
  {
    id: "ch-j",
    sound: "CH & J",
    emoji: "🧀",
    tip: "CH: like a sneeze 'choo'. J: the same shape, but use your voice.",
    items: [
      "Cheap ship trip.",
      "Chester chooses chestnuts, cheddar cheese with chewy chives.",
      "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
      "Jolly juggling jesters jauntily juggled jingling jacks.",
      "Chop shops stock chops.",
      "Jenny's giant jelly jiggles.",
      "Charlie chose cheese and chips for lunch.",
      "Judge Jim just jogged in June.",
      "A cheerful child chewed cherry chocolate.",
      "Jack's jeep jumped the jagged junction.",
    ],
  },
  {
    id: "k-g",
    sound: "K & G",
    emoji: "🦘",
    tip: "The back of your tongue touches the back of your mouth. K is air; G uses your voice.",
    items: [
      "Unique New York.",
      "Kitty caught the kitten in the kitchen.",
      "Green glass globes glow greenly.",
      "Good blood, bad blood.",
      "Can you can a can as a canner can can a can?",
      "Greek grapes, Greek grapes, Greek grapes.",
      "Kind kings keep quiet kittens.",
      "Gig whip, gig whip, gig whip.",
      "Clean clams crammed in clean cans.",
      "Great gray goats graze on green grass.",
    ],
  },
  {
    id: "m-n",
    sound: "M & N",
    emoji: "🐝",
    tip: "M: close your lips and hum. N: tongue behind your top teeth and hum through your nose.",
    items: [
      "Many mumbling mice are making merry music in the moonlight.",
      "Mommy made me mash my M&Ms.",
      "Nine nice night nurses nursing nicely.",
      "Mixed biscuits, mixed biscuits.",
      "Ned Nott was shot and Sam Shott was not.",
      "Mister Moon makes many melons.",
      "No need to light a night light on a light night like tonight.",
      "Mary made marvellous marmalade in May.",
      "Nancy needs nine new notebooks.",
      "Monkeys munch mangoes merrily.",
    ],
  },
  {
    id: "t-d",
    sound: "T & D",
    emoji: "🥁",
    tip: "Tongue tip taps behind your top teeth. T is air; D uses your voice.",
    items: [
      "Toy boat, toy boat, toy boat.",
      "Tie twine to three tree twigs.",
      "Two tiny tigers take two taxis to town.",
      "Double bubble gum bubbles double.",
      "Ted told Tom to take the train to Thailand.",
      "Daddy draws doors.",
      "A tutor who tooted the flute tried to tutor two tooters to toot.",
      "Don't trouble trouble till trouble troubles you.",
      "Tim takes tea at ten to ten.",
      "Dan's dog dug deep down.",
    ],
  },
  {
    id: "mixed",
    sound: "Vowels & mixed",
    emoji: "🎡",
    tip: "Open your mouth wide for long vowels. Go slowly first, then speed up!",
    items: [
      "A big black bear sat on a big black rug.",
      "I scream, you scream, we all scream for ice cream.",
      "Eleven benevolent elephants.",
      "Any noise annoys an oyster, but a noisy noise annoys an oyster more.",
      "Eddie edited it.",
      "Imagine an imaginary menagerie manager imagining managing an imaginary menagerie.",
      "Of all the vids I've ever viewed, I've never viewed a vid as valued as Alex's valued vid.",
      "A loyal warrior will rarely worry why we rule.",
      "Wow, look at all those owls out at the old oak.",
      "Ape cake, grape cake, ape cake, grape cake.",
      "The big bug bit the little beetle, but the little beetle bit the big bug back.",
      "Six thick thistle sticks.",
    ],
  },
];

// Add the 100 extra twisters (skipping any that are already in the list).
{
  const seen = new Set(twisterGroups.flatMap((g) => g.items.map((t) => t.toLowerCase())));
  const fresh = (items: string[]) => items.filter((t) => !seen.has(t.toLowerCase()) && (seen.add(t.toLowerCase()), true));
  for (const g of twisterGroups) g.items.push(...fresh(MORE_ITEMS[g.id] ?? []));
  for (const g of NEW_GROUPS) twisterGroups.push({ ...g, items: fresh(g.items) });
}

export const allTwisters = twisterGroups.flatMap((g) => g.items.map((text) => ({ text, group: g })));

export const TWISTERS_PER_SESSION = 10;
export const TWISTER_SESSIONS = Math.ceil(allTwisters.length / TWISTERS_PER_SESSION);

/** Session n (1-based) mixes sounds: take every k-th twister so each session has variety. */
export function twisterSession(n: number) {
  return allTwisters.filter((_, i) => i % TWISTER_SESSIONS === n - 1);
}
