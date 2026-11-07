/**
 * Talking Dictionary: built-in words with English + Sinhala meanings.
 * Sinhala translations are written for learners; please have a native Sinhala speaker review them.
 * IPA is British English (Received Pronunciation).
 */

export type Entry = {
  word: string;
  pos: string; // part of speech
  ipa: string;
  syllables: string; // e.g. "air·port"
  emoji: string;
  en: string; // simple English meaning
  si: string; // Sinhala meaning
  examples: string[];
  topic: TopicId;
  /** 1 Beginner … 5 Advanced (words from the 5,000-word list). */
  level?: number;
};

export type TopicId =
  | "travel"
  | "hotel"
  | "food"
  | "shopping"
  | "health"
  | "work"
  | "home"
  | "feelings"
  | "sports"
  | "verbs"
  | "describe"
  | "time";

export const TOPICS: { id: TopicId; label: string; emoji: string; si: string }[] = [
  { id: "travel", label: "Travel", emoji: "✈️", si: "සංචාරය" },
  { id: "hotel", label: "Hotel", emoji: "🏨", si: "හෝටලය" },
  { id: "food", label: "Food & drink", emoji: "🍛", si: "ආහාර පාන" },
  { id: "shopping", label: "Shopping & money", emoji: "🛍️", si: "සාප්පු සවාරි හා මුදල්" },
  { id: "health", label: "Health & body", emoji: "🩺", si: "සෞඛ්‍යය හා ශරීරය" },
  { id: "work", label: "Work & study", emoji: "💼", si: "රැකියාව හා අධ්‍යාපනය" },
  { id: "home", label: "Home & family", emoji: "🏠", si: "නිවස හා පවුල" },
  { id: "feelings", label: "Feelings", emoji: "😊", si: "හැඟීම්" },
  { id: "sports", label: "Sports", emoji: "🏏", si: "ක්‍රීඩා" },
  { id: "verbs", label: "Everyday verbs", emoji: "🏃", si: "එදිනෙදා ක්‍රියා පද" },
  { id: "describe", label: "Describing words", emoji: "🎨", si: "විස්තර කරන වචන" },
  { id: "time", label: "Time & weather", emoji: "⏰", si: "කාලය හා කාලගුණය" },
];

const D = (topic: TopicId, word: string, pos: string, ipa: string, syllables: string, emoji: string, en: string, si: string, ...examples: string[]): Entry => ({
  word,
  pos,
  ipa,
  syllables,
  emoji,
  en,
  si,
  examples,
  topic,
});

