import { SessionGrid } from "@/components/Sessions";
import { TwisterBrowser } from "@/components/Twisters";
import { allTwisters } from "@/lib/twisters";

export const metadata = { title: "Tongue Twisters · English Practice" };

export default function TwistersPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold">👅 Tongue Twister Karaoke</h1>
        <p className="opacity-70">
          {allTwisters.length} tongue twisters. The words light up as they are spoken at 3 speeds: slow, normal and fast. Then it&apos;s your turn: say it into
          the mic and get a score and a words-per-second speed.
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">🎤 Karaoke sessions</h2>
        <SessionGrid kind="twisters" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">📚 Practise by sound</h2>
        <TwisterBrowser />
      </section>
    </div>
  );
}
