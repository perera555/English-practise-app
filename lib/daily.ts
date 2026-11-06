import type { Level, Line, Scene } from "./types";

export type DailyTalk = {
  id: string;
  n: number;
  title: string;
  emoji: string;
  level: Level;
  scene: Scene;
  learnerRole: string;
  lines: Line[];
  phrases: { phrase: string; meaning: string }[];
  robot: string;
  opener: string;
};

/** Quick scene: emojis spread across the picture. The first emoji is drawn large in the sky. */
function sc(sky: [string, string], ground: string, ...e: string[]): Scene {
  const spots = [
    { x: 50, y: 22, s: 5 },
    { x: 24, y: 58, s: 5 },
    { x: 76, y: 58, s: 5 },
    { x: 50, y: 66, s: 3 },
    { x: 12, y: 22, s: 3 },
    { x: 88, y: 24, s: 3 },
  ];
  return { sky, ground, items: e.slice(0, 6).map((emoji, i) => ({ e: emoji, ...spots[i] })) };
}

const L = (speaker: string, text: string): Line => ({ speaker, text });

const warm: [string, string] = ["#fde68a", "#fffbeb"];
const cool: [string, string] = ["#bae6fd", "#f0f9ff"];
const pink: [string, string] = ["#fbcfe8", "#fdf2f8"];
const green: [string, string] = ["#bbf7d0", "#f0fdf4"];
const violet: [string, string] = ["#ddd6fe", "#f5f3ff"];