export const DICTIONARY: Entry[] = [
  // ✈️ Travel
  D("travel", "airport", "noun", "/ˈeə.pɔːt/", "air·port", "🛫", "a place where planes take off and land", "ගුවන් තොටුපළ", "We arrived at the airport two hours early.", "The airport is very busy in December."),
  D("travel", "passport", "noun", "/ˈpɑːs.pɔːt/", "pass·port", "🛂", "an official book that shows who you are and your nationality", "විදේශ ගමන් බලපත්‍රය", "Don't forget your passport!", "My passport expires next year."),
  D("travel", "ticket", "noun", "/ˈtɪk.ɪt/", "tick·et", "🎫", "a paper or card that shows you paid to travel or enter", "ප්‍රවේශ පත්‍රය / ටිකට්පත", "I bought a return ticket to Kandy.", "Can I see your ticket, please?"),
  D("travel", "luggage", "noun", "/ˈlʌɡ.ɪdʒ/", "lug·gage", "🧳", "the bags and suitcases you take on a trip", "ගමන් මලු", "How much luggage can I take?", "Please don't leave your luggage alone."),
  D("travel", "departure", "noun", "/dɪˈpɑː.tʃər/", "de·par·ture", "🛫", "the act of leaving a place", "පිටත්වීම", "Our departure time is 9:30.", "Check the departure board for your gate."),
  D("travel", "arrival", "noun", "/əˈraɪ.vəl/", "ar·riv·al", "🛬", "the act of reaching a place", "පැමිණීම", "The arrival hall is on the ground floor.", "We waited for her arrival."),
  D("travel", "delay", "noun / verb", "/dɪˈleɪ/", "de·lay", "⏰", "a time when something happens later than planned", "ප්‍රමාදය", "There is a two-hour delay.", "The rain delayed our flight."),
  D("travel", "journey", "noun", "/ˈdʒɜː.ni/", "jour·ney", "🛤️", "travelling from one place to another", "ගමන", "The journey takes six hours.", "Have a safe journey!"),
  D("travel", "destination", "noun", "/ˌdes.tɪˈneɪ.ʃən/", "des·ti·na·tion", "📍", "the place where you are going", "ගමනාන්තය", "Our destination is Galle.", "Paris is a popular destination."),
  D("travel", "passenger", "noun", "/ˈpæs.ən.dʒər/", "pas·sen·ger", "🧍", "a person travelling in a car, bus, train or plane", "මගියා", "All passengers must wear a seat belt.", "The bus had forty passengers."),
  D("travel", "boarding pass", "noun", "/ˈbɔː.dɪŋ ˌpɑːs/", "board·ing pass", "🎟️", "the card you need to get on a plane", "ගුවන් යානයට ඇතුළුවීමේ පත්‍රය", "Please show your boarding pass at the gate.", "I have my boarding pass on my phone."),
  D("travel", "customs", "noun", "/ˈkʌs.təmz/", "cus·toms", "🛃", "the place at a border where officers check what you bring", "රේගුව", "We went through customs quickly.", "You must declare this at customs."),
  D("travel", "map", "noun", "/mæp/", "map", "🗺️", "a drawing that shows roads, cities and places", "සිතියම", "Can you show me on the map?", "I use the map on my phone."),
  D("travel", "tourist", "noun", "/ˈtʊə.rɪst/", "tour·ist", "📸", "a person who visits a place for fun", "සංචාරකයා", "Many tourists visit Sigiriya.", "The tourist asked for directions."),
  // 🏨 Hotel
  D("hotel", "reservation", "noun", "/ˌrez.əˈveɪ.ʃən/", "res·er·va·tion", "📒", "an arrangement to keep a room or table for you", "වෙන්කිරීම", "I have a reservation for two nights.", "Do I need a reservation?"),
  D("hotel", "reception", "noun", "/rɪˈsep.ʃən/", "re·cep·tion", "🛎️", "the desk where guests are welcomed in a hotel", "පිළිගැනීමේ කවුළුව", "Please leave your key at reception.", "Reception is open 24 hours."),
  D("hotel", "guest", "noun", "/ɡest/", "guest", "🧑", "a person staying at a hotel or visiting a home", "අමුත්තා", "The hotel has two hundred guests.", "Our guests arrive tonight."),
  D("hotel", "single room", "noun", "/ˌsɪŋ.ɡəl ˈruːm/", "sin·gle room", "🛏️", "a room for one person", "තනි කාමරය", "I'd like a single room, please.", "A single room costs forty dollars."),
  D("hotel", "towel", "noun", "/ˈtaʊ.əl/", "tow·el", "🧺", "a cloth used to dry your body", "තුවාය", "Could I have an extra towel?", "The towels are in the bathroom."),
  D("hotel", "check in", "phrasal verb", "/ˌtʃek ˈɪn/", "check in", "🔑", "to arrive and register at a hotel or airport", "ලියාපදිංචි වී ඇතුළු වීම", "We can check in after two o'clock.", "Where do I check in?"),
  D("hotel", "check out", "phrasal verb", "/ˌtʃek ˈaʊt/", "check out", "🚪", "to pay and leave a hotel", "ගාස්තු ගෙවා පිටවීම", "Check-out is at eleven.", "We checked out early."),
  D("hotel", "key", "noun", "/kiː/", "key", "🔑", "a small metal object or card that opens a lock", "යතුර", "I lost my room key.", "Here is your key."),
  D("hotel", "lift", "noun", "/lɪft/", "lift", "🛗", "a machine that carries people between floors (US: elevator)", "සෝපානය", "Take the lift to the fifth floor.", "The lift is not working."),
  D("hotel", "breakfast", "noun", "/ˈbrek.fəst/", "break·fast", "🍳", "the first meal of the day", "උදේ ආහාරය", "Breakfast is served from seven.", "What would you like for breakfast?"),
  D("hotel", "bill", "noun", "/bɪl/", "bill", "🧾", "a paper that shows how much you must pay", "බිල්පත", "Could we have the bill, please?", "The bill includes tax."),
  D("hotel", "comfortable", "adjective", "/ˈkʌm.fə.tə.bəl/", "com·for·ta·ble", "🛋️", "pleasant and relaxing to use or be in", "සුවපහසු", "The bed was very comfortable.", "Are you comfortable?"),
  // 🍛 Food & drink
  D("food", "delicious", "adjective", "/dɪˈlɪʃ.əs/", "de·li·cious", "😋", "tasting very good", "ඉතා රසවත්", "This curry is delicious!", "Thank you for a delicious meal."),
  D("food", "spicy", "adjective", "/ˈspaɪ.si/", "spic·y", "🌶️", "with a hot, strong taste from chilli or spices", "සැර / කුළුබඩු වැඩි", "I love spicy food.", "Is this dish very spicy?"),
  D("food", "vegetable", "noun", "/ˈvedʒ.tə.bəl/", "veg·e·ta·ble", "🥕", "a plant or part of a plant used as food", "එළවළු", "Eat more vegetables.", "Carrots are my favourite vegetable."),
  D("food", "fruit", "noun", "/fruːt/", "fruit", "🍎", "the sweet part of a plant that you can eat", "පළතුරු", "Mangoes are a tropical fruit.", "I eat fruit every morning."),
  D("food", "menu", "noun", "/ˈmen.juː/", "men·u", "📜", "a list of food you can order in a restaurant", "ආහාර ලැයිස්තුව", "Can I see the menu, please?", "The menu changes every week."),
  D("food", "order", "verb / noun", "/ˈɔː.dər/", "or·der", "📝", "to ask for food or goods", "ඇණවුම් කිරීම", "Are you ready to order?", "I ordered a pizza."),
  D("food", "hungry", "adjective", "/ˈhʌŋ.ɡri/", "hun·gry", "🤤", "wanting or needing food", "බඩගිනි", "I'm really hungry.", "The children are hungry after school."),
  D("food", "thirsty", "adjective", "/ˈθɜː.sti/", "thirst·y", "🥤", "wanting or needing a drink", "පිපාසිත", "I'm thirsty. Can I have some water?", "Running makes me thirsty."),
  D("food", "recipe", "noun", "/ˈres.ɪ.pi/", "rec·i·pe", "📖", "instructions for cooking a dish", "වට්ටෝරුව", "This is my grandmother's recipe.", "Can you share the recipe?"),
  D("food", "dessert", "noun", "/dɪˈzɜːt/", "des·sert", "🍰", "sweet food eaten after a meal", "අතුරුපසය", "What's for dessert?", "I'll have ice cream for dessert."),
  D("food", "bread", "noun", "/bred/", "bread", "🍞", "a food made from flour, water and yeast, baked in an oven", "පාන්", "I bought fresh bread.", "Would you like bread with your soup?"),
  D("food", "rice", "noun", "/raɪs/", "rice", "🍚", "small white or brown grains cooked and eaten as food", "බත් / සහල්", "We eat rice and curry every day.", "This rice is very soft."),
  D("food", "cook", "verb", "/kʊk/", "cook", "🧑‍🍳", "to make food ready to eat by heating it", "උයනවා", "My father cooks on Sundays.", "Can you cook rice?"),
  // 🛍️ Shopping & money
  D("shopping", "price", "noun", "/praɪs/", "price", "🏷️", "the amount of money something costs", "මිල", "What's the price of this shirt?", "Prices are going up."),
  D("shopping", "cheap", "adjective", "/tʃiːp/", "cheap", "💲", "not costing much money", "ලාභ", "This bag is very cheap.", "Is there a cheaper one?"),
  D("shopping", "expensive", "adjective", "/ɪkˈspen.sɪv/", "ex·pen·sive", "💎", "costing a lot of money", "මිල අධික", "This phone is too expensive.", "London is an expensive city."),
  D("shopping", "discount", "noun", "/ˈdɪs.kaʊnt/", "dis·count", "🔖", "a lower price than usual", "වට්ටම", "Is there a student discount?", "They gave me a ten percent discount."),
  D("shopping", "receipt", "noun", "/rɪˈsiːt/", "re·ceipt", "🧾", "a paper that shows you have paid", "ලදුපත", "Keep your receipt.", "Can I have a receipt, please?"),
  D("shopping", "cash", "noun", "/kæʃ/", "cash", "💵", "money in coins or notes", "මුදල් (නෝට්ටු හා කාසි)", "Do you accept cash?", "I don't have any cash."),
  D("shopping", "change", "noun", "/tʃeɪndʒ/", "change", "🪙", "the money you get back when you pay too much", "ඉතිරි මුදල", "Here is your change.", "Keep the change."),
  D("shopping", "size", "noun", "/saɪz/", "size", "📏", "how big or small something is", "ප්‍රමාණය", "What size do you wear?", "Do you have this in a bigger size?"),
  D("shopping", "try on", "phrasal verb", "/ˌtraɪ ˈɒn/", "try on", "👕", "to put on clothes to see if they fit", "ඇඳලා බලනවා", "Can I try this on?", "She tried on three dresses."),
  D("shopping", "refund", "noun", "/ˈriː.fʌnd/", "re·fund", "↩️", "money given back when you return something", "මුදල් ආපසු ගෙවීම", "I'd like a refund, please.", "You can get a full refund."),
  D("shopping", "customer", "noun", "/ˈkʌs.tə.mər/", "cus·tom·er", "🧑", "a person who buys something from a shop", "පාරිභෝගිකයා", "The shop has many customers.", "The customer is always right."),
  D("shopping", "afford", "verb", "/əˈfɔːd/", "af·ford", "👛", "to have enough money to buy something", "දරාගත හැකි වීම", "I can't afford a new car.", "Can we afford this holiday?"),
  // 🩺 Health & body
  D("health", "headache", "noun", "/ˈhed.eɪk/", "head·ache", "🤕", "a pain in your head", "හිසරදය", "I have a terrible headache.", "Drink water to stop a headache."),
  D("health", "fever", "noun", "/ˈfiː.vər/", "fe·ver", "🤒", "a body temperature that is higher than normal", "උණ", "She has a high fever.", "Take this medicine for the fever."),
  D("health", "medicine", "noun", "/ˈmed.ɪ.sən/", "med·i·cine", "💊", "something you take to make an illness better", "ඖෂධය / බෙහෙත්", "Take the medicine after meals.", "Did you take your medicine?"),
  D("health", "doctor", "noun", "/ˈdɒk.tər/", "doc·tor", "🧑‍⚕️", "a person who treats sick people", "වෛද්‍යවරයා", "You should see a doctor.", "The doctor said I need rest."),
  D("health", "pharmacy", "noun", "/ˈfɑː.mə.si/", "phar·ma·cy", "🏥", "a shop that sells medicine", "ඖෂධ හල / ෆාමසිය", "Is there a pharmacy near here?", "I bought tablets at the pharmacy."),
  D("health", "pain", "noun", "/peɪn/", "pain", "😣", "the feeling when part of your body hurts", "වේදනාව", "I have a pain in my back.", "Where is the pain?"),
  D("health", "cough", "noun / verb", "/kɒf/", "cough", "😷", "to push air out of your throat with a loud noise", "කැස්ස", "He has a bad cough.", "She coughed all night."),
  D("health", "healthy", "adjective", "/ˈhel.θi/", "health·y", "🥗", "strong and well; good for your body", "සෞඛ්‍ය සම්පන්න", "Eat healthy food.", "Walking keeps you healthy."),
  D("health", "tired", "adjective", "/taɪəd/", "tired", "🥱", "needing rest or sleep", "මහන්සි", "I'm very tired after work.", "You look tired."),
  D("health", "appointment", "noun", "/əˈpɔɪnt.mənt/", "ap·point·ment", "📅", "a fixed time to meet someone, like a doctor", "හමුවීමට වේලාවක්", "I have a doctor's appointment at ten.", "Can I make an appointment?"),
  D("health", "allergy", "noun", "/ˈæl.ə.dʒi/", "al·ler·gy", "🤧", "a bad reaction of your body to something", "අසාත්මිකතාව", "I have an allergy to nuts.", "Do you have any allergies?"),
  D("health", "exercise", "noun / verb", "/ˈek.sə.saɪz/", "ex·er·cise", "🏋️", "physical activity to stay healthy", "ව්‍යායාම", "I exercise every morning.", "Exercise is good for your heart."),
  // 💼 Work & study
  D("work", "job", "noun", "/dʒɒb/", "job", "💼", "the work you do to earn money", "රැකියාව", "I have a new job.", "What's your job?"),
  D("work", "office", "noun", "/ˈɒf.ɪs/", "of·fice", "🏢", "a room or building where people work at desks", "කාර්යාලය", "I work in an office.", "The office opens at nine."),
  D("work", "meeting", "noun", "/ˈmiː.tɪŋ/", "meet·ing", "👥", "when people come together to talk about something", "රැස්වීම", "I have a meeting at two.", "The meeting was very long."),
  D("work", "colleague", "noun", "/ˈkɒl.iːɡ/", "col·league", "🤝", "a person you work with", "සහෝදර සේවකයා", "My colleagues are very friendly.", "I had lunch with a colleague."),
  D("work", "salary", "noun", "/ˈsæl.ər.i/", "sal·a·ry", "💰", "money you get every month for your job", "වැටුප", "She gets a good salary.", "When is salary day?"),
  D("work", "interview", "noun", "/ˈɪn.tə.vjuː/", "in·ter·view", "🎙️", "a meeting where someone asks you questions, often for a job", "සම්මුඛ පරීක්ෂණය", "I have a job interview tomorrow.", "The interview went well."),
  D("work", "experience", "noun", "/ɪkˈspɪə.ri.əns/", "ex·pe·ri·ence", "📈", "knowledge or skill you get from doing something", "පළපුරුද්ද", "Do you have any experience?", "Travelling is a great experience."),
  D("work", "deadline", "noun", "/ˈded.laɪn/", "dead·line", "⏳", "the last time or date to finish something", "අවසන් දිනය", "The deadline is Friday.", "We missed the deadline."),
  D("work", "exam", "noun", "/ɪɡˈzæm/", "ex·am", "📝", "a test of what you know", "විභාගය", "I passed my English exam!", "The exam starts at nine."),
  D("work", "practise", "verb", "/ˈpræk.tɪs/", "prac·tise", "🔁", "to do something again and again to get better (US: practice)", "පුහුණු වෙනවා", "Practise speaking every day.", "She practises the piano."),
  D("work", "improve", "verb", "/ɪmˈpruːv/", "im·prove", "📈", "to get better or make something better", "දියුණු කරනවා", "My English is improving.", "How can I improve my writing?"),
  D("work", "skill", "noun", "/skɪl/", "skill", "🛠️", "the ability to do something well", "කුසලතාව", "Speaking is an important skill.", "He has great computer skills."),
  // 🏠 Home & family
  D("home", "family", "noun", "/ˈfæm.əl.i/", "fam·i·ly", "👨‍👩‍👧", "parents, children and other relatives", "පවුල", "I have a big family.", "We have dinner as a family."),
  D("home", "parents", "noun", "/ˈpeə.rənts/", "par·ents", "👫", "your mother and father", "දෙමාපියන්", "My parents live in Colombo.", "I call my parents every day."),
  D("home", "brother", "noun", "/ˈbrʌð.ər/", "broth·er", "👦", "a boy or man with the same parents as you", "සහෝදරයා", "My brother is older than me.", "I have two brothers."),
  D("home", "sister", "noun", "/ˈsɪs.tər/", "sis·ter", "👧", "a girl or woman with the same parents as you", "සහෝදරිය", "My sister is a nurse.", "Do you have any sisters?"),
  D("home", "neighbour", "noun", "/ˈneɪ.bər/", "neigh·bour", "🏡", "a person who lives near you (US: neighbor)", "අසල්වැසියා", "Our neighbours are very kind.", "I met my new neighbour today."),
  D("home", "kitchen", "noun", "/ˈkɪtʃ.ən/", "kitch·en", "🍳", "the room where you cook", "කුස්සිය", "Mum is in the kitchen.", "The kitchen is very clean."),
  D("home", "bedroom", "noun", "/ˈbed.ruːm/", "bed·room", "🛏️", "a room for sleeping", "නිදන කාමරය", "My bedroom is upstairs.", "The house has three bedrooms."),
  D("home", "clean", "verb / adjective", "/kliːn/", "clean", "🧹", "to remove dirt; not dirty", "පිරිසිදු කරනවා / පිරිසිදු", "I clean my room on Saturdays.", "The kitchen is clean."),
  D("home", "wedding", "noun", "/ˈwed.ɪŋ/", "wed·ding", "💍", "a ceremony where two people get married", "විවාහ මංගල්‍යය", "My cousin's wedding is in June.", "It was a beautiful wedding."),
  D("home", "birthday", "noun", "/ˈbɜːθ.deɪ/", "birth·day", "🎂", "the day of the year you were born", "උපන් දිනය", "Happy birthday!", "When is your birthday?"),
  D("home", "grandmother", "noun", "/ˈɡræn.mʌð.ər/", "grand·moth·er", "👵", "the mother of your mother or father", "ආච්චි", "My grandmother makes the best food.", "I visit my grandmother every week."),
  D("home", "relative", "noun", "/ˈrel.ə.tɪv/", "rel·a·tive", "👪", "a member of your family", "ඥාතියා", "All our relatives came to the party.", "Do you have relatives abroad?"),
  // 😊 Feelings
  D("feelings", "happy", "adjective", "/ˈhæp.i/", "hap·py", "😊", "feeling good and pleased", "සතුටු", "I'm so happy to see you!", "She looks happy today."),
  D("feelings", "sad", "adjective", "/sæd/", "sad", "😢", "unhappy", "දුක්", "Why are you sad?", "It was a sad film."),
  D("feelings", "angry", "adjective", "/ˈæŋ.ɡri/", "an·gry", "😠", "feeling strong annoyance", "කේන්ති", "Please don't be angry with me.", "He was angry about the delay."),
  D("feelings", "nervous", "adjective", "/ˈnɜː.vəs/", "ner·vous", "😬", "worried or a little afraid", "කලබල / බියෙන්", "I'm nervous about the exam.", "She felt nervous before the interview."),
  D("feelings", "excited", "adjective", "/ɪkˈsaɪ.tɪd/", "ex·cit·ed", "🤩", "very happy and full of energy about something", "උද්යෝගිමත්", "We're excited about the holiday.", "The children were excited."),
  D("feelings", "worried", "adjective", "/ˈwʌr.id/", "wor·ried", "😟", "thinking about problems; anxious", "කනස්සල්ලෙන්", "I'm worried about my mother.", "Don't be worried."),
  D("feelings", "proud", "adjective", "/praʊd/", "proud", "🥲", "pleased about something you or someone did", "ආඩම්බර", "I'm proud of you!", "She is proud of her English."),
  D("feelings", "bored", "adjective", "/bɔːd/", "bored", "🥱", "not interested; with nothing to do", "කම්මැලි", "I'm bored. Let's go out.", "The students looked bored."),
  D("feelings", "surprised", "adjective", "/səˈpraɪzd/", "sur·prised", "😮", "feeling something unexpected happened", "පුදුමයට පත්", "I was surprised to see him.", "She looked surprised."),
  D("feelings", "confident", "adjective", "/ˈkɒn.fɪ.dənt/", "con·fi·dent", "😎", "sure about yourself and your abilities", "ආත්ම විශ්වාසයෙන් යුත්", "Speak English with a confident voice.", "I feel confident today."),
  D("feelings", "grateful", "adjective", "/ˈɡreɪt.fəl/", "grate·ful", "🙏", "wanting to thank someone", "කෘතඥ", "I'm grateful for your help.", "We are very grateful."),
  D("feelings", "lonely", "adjective", "/ˈləʊn.li/", "lone·ly", "😔", "sad because you are alone", "හුදෙකලා බවක් දැනෙන", "She felt lonely in the new city.", "Call me if you feel lonely."),
  // 🏏 Sports
  D("sports", "match", "noun", "/mætʃ/", "match", "🏟️", "a game between two teams or players", "තරගය", "Did you watch the match?", "We won the match!"),
  D("sports", "team", "noun", "/tiːm/", "team", "👥", "a group of people who play together", "කණ්ඩායම", "Which team do you support?", "Our team is the best."),
  D("sports", "score", "noun / verb", "/skɔːr/", "score", "🔢", "the number of points; to get a point or goal", "ලකුණු / ලකුණු ලබා ගන්නවා", "What's the score?", "He scored two goals."),
  D("sports", "win", "verb", "/wɪn/", "win", "🏆", "to be the best in a game or competition", "ජයගන්නවා", "We want to win the cup.", "Who won the match?"),
  D("sports", "lose", "verb", "/luːz/", "lose", "😞", "not to win", "පරාජය වෙනවා", "We lost by two runs.", "Don't be sad if you lose."),
  D("sports", "captain", "noun", "/ˈkæp.tɪn/", "cap·tain", "👑", "the leader of a team", "නායකයා", "He is the team captain.", "The captain lifted the trophy."),
  D("sports", "referee", "noun", "/ˌref.əˈriː/", "ref·er·ee", "🧑‍⚖️", "the person who controls a football or rugby game", "විනිසුරු", "The referee blew the whistle.", "The referee gave a penalty."),
  D("sports", "umpire", "noun", "/ˈʌm.paɪər/", "um·pire", "☝️", "the person who controls a cricket or tennis game", "විනිසුරු (ක්‍රිකට්)", "The umpire gave him out.", "The umpire raised his finger."),
  D("sports", "goal", "noun", "/ɡəʊl/", "goal", "🥅", "the net where you score in football; a point scored", "ගෝලය", "What a goal!", "She scored the winning goal."),
  D("sports", "wicket", "noun", "/ˈwɪk.ɪt/", "wick·et", "🏏", "the three sticks in cricket; when a batter is out", "කඩුල්ල", "He took three wickets.", "The ball hit the wicket."),
  D("sports", "stadium", "noun", "/ˈsteɪ.di.əm/", "sta·di·um", "🏟️", "a large place where sports are played and watched", "ක්‍රීඩාංගණය", "The stadium was full.", "We went to the stadium together."),
  D("sports", "champion", "noun", "/ˈtʃæm.pi.ən/", "cham·pi·on", "🥇", "the winner of a competition", "ශූරයා", "Sri Lanka were world champions in 1996.", "She is the tennis champion."),
  // 🏃 Everyday verbs
  D("verbs", "go", "verb", "/ɡəʊ/", "go", "🚶", "to move from one place to another (go, went, gone)", "යනවා", "I go to work by bus.", "We went to the beach."),
  D("verbs", "come", "verb", "/kʌm/", "come", "👋", "to move towards the speaker (come, came, come)", "එනවා", "Come here, please.", "She came home late."),
  D("verbs", "eat", "verb", "/iːt/", "eat", "🍽️", "to put food in your mouth and swallow it (eat, ate, eaten)", "කනවා", "Let's eat lunch.", "I ate rice for dinner."),
  D("verbs", "drink", "verb", "/drɪŋk/", "drink", "🥛", "to take liquid into your mouth (drink, drank, drunk)", "බොනවා", "Drink more water.", "I drank two cups of tea."),
  D("verbs", "speak", "verb", "/spiːk/", "speak", "🗣️", "to say words; to talk (speak, spoke, spoken)", "කතා කරනවා", "Do you speak English?", "Please speak slowly."),
  D("verbs", "listen", "verb", "/ˈlɪs.ən/", "lis·ten", "👂", "to pay attention to sounds", "සවන් දෙනවා", "Listen to the teacher.", "I listen to music every day."),
  D("verbs", "read", "verb", "/riːd/", "read", "📖", "to look at words and understand them (read, read, read)", "කියවනවා", "I read a story every night.", "Have you read this book?"),
  D("verbs", "write", "verb", "/raɪt/", "write", "✍️", "to make letters or words with a pen or keyboard (write, wrote, written)", "ලියනවා", "Write your name here.", "She wrote a letter."),
  D("verbs", "understand", "verb", "/ˌʌn.dəˈstænd/", "un·der·stand", "💡", "to know the meaning of something (understand, understood)", "තේරුම් ගන්නවා", "Do you understand?", "I don't understand this word."),
  D("verbs", "help", "verb", "/help/", "help", "🤝", "to make it easier for someone to do something", "උදව් කරනවා", "Can you help me?", "Thank you for helping."),
  D("verbs", "buy", "verb", "/baɪ/", "buy", "🛒", "to get something by paying money (buy, bought)", "මිලදී ගන්නවා", "I want to buy a new phone.", "She bought some fruit."),
  D("verbs", "sleep", "verb", "/sliːp/", "sleep", "😴", "to rest with your eyes closed (sleep, slept)", "නිදා ගන්නවා", "I sleep eight hours a night.", "Did you sleep well?"),
  D("verbs", "wait", "verb", "/weɪt/", "wait", "⏱️", "to stay until something happens", "බලා සිටිනවා", "Please wait here.", "I waited for the bus."),
  D("verbs", "learn", "verb", "/lɜːn/", "learn", "🎓", "to get new knowledge or skills", "ඉගෙන ගන්නවා", "I'm learning English.", "We learn something new every day."),
  D("verbs", "remember", "verb", "/rɪˈmem.bər/", "re·mem·ber", "🧠", "to keep something in your mind", "මතක තබා ගන්නවා", "I remember my first day at school.", "Remember to call me."),
  D("verbs", "forget", "verb", "/fəˈɡet/", "for·get", "🤔", "not to remember (forget, forgot, forgotten)", "අමතක කරනවා", "Don't forget your keys!", "I forgot her name."),
  // 🎨 Describing words
  D("describe", "beautiful", "adjective", "/ˈbjuː.tɪ.fəl/", "beau·ti·ful", "🌸", "very nice to look at", "ලස්සන / සුන්දර", "What a beautiful beach!", "She has a beautiful voice."),
  D("describe", "big", "adjective", "/bɪɡ/", "big", "🐘", "large in size", "ලොකු", "They live in a big house.", "That's a big problem."),
  D("describe", "small", "adjective", "/smɔːl/", "small", "🐜", "little in size", "කුඩා / පොඩි", "I have a small car.", "Can I have a small coffee?"),
  D("describe", "easy", "adjective", "/ˈiː.zi/", "eas·y", "✅", "not difficult", "පහසු", "This exercise is easy.", "English can be easy with practice."),
  D("describe", "difficult", "adjective", "/ˈdɪf.ɪ.kəlt/", "dif·fi·cult", "🧗", "not easy; hard to do", "අමාරු", "This word is difficult to say.", "It was a difficult day."),
  D("describe", "important", "adjective", "/ɪmˈpɔː.tənt/", "im·por·tant", "⭐", "having great value or meaning", "වැදගත්", "Family is important to me.", "This is an important meeting."),
  D("describe", "quiet", "adjective", "/ˈkwaɪ.ət/", "qui·et", "🤫", "making little or no noise", "නිහඬ", "Please be quiet.", "It's a quiet street."),
  D("describe", "busy", "adjective", "/ˈbɪz.i/", "bus·y", "🐝", "having a lot to do; full of people", "කාර්යබහුල", "I'm busy today.", "The market is very busy."),
  D("describe", "friendly", "adjective", "/ˈfrend.li/", "friend·ly", "🤗", "kind and pleasant to others", "මිත්‍රශීලී", "The people here are very friendly.", "He has a friendly smile."),
  D("describe", "fast", "adjective / adverb", "/fɑːst/", "fast", "⚡", "moving or happening quickly", "වේගවත් / ඉක්මනින්", "This train is very fast.", "Don't drive so fast."),
  D("describe", "slow", "adjective", "/sləʊ/", "slow", "🐢", "not fast", "මන්දගාමී / සෙමින්", "The internet is slow today.", "Please speak slowly."),
  D("describe", "different", "adjective", "/ˈdɪf.ər.ənt/", "dif·fer·ent", "🔀", "not the same", "වෙනස්", "We have different ideas.", "This is different from that."),
  // ⏰ Time & weather
  D("time", "today", "adverb", "/təˈdeɪ/", "to·day", "📅", "on this day", "අද", "What are you doing today?", "Today is Friday."),
  D("time", "tomorrow", "adverb", "/təˈmɒr.əʊ/", "to·mor·row", "⏭️", "on the day after today", "හෙට", "See you tomorrow!", "Tomorrow will be sunny."),
  D("time", "yesterday", "adverb", "/ˈjes.tə.deɪ/", "yes·ter·day", "⏮️", "on the day before today", "ඊයේ", "I called you yesterday.", "Yesterday was very hot."),
  D("time", "morning", "noun", "/ˈmɔː.nɪŋ/", "morn·ing", "🌅", "the early part of the day", "උදෑසන", "Good morning!", "I run every morning."),
  D("time", "evening", "noun", "/ˈiːv.nɪŋ/", "eve·ning", "🌇", "the end of the day, before night", "සවස", "Good evening, everyone.", "We walk in the evening."),
  D("time", "weekend", "noun", "/ˌwiːkˈend/", "week·end", "🎉", "Saturday and Sunday", "සති අන්තය", "Have a nice weekend!", "What did you do at the weekend?"),
  D("time", "weather", "noun", "/ˈweð.ər/", "weath·er", "🌦️", "how hot, cold, rainy or sunny it is", "කාලගුණය", "What's the weather like today?", "The weather is lovely."),
  D("time", "rain", "noun / verb", "/reɪn/", "rain", "🌧️", "water falling from clouds", "වැස්ස / වහිනවා", "It's raining again.", "Take an umbrella; there will be rain."),
  D("time", "sunny", "adjective", "/ˈsʌn.i/", "sun·ny", "☀️", "with a lot of sunshine", "අව්ව සහිත", "It's a sunny day.", "Tomorrow will be sunny and warm."),
  D("time", "hot", "adjective", "/hɒt/", "hot", "🥵", "having a high temperature", "උණුසුම් / රස්නෙ", "It's very hot today.", "Be careful, the tea is hot."),
  D("time", "cold", "adjective", "/kəʊld/", "cold", "🥶", "having a low temperature", "සීතල", "It's cold in the mountains.", "I'd like a cold drink."),
  D("time", "early", "adjective / adverb", "/ˈɜː.li/", "ear·ly", "🐓", "before the usual or planned time", "කලින් / උදෙන්ම", "I woke up early.", "You're early!"),
  D("time", "late", "adjective / adverb", "/leɪt/", "late", "🕙", "after the usual or planned time", "ප්‍රමාද", "Sorry I'm late.", "The bus is late again."),
];

export function findWord(q: string) {
  const w = q.trim().toLowerCase();
  return DICTIONARY.find((e) => e.word.toLowerCase() === w);
}

export function searchWords(q: string, limit = 12) {
  const w = q.trim().toLowerCase();
  if (!w) return [];
  const starts = DICTIONARY.filter((e) => e.word.toLowerCase().startsWith(w));
  const contains = DICTIONARY.filter((e) => !starts.includes(e) && (e.word.toLowerCase().includes(w) || e.si.includes(q.trim()) || e.en.toLowerCase().includes(` ${w}`)));
  return [...starts, ...contains].slice(0, limit);
}

/** Trusted online dictionaries (links only, nothing is copied from them). */
export function externalDictionaries(word: string) {
  const q = encodeURIComponent(word);
  return [
    { label: "Madura (EN ↔ සිං)", url: `https://www.maduraonline.com/?find=${q}` },
    { label: "Google Translate (සිංහල)", url: `https://translate.google.com/?sl=en&tl=si&text=${q}&op=translate` },
    { label: "Cambridge Dictionary", url: `https://dictionary.cambridge.org/dictionary/english/${q}` },
  ];
}

