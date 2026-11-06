# 📱 Publishing SpeakUp English to Google Play and the App Store

This guide is in order. Do the steps one by one. ⏱️ Plan about 1–2 days in total, plus store review time.

> 🔒 **Never** share passwords, bank details or secret keys in chat, email or GitHub. You type them only into the official websites below or into `.env.local` / Vercel.

---

## Step 1: Put the website online (Vercel, free)

The phone app works offline, but the **AI robot, Premium checks, admin and new content** need your website online.

1. Go to **vercel.com** and sign in with GitHub.
2. Click **Add New → Project**, choose `English-practise-app`, then click **Deploy**.
3. Open **Storage → Marketplace → Upstash (Redis) → Create**, and connect it to the project. This saves your admin content, gift codes and users.
4. Open **Settings → Environment Variables** and add the values from `.env.example`:
   - `ANTHROPIC_API_KEY` from console.anthropic.com (for the AI robot)
   - `ADMIN_PASSWORD`, a strong password
   - the RevenueCat keys (Step 3)
5. **Redeploy.** Your site is now at something like `https://speakup-english.vercel.app`.
6. Open `https://<your-site>/admin` and log in. ✅ As admin you have Premium for free.

## Step 2: Developer accounts

| Store | Cost | Where |
|---|---|---|
| Google Play | $25 once | play.google.com/console |
| Apple App Store | $99 per year | developer.apple.com/programs |

### 💰 Getting paid to your bank account

- **Google:** Play Console → **Setup → Payments profile**. Add your bank account and tax information.
- **Apple:** App Store Connect → **Business** (Agreements, Tax and Banking). Accept the **Paid Apps** agreement, then add your bank and tax information.
- Both stores pay you **monthly**. They keep 15% of sales (Small Business Program; apply for it on both stores).

## Step 3: Subscriptions (RevenueCat, free until you earn $2,500 per month)

1. Create the subscription products in each store:
   - Google Play Console → your app → **Monetize → Subscriptions → Create**. ID: `premium_monthly`. Add a yearly one too if you want.
   - App Store Connect → your app → **Subscriptions → Create group** "Premium" → product `premium_monthly`.
2. **revenuecat.com:** create a project and add your Android and iOS apps (follow its wizard to connect each store).
3. In RevenueCat, create an **Entitlement** called `premium` and attach both products.
4. Create an **Offering** called "default" with your package(s). The app shows the first package.
5. Copy the keys into Vercel and into `.env.local` on your computer:
   - `NEXT_PUBLIC_RC_ANDROID_KEY`, `NEXT_PUBLIC_RC_IOS_KEY` (public SDK keys)
   - `REVENUECAT_SECRET_KEY` (secret, Vercel only)

When a subscription ends and isn't renewed, the app locks Premium again automatically. Paid users keep access **offline** until their paid period ends.

## Step 4: Build the phone app

On your computer, in `.env.local`, set `NEXT_PUBLIC_API_BASE=https://<your-site>` plus the `NEXT_PUBLIC_RC_*` keys, then run:

```bash
npm run build:mobile
```

### 🤖 Android (Windows or Mac)

1. Install **Android Studio**.
2. Run `npm run open:android`.
3. Choose **Build → Generate Signed App Bundle → Android App Bundle**, and create a new keystore. ⚠️ Back up the keystore file and its password safely. You need them for every future update.
4. Upload the `.aab` file in Play Console → **Testing → Internal testing** first, then **Production**.

### 🍎 iPhone (on your Mac)

1. Install **Xcode** from the Mac App Store.
2. Copy the project to the Mac (`git clone`), then run `npm install` and `npm run build:mobile`.
3. Run `npm run open:ios`. In Xcode: **Signing & Capabilities** → choose your team → add the **In-App Purchase** capability.
4. **Product → Archive → Distribute App → App Store Connect**.
5. In App Store Connect, fill in the listing and submit it for review.

> ⚠️ Change `appId` in `capacitor.config.ts` before your first upload. It can never change after you publish. The current value is `com.perera555.speakupenglish`.

## Step 5: Store listing checklist

- App name: **SpeakUp English**. Icon: done (`assets/icon-only.png`).
- Screenshots: take them from the app on a phone (at least 2 per store; Apple needs 6.7" and 5.5" sizes).
- Privacy policy URL: `https://<your-site>/privacy`. Put your real email in `NEXT_PUBLIC_SUPPORT_EMAIL`.
- Data safety (Google) and App Privacy (Apple). Declare:
  - **Audio**: used for speech recognition, not stored
  - **User ID** (anonymous)
  - **Purchase history**
  - **Messages to the AI robot**
- Content rating: Everyone / 4+.
- Apple review note: *"Premium unlocks chapters 6-30 and the AI robot. Use the gift code XXXX-XXXX to review Premium."* Create a lifetime code in Admin → Gift codes for the reviewer.

## Step 6: Running the business (Admin dashboard: `/admin`)

- 👥 **Users & Premium:** give or remove Premium for any user ID (shown at the bottom of the user's Premium page). Use **Lifetime** for yourself, staff and testers.
- 🎁 **Gift codes:** create codes for promotions, schools or reviewers.
- 📚 **Chapters / 🎵 Songs / 👅 Twisters / 🎬 Videos:** add new content. It appears in the app straight away and is saved on users' phones for offline use.

## Updating the app later

- **Content added in Admin** appears immediately, with no store update needed.
- **Code changes:** push to GitHub, and Vercel updates the website automatically. For the phone apps, run `npm run build:mobile`, raise the version number (Android Studio: `versionCode`; Xcode: Build number), then upload again.