export const dailyTalks: DailyTalk[] = [
  {
    id: "greetings", n: 1, title: "Greetings & Introductions", emoji: "👋", level: "Beginner",
    scene: sc(warm, "#a3a3a3", "☀️", "🙋‍♀️", "🙋‍♂️", "🤝"), learnerRole: "Ravi",
    lines: [L("Anna", "Hi! I'm Anna. Nice to meet you."), L("Ravi", "Hello Anna, I'm Ravi. Nice to meet you too."), L("Anna", "Where are you from, Ravi?"), L("Ravi", "I'm from Sri Lanka. And you?"), L("Anna", "I'm from Canada. What do you do?"), L("Ravi", "I'm a student. I'm learning English."), L("Anna", "That's great! Your English is very good.")],
    phrases: [{ phrase: "Nice to meet you.", meaning: "a polite thing to say when you meet someone new" }, { phrase: "Where are you from?", meaning: "asking which country or city" }, { phrase: "What do you do?", meaning: "asking about someone's job" }],
    robot: "a friendly person meeting the learner for the first time", opener: "Hi there! I'm Sam. What's your name?",
  },
  {
    id: "how-was-your-day", n: 2, title: "How Was Your Day?", emoji: "🌇", level: "Beginner",
    scene: sc(["#fdba74", "#fff7ed"], "#78716c", "🌇", "🧑", "👩", "☕"), learnerRole: "Mia",
    lines: [L("Tom", "Hi Mia! How was your day?"), L("Mia", "It was busy, but good. How about you?"), L("Tom", "Not bad. I had a long meeting this morning."), L("Mia", "Oh, that sounds tiring."), L("Tom", "It was. What did you do after work?"), L("Mia", "I went to the gym and then cooked dinner."), L("Tom", "Nice! I think I'll just relax tonight.")],
    phrases: [{ phrase: "How was your day?", meaning: "asking about someone's day" }, { phrase: "Not bad.", meaning: "okay, quite good" }, { phrase: "That sounds tiring.", meaning: "showing you understand someone is tired" }],
    robot: "a friend asking about the learner's day", opener: "Hey! How was your day today?",
  },
  {
    id: "weather", n: 3, title: "Talking About the Weather", emoji: "🌦️", level: "Beginner",
    scene: sc(["#93c5fd", "#e0f2fe"], "#4d7c0f", "🌦️", "🧑‍🦱", "👵", "☂️"), learnerRole: "Leo",
    lines: [L("Grace", "Lovely day today, isn't it?"), L("Leo", "Yes, it's really sunny. But it was raining yesterday."), L("Grace", "I know! The weather changes so quickly here."), L("Leo", "Do you think it will rain this afternoon?"), L("Grace", "The forecast says it might. Take an umbrella."), L("Leo", "Good idea. I don't want to get wet.")],
    phrases: [{ phrase: "Lovely day, isn't it?", meaning: "a friendly way to start small talk" }, { phrase: "The forecast says…", meaning: "the weather report says" }, { phrase: "Take an umbrella.", meaning: "advice when rain is coming" }],
    robot: "a friendly neighbour making small talk about the weather", opener: "Good morning! What's the weather like where you are today?",
  },
  {
    id: "weekend-plans", n: 4, title: "Making Weekend Plans", emoji: "🗓️", level: "Beginner",
    scene: sc(green, "#65a30d", "🗓️", "👩‍🦰", "🧔", "🎬"), learnerRole: "Jay",
    lines: [L("Sara", "Are you free this weekend?"), L("Jay", "I'm free on Saturday. Why?"), L("Sara", "Would you like to see a movie with me?"), L("Jay", "Sure, I'd love to! What time?"), L("Sara", "How about seven o'clock?"), L("Jay", "Perfect. Let's meet at the cinema."), L("Sara", "Great. See you on Saturday!")],
    phrases: [{ phrase: "Are you free…?", meaning: "asking if someone has time" }, { phrase: "Would you like to…?", meaning: "a polite invitation" }, { phrase: "How about…?", meaning: "making a suggestion" }],
    robot: "a friend trying to make weekend plans with the learner", opener: "Hey! Do you have any plans for this weekend?",
  },
  {
    id: "phone-call", n: 5, title: "A Phone Call to a Friend", emoji: "📱", level: "Beginner",
    scene: sc(cool, "#94a3b8", "📱", "🧑", "👩", "💬"), learnerRole: "Nimal",
    lines: [L("Kate", "Hello?"), L("Nimal", "Hi Kate, it's Nimal. Is this a good time to talk?"), L("Kate", "Yes, of course. What's up?"), L("Nimal", "I wanted to ask if you have my blue notebook."), L("Kate", "Let me check. Yes, it's here on my desk."), L("Nimal", "Oh, thank goodness! Can I pick it up tomorrow?"), L("Kate", "No problem. Call me before you come.")],
    phrases: [{ phrase: "It's Nimal.", meaning: "on the phone we say 'It's…', not 'I am…'" }, { phrase: "Is this a good time?", meaning: "asking if the person can talk now" }, { phrase: "What's up?", meaning: "informal: what is happening / what do you want?" }],
    robot: "a friend answering the learner's phone call", opener: "Hello? Oh hi! What's up?",
  },
  {
    id: "asking-for-help", n: 6, title: "Asking for Help", emoji: "🙏", level: "Beginner",
    scene: sc(violet, "#7c3aed", "🙏", "🧑‍🦰", "👨‍💼", "📦"), learnerRole: "Asha",
    lines: [L("Asha", "Excuse me, could you help me, please?"), L("Man", "Of course. What do you need?"), L("Asha", "This box is too heavy. Could you help me carry it?"), L("Man", "Sure. Where do you want to take it?"), L("Asha", "Just to my car, over there."), L("Man", "Here you go. Anything else?"), L("Asha", "No, that's all. Thank you so much!")],
    phrases: [{ phrase: "Could you help me, please?", meaning: "a polite request" }, { phrase: "Here you go.", meaning: "said when you give something or finish helping" }, { phrase: "That's all.", meaning: "I don't need anything else" }],
    robot: "a kind stranger the learner asks for help", opener: "Hi! You look like you need a hand. Can I help you with something?",
  },
  {
    id: "supermarket", n: 7, title: "At the Supermarket", emoji: "🛒", level: "Beginner",
    scene: sc(green, "#16a34a", "🛒", "🧑", "👩‍💼", "🍎", "🥛", "🍞"), learnerRole: "Customer",
    lines: [L("Customer", "Excuse me, where can I find the milk?"), L("Assistant", "It's in aisle five, next to the cheese."), L("Customer", "Thanks. And do you sell fresh bread?"), L("Assistant", "Yes, the bakery is at the back of the store."), L("Customer", "Great. Are these apples on sale?"), L("Assistant", "Yes, they're two for one today."), L("Customer", "Perfect, I'll take some.")],
    phrases: [{ phrase: "Where can I find…?", meaning: "asking where something is in a shop" }, { phrase: "aisle", meaning: "a row between shelves in a shop" }, { phrase: "two for one", meaning: "buy one, get one free" }],
    robot: "a supermarket assistant", opener: "Hello! Are you looking for something in particular today?",
  },
  {
    id: "family", n: 8, title: "Talking About Family", emoji: "👨‍👩‍👧", level: "Beginner",
    scene: sc(pink, "#be185d", "🏠", "👨‍👩‍👧", "👴", "📸"), learnerRole: "Dilan",
    lines: [L("Emma", "Do you have any brothers or sisters?"), L("Dilan", "Yes, I have one older sister and a younger brother."), L("Emma", "Do they live near you?"), L("Dilan", "My brother lives with my parents. My sister lives in Dubai."), L("Emma", "Wow! Do you miss her?"), L("Dilan", "Yes, a lot. We video call every Sunday."), L("Emma", "That's lovely.")],
    phrases: [{ phrase: "older / younger", meaning: "born before / after you" }, { phrase: "I miss her.", meaning: "I feel sad because she is far away" }, { phrase: "video call", meaning: "a phone call where you see each other" }],
    robot: "a friend asking about the learner's family", opener: "Tell me about your family! Do you have any brothers or sisters?",
  },
  {
    id: "hobbies", n: 9, title: "Hobbies & Free Time", emoji: "🎨", level: "Beginner",
    scene: sc(warm, "#ca8a04", "🎨", "🧑‍🎨", "🏸", "📚", "🎸"), learnerRole: "Priya",
    lines: [L("Max", "What do you like to do in your free time?"), L("Priya", "I love painting and reading."), L("Max", "Cool! What kind of books do you read?"), L("Priya", "Mostly mystery stories. How about you?"), L("Max", "I play badminton twice a week."), L("Priya", "That sounds fun. Is it hard to learn?"), L("Max", "Not really. You should come and try it!")],
    phrases: [{ phrase: "in your free time", meaning: "when you are not working or studying" }, { phrase: "twice a week", meaning: "two times every week" }, { phrase: "You should…", meaning: "giving a friendly suggestion" }],
    robot: "a friend chatting about hobbies", opener: "So, what do you like to do in your free time?",
  },
  {
    id: "ordering-pizza", n: 10, title: "Ordering Pizza by Phone", emoji: "🍕", level: "Beginner",
    scene: sc(["#fecaca", "#fff1f2"], "#b91c1c", "🍕", "🧑", "👨‍🍳", "🛵"), learnerRole: "Customer",
    lines: [L("Staff", "Hello, Tony's Pizza. What can I get you?"), L("Customer", "Hi, I'd like a large pepperoni pizza, please."), L("Staff", "Anything to drink?"), L("Customer", "Two bottles of cola, please."), L("Staff", "Is that for delivery or collection?"), L("Customer", "Delivery, please. To 12 Park Road."), L("Staff", "That's eighteen dollars. It will be there in thirty minutes.")],
    phrases: [{ phrase: "I'd like…", meaning: "a polite way to order" }, { phrase: "delivery or collection?", meaning: "bring it to you, or you pick it up?" }, { phrase: "It will be there in…", meaning: "it will arrive after…" }],
    robot: "a pizza shop worker taking a phone order", opener: "Hello, Tony's Pizza! What can I get for you today?",
  },
  {
    id: "party-invitation", n: 11, title: "Inviting Someone to a Party", emoji: "🎉", level: "Beginner",
    scene: sc(pink, "#db2777", "🎉", "👩", "🧑", "🎂", "🎈"), learnerRole: "Liam",
    lines: [L("Zoe", "I'm having a party on Friday night. Can you come?"), L("Liam", "I'd love to! What's the occasion?"), L("Zoe", "It's my birthday!"), L("Liam", "Happy early birthday! Should I bring anything?"), L("Zoe", "Just bring yourself. Maybe some snacks if you want."), L("Liam", "Okay. What time does it start?"), L("Zoe", "At eight. See you there!")],
    phrases: [{ phrase: "Can you come?", meaning: "asking if someone can join" }, { phrase: "What's the occasion?", meaning: "why are you having the party?" }, { phrase: "Just bring yourself.", meaning: "you don't need to bring anything" }],
    robot: "a friend inviting the learner to a party", opener: "Guess what? I'm having a party this weekend! Can you come?",
  },
  {
    id: "saying-sorry", n: 12, title: "Saying Sorry", emoji: "😔", level: "Beginner",
    scene: sc(cool, "#64748b", "💬", "😔", "🙂", "☕"), learnerRole: "Sam",
    lines: [L("Sam", "I'm really sorry I'm late."), L("Lucy", "That's okay. What happened?"), L("Sam", "My bus broke down, and I had to walk."), L("Lucy", "Oh no! Don't worry about it."), L("Sam", "I should have called you. Sorry again."), L("Lucy", "It's fine, really. Let's order some coffee.")],
    phrases: [{ phrase: "I'm really sorry…", meaning: "a strong apology" }, { phrase: "Don't worry about it.", meaning: "it is not a problem" }, { phrase: "I should have…", meaning: "I did not do it, and that was a mistake" }],
    robot: "a friend the learner is apologising to", opener: "Oh, there you are! I was waiting for you. Is everything okay?",
  },
  {
    id: "compliments", n: 13, title: "Giving Compliments", emoji: "🌟", level: "Beginner",
    scene: sc(warm, "#d97706", "🌟", "👩‍🦱", "🧑", "👗"), learnerRole: "Nina",
    lines: [L("Nina", "I love your dress! It's beautiful."), L("Rosa", "Thank you! I bought it last week."), L("Nina", "The colour really suits you."), L("Rosa", "That's so kind of you. Your new haircut looks great too."), L("Nina", "Thanks! I wasn't sure about it at first."), L("Rosa", "No, it really looks good on you.")],
    phrases: [{ phrase: "It suits you.", meaning: "it looks good on you" }, { phrase: "That's so kind of you.", meaning: "thanking someone for nice words" }, { phrase: "It looks good on you.", meaning: "another way to say it suits you" }],
    robot: "a friendly colleague exchanging compliments", opener: "Hi! You look happy today. Did something good happen?",
  },
  {
    id: "talking-food", n: 14, title: "Talking About Food", emoji: "🍛", level: "Beginner",
    scene: sc(["#fed7aa", "#fff7ed"], "#c2410c", "🍛", "🧑", "👩", "🌶️", "🍰"), learnerRole: "Kumar",
    lines: [L("Lisa", "What's your favourite food?"), L("Kumar", "I love rice and curry. It's spicy and delicious."), L("Lisa", "Can you cook it?"), L("Kumar", "Yes, my mother taught me. Do you like spicy food?"), L("Lisa", "A little, but not too hot."), L("Kumar", "I'll make you a mild one next time."), L("Lisa", "Deal! I'll bring dessert.")],
    phrases: [{ phrase: "What's your favourite…?", meaning: "asking what someone likes most" }, { phrase: "mild", meaning: "not very spicy" }, { phrase: "Deal!", meaning: "I agree!" }],
    robot: "a friend who loves talking about food from different countries", opener: "I'm so hungry! What's your favourite food?",
  },
  {
    id: "bus-stop", n: 15, title: "At the Bus Stop", emoji: "🚌", level: "Beginner",
    scene: sc(cool, "#52525b", "🚌", "🧍", "👵", "🕒"), learnerRole: "Traveller",
    lines: [L("Traveller", "Excuse me, does this bus go to the city centre?"), L("Woman", "Yes, the number 7 goes there."), L("Traveller", "How often does it come?"), L("Woman", "Every fifteen minutes."), L("Traveller", "And how much is the ticket?"), L("Woman", "Two dollars. You can pay the driver."), L("Traveller", "Thank you very much.")],
    phrases: [{ phrase: "Does this bus go to…?", meaning: "checking the bus route" }, { phrase: "How often…?", meaning: "how many times, how frequently" }, { phrase: "pay the driver", meaning: "give the money to the bus driver" }],
    robot: "a local person waiting at a bus stop", opener: "Hi! Waiting for the bus too? Where are you going?",
  },
  {
    id: "neighbour", n: 16, title: "Meeting a New Neighbour", emoji: "🏡", level: "Beginner",
    scene: sc(green, "#4d7c0f", "🏡", "🧑", "👩‍🦳", "🌷"), learnerRole: "Arun",
    lines: [L("Helen", "Hello! Are you the new neighbour?"), L("Arun", "Yes, I just moved in last week. I'm Arun."), L("Helen", "Welcome! I'm Helen from number ten."), L("Arun", "Nice to meet you, Helen. Is this a quiet street?"), L("Helen", "Very quiet. The park is just around the corner."), L("Arun", "Lovely. Let me know if you ever need anything."), L("Helen", "You too. Welcome to the street!")],
    phrases: [{ phrase: "I just moved in.", meaning: "I started living here recently" }, { phrase: "around the corner", meaning: "very near" }, { phrase: "Let me know if…", meaning: "tell me if…" }],
    robot: "a friendly new neighbour", opener: "Hello! I don't think we've met. Did you just move here?",
  },
  {
    id: "talking-work", n: 17, title: "Talking About Work", emoji: "💼", level: "Intermediate",
    scene: sc(violet, "#475569", "🏢", "👨‍💼", "👩‍💻", "💻"), learnerRole: "Kasun",
    lines: [L("Olivia", "So, how's the new job going?"), L("Kasun", "It's going well, thanks. I'm still learning a lot."), L("Olivia", "What does a typical day look like?"), L("Kasun", "I usually start at nine and have meetings in the morning."), L("Olivia", "Do you get along with your colleagues?"), L("Kasun", "Yes, they're really supportive. My manager is great too."), L("Olivia", "That makes a big difference.")],
    phrases: [{ phrase: "How's … going?", meaning: "asking about progress" }, { phrase: "a typical day", meaning: "a normal day" }, { phrase: "get along with", meaning: "have a good relationship with" }],
    robot: "a friend asking about the learner's job or studies", opener: "Hey! How's work or study going these days?",
  },
  {
    id: "bank", n: 18, title: "At the Bank", emoji: "🏦", level: "Intermediate",
    scene: sc(cool, "#1e40af", "🏦", "🧑", "👩‍💼", "💳", "💵"), learnerRole: "Customer",
    lines: [L("Clerk", "Good morning. How can I help you?"), L("Customer", "I'd like to open a savings account, please."), L("Clerk", "Certainly. Do you have your ID and proof of address?"), L("Customer", "Yes, here's my passport and a utility bill."), L("Clerk", "Thank you. Would you like a debit card with the account?"), L("Customer", "Yes, please. How long will it take to arrive?"), L("Clerk", "About five working days.")],
    phrases: [{ phrase: "open an account", meaning: "start using a bank" }, { phrase: "proof of address", meaning: "a paper that shows where you live" }, { phrase: "working days", meaning: "Monday to Friday" }],
    robot: "a bank clerk", opener: "Good morning, welcome to City Bank. How can I help you today?",
  },
  {
    id: "doctor-appointment", n: 19, title: "Making a Doctor's Appointment", emoji: "🩺", level: "Intermediate",
    scene: sc(green, "#15803d", "🏥", "🧑", "👩‍⚕️", "📅"), learnerRole: "Patient",
    lines: [L("Receptionist", "Good morning, Green Street Clinic."), L("Patient", "Hello, I'd like to make an appointment with a doctor."), L("Receptionist", "What seems to be the problem?"), L("Patient", "I've had a bad cough for a week."), L("Receptionist", "We have a slot tomorrow at ten thirty. Is that okay?"), L("Patient", "Yes, that's fine. My name is Nadia Perera."), L("Receptionist", "Thank you. Please arrive ten minutes early.")],
    phrases: [{ phrase: "make an appointment", meaning: "book a time to see someone" }, { phrase: "What seems to be the problem?", meaning: "what is wrong?" }, { phrase: "a slot", meaning: "a free time in the diary" }],
    robot: "a clinic receptionist booking appointments (practice only)", opener: "Good morning, Green Street Clinic. How can I help you?",
  },
  {
    id: "hair-salon", n: 20, title: "At the Hair Salon", emoji: "💇", level: "Beginner",
    scene: sc(pink, "#9d174d", "💇", "🧑", "💇‍♂️", "✂️"), learnerRole: "Customer",
    lines: [L("Stylist", "Hi! What would you like today?"), L("Customer", "Just a trim, please. Not too short."), L("Stylist", "Sure. About two centimetres off?"), L("Customer", "Yes, that's perfect."), L("Stylist", "Would you like me to wash it first?"), L("Customer", "Yes, please."), L("Stylist", "Great. Have a seat over here.")],
    phrases: [{ phrase: "a trim", meaning: "a small haircut" }, { phrase: "Not too short.", meaning: "please don't cut too much" }, { phrase: "Have a seat.", meaning: "please sit down" }],
    robot: "a friendly hairdresser", opener: "Hi, welcome! What would you like done with your hair today?",
  },
  {
    id: "movies", n: 21, title: "Talking About Movies", emoji: "🎬", level: "Intermediate",
    scene: sc(["#1e1b4b", "#4338ca"], "#312e81", "🎬", "🧑", "👩", "🍿"), learnerRole: "Ben",
    lines: [L("Amy", "Have you seen any good movies lately?"), L("Ben", "Yes! I watched a great thriller last night."), L("Amy", "What was it about?"), L("Ben", "A detective who tries to solve a mystery on a train."), L("Amy", "Sounds exciting. Would you recommend it?"), L("Ben", "Definitely. The ending was a big surprise."), L("Amy", "Don't tell me! I want to watch it.")],
    phrases: [{ phrase: "lately", meaning: "recently" }, { phrase: "What was it about?", meaning: "what is the story?" }, { phrase: "Don't tell me!", meaning: "don't say the ending (no spoilers)" }],
    robot: "a friend who loves movies and series", opener: "Have you watched any good movies or series recently?",
  },
  {
    id: "borrowing", n: 22, title: "Borrowing Something", emoji: "🔌", level: "Beginner",
    scene: sc(violet, "#6d28d9", "🔌", "🧑", "👩", "📱"), learnerRole: "Raj",
    lines: [L("Raj", "Can I borrow your phone charger, please?"), L("Ella", "Sure. Is your battery low?"), L("Raj", "Yes, it's almost dead."), L("Ella", "Here you are. I need it back before I leave."), L("Raj", "No problem. I'll give it back in an hour."), L("Ella", "Okay, that's fine.")],
    phrases: [{ phrase: "Can I borrow…?", meaning: "can I use your thing and give it back?" }, { phrase: "almost dead", meaning: "the battery is nearly empty" }, { phrase: "give it back", meaning: "return it" }],
    robot: "a classmate or colleague the learner wants to borrow something from", opener: "Hi! You look like you need something. What's up?",
  },
  {
    id: "birthday", n: 23, title: "Birthday Wishes", emoji: "🎂", level: "Beginner",
    scene: sc(pink, "#be185d", "🎂", "🥳", "🧑", "🎁"), learnerRole: "Hana",
    lines: [L("Hana", "Happy birthday, Josh! Many happy returns!"), L("Josh", "Thank you so much, Hana!"), L("Hana", "I got you a small gift. I hope you like it."), L("Josh", "You shouldn't have! Can I open it now?"), L("Hana", "Of course!"), L("Josh", "Wow, a book by my favourite author! Thank you!"), L("Hana", "You're welcome. Have a wonderful day!")],
    phrases: [{ phrase: "Many happy returns!", meaning: "a birthday wish (British)" }, { phrase: "You shouldn't have!", meaning: "a polite thank you for a gift" }, { phrase: "Have a wonderful day!", meaning: "a warm wish" }],
    robot: "a friend celebrating the learner's birthday", opener: "Happy birthday! 🎉 How are you going to celebrate today?",
  },
  {
    id: "time-date", n: 24, title: "Asking the Time & Date", emoji: "⏰", level: "Beginner",
    scene: sc(warm, "#a16207", "⏰", "🧑", "👨", "📅"), learnerRole: "Visitor",
    lines: [L("Visitor", "Excuse me, do you know what time it is?"), L("Man", "It's quarter past three."), L("Visitor", "Thanks. And what's the date today?"), L("Man", "It's the twelfth of June."), L("Visitor", "Oh, my train is at half past three. I must hurry!"), L("Man", "The station is close. You'll make it."), L("Visitor", "Thank you, have a nice day!")],
    phrases: [{ phrase: "quarter past three", meaning: "3:15" }, { phrase: "half past three", meaning: "3:30" }, { phrase: "You'll make it.", meaning: "you will arrive in time" }],
    robot: "a person in the street answering questions about time and dates", opener: "Hi! Do you need something? I have a minute.",
  },
  {
    id: "holidays", n: 25, title: "Talking About Holidays", emoji: "🏖️", level: "Intermediate",
    scene: sc(["#67e8f9", "#ecfeff"], "#0891b2", "🏖️", "🧑", "👩", "🌴", "✈️"), learnerRole: "Mila",
    lines: [L("Chris", "Where did you go on holiday?"), L("Mila", "I went to the Maldives with my family."), L("Chris", "Lucky you! What was it like?"), L("Mila", "Amazing. The water was so clear, and we went snorkelling every day."), L("Chris", "I've always wanted to go there."), L("Mila", "You should! It's worth every penny."), L("Chris", "Maybe next year. I'm saving up.")],
    phrases: [{ phrase: "What was it like?", meaning: "describe it to me" }, { phrase: "worth every penny", meaning: "very good, not a waste of money" }, { phrase: "saving up", meaning: "keeping money for something" }],
    robot: "a friend talking about holidays and travel dreams", opener: "I need a holiday! Where is the best place you have ever visited?",
  },
  {
    id: "online-shopping", n: 26, title: "An Online Shopping Problem", emoji: "📦", level: "Intermediate",
    scene: sc(cool, "#0369a1", "📦", "😕", "🎧", "💻"), learnerRole: "Customer",
    lines: [L("Agent", "Thank you for calling. How can I help?"), L("Customer", "I ordered a pair of shoes, but I received the wrong size."), L("Agent", "I'm sorry about that. Can I have your order number?"), L("Customer", "Yes, it's four five two eight one."), L("Agent", "Thank you. Would you like an exchange or a refund?"), L("Customer", "An exchange, please. I need size forty two."), L("Agent", "No problem. We'll send a courier to collect them tomorrow.")],
    phrases: [{ phrase: "the wrong size", meaning: "not the size you ordered" }, { phrase: "an exchange or a refund", meaning: "a new item, or your money back" }, { phrase: "courier", meaning: "a delivery person" }],
    robot: "an online shop customer service agent", opener: "Thank you for calling ShopNow customer service. How can I help you today?",
  },
  {
    id: "post-office", n: 27, title: "At the Post Office", emoji: "📮", level: "Beginner",
    scene: sc(["#fecaca", "#fff1f2"], "#991b1b", "📮", "🧑", "👨‍💼", "✉️"), learnerRole: "Customer",
    lines: [L("Customer", "Hello, I'd like to send this parcel to Australia."), L("Clerk", "Sure. Please put it on the scale."), L("Customer", "How much will it cost?"), L("Clerk", "By air it's thirty dollars. By sea it's twelve."), L("Customer", "How long does it take by sea?"), L("Clerk", "About six weeks."), L("Customer", "I'll send it by air, please.")],
    phrases: [{ phrase: "parcel", meaning: "a package you send" }, { phrase: "by air / by sea", meaning: "on a plane / on a ship" }, { phrase: "How long does it take?", meaning: "how much time?" }],
    robot: "a post office clerk", opener: "Next, please! Hello, what are you sending today?",
  },
  {
    id: "health-exercise", n: 28, title: "Health & Exercise", emoji: "🏃", level: "Intermediate",
    scene: sc(green, "#15803d", "🏃", "🧑", "👩", "🥗", "💪"), learnerRole: "Nethmi",
    lines: [L("Coach", "How often do you exercise?"), L("Nethmi", "Not very often. Maybe once a week."), L("Coach", "Try to walk for thirty minutes every day. It really helps."), L("Nethmi", "I'll try. I also want to eat more healthily."), L("Coach", "Good idea. More vegetables and less sugar."), L("Nethmi", "That's hard, because I love chocolate!"), L("Coach", "A little is fine. It's all about balance.")],
    phrases: [{ phrase: "How often…?", meaning: "how many times?" }, { phrase: "eat healthily", meaning: "eat good food for your body" }, { phrase: "It's all about balance.", meaning: "not too much, not too little" }],
    robot: "a friendly fitness coach", opener: "Hi! Let's talk about health. How do you usually stay active?",
  },
  {
    id: "saying-goodbye", n: 29, title: "Saying Goodbye", emoji: "🫂", level: "Beginner",
    scene: sc(["#fdba74", "#fff7ed"], "#9a3412", "🌅", "🧑", "👩", "🧳"), learnerRole: "Isuru",
    lines: [L("Isuru", "Well, I should get going. It's getting late."), L("Clara", "Already? It was so nice to see you."), L("Isuru", "You too. Let's catch up again soon."), L("Clara", "Definitely. Text me when you get home."), L("Isuru", "I will. Take care!"), L("Clara", "Bye! Safe journey!")],
    phrases: [{ phrase: "I should get going.", meaning: "I need to leave now" }, { phrase: "catch up", meaning: "meet and talk about news" }, { phrase: "Take care!", meaning: "a warm goodbye" }],
    robot: "a friend at the end of a visit", opener: "It's been a lovely evening! Do you have to leave soon?",
  },
  {
    id: "job-interview", n: 30, title: "Job Interview Basics", emoji: "🤝", level: "Intermediate",
    scene: sc(violet, "#334155", "🏢", "🧑‍💼", "👩‍💼", "📄"), learnerRole: "Candidate",
    lines: [L("Interviewer", "Thank you for coming. Can you tell me a little about yourself?"), L("Candidate", "Of course. I studied business and I have two years of experience in sales."), L("Interviewer", "Why do you want to work for our company?"), L("Candidate", "I like your products, and I want to grow in a team like yours."), L("Interviewer", "What is your biggest strength?"), L("Candidate", "I'm a good communicator, and I work well under pressure."), L("Interviewer", "Great. Do you have any questions for us?")],
    phrases: [{ phrase: "Tell me about yourself.", meaning: "a common first interview question" }, { phrase: "experience in…", meaning: "time you have worked in…" }, { phrase: "work well under pressure", meaning: "do good work when it is busy or stressful" }],
    robot: "a friendly job interviewer (practice interview)", opener: "Good morning, please take a seat. Can you tell me a little about yourself?",
  },
];

export const FREE_DAILY = 5;
