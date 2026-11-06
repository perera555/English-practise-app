import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "User Guide · SpeakUp English" };

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-500 text-white font-black shadow-[0_3px_0_rgba(0,0,0,0.25)]">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="opacity-80 text-[15px]">{children}</div>
      </div>
    </div>
  );
}

function Topic({ id, emoji, title, children }: { id: string; emoji: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="card flex flex-col gap-3 scroll-mt-20">
      <h2 className="text-xl font-extrabold flex items-center gap-2">
        <span className="text-3xl">{emoji}</span> {title}
      </h2>
      {children}
    </section>
  );
}

const TOC = [
  ["start", "🚀", "Getting started"],
  ["chapters", "📚", "Chapters (5 steps)"],
  ["karaoke", "🎤", "Karaoke subtitles"],
  ["speaking", "🗣️", "Speaking & microphone"],
  ["camera", "📹", "See yourself & backgrounds"],
  ["robot", "🤖", "Robot chat & 20-minute talks"],
  ["daily", "☕", "Daily conversation"],
  ["videos", "🎬", "Videos & your own videos"],
  ["more", "🎵", "Music, twisters, listening, PTE"],
  ["premium", "⭐", "Premium & payment"],
  ["offline", "📶", "Using it offline"],
  ["help", "🛠️", "Problems & help"],
] as const;

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <header className="rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 text-white p-6 shadow-xl">
        <p className="text-5xl">📖</p>
        <h1 className="text-3xl font-black mt-1">User Guide</h1>
        <p className="opacity-90">Everything you need to learn English with SpeakUp. Practise 15–20 minutes every day for the best results.</p>
      </header>

      <nav className="card grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TOC.map(([id, e, t]) => (
          <a key={id} href={`#${id}`} className="rounded-xl px-3 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-sm font-semibold">
            {e} {t}
          </a>
        ))}
      </nav>

      <Topic id="start" emoji="🚀" title="Getting started">
        <Step n={0} title="Create your profile">
          Tap <b>👤 Log in</b> (top right). Type your name, then take a selfie 🤳 or choose a picture 🖼️. Your picture shows a <b>green dot</b> when you are online
          and a grey dot when you are offline.
        </Step>
        <Step n={1} title="Choose your level">
          Tap ⚙️ (top right) → <b>My level</b> → Beginner 🌱 or Intermediate 🌳. The robot talks more simply for beginners.
        </Step>
        <Step n={2} title="Choose an accent and speed">
          In ⚙️ pick British, American, Australian or Indian English, and the speaking speed.
        </Step>
        <Step n={3} title="Allow the microphone">
          The first time you press 🎤, your phone asks for permission. Tap <b>Allow</b>.
        </Step>
        <Step n={4} title="Start Chapter 1">
          On <b>📚 Learn</b>, press <b>▶ Start: Chapter 1</b>. Your progress, streak 🔥 and minutes are saved automatically. Going on a trip? Open{" "}
          <Link className="underline" href="/travel">
            ✈️ Travel
          </Link>{" "}
          to practise every step from the airport to the hotel.
        </Step>
      </Topic>

      <Topic id="chapters" emoji="📚" title="Chapters: each one has 5 steps">
        <Step n={1} title="🎬 Watch & Read">Look at the picture or the live match, and press Play. Each word lights up as it is spoken.</Step>
        <Step n={2} title="🖼️ Words">Tap the picture cards to hear new words. Press 🎤 to say each one.</Step>
        <Step n={3} title="🎧 Listening">Listen with the subtitles hidden, answer the questions, then do the dictation (type what you hear).</Step>
        <Step n={4} title="🎤 Speaking">Repeat your lines, role-play the whole conversation, and describe the picture.</Step>
        <Step n={5} title="🤖 Conversation">Talk with the robot in a 20-minute session or a quick chat.</Step>
        <p className="text-sm opacity-70">A ✅ appears on each finished step. Finish all 5 to get a 🏆 on the chapter.</p>
      </Topic>

      <Topic id="karaoke" emoji="🎤" title="Karaoke subtitles">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>
            <b>▶ Play all</b> plays the whole conversation. <b>Tap any line</b> to hear just that line again.
          </li>
          <li>
            <b>🐢 Slow</b> speaks more slowly. <b>🙈 Hide subtitles</b> tests your listening.
          </li>
          <li>
            <b>🎭 Role-play</b>: the robot speaks the other people, and when it is your line, you speak. Green words = correct, red words = try again.
          </li>
        </ul>
      </Topic>

      <Topic id="speaking" emoji="🗣️" title="Speaking & the microphone">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Press 🎤, speak clearly, and stop. You get a score from 0 to 100%.</li>
          <li>Speak in a quiet place, about 20 cm from the phone.</li>
          <li>
            On a computer, use <b>Google Chrome</b> or <b>Microsoft Edge</b>.
          </li>
          <li>
            Try <Link className="underline" href="/speaking">Speaking sessions</Link> and <Link className="underline" href="/twisters">Tongue Twister Karaoke</Link>{" "}
            for extra practice.
          </li>
        </ul>
      </Topic>

      <Topic id="camera" emoji="📹" title="See yourself & real-world backgrounds">
        <Step n={1} title="Open the camera">
          Press <b>📹 See yourself</b> in role-play, robot chat, tongue twisters or describe-the-picture. A small window shows you, like a video call.
        </Step>
        <Step n={2} title="Put yourself in a real place">
          Tap <b>🖼️</b> and choose a background: Airport ✈️, Hotel 🏨, Stadium 🏟️, Café ☕, Beach 🏖️, City 🌃, Blur 🌫️ or a 3D studio ✨. You appear inside that
          place!
        </Step>
        <Step n={3} title="Record and watch yourself">
          Press <b>⏺️</b>, speak, then press <b>⏹️</b>. Watch your clip and <b>💾 save</b> it. Recordings stay on your phone and are never uploaded.
        </Step>
      </Topic>

      <Topic id="robot" emoji="🤖" title="Robot chat & 20-minute sessions">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Speak with 🎤 or type. The robot answers out loud.</li>
          <li>
            If you make a mistake, you see a yellow <b>✏️ Better:</b> line with the correct sentence.
          </li>
          <li>
            A <b>20-minute session</b> has 4 stages: 👋 warm-up → 🎭 role-play → 💬 free talk → 📝 feedback report. Press <b>Finish now</b> to get your feedback early.
          </li>
          <li>
            The smart AI robot is a ⭐ Premium feature. Free users get a simple practice robot.
          </li>
        </ul>
      </Topic>

      <Topic id="daily" emoji="☕" title="Daily conversation">
        <p>
          Every day there is a new <b>Today&apos;s conversation</b>. Each talk has: 🎧 listen &amp; read → 💡 key phrases → 🎭 role-play → 🤖 talk to the robot.
        </p>
      </Topic>

      <Topic id="videos" emoji="🎬" title="Videos & your own videos">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Real videos play with subtitles. Tap a subtitle line to jump there, or press <b>🎤 Practise this line</b>.</li>
          <li>
            <b>📂 Play my own video</b>: open any video file on your phone (MP4 is best) and add its <b>.srt</b> subtitle file for karaoke subtitles. It works
            offline.
          </li>
          <li>Online videos need internet.</li>
        </ul>
      </Topic>

      <Topic id="more" emoji="🎵" title="Music, tongue twisters, listening and PTE">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>
            <b>🎵 Music</b>: sing along. Words light up on the beat. The 🗣️ voice guide sings with you.
          </li>
          <li>
            <b>👅 Twisters</b>: karaoke at 3 speeds (slow → normal → fast), then 🗣️ My turn for a score and your words-per-second.
          </li>
          <li>
            <b>🎧 Listening</b> and <b>🎤 Speaking</b>: 10 guided sessions each, with a score at the end.
          </li>
          <li>
            <b>🎓 PTE</b>: practise the real PTE task types with timers, plus 6 full PTE sessions. Scores are practice estimates, not official scores.
          </li>
        </ul>
      </Topic>

      <Topic id="premium" emoji="⭐" title="Premium & payment">
        <Step n={1} title="What is free">
          Chapters 1–5, 5 daily talks, session 1 of each type, 2 songs, all tongue twisters and the simple robot.
        </Step>
        <Step n={2} title="Subscribe">
          Open <Link className="underline" href="/premium">⭐ Premium</Link> → <b>Subscribe</b>. Pay safely with Google Play or the App Store (card, Google Pay, Apple
          Pay). Everything unlocks immediately.
        </Step>
        <Step n={3} title="Renew or cancel">
          Premium renews automatically. If it ends, tap <b>🔁 Renew Premium</b>. To cancel: Google Play → Payments &amp; subscriptions → Subscriptions, or iPhone
          Settings → your name → Subscriptions.
        </Step>
        <Step n={4} title="New phone?">
          Sign in with the same Google or Apple account and tap <b>🔄 Restore purchases</b>.
        </Step>
        <Step n={5} title="Gift code">
          Type it on the Premium page and press <b>Redeem</b>.
        </Step>
      </Topic>

      <Topic id="offline" emoji="📶" title="Using it offline">
        <p>
          After you open the app once with internet, chapters, daily talks, sessions, songs, tongue twisters and PTE all work <b>without internet</b>. Premium
          keeps working offline until your paid period ends. Online videos, real photos you have not seen yet, and the smart AI robot need internet; offline, the
          app shows drawn pictures and the simple robot instead.
        </p>
      </Topic>

      <Topic id="help" emoji="🛠️" title="Problems & help">
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>
            <b>Microphone doesn&apos;t work</b>: allow the microphone in your phone Settings → Apps → SpeakUp → Permissions. On a computer, use Chrome or Edge.
          </li>
          <li>
            <b>No sound</b>: turn up the volume and turn off silent mode. Try another voice in ⚙️.
          </li>
          <li>
            <b>Camera doesn&apos;t work</b>: allow the camera in your phone settings. Backgrounds need internet the first time.
          </li>
          <li>
            <b>Premium is not showing</b>: open the Premium page and tap <b>🔄 Restore purchases</b> while online.
          </li>
          <li>
            <b>Contact us</b>: email support with the <b>User ID</b> shown at the bottom of the Premium page.{" "}
            <Link className="underline" href="/privacy">
              Privacy policy
            </Link>
            .
          </li>
        </ul>
      </Topic>
    </div>
  );
}
