import { airport } from "./chapters/airport";
import { hotel } from "./chapters/hotel";
import { city } from "./chapters/city";
import { sports } from "./chapters/sports";
import type { Lesson, Song, UnitId } from "./types";

export const chapters: Lesson[] = [...airport, ...hotel, ...city, ...sports].sort(
  (a, b) => a.chapter - b.chapter,
);

export const units: { id: UnitId; title: string; emoji: string; color: string; blurb: string }[] = [
  { id: "airport", title: "Airport & Flying", emoji: "✈️", color: "from-sky-500 to-blue-600", blurb: "Book, check in, board and land" },
  { id: "hotel", title: "Hotel Life", emoji: "🏨", color: "from-amber-500 to-orange-600", blurb: "Check in, complain, order, check out" },
  { id: "city", title: "Around the City", emoji: "🏙️", color: "from-emerald-500 to-teal-600", blurb: "Taxis, food, shops and help" },
  { id: "sports", title: "Sports Commentary", emoji: "🏏", color: "from-fuchsia-500 to-purple-600", blurb: "Cricket, football, rugby, tennis" },
];

export function getChapter(id: string) {
  return chapters.find((c) => c.id === id);
}

// Chords as triads (Hz). One chord per bar.
const C = [261.63, 329.63, 392.0];
const G = [196.0, 246.94, 293.66];
const Am = [220.0, 261.63, 329.63];
const F = [174.61, 220.0, 261.63];
const D = [293.66, 369.99, 440.0];
const Em = [164.81, 196.0, 246.94];

