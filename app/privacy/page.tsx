export const metadata = { title: "Privacy Policy · SpeakUp English" };

const CONTACT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com";

export default function PrivacyPage() {
  return (
    <article className="card max-w-3xl mx-auto flex flex-col gap-3 leading-relaxed">
      <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
      <p className="text-sm opacity-60">Last updated: November 2026</p>

      <h2 className="text-xl font-bold mt-2">What we collect</h2>
      <ul className="list-disc pl-6">
        <li>
          <b>An anonymous user ID</b> created on your device. It lets us check your Premium subscription. We do not ask for your name.
        </li>
        <li>
          <b>Your learning progress and settings.</b> These are saved on your device only.
        </li>
        <li>
          <b>Messages you send to the AI robot</b> (Premium). These are sent to our server and to our AI provider (Anthropic) to create a reply. We do not use them to
          identify you.
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-2">Microphone</h2>
      <p>
        The app uses your microphone only while you press a speaking button. Your voice is turned into text by your device&apos;s speech service (Google on
        Android, Apple on iPhone, or your browser). We do not record or store audio.
      </p>

      <h2 className="text-xl font-bold mt-2">Camera</h2>
      <p>
        The “See yourself” camera is used only when you open it. Background replacement runs on your device. Video and recordings stay on your device and are
        never uploaded. Some app files for the background feature are downloaded from Google and jsDelivr the first time you use it.
      </p>

      <h2 className="text-xl font-bold mt-2">Photos and videos</h2>
      <p>Real photos come from Pexels and videos are played from YouTube. When you view them, those services may receive your IP address.</p>

      <h2 className="text-xl font-bold mt-2">Payments</h2>
      <p>
        Subscriptions are processed by Google Play or the Apple App Store. We never see your card details. We use RevenueCat to check whether your subscription
        is active.
      </p>

      <h2 className="text-xl font-bold mt-2">Children</h2>
      <p>The app is designed for general English learners. We do not knowingly collect personal information from children.</p>

      <h2 className="text-xl font-bold mt-2">Deleting your data</h2>
      <p>
        Uninstalling the app deletes all data on your device. To delete anything stored on our server, email us with the user ID shown on the Premium page.
      </p>

      <h2 className="text-xl font-bold mt-2">Contact</h2>
      <p>
        <a className="underline" href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>
      </p>
    </article>
  );
}
