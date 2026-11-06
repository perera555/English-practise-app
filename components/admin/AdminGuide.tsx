"use client";

import type { ReactNode } from "react";

function Section({ emoji, title, children, open = false }: { emoji: string; title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="card group">
      <summary className="cursor-pointer list-none flex items-center gap-3 font-bold text-lg">
        <span className="text-2xl">{emoji}</span>
        <span className="flex-1">{title}</span>
        <span className="opacity-50 group-open:rotate-90 transition">▶</span>
      </summary>
      <div className="mt-3 flex flex-col gap-2 leading-relaxed text-[15px] [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_code]:rounded [&_code]:bg-black/5 [&_code]:dark:bg-white/10 [&_code]:px-1">
        {children}
      </div>
    </details>
  );
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ok ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200"}`}>
      {ok ? "✅" : "⚠️"} {label}
    </span>
  );
}

const Warn = ({ children }: { children: ReactNode }) => (
  <p className="rounded-xl bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-100 px-3 py-2 text-sm">🔒 {children}</p>
);

export function AdminGuide({ pexels, youtube, storage }: { pexels: boolean; youtube: boolean; storage: string }) {
  return (
    <div className="flex flex-col gap-3 max-w-4xl">
      <div className="card flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold">📖 Admin guide</h2>
        <p className="opacity-80">Everything you need to run SpeakUp English as a business. Tap a topic to open it.</p>
        <div className="flex flex-wrap gap-2">
          <Status ok={storage === "upstash"} label={storage === "upstash" ? "Online database connected" : "Local test database"} />
          <Status ok={pexels} label={pexels ? "Real pictures ON" : "Real pictures OFF (no Pexels key)"} />
          <Status ok={youtube} label={youtube ? "YouTube search ON" : "YouTube search OFF (no key)"} />
        </div>
      </div>

      <Section emoji="💰" title="How customers pay you" open>
        <ol>
          <li>A customer installs the free app and taps <b>⭐ Subscribe to Premium</b>.</li>
          <li>Google Play or the Apple App Store shows its payment screen. The customer pays by card, Google Pay or Apple Pay, or on their phone bill.</li>
          <li>The store keeps <b>15%</b> (after you join the Small Business Program) and pays the rest <b>into your bank account every month</b>.</li>
          <li>The subscription renews automatically each month. If the customer cancels, Premium locks again when their paid time ends.</li>
          <li>Watch your sales on the <b>RevenueCat dashboard</b> (app.revenuecat.com) or in the store consoles.</li>
        </ol>
        <p>
          To get paid you <b>must</b> add your bank account in <b>both</b> stores. Steps are in the next two sections. Google pays around the 15th of each month,
          and Apple about 33 days after each month ends. A minimum amount applies; for example, Google pays from about $1–$100 depending on your country.
        </p>
        <Warn>Only type bank, tax and ID details into play.google.com/console and appstoreconnect.apple.com. Never send them by chat or email.</Warn>
      </Section>

      <Section emoji="🤖" title="Google Play Console: step by step">
        <ol>
          <li>
            Go to <b>play.google.com/console</b> → <b>Create account</b> → Personal or Organization → pay <b>$25</b> once → verify your identity with your ID
            (it takes 1–3 days).
          </li>
          <li>
            <b>Get paid:</b> Settings (⚙️) → <b>Payments profile</b> → add your <b>bank account</b> and tax information. Then Settings → <b>Developer account</b> →
            apply for the <b>15% service fee</b> (Small Business).
          </li>
          <li>
            <b>Create app</b> → name <code>SpeakUp English</code> → App → Free → accept the declarations.
          </li>
          <li>
            Fill in <b>Dashboard → Set up your app</b>:
            <ul>
              <li>Privacy policy: <code>https://YOUR-SITE/privacy</code></li>
              <li>App access: “Some features are restricted”. Give the reviewer a <b>lifetime gift code</b> (Admin → Gift codes).</li>
              <li>Ads: No. Content rating: answer the questionnaire (result: Everyone).</li>
              <li>Target audience: 13+ (or 18+). Data safety: see “Store forms” below.</li>
            </ul>
          </li>
          <li>
            <b>Store listing:</b> short and full description, the icon <code>assets/icon-only.png</code> (resize to 512×512), a 1024×500 feature graphic, and at
            least 2 phone screenshots.
          </li>
          <li>
            <b>Upload the app:</b> on your computer run <code>npm run build:mobile</code> → <code>npm run open:android</code> → Android Studio: Build → Generate Signed
            App Bundle → create a keystore (<b>back it up!</b>) → upload the <code>.aab</code> to <b>Testing → Closed testing</b>.
          </li>
          <li>
            ⚠️ New personal accounts must run a <b>closed test with at least 12 testers for 14 days</b> before going to Production. Ask friends and students to join
            using the testing link.
          </li>
          <li>
            <b>Subscription:</b> Monetize → Products → <b>Subscriptions</b> → Create → ID <code>premium_monthly</code> → add a base plan (Monthly, auto-renewing) →
            set the price → Activate.
          </li>
          <li>
            After 14 days: <b>Production → Create release</b> → choose countries → Send for review (usually 1–7 days).
          </li>
        </ol>
      </Section>

      <Section emoji="🍎" title="Apple App Store Connect: step by step">
        <ol>
          <li>
            Join the <b>Apple Developer Program</b> at developer.apple.com/programs ($99 per year). Use your Apple ID; verification takes 1–2 days.
          </li>
          <li>
            <b>Get paid:</b> appstoreconnect.apple.com → <b>Business</b> → accept the <b>Paid Apps Agreement</b> → add your <b>bank account</b> and <b>tax forms</b>.
            Subscriptions only work after this is “Active”. Also join the <b>App Store Small Business Program</b> (15%).
          </li>
          <li>
            Apps → <b>➕ New App</b> → iOS → name <code>SpeakUp English</code> → Bundle ID <code>com.perera555.speakupenglish</code> (create it in Certificates,
            Identifiers &amp; Profiles if it isn’t listed) → SKU <code>speakup1</code>.
          </li>
          <li>
            Your app → <b>Monetization → Subscriptions</b> → create the group <code>Premium</code> → product ID <code>premium_monthly</code> → 1 month → price → add a display
            name and description → add a review screenshot of the Premium page.
          </li>
          <li>
            <b>App Privacy:</b> fill it in as in “Store forms” below. <b>Privacy Policy URL:</b> <code>https://YOUR-SITE/privacy</code>.
          </li>
          <li>
            <b>Upload the build (on your Mac):</b> run <code>git clone</code>, then <code>npm install</code>, then <code>npm run build:mobile</code>, then{" "}
            <code>npm run open:ios</code>. In Xcode: Signing &amp; Capabilities → your Team → <b>+ In-App Purchase</b> → Product → Archive → Distribute → App Store
            Connect.
          </li>
          <li>
            Add screenshots (6.7&quot; and 6.5&quot; iPhone), a description and keywords. In <b>App Review Information</b>, write: “Premium can be tested with gift code
            XXXX-XXXX on the Premium page.” Use a lifetime gift code.
          </li>
          <li>Attach the subscription to the version → <b>Add for Review</b> → Submit (review takes 1–3 days).</li>
        </ol>
      </Section>

      <Section emoji="🔗" title="Connect payments (RevenueCat)">
        <ol>
          <li>Create a free account at <b>app.revenuecat.com</b> and create a project called SpeakUp English.</li>
          <li>
            Add the <b>Google Play app</b> (package <code>com.perera555.speakupenglish</code>). Follow its guide to upload a Google <b>service account JSON</b>, so
            RevenueCat can see purchases.
          </li>
          <li>
            Add the <b>App Store app</b> (bundle ID). Follow its guide to add the <b>In-App Purchase key</b> from App Store Connect.
          </li>
          <li>
            <b>Entitlements</b> → create <code>premium</code> → attach both <code>premium_monthly</code> products.
          </li>
          <li>
            <b>Offerings</b> → <code>default</code> → add a package with both products.
          </li>
          <li>
            <b>API keys</b> → copy the Android and iOS public keys into <code>NEXT_PUBLIC_RC_ANDROID_KEY</code> and <code>NEXT_PUBLIC_RC_IOS_KEY</code>, and the{" "}
            <b>secret key</b> into <code>REVENUECAT_SECRET_KEY</code> (Vercel only).
          </li>
        </ol>
      </Section>

      <Section emoji="📝" title="Store forms (Data safety / App Privacy)">
        <ul>
          <li>
            <b>Audio:</b> used for speech recognition and is not stored. <b>Camera:</b> used only for the “See yourself” mirror and stays on the device.
          </li>
          <li>
            <b>Identifiers:</b> an anonymous user ID (app functionality). <b>Purchases:</b> purchase history (app functionality).
          </li>
          <li>
            <b>Other content you write:</b> messages sent to the AI robot (app functionality, not linked to identity).
          </li>
          <li>No ads. No data sold. Data is encrypted in transit. Users can ask for deletion by email.</li>
        </ul>
      </Section>

      <Section emoji="🧭" title="Using this admin panel">
        <ul>
          <li>
            <b>🏠 Overview</b>: customers, who is online now, Premium users, gift codes, pictures and videos at a glance, plus a setup checklist.
          </li>
          <li>
            <b>📱 Customer view</b>: the real app inside the admin panel (phone or computer size). As an admin, everything is unlocked, so you can see every
            picture, video and lesson.
          </li>
          <li>
            <b>👥 Customers</b>: everyone who created a profile on the website or in the phone apps, with their picture and a <b>🟢 Online now</b> or last-seen
            time. 👁️ View / ✏️ Edit changes their name or email or removes an unsuitable picture. 🗑️ Delete removes the profile.
          </li>
          <li>
            <b>🗂️ Library</b>: every section (Travel, Sports, Daily, Stories, Motivation, Music, Videos, all sessions). 👁️ opens an item, 🗑️ removes it from the
            app, and ↩️ restores it.
          </li>
          <li>
            <b>📚 Chapters</b>: ✏️ edit any chapter, including built-in chapters 1–30. ↩️ undoes your edits. ➕ adds new chapters.
          </li>
          <li>
            <b>Admins never need a subscription.</b> On the website, logging in to Admin unlocks everything. On your own phone, use ⭐ Give Premium → “Use this
            device’s ID” → Lifetime.
          </li>
        </ul>
      </Section>

      <Section emoji="👥" title="Users, Premium and gift codes">
        <ul>
          <li>
            Every user has an ID at the bottom of their <b>⭐ Premium</b> page, like <code>u_1a2b…</code>. To give someone Premium, go to <b>Users &amp; Premium</b>,
            paste the ID, choose how long, and click <b>Give Premium</b>.
          </li>
          <li>
            <b>You and your staff</b>: choose <b>Lifetime</b>. Logged-in admins also get Premium automatically on the website.
          </li>
          <li>
            <b>Gift codes</b>: create them for promotions, schools, or the store reviewers. Each code works once. Customers type it on the Premium page.
          </li>
          <li>Paying customers are handled automatically by the stores. You don’t need to do anything for them.</li>
        </ul>
      </Section>

      <Section emoji="🖼️" title="Real pictures (Pexels, free)">
        <ol>
          <li>Go to <b>pexels.com/api</b> → sign up (free) → “Your API key” → copy it.</li>
          <li>
            Add it as <code>PEXELS_API_KEY</code> in Vercel (Settings → Environment Variables) and in <code>.env.local</code>, then redeploy.
          </li>
          <li>
            Open <b>Admin → Pictures</b> → <b>✨ Fill all missing pictures automatically</b>. Every chapter, daily talk, song and PTE image gets a real photo.
          </li>
          <li>
            Don’t like one? Click <b>🔎 Change</b> and pick another. Pexels photos are free for commercial use. The app credits the photographer automatically.
          </li>
          <li>When there is no internet the app shows the drawn picture instead, so it never breaks.</li>
        </ol>
      </Section>

      <Section emoji="🎬" title="Real videos (YouTube) and subtitles">
        <ol>
          <li>
            Get a free key: <b>console.cloud.google.com</b> → create a project → APIs &amp; Services → <b>Enable “YouTube Data API v3”</b> → Credentials →{" "}
            <b>Create API key</b> → copy it into <code>YOUTUBE_API_KEY</code>.
          </li>
          <li>
            <b>Admin → Videos → 🔎 Find real videos</b>: search, for example “cricket commentary highlights”, preview, then click <b>➕ Use this video</b>. Choose a
            category (Sports, Travel, Music…) and a chapter, then <b>Save</b>.
          </li>
          <li>
            <b>✨ Auto-add a video to every chapter</b> adds one captioned video to each chapter quickly. Watch them afterwards and delete any you don’t like.
          </li>
          <li>
            <b>Karaoke subtitles:</b> type lines as <code>0:05 | Good morning!</code>. Without typed lines, YouTube’s own subtitles (CC) are shown.
          </li>
          <li>
            <b>Music:</b> use <b>official</b> artist or label videos (the official channel, or “Topic” and VEVO channels) and choose the category <b>🎵 Music</b>. They appear
            under “Famous English songs”. Don’t type full lyrics of famous songs; that needs a paid lyrics licence.
          </li>
          <li>
            <b>Your own videos:</b> upload an .mp4 to any https file host (for example Vercel Blob or Cloudflare R2) and paste the link. These can have your own
            people and teachers in them.
          </li>
        </ol>
      </Section>

      <Section emoji="📚" title="Adding chapters, songs and tongue twisters">
        <ul>
          <li>
            <b>Chapters:</b> write the dialogue as <code>Speaker: text</code> lines, vocabulary as <code>emoji | word | meaning</code>, and quiz questions as{" "}
            <code>Question | A | B | C | 1</code>. New chapters are numbered 31 and up and are Premium.
          </li>
          <li>
            <b>Songs:</b> only use lyrics you wrote or have permission for. Choose a music style; the app plays the beat and the karaoke.
          </li>
          <li>
            <b>Tongue twisters:</b> one per line.
          </li>
          <li>New content reaches every phone automatically, with no app update needed, and is saved for offline use.</li>
        </ul>
      </Section>

      <Section emoji="⚙️" title="All settings (environment variables)">
        <p>Set these in Vercel → Project → Settings → Environment Variables, then redeploy. The file <code>.env.example</code> lists them all.</p>
        <ul>
          <li>
            <code>ADMIN_PASSWORD</code>: your admin password (at least 8 characters). Change it here if it ever leaks.
          </li>
          <li>
            <code>ANTHROPIC_API_KEY</code>: the AI robot (console.anthropic.com).
          </li>
          <li>
            <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code>: the database (Vercel → Storage → Upstash).
          </li>
          <li>
            <code>REVENUECAT_SECRET_KEY</code>, <code>NEXT_PUBLIC_RC_ANDROID_KEY</code>, <code>NEXT_PUBLIC_RC_IOS_KEY</code>: payments.
          </li>
          <li>
            <code>PEXELS_API_KEY</code>: real pictures. <code>YOUTUBE_API_KEY</code>: video search.
          </li>
          <li>
            <code>NEXT_PUBLIC_API_BASE</code>: your website address (needed for the phone app). <code>NEXT_PUBLIC_SUPPORT_EMAIL</code>: your support email.
          </li>
        </ul>
        <Warn>Secret keys (ANTHROPIC, REVENUECAT_SECRET, PEXELS, YOUTUBE, UPSTASH, ADMIN_PASSWORD) must never be put in the code or sent to anyone.</Warn>
      </Section>

      <Section emoji="🚀" title="Updating the app">
        <ul>
          <li>Content you add in Admin appears straight away, with no update needed.</li>
          <li>
            Code changes: push to GitHub and Vercel updates the website automatically. For the phone apps, run <code>npm run build:mobile</code>, increase the version
            number, and upload a new build to both stores.
          </li>
        </ul>
      </Section>
    </div>
  );
}
