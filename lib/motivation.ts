/** Original motivational speeches (written for this app) for karaoke and speaking practice. */
export type Speech = {
  id: string;
  n: number;
  title: string;
  emoji: string;
  speaker: string;
  /** One sentence per item. */
  sentences: string[];
  /** The strongest lines, used for "speak like a speaker" practice. */
  keyLines: string[];
  photo: string;
};

export const speeches: Speech[] = [
  {
    id: "mistakes-are-teachers", n: 1, title: "Mistakes Are Teachers", emoji: "✏️", speaker: "Coach Maya", photo: "woman motivational speaker stage",
    sentences: [
      "Let me tell you a secret about every great English speaker.",
      "They made thousands of mistakes before they sounded confident.",
      "Every wrong word was a small teacher.",
      "Every strange look from a listener was a free lesson.",
      "If you are afraid of mistakes, you are afraid of learning.",
      "So today, I want you to make a new promise.",
      "Make mistakes loudly, learn from them quickly, and never stop speaking.",
      "Your mistakes are not your enemy. Silence is.",
    ],
    keyLines: ["Every wrong word was a small teacher.", "Your mistakes are not your enemy. Silence is."],
  },
  {
    id: "one-percent-better", n: 2, title: "One Percent Better", emoji: "📈", speaker: "Mr Daniel", photo: "person climbing stairs sunrise",
    sentences: [
      "You don't need to be perfect tomorrow.",
      "You only need to be one percent better than today.",
      "One new word. One new sentence. One short conversation.",
      "It seems small, almost nothing.",
      "But one percent every day for a year makes you more than thirty times better.",
      "Small steps are not slow. Small steps are how mountains are climbed.",
      "So open your app, practise for fifteen minutes, and be proud of that.",
      "Tomorrow, do it again.",
    ],
    keyLines: ["You only need to be one percent better than today.", "Small steps are how mountains are climbed."],
  },
  {
    id: "your-accent-is-your-story", n: 3, title: "Your Accent Is Your Story", emoji: "🌍", speaker: "Ms Priya", photo: "diverse group people talking smiling",
    sentences: [
      "Some people try very hard to hide their accent.",
      "But your accent is not a problem. It is your story.",
      "It tells the world where you come from and how far you have travelled.",
      "The goal of English is not to sound like someone else.",
      "The goal is to be understood and to understand others.",
      "Speak clearly, speak slowly when you need to, and speak with pride.",
      "The world does not need another copy. The world needs your voice.",
    ],
    keyLines: ["Your accent is not a problem. It is your story.", "The world needs your voice."],
  },
  {
    id: "the-courage-to-start", n: 4, title: "The Courage to Start", emoji: "🚀", speaker: "Captain Leo", photo: "runner starting line",
    sentences: [
      "The hardest part of any journey is the first step.",
      "Many people wait for the perfect moment to start learning.",
      "They wait for more time, more money, or more confidence.",
      "But the perfect moment never comes.",
      "Confidence does not come before action. It comes after action.",
      "So don't wait to feel ready.",
      "Start today, start small, and start now.",
      "Your future self is already thanking you.",
    ],
    keyLines: ["Confidence does not come before action. It comes after action.", "Start today, start small, and start now."],
  },
  {
    id: "dream-big-work-hard", n: 5, title: "Dream Big, Work Hard", emoji: "🌟", speaker: "Dr Nadia", photo: "graduation celebration students",
    sentences: [
      "I grew up in a small village with no library and no internet.",
      "But I had a big dream: to study medicine in another country.",
      "People told me my English was not good enough.",
      "So I read one English page every night by candlelight.",
      "I failed my first exam, and I cried.",
      "Then I wiped my tears and studied harder.",
      "Today I am a doctor, and I speak English every day at work.",
      "Your dream is possible. But it needs your hard work every single day.",
    ],
    keyLines: ["Your dream is possible.", "It needs your hard work every single day."],
  },
  {
    id: "speak-up", n: 6, title: "Speak Up", emoji: "📣", speaker: "Coach Sam", photo: "young man speaking microphone confident",
    sentences: [
      "How many times have you had a good idea but stayed quiet?",
      "You thought, what if my English is wrong?",
      "What if people laugh at me?",
      "Here is the truth: most people are too busy thinking about themselves to laugh at you.",
      "And the ones who matter will respect you for trying.",
      "Your ideas deserve to be heard.",
      "Next time, take a deep breath, raise your hand, and speak up.",
    ],
    keyLines: ["Your ideas deserve to be heard.", "Take a deep breath, raise your hand, and speak up."],
  },
  {
    id: "discipline-beats-motivation", n: 7, title: "Discipline Beats Motivation", emoji: "⏰", speaker: "Mr Kumar", photo: "alarm clock morning routine",
    sentences: [
      "Motivation is like the weather. Some days it is sunny, some days it rains.",
      "If you only practise when you feel motivated, you will not practise very often.",
      "Discipline is different. Discipline is a promise you keep to yourself.",
      "Choose a time. Choose a place. Practise there every day.",
      "Even when you are tired. Especially when you are tired.",
      "One day you will look back and be amazed at how far you have come.",
      "Motivation gets you started. Discipline keeps you going.",
    ],
    keyLines: ["Discipline is a promise you keep to yourself.", "Motivation gets you started. Discipline keeps you going."],
  },
  {
    id: "fall-seven-times", n: 8, title: "Fall Seven Times, Stand Up Eight", emoji: "🧗", speaker: "Ms Grace", photo: "mountain climber summit success",
    sentences: [
      "Everyone falls. The strongest people are not the ones who never fall.",
      "They are the ones who stand up again.",
      "Maybe you failed an exam. Maybe a conversation went badly.",
      "Maybe you felt embarrassed when someone corrected you.",
      "That's okay. Feel it, learn from it, and then stand up.",
      "Fall seven times, stand up eight.",
      "Every time you stand up, you become stronger than before.",
    ],
    keyLines: ["Fall seven times, stand up eight.", "Every time you stand up, you become stronger than before."],
  },
  {
    id: "the-power-of-thank-you", n: 9, title: "The Power of Thank You", emoji: "🙏", speaker: "Grandma Rose", photo: "elderly woman smiling kindness",
    sentences: [
      "Two small words can change a whole day: thank you.",
      "Thank the bus driver. Thank the waiter. Thank your teacher.",
      "Thank yourself for showing up and trying again.",
      "Gratitude makes people smile, and smiles make conversations easier.",
      "When you are thankful, you notice how much you already have.",
      "And when you notice what you have, fear becomes smaller.",
      "So today, say thank you at least ten times, and mean it every time.",
    ],
    keyLines: ["Two small words can change a whole day: thank you.", "Say thank you, and mean it every time."],
  },
  {
    id: "you-are-ready", n: 10, title: "You Are Ready", emoji: "🏆", speaker: "Coach Maya", photo: "confident woman city skyline",
    sentences: [
      "Look at how far you have come.",
      "You have listened, repeated, practised and tried again.",
      "You have spoken to a robot, to friends, and to yourself in the mirror.",
      "Now it is time to speak to the world.",
      "Order your coffee in English. Ask for directions. Say hello to a stranger.",
      "You will not be perfect, and you don't need to be.",
      "You are ready, because you decided to be ready.",
      "Now go out there and speak.",
    ],
    keyLines: ["Now it is time to speak to the world.", "You are ready, because you decided to be ready."],
  },
];
