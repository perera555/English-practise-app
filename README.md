# SpeakUp English 🗣️

An English practice app for Beginner to Intermediate learners, built with Next.js.

## What's inside

- **30 chapters** in 4 units: Airport ✈️, Hotel 🏨, City life 🏙️ and Sports commentary 🏏⚽🏉🎾
- Every chapter is a full session:
  1. **Watch & Read**: a picture scene (or an animated live pitch for sports), with karaoke subtitles that highlight each word as it is spoken
  2. **Words**: vocabulary picture cards with audio and pronunciation check
  3. **Listening**: listen without subtitles, then answer questions and do a dictation
  4. **Speaking**: repeat-after-me scoring, a role-play where you speak one part, and describe-the-picture
  5. **Conversation**: chat with the robot, either a **20-minute session** (warm-up → role-play → free talk → feedback) or a quick chat
- **Listening** and **Speaking** hubs: random dictation, tongue twisters, sound pairs
- **Robot Chat**: an AI partner for all 30 chapter roles plus a general tutor. You can speak or type, and it corrects mistakes ✏️
- **Music Karaoke**: original songs with a built-in backing track and lyrics that light up on the beat
- **PTE Practice**: Read Aloud, Repeat Sentence, Describe Image, Answer Short Question, Write from Dictation and Highlight Incorrect Words, with timers and practice scores (these are not official PTE scores)
- **Settings** (⚙️): your level, accent (UK / US / AU / IN), voice and speed
- **Progress**: completed chapters, day streak and talk minutes, saved in your browser

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 in **Google Chrome or Microsoft Edge**. The microphone features need their speech recognition. Allow microphone access when the browser asks.

## Turn on the smart AI robot

Without a key, the robot runs in a simple offline mode. For full AI conversation powered by Claude:

1. Get an API key from https://console.anthropic.com
2. Create a file called `.env.local` in the project folder:

   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

3. Restart `npm run dev`.

`.env.local` is ignored by git, so your key never goes to GitHub.

## Add more chapters

Chapters live in `lib/chapters/*.ts`. Copy one chapter object, change the text, and give it a new `id` and `chapter` number. The pages are generated automatically.
