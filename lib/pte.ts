import type { Scene } from "./types";

export const readAloud: string[] = [
  "Public libraries have changed a great deal in recent years. Today, many libraries offer free internet access, language classes and community events, as well as books.",
  "Regular exercise improves both physical and mental health. Even a short walk every day can reduce stress, help people sleep better and increase their energy levels.",
  "Many cities are investing in public transport to reduce traffic and air pollution. Buses and trains that run on electricity are becoming more common around the world.",
  "Learning a second language takes time and practice. Students who listen to music, watch films and speak with native speakers often make faster progress.",
  "The tourism industry provides millions of jobs worldwide. However, too many visitors can damage natural areas, so careful planning is important.",
  "Cricket is one of the most popular sports in South Asia. Millions of fans follow international matches on television and online.",
];

export const repeatSentence: string[] = [
  "The library will be closed on Monday for repairs.",
  "Please submit your assignment before the end of the week.",
  "Most students prefer to study in the morning.",
  "The lecture has been moved to the main hall.",
  "Remember to bring your student card to the exam.",
  "The results will be published on the university website.",
  "Climate change affects every country in the world.",
  "You can borrow up to five books at a time.",
];

export type Chart = { title: string; unit: string; bars: { label: string; value: number }[] };

export type DescribeItem =
  | { kind: "chart"; chart: Chart; keywords: string[] }
  | { kind: "scene"; title: string; scene: Scene; keywords: string[] };

export const describeImage: DescribeItem[] = [
  {
    kind: "chart",
    chart: {
      title: "Number of tourists visiting a city (millions)",
      unit: "m",
      bars: [
        { label: "2020", value: 1.2 },
        { label: "2021", value: 1.8 },
        { label: "2022", value: 3.1 },
        { label: "2023", value: 4.0 },
        { label: "2024", value: 4.6 },
      ],
    },
    keywords: ["chart", "tourists", "increase", "highest", "lowest", "2024", "2020", "million"],
  },
  {
    kind: "scene",
    title: "A busy airport",
    scene: {
      sky: ["#7dd3fc", "#e0f2fe"],
      ground: "#94a3b8",
      items: [
        { e: "✈️", x: 70, y: 18, s: 5 },
        { e: "🧳", x: 30, y: 66, s: 3 },
        { e: "🧍", x: 22, y: 58, s: 4.5 },
        { e: "👩‍✈️", x: 60, y: 58, s: 4.5 },
        { e: "🛄", x: 45, y: 35, s: 3 },
      ],
    },
    keywords: ["picture", "airport", "plane", "passenger", "suitcase", "people", "waiting"],
  },
  {
    kind: "chart",
    chart: {
      title: "Favourite sport of students (%)",
      unit: "%",
      bars: [
        { label: "Cricket", value: 38 },
        { label: "Football", value: 30 },
        { label: "Rugby", value: 12 },
        { label: "Tennis", value: 20 },
      ],
    },
    keywords: ["chart", "students", "cricket", "most", "popular", "least", "rugby", "percent"],
  },
  {
    kind: "scene",
    title: "A hotel reception",
    scene: {
      sky: ["#fcd34d", "#fef9c3"],
      ground: "#b45309",
      items: [
        { e: "🏨", x: 50, y: 22, s: 5 },
        { e: "💁", x: 70, y: 56, s: 4.5 },
        { e: "🧑", x: 30, y: 58, s: 4.5 },
        { e: "🔑", x: 52, y: 64, s: 2.5 },
        { e: "🛎️", x: 60, y: 66, s: 2.5 },
      ],
    },
    keywords: ["picture", "hotel", "receptionist", "guest", "key", "checking", "desk"],
  },
];

export const shortQuestions: { q: string; answers: string[] }[] = [
  { q: "What do we call a person who flies a plane?", answers: ["pilot", "a pilot"] },
  { q: "How many days are there in a week?", answers: ["seven", "7"] },
  { q: "What do you use to unlock a door?", answers: ["key", "a key"] },
  { q: "In cricket, how many balls are there in one over?", answers: ["six", "6"] },
  { q: "What is the opposite of 'arrival'?", answers: ["departure"] },
  { q: "Which season comes after winter?", answers: ["spring"] },
  { q: "What do we call a book of words and their meanings?", answers: ["dictionary", "a dictionary"] },
  { q: "Where do you go to catch a train?", answers: ["station", "train station", "the station", "railway station"] },
];

export const writeFromDictation: string[] = [
  "Students must register for the course online.",
  "The museum offers free entry on Sundays.",
  "Research shows that sleep improves memory.",
  "The new timetable starts next semester.",
  "All flights have been delayed due to bad weather.",
  "Assignments should be submitted electronically.",
];

/** Audio says `spoken`; the transcript shows `shown`. Learner clicks the words that differ. */
export const highlightIncorrect: { spoken: string; shown: string }[] = [
  {
    spoken: "The city council has decided to build a new park near the river, which will open next summer.",
    shown: "The city council has decided to build a new school near the river, which will open next winter.",
  },
  {
    spoken: "Most tourists visit the island in July and August when the weather is warm and sunny.",
    shown: "Most tourists visit the island in June and August when the weather is hot and sunny.",
  },
  {
    spoken: "The professor explained that regular practice is the key to learning a new language quickly.",
    shown: "The professor explained that daily practice is the key to learning a new skill quickly.",
  },
];
