import type { CapacitorConfig } from "@capacitor/cli";

/**
 * The phone app bundles the static build (.next-mobile) so it works offline.
 * IMPORTANT: change appId to your own unique ID BEFORE the first store upload.
 * It can never be changed after publishing.
 */
const config: CapacitorConfig = {
  appId: "com.perera555.speakupenglish",
  appName: "SpeakUp English",
  webDir: ".next-mobile",
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
