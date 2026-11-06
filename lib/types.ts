export type Sport = "cricket" | "football" | "rugby" | "tennis";

export type SportAction =
  | "start"
  | "bowl"
  | "hit"
  | "four"
  | "six"
  | "wicket"
  | "pass"
  | "run"
  | "shot"
  | "goal"
  | "save"
  | "tackle"
  | "try"
  | "kick"
  | "serve"
  | "ace"
  | "rally"
  | "point"
  | "cheer";

export type Line = { speaker: string; text: string; action?: SportAction };

export type Vocab = { word: string; emoji: string; meaning: string };

export type Question = { q: string; options: string[]; answer: number };

export type SceneItem = { e: string; x: number; y: number; s?: number };

export type Scene = { sky: [string, string]; ground: string; items: SceneItem[] };

export type Level = "Beginner" | "Intermediate";

export type UnitId = "airport" | "hotel" | "city" | "sports";

export type Lesson = {
  id: string;
  chapter: number;
  unit: UnitId;
  title: string;
  subtitle: string;
  emoji: string;
  level: Level;
  scene: Scene;
  sport?: Sport;
  /** The speaker the learner plays in role-play mode. */
  learnerRole: string;
  lines: Line[];
  vocab: Vocab[];
  quiz: Question[];
  /** YouTube search phrase for real videos on this topic. */
  watch: string;
  /** Who the robot plays in chat, e.g. "a hotel receptionist". */
  robot: string;
  /** The robot's first chat message. */
  opener: string;
};

export type VideoCategory = "motivation" | "travel" | "sports" | "daily" | "music" | "pte" | "general";

export type Video = {
  id: string;
  title: string;
  /** YouTube video ID, or empty when `fileUrl` is used. */
  youtubeId: string;
  /** Direct .mp4 link (your own video), used when there is no YouTube ID. */
  fileUrl: string;
  category: VideoCategory;
  /** Show this video inside a chapter's Watch tab. */
  chapterId: string;
  /** Timed subtitles for karaoke highlighting (seconds). */
  subtitles: { start: number; text: string }[];
};

export type SongLine = { text: string };

export type Song = {
  id: string;
  title: string;
  emoji: string;
  mood: string;
  bpm: number;
  /** One chord (root note frequencies, Hz) per bar, cycled. */
  chords: number[][];
  scene: Scene;
  lines: SongLine[];
  vocab: Vocab[];
};
