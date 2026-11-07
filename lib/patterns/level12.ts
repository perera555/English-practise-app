import { P, type Pattern } from "./types";

/* 🌱 Level 1 (Beginner, A1) and 🌿 Level 2 (Elementary, A2) */
export const LEVEL12: Pattern[] = [
  P("be-noun", 1, "I am a student", "Subject + am / is / are + noun", "Use am with I, is with he/she/it, are with you/we/they.", "I සමඟ am, he/she/it සමඟ is, you/we/they සමඟ are භාවිතා කරන්න.", [
    "I [am|is|are] a student.", "She [is|am|are] a doctor.", "They [are|is|am] my friends.", "He [is|are|am] a teacher.", "We [are|is|am] tourists.",
    "You [are|is|am] my best friend.", "It [is|are|am] a big airport.", "My father [is|are|am] a driver.", "My parents [are|is|am] farmers.", "Colombo [is|are|am] a busy city.",
    "I [am|are|is] a new guest.", "The players [are|is|am] champions.", "My sister [is|are|am] a nurse.", "You and I [are|is|am] partners.", "This [is|are|am] my room.",
    "Sam and Lily [are|is|am] students.", "The hotel [is|are|am] a nice place.", "Cricket [is|are|am] a popular sport.", "I [am|is|are] a cricket fan.", "These [are|is|am] my bags.",
  ]),
  P("be-adjective", 1, "She is happy", "Subject + am / is / are + adjective", "Adjectives describe people and things. Put them after am/is/are.", "විශේෂණ පදයට පෙර am/is/are යොදන්න.", [
    "I [am|is|are] tired.", "The room [is|are|am] clean.", "The children [are|is|am] hungry.", "The tea [is|are|am] hot.", "We [are|is|am] ready.",
    "My shoes [are|is|am] wet.", "The test [is|are|am] easy.", "You [are|is|am] very kind.", "The bus [is|are|am] late.", "I [am|are|is] so happy today.",
    "The beds [are|is|am] comfortable.", "The street [is|are|am] quiet.", "Our teacher [is|are|am] friendly.", "The tickets [are|is|am] expensive.", "The weather [is|are|am] sunny.",
    "My hands [are|is|am] cold.", "The food [is|are|am] delicious.", "His car [is|are|am] fast.", "The shops [are|is|am] open.", "She [is|are|am] nervous.",
  ]),
  P("this-that", 1, "This is / These are", "this / that (one) · these / those (many)", "This/these = near you. That/those = far from you.", "ළඟ ඇති දේට this/these, ඈත ඇති දේට that/those.", [
    "[This|These] is my passport.", "[These|This] are my keys.", "[That|Those] is our hotel over there.", "[Those|That] are the mountains.", "Is [this|these] your bag?",
    "Are [these|this] your children?", "[That|Those] man is my uncle.", "[Those|That] birds are beautiful.", "[This|These] coffee is too hot.", "[These|This] shoes are new.",
    "Look at [that|those] plane in the sky!", "Who are [those|that] people?", "[This|These] is my brother, Ravi.", "[These|This] apples are sweet.", "Is [that|those] your car outside?",
    "Can I try [this|these] shirt?", "I like [these|this] songs.", "[Those|That] were great days.", "What is [this|these] word?", "[That|Those] house is very old.",
  ]),
  P("there-is", 1, "There is / There are", "There is + one thing · There are + many things", "Use 'there is/are' to say something exists.", "යමක් තිබෙන බව කීමට there is (එකක්) / there are (කිහිපයක්).", [
    "There [is|are] a bank near here.", "There [are|is] three bedrooms.", "There [is|are] a problem with my room.", "There [are|is] many tourists today.", "There [is|are] some milk in the fridge.",
    "There [are|is] two flights to London.", "[Is|Are] there a pharmacy nearby?", "[Are|Is] there any seats left?", "There [is|are] a taxi outside.", "There [are|is] lots of shops in town.",
    "There [is|are] no hot water.", "There [are|is] five players on the field.", "[Is|Are] there Wi-Fi in the room?", "There [is|are] a cat on the roof.", "There [are|is] some eggs on the table.",
    "There [is|are] a big match tonight.", "There [are|is] people waiting at the gate.", "[Are|Is] there buses to the airport?", "There [is|are] a lot of traffic.", "There [are|is] no towels in the bathroom.",
  ]),
  P("have-has", 1, "I have / She has", "I/you/we/they + have · he/she/it + has", "Has is only for he, she and it.", "he/she/it සමඟ has, අනෙක් සියල්ල සමඟ have.", [
    "I [have|has] a reservation.", "She [has|have] two brothers.", "We [have|has] a big family.", "He [has|have] a new phone.", "They [have|has] a nice house.",
    "My mother [has|have] a car.", "You [have|has] beautiful eyes.", "The hotel [has|have] a pool.", "I [have|has] a headache.", "Our team [has|have] a great captain.",
    "Do you [have|has] a pen?", "Nimal [has|have] a cold.", "We [have|has] English on Monday.", "The room [has|have] a balcony.", "My friends [have|has] tickets.",
    "It [has|have] four wheels.", "Does she [have|has] a passport?", "I [have|has] an idea!", "The city [has|have] many parks.", "They [have|has] breakfast at seven.",
  ]),
  P("present-simple", 1, "She works in a bank", "he/she/it + verb + s/es", "In the present simple, add -s or -es for he/she/it.", "වර්තමාන කාලයේ he/she/it සමඟ ක්‍රියා පදයට -s / -es එකතු කරන්න.", [
    "She [works|work|working] in a bank.", "I [live|lives|living] in Kandy.", "He [plays|play|playing] cricket every Sunday.", "They [speak|speaks|speaking] English.", "My father [drives|drive|driving] a bus.",
    "We [eat|eats|eating] rice every day.", "The shop [opens|open|opening] at nine.", "He [watches|watch|watching] TV at night.", "You [study|studies|studying] hard.", "She [goes|go|going] to school by bus.",
    "The train [leaves|leave|leaving] at ten.", "My cat [sleeps|sleep|sleeping] all day.", "I [drink|drinks|drinking] tea in the morning.", "He [teaches|teach|teaching] English.", "It [rains|rain|raining] a lot in May.",
    "They [work|works|working] at the airport.", "My mother [cooks|cook|cooking] dinner.", "Lisa [loves|love|loving] music.", "We [walk|walks|walking] to work.", "The baby [cries|cry|crying] at night.",
  ]),
  P("do-does", 1, "Do you like tea?", "Do / Does + subject + verb?", "Use does with he/she/it, and then the verb has no -s.", "he/she/it සමඟ ප්‍රශ්න අහන්න does, අනෙක් ඒවාට do.", [
    "[Do|Does] you like tea?", "[Does|Do] she speak English?", "[Do|Does] they live here?", "[Does|Do] the bus stop here?", "[Do|Does] we need a ticket?",
    "[Does|Do] he play football?", "[Do|Does] you have a map?", "[Does|Do] it rain a lot here?", "[Do|Does] your parents work?", "[Does|Do] the hotel have a gym?",
    "Where [do|does] you live?", "What time [does|do] the shop open?", "[Do|Does] I need a visa?", "[Does|Do] your sister drive?", "How [do|does] you say this word?",
    "[Do|Does] the children like school?", "What [does|do] this word mean?", "[Do|Does] you know the way?", "[Does|Do] Nimal like spicy food?", "When [do|does] we leave?",
  ]),
  P("dont-doesnt", 1, "I don't like coffee", "Subject + don't / doesn't + verb", "Doesn't is for he/she/it. After don't/doesn't, use the basic verb.", "he/she/it සමඟ doesn't, අනෙක් ඒවාට don't.", [
    "I [don't|doesn't] like coffee.", "She [doesn't|don't] eat meat.", "We [don't|doesn't] have a car.", "He [doesn't|don't] work on Sunday.", "They [don't|doesn't] speak French.",
    "The lift [doesn't|don't] work.", "You [don't|doesn't] need a coat.", "My brother [doesn't|don't] play cricket.", "I [don't|doesn't] understand.", "It [doesn't|don't] matter.",
    "We [don't|doesn't] watch TV.", "The shop [doesn't|don't] open on Monday.", "My parents [don't|doesn't] live here.", "She [doesn't|don't] drink tea.", "I [don't|doesn't] know his name.",
    "The bus [doesn't|don't] go to the airport.", "They [don't|doesn't] like spicy food.", "He [doesn't|don't] have a passport.", "You [don't|doesn't] have to pay.", "My phone [doesn't|don't] charge.",
  ]),
  P("can-cant", 1, "I can swim", "Subject + can / can't + verb", "Can is the same for everyone. Never add -s or 'to' after can.", "හැකියාව කීමට can, නොහැකියාව කීමට can't.", [
    "I [can|cans|can to] swim.", "She [can|cans|can to] speak three languages.", "[Can|Cans] you help me?", "We [can't|don't can] find our hotel.", "He [can|cans] play the guitar.",
    "[Can|Do] I pay by card?", "They [can't|doesn't can] come today.", "You [can|cans] sit here.", "I [can't|not can] hear you.", "[Can|Are] you speak more slowly?",
    "My grandmother [can|cans] use a phone.", "We [can|can to] take a taxi.", "She [can't|cannot to] drive.", "[Can|Does] I have the bill, please?", "The baby [can|cans] walk now.",
    "I [can|can to] see the sea from my room.", "He [can't|don't can] come to the party.", "[Can|Is] you close the door, please?", "You [can't|not can] smoke here.", "We [can|cans] meet tomorrow.",
  ]),
  P("articles", 1, "a / an / the", "a + consonant sound · an + vowel sound · the = a specific one", "Use 'an' before a vowel SOUND: an apple, an hour.", "ස්වර ශබ්දයකට පෙර an, අනෙක් ඒවාට a, විශේෂිත දෙයකට the.", [
    "I have [a|an] brother.", "She is [an|a] engineer.", "It's [an|a] hour from here.", "Can I have [an|a] apple?", "He is [a|an] good player.",
    "[The|A] sun is very hot today.", "I need [an|a] umbrella.", "We stayed in [a|an] small hotel.", "Close [the|a] door, please.", "It's [an|a] easy question.",
    "She bought [a|an] new dress.", "[The|A] airport is far from the city.", "He's [an|a] honest man.", "I saw [a|an] elephant!", "Where is [the|a] toilet, please?",
    "This is [a|an] university.", "Let's take [a|an] taxi.", "[The|An] moon is bright tonight.", "She has [an|a] interview today.", "It was [a|an] amazing match.",
  ]),
  P("prepositions-place", 1, "in / on / at (places)", "in (inside) · on (surface) · at (a point/place)", "In a room, on the table, at the bus stop.", "ඇතුළත in, මතුපිට on, නිශ්චිත ස්ථානයක at.", [
    "The keys are [on|in|at] the table.", "She is [in|on|at] the kitchen.", "Wait for me [at|in|on] the bus stop.", "My hotel is [in|on|at] Colombo.", "There's a picture [on|in|at] the wall.",
    "He works [at|on|in] the airport.", "The milk is [in|on|at] the fridge.", "We met [at|on|in] the station.", "The book is [on|in|at] the shelf.", "I live [in|on|at] Sri Lanka.",
    "She is sitting [on|in|at] the chair.", "Meet me [at|on|in] the gate.", "The children are [in|on|at] the garden.", "There's a fly [on|in|at] your shirt.", "I'm [at|on|in] home now.",
    "The players are [on|in|at] the field.", "My passport is [in|on|at] my bag.", "Turn left [at|on|in] the traffic lights.", "The cat is [on|in|at] the roof.", "We had lunch [at|on|in] a café.",
  ]),
  P("possessives", 1, "my / your / his / her", "my · your · his · her · its · our · their", "Possessive words show who owns something.", "අයිතිය පෙන්වීමට my, your, his, her, our, their.", [
    "This is [my|me|I] passport.", "Is this [your|you|yours] bag?", "He lost [his|her|him] keys.", "She loves [her|his|she] job.", "We sold [our|us|we] car.",
    "They visited [their|there|them] parents.", "The dog wagged [its|it's|it] tail.", "I called [my|me|mine] mother.", "Nimal and [his|her|him] wife are here.", "Mary and [her|his|she] brother are teachers.",
    "Where is [your|you|yours] hotel?", "Our team won [our|us|ours] match.", "The children did [their|there|they] homework.", "I forgot [my|me|mine] ticket.", "Is that [her|she|hers] car?",
    "We love [our|us|we] new house.", "The hotel has [its|it's|it] own beach.", "What's [your|you|yours] name?", "They brought [their|they're|them] bags.", "He washed [his|him|he] car.",
  ]),
  P("present-continuous", 2, "I am working now", "am / is / are + verb-ing", "Use it for actions happening now.", "දැන් සිදුවන දේ: am/is/are + -ing.", [
    "I [am working|work|working] now.", "She [is talking|talks|talking] on the phone.", "They [are playing|play|playing] cricket.", "It [is raining|rains|raining] outside.", "We [are waiting|wait|waiting] for the bus.",
    "Look! The baby [is sleeping|sleeps|sleeping].", "He [is cooking|cooks|cooking] dinner now.", "What [are you doing|do you do|you doing]?", "I [am reading|read|reading] a great book.", "They [are watching|watch|watching] the match.",
    "The plane [is landing|lands|landing] now.", "Why [are you laughing|do you laugh|you laughing]?", "She [is wearing|wears|wearing] a red dress today.", "We [are staying|stay|staying] at a hotel this week.", "Listen! Someone [is singing|sings|singing].",
    "The children [are swimming|swim|swimming] in the pool.", "I [am not feeling|don't feel|not feeling] well today.", "[Is he coming|Does he come|He coming] to the party?", "My phone [is ringing|rings|ringing].", "You [are doing|do|doing] very well!",
  ]),
  P("past-regular", 2, "I visited my grandmother", "verb + -ed (regular past)", "Regular verbs add -ed in the past: work → worked.", "සාමාන්‍ය ක්‍රියා පදවලට අතීතයට -ed එකතු කරන්න.", [
    "I [visited|visit|visiting] my grandmother yesterday.", "We [watched|watch|watching] a film last night.", "She [called|call|calls] me this morning.", "They [played|play|plays] football yesterday.", "He [cleaned|clean|cleans] his room.",
    "The flight [arrived|arrive|arrives] late.", "I [booked|book|books] a table last week.", "We [walked|walk|walks] to the beach.", "She [cooked|cook|cooks] rice and curry.", "The match [started|start|starts] at two.",
    "I [studied|study|studys] English last year.", "They [stayed|stay|stays] in a hotel.", "He [opened|open|opens] the door.", "We [enjoyed|enjoy|enjoys] the party.", "The shop [closed|close|closes] early yesterday.",
    "She [helped|help|helps] me with my bags.", "I [lived|live|lives] in Kandy in 2020.", "They [waited|wait|waits] for an hour.", "He [answered|answer|answers] all the questions.", "We [travelled|travel|travels] to India last year.",
  ]),
  P("past-irregular", 2, "I went to Kandy", "irregular past: go → went, eat → ate…", "Many common verbs are irregular. Learn them by heart.", "අක්‍රමවත් ක්‍රියා පද (go→went) මතකයෙන් ඉගෙන ගන්න.", [
    "I [went|goed|go] to Kandy last week.", "She [ate|eated|eat] all the cake.", "We [saw|seed|see] a great film.", "He [bought|buyed|buy] a new phone.", "They [came|comed|come] home late.",
    "I [had|haved|have] a good time.", "She [took|taked|take] a photo.", "We [made|maked|make] a cake.", "He [gave|gived|give] me a present.", "I [found|finded|find] my keys.",
    "They [won|winned|win] the match.", "She [wrote|writed|write] a letter.", "I [slept|sleeped|sleep] for ten hours.", "We [met|meeted|meet] at the airport.", "He [spoke|speaked|speak] to the manager.",
    "The plane [flew|flied|fly] over the sea.", "I [lost|losed|lose] my wallet.", "She [drank|drinked|drink] a cup of tea.", "We [left|leaved|leave] at six.", "He [told|telled|tell] me a story.",
  ]),
  P("was-were", 2, "I was tired", "I/he/she/it + was · you/we/they + were", "The past of am/is = was. The past of are = were.", "am/is හි අතීතය was, are හි අතීතය were.", [
    "I [was|were] tired yesterday.", "They [were|was] at the beach.", "The film [was|were] great.", "We [were|was] late for the meeting.", "She [was|were] very happy.",
    "The rooms [were|was] clean.", "[Was|Were] the flight on time?", "[Were|Was] you at home last night?", "He [wasn't|weren't] at school.", "The tickets [weren't|wasn't] cheap.",
    "It [was|were] a beautiful day.", "My parents [were|was] in London.", "The food [was|were] delicious.", "You [were|was] right!", "I [wasn't|weren't] hungry.",
    "There [was|were] a problem.", "There [were|was] many people there.", "The questions [were|was] easy.", "[Was|Were] the hotel nice?", "We [weren't|wasn't] ready.",
  ]),
  P("did-didnt", 2, "Did you see it?", "Did + subject + verb? · didn't + verb", "After did/didn't, use the basic verb (no -ed).", "did / didn't සමඟ ක්‍රියා පදයේ මූල රූපය.", [
    "[Did|Do] you see the match last night?", "I [didn't see|didn't saw|not saw] him.", "[Did|Was] she call you?", "We [didn't go|didn't went|not went] out.", "Did they [win|won|wins] the game?",
    "He [didn't eat|didn't ate|not ate] breakfast.", "Where [did|do] you go yesterday?", "Did you [enjoy|enjoyed|enjoys] the trip?", "I [didn't have|didn't had|not had] time.", "What [did|was] you do last weekend?",
    "She [didn't come|didn't came|not came] to class.", "Did he [find|found|finds] his keys?", "We [didn't know|didn't knew|not knew] the way.", "[Did|Were] you sleep well?", "They [didn't like|didn't liked|not liked] the food.",
    "Why [did|do] you leave early?", "Did the bus [arrive|arrived|arrives] on time?", "I [didn't understand|didn't understood|not understood] the question.", "When [did|was] you arrive?", "Did she [buy|bought|buys] the tickets?",
  ]),
  P("going-to", 2, "I'm going to travel", "am / is / are + going to + verb", "Use 'going to' for plans you have already made.", "කලින් සැලසුම් කළ දේට going to.", [
    "I [am going to|going to|will to] visit London next year.", "She [is going to|are going to|going] study medicine.", "We [are going to|is going to|going] have a party.", "They [are going to|is going|go to] buy a house.", "It [is going to|are going to|going] rain.",
    "He [is going to|going to|is go to] learn English.", "What [are you going to|you going to|do you going to] do?", "I [am not going to|not going to|don't going to] eat meat.", "[Are you going to|Do you going to|You going to] come?", "We [are going to|going|are go] fly on Monday.",
    "My sister [is going to|are going to|going to] get married.", "Look at the sky! It [is going to|going to|will going to] storm.", "They [are going to|is going to|going to be] open a shop.", "I [am going to|am go to|going] call her tonight.", "He [isn't going to|not going to|doesn't going to] come.",
    "The team [is going to|are going|going] train hard.", "We [are going to|are going|going] watch the final.", "[Is she going to|Does she going to|She going to] drive?", "I [am going to|will going to|going] cook tonight.", "They [aren't going to|not going to|don't going to] wait.",
  ]),
  P("will-future", 2, "I'll help you", "will + verb", "Use will for quick decisions, promises and predictions.", "එවෙලේම ගන්නා තීරණ, පොරොන්දු හා අනාවැකි සඳහා will.", [
    "I [will|am|going] help you.", "It's cold. I ['ll close|close|closing] the window.", "She [will|wills|is will] be here soon.", "I think it [will|is|going] be sunny.", "I promise I [will|am|do] call you.",
    "They [won't|don't will|willn't] be late.", "[Will|Do] you marry me?", "Don't worry, I [will|do|am] carry that.", "We [will|are will|wills] see.", "He [will|is going|wills] probably win.",
    "I ['ll have|have|having] the chicken, please.", "[Will|Are] you help me with this?", "The shop [will|is will|wills] open at ten tomorrow.", "I'm tired. I think I ['ll go|go|going] to bed.", "You [will|are|wills] love this film.",
    "She [won't|doesn't will|not will] tell anyone.", "One day, I [will|am|do] visit Japan.", "The phone is ringing. I ['ll answer|answer|answering] it.", "Prices [will|are will|wills] go up.", "[Will|Does] it be expensive?",
  ]),
  P("comparatives", 2, "bigger / more beautiful", "short adj + -er than · more + long adj + than", "One syllable: -er. Two or more syllables: more ___.", "කෙටි විශේෂණවලට -er, දිගු ඒවාට more.", [
    "Colombo is [bigger|more big|biggest] than Galle.", "This hotel is [more expensive|expensiver|most expensive] than that one.", "My brother is [taller|more tall|tallest] than me.", "English is [easier|more easy|easiest] than I thought.", "The train is [faster|more fast|fastest] than the bus.",
    "Today is [hotter|more hot|hottest] than yesterday.", "This book is [more interesting|interestinger|most interesting] than the film.", "She is [younger|more young|youngest] than her sister.", "Your room is [better|gooder|more good] than mine.", "My English is [worse|badder|more bad] than yours.",
    "The beach is [more beautiful|beautifuler|most beautiful] in the morning.", "Cricket is [more popular|popularer|most popular] than rugby here.", "This road is [busier|more busy|busiest] than that one.", "Gold is [heavier|more heavy|heaviest] than silver.", "Planes are [safer|more safe|safest] than cars.",
    "This exam was [harder|more hard|hardest] than the last one.", "Kandy is [cooler|more cool|coolest] than Colombo.", "Running is [healthier|more healthy|healthiest] than sitting.", "Your idea is [more creative|creativer|most creative] than mine.", "It's [cheaper|more cheap|cheapest] to go by bus.",
  ]),
  P("superlatives", 2, "the biggest / the most beautiful", "the + adj-est · the most + long adj", "Use superlatives to compare three or more things.", "තුනකට වඩා සසඳන විට the + -est / the most.", [
    "This is [the biggest|the bigger|biggest] hotel in town.", "She is [the best|the better|the goodest] player.", "It was [the most exciting|the excitingest|more exciting] match.", "Mount Everest is [the highest|the higher|highest] mountain.", "This is [the cheapest|the cheaper|cheapest] ticket.",
    "He is [the tallest|the taller|tallest] in the class.", "That was [the worst|the baddest|the worse] day of my life.", "Sigiriya is [the most famous|the famousest|most famous] place here.", "It's [the hottest|the hotter|hottest] month.", "She's [the youngest|the younger|youngest] in the family.",
    "This is [the most important|the importantest|more important] meeting.", "Who is [the fastest|the faster|fastest] runner?", "It's [the most beautiful|the beautifulest|more beautiful] beach I've seen.", "Today is [the happiest|the happier|happiest] day!", "This is [the easiest|the easier|easiest] way.",
    "He is [the funniest|the funnier|funniest] person I know.", "July is [the busiest|the busier|busiest] month for hotels.", "That was [the longest|the longer|longest] flight ever.", "It's [the most popular|the popularest|most popular] dish.", "You are [the kindest|the kinder|kindest] teacher.",
  ]),
  P("much-many", 2, "much / many / some / any", "many + countable · much + uncountable · some (+) · any (? and –)", "Many people, much water. Some in positive sentences, any in questions and negatives.", "ගණන් කළ හැකි දේට many, ගණන් කළ නොහැකි දේට much.", [
    "How [many|much] bags do you have?", "How [much|many] water do you drink?", "There aren't [many|much] tourists today.", "I don't have [much|many] money.", "Do you have [any|some] questions?",
    "I'd like [some|any] tea, please.", "We don't have [any|some] milk.", "There are [many|much] shops here.", "How [much|many] does it cost?", "Is there [any|some] sugar?",
    "She has [many|much] friends.", "There isn't [much|many] time.", "I bought [some|any] apples.", "Are there [any|some] seats left?", "How [many|much] people came?",
    "We didn't see [any|some] animals.", "Can I have [some|any] water, please?", "There's not [much|many] traffic.", "He drinks too [much|many] coffee.", "[Many|Much] players were injured.",
  ]),
];