export const songs: Song[] = [
  {
    id: "pack-my-bags",
    title: "Pack My Bags",
    emoji: "🧳",
    mood: "Happy travel pop",
    bpm: 104,
    chords: [C, G, Am, F],
    scene: {
      sky: ["#38bdf8", "#e0f2fe"],
      ground: "#0ea5e9",
      items: [
        { e: "🧳", x: 25, y: 60, s: 5 },
        { e: "✈️", x: 70, y: 20, s: 5 },
        { e: "☀️", x: 12, y: 15, s: 4 },
        { e: "🎶", x: 50, y: 40, s: 3 },
      ],
    },
    lines: [
      { text: "I pack my bags and lock the door" },
      { text: "I've never been this far before" },
      { text: "My passport's ready in my hand" },
      { text: "I'm flying to a brand new land" },
      { text: "Check in, check in, find my seat" },
      { text: "Window view, it's such a treat" },
      { text: "Fasten up, we're off the ground" },
      { text: "Hello world, I'm heaven bound" },
      { text: "Pack my bags, pack my bags" },
      { text: "Every road has something new" },
      { text: "Pack my bags, pack my bags" },
      { text: "I'm learning English as I do" },
    ],
    vocab: [
      { word: "pack", emoji: "🎒", meaning: "to put things into a bag" },
      { word: "brand new", emoji: "✨", meaning: "completely new" },
      { word: "a treat", emoji: "🍬", meaning: "something special and nice" },
      { word: "off the ground", emoji: "🛫", meaning: "flying, in the air" },
    ],
  },
  {
    id: "room-two-oh-four",
    title: "Room 204",
    emoji: "🛎️",
    mood: "Chill hotel groove",
    bpm: 92,
    chords: [Am, F, C, G],
    scene: {
      sky: ["#a78bfa", "#ede9fe"],
      ground: "#7c3aed",
      items: [
        { e: "🏨", x: 50, y: 25, s: 6 },
        { e: "🛎️", x: 25, y: 62, s: 3 },
        { e: "🔑", x: 75, y: 62, s: 3 },
        { e: "🌙", x: 85, y: 12, s: 3 },
      ],
    },
    lines: [
      { text: "Good evening, welcome, how was your day" },
      { text: "Do you have a booking, may I say" },
      { text: "Your key card's here, the lift is on the left" },
      { text: "Breakfast at seven, that's the best" },
      { text: "Room two oh four, room two oh four" },
      { text: "Quiet and cosy, behind the door" },
      { text: "If the shower's cold, just call the desk" },
      { text: "We'll fix it fast, you get some rest" },
      { text: "Room two oh four, room two oh four" },
      { text: "I can't wait to come back for more" },
    ],
    vocab: [
      { word: "booking", emoji: "📒", meaning: "a reservation" },
      { word: "cosy", emoji: "🛋️", meaning: "warm and comfortable" },
      { word: "the desk", emoji: "🛎️", meaning: "hotel reception" },
      { word: "rest", emoji: "😴", meaning: "relax or sleep" },
    ],
  },
  {
    id: "hit-it-for-six",
    title: "Hit It for Six",
    emoji: "🏏",
    mood: "Stadium rock",
    bpm: 120,
    chords: [D, G, Em, G],
    scene: {
      sky: ["#1e3a8a", "#60a5fa"],
      ground: "#16a34a",
      items: [
        { e: "🏟️", x: 50, y: 22, s: 6 },
        { e: "🏏", x: 30, y: 62, s: 4 },
        { e: "💥", x: 72, y: 35, s: 4 },
        { e: "🙌", x: 80, y: 62, s: 3 },
      ],
    },
    lines: [
      { text: "The bowler's running, here he comes" },
      { text: "The crowd is beating on their drums" },
      { text: "I see the ball, I watch it spin" },
      { text: "I swing my bat, I'm gonna win" },
      { text: "Hit it for six, into the sky" },
      { text: "Watch that ball go flying high" },
      { text: "Hit it for six, the stadium roars" },
      { text: "Six more runs and the scoreboard soars" },
      { text: "Last ball, four to win the game" },
      { text: "Tonight they're going to shout my name" },
    ],
    vocab: [
      { word: "spin", emoji: "🌀", meaning: "to turn round and round" },
      { word: "swing", emoji: "🏏", meaning: "to move the bat in a curve" },
      { word: "roars", emoji: "🦁", meaning: "makes a very loud noise" },
      { word: "soars", emoji: "🚀", meaning: "goes up high and fast" },
    ],
  },
  {
    id: "good-morning-world",
    title: "Good Morning, World",
    emoji: "🌅",
    mood: "Gentle morning song",
    bpm: 84,
    chords: [G, D, Em, C],
    scene: {
      sky: ["#fdba74", "#fef3c7"],
      ground: "#65a30d",
      items: [
        { e: "🌅", x: 50, y: 28, s: 6 },
        { e: "🐦", x: 20, y: 20, s: 3 },
        { e: "🌻", x: 25, y: 64, s: 4 },
        { e: "☕", x: 75, y: 64, s: 3 },
      ],
    },
    lines: [
      { text: "Good morning world, the sun is high" },
      { text: "A cup of tea, a bright blue sky" },
      { text: "I say hello to everyone" },
      { text: "A brand new day has just begun" },
      { text: "How are you, I'm fine, thank you" },
      { text: "Nice to meet you, me too, me too" },
      { text: "Step by step and word by word" },
      { text: "My English voice is being heard" },
    ],
    vocab: [
      { word: "begun", emoji: "🏁", meaning: "started (begin, began, begun)" },
      { word: "bright", emoji: "☀️", meaning: "full of light" },
      { word: "step by step", emoji: "👣", meaning: "slowly, one part at a time" },
      { word: "heard", emoji: "👂", meaning: "listened to (hear, heard)" },
    ],
  },
  {
    id: "left-right-straight",
    title: "Left, Right, Straight Ahead",
    emoji: "🧭",
    mood: "Bouncy directions song",
    bpm: 112,
    chords: [C, F, G, C],
    scene: {
      sky: ["#86efac", "#f0fdf4"],
      ground: "#4d7c0f",
      items: [
        { e: "🧭", x: 50, y: 25, s: 5 },
        { e: "⬅️", x: 20, y: 60, s: 3 },
        { e: "⬆️", x: 50, y: 62, s: 3 },
        { e: "➡️", x: 80, y: 60, s: 3 },
      ],
    },
    lines: [
      { text: "Excuse me please, I'm lost in town" },
      { text: "I need the station, up or down" },
      { text: "Go straight ahead, then turn to the left" },
      { text: "Walk past the bank, it's on your right" },
      { text: "Left, right, straight ahead" },
      { text: "Next to the bakery selling bread" },
      { text: "Left, right, straight ahead" },
      { text: "Thank you so much for what you said" },
      { text: "Is it far, or is it near" },
      { text: "Five minutes walking from right here" },
    ],
    vocab: [
      { word: "lost", emoji: "😕", meaning: "you do not know where you are" },
      { word: "straight ahead", emoji: "⬆️", meaning: "forward, without turning" },
      { word: "past", emoji: "🚶", meaning: "going by something" },
      { word: "bakery", emoji: "🥖", meaning: "a shop that sells bread and cakes" },
    ],
  },
  {
    id: "table-for-two",
    title: "Table for Two",
    emoji: "🍽️",
    mood: "Jazzy restaurant swing",
    bpm: 96,
    chords: [F, Am, D, G],
    scene: {
      sky: ["#fca5a5", "#fff1f2"],
      ground: "#9f1239",
      items: [
        { e: "🍽️", x: 50, y: 60, s: 4 },
        { e: "🕯️", x: 35, y: 58, s: 3 },
        { e: "🍝", x: 65, y: 58, s: 3 },
        { e: "🎷", x: 18, y: 25, s: 4 },
      ],
    },
    lines: [
      { text: "A table for two, by the window please" },
      { text: "Can I see the menu, I'd like some cheese" },
      { text: "What do you recommend tonight" },
      { text: "The fish is fresh, the soup is light" },
      { text: "Is it spicy, just a bit" },
      { text: "I'll have the pasta, that's it" },
      { text: "Could we have the bill, it was delicious" },
      { text: "Thank you, waiter, you were so kind to us" },
    ],
    vocab: [
      { word: "menu", emoji: "📜", meaning: "the list of food in a restaurant" },
      { word: "recommend", emoji: "👍", meaning: "to say something is good to try" },
      { word: "fresh", emoji: "🐟", meaning: "new, not old" },
      { word: "the bill", emoji: "🧾", meaning: "the paper that says how much to pay" },
    ],
  },
  {
    id: "goal-goal-goal",
    title: "Goal! Goal! Goal!",
    emoji: "⚽",
    mood: "Football chant anthem",
    bpm: 126,
    chords: [G, C, D, G],
    scene: {
      sky: ["#1e3a8a", "#60a5fa"],
      ground: "#16a34a",
      items: [
        { e: "🏟️", x: 50, y: 22, s: 6 },
        { e: "⚽", x: 40, y: 60, s: 3 },
        { e: "🥅", x: 78, y: 58, s: 4 },
        { e: "📣", x: 15, y: 60, s: 3 },
      ],
    },
    lines: [
      { text: "The whistle blows, the game is on" },
      { text: "We pass the ball and run along" },
      { text: "The striker shoots, the keeper dives" },
      { text: "The stadium comes alive" },
      { text: "Goal, goal, goal, in the back of the net" },
      { text: "That's the best one yet" },
      { text: "Goal, goal, goal, hear the people sing" },
      { text: "Football is the thing" },
      { text: "Final whistle, two to one" },
      { text: "We play as a team and we have won" },
    ],
    vocab: [
      { word: "whistle", emoji: "📯", meaning: "a small thing you blow to make a high sound" },
      { word: "striker", emoji: "⚽", meaning: "a player who scores goals" },
      { word: "keeper", emoji: "🧤", meaning: "the goalkeeper" },
      { word: "comes alive", emoji: "🎉", meaning: "becomes full of energy" },
    ],
  },
  {
    id: "seven-days",
    title: "Seven Days",
    emoji: "📅",
    mood: "Easy daily routine song",
    bpm: 100,
    chords: [C, Am, F, G],
    scene: {
      sky: ["#fde68a", "#fffbeb"],
      ground: "#ca8a04",
      items: [
        { e: "📅", x: 50, y: 25, s: 5 },
        { e: "⏰", x: 20, y: 60, s: 3 },
        { e: "🚌", x: 50, y: 62, s: 3 },
        { e: "🛌", x: 80, y: 62, s: 3 },
      ],
    },
    lines: [
      { text: "On Monday morning I wake at six" },
      { text: "On Tuesday I go to the gym and get fit" },
      { text: "On Wednesday I study, I read and write" },
      { text: "On Thursday I cook a curry at night" },
      { text: "On Friday I meet my friends in town" },
      { text: "On Saturday I watch the cricket go down" },
      { text: "On Sunday I rest and call my mum" },
      { text: "Seven days, and the week is done" },
    ],
    vocab: [
      { word: "wake", emoji: "⏰", meaning: "to stop sleeping" },
      { word: "get fit", emoji: "💪", meaning: "to become strong and healthy" },
      { word: "in town", emoji: "🏙️", meaning: "in the city centre" },
      { word: "rest", emoji: "😌", meaning: "to relax" },
    ],
  },
];

export function getSong(id: string) {
  return songs.find((s) => s.id === id);
}
