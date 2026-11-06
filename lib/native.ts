"use client";

/**
 * Bridges to native phone features when the site runs inside the Capacitor app
 * (Android / iPhone). In a normal browser these return false / do nothing.
 */
import { Capacitor } from "@capacitor/core";

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function nativePlatform(): "ios" | "android" | "web" {
  try {
    return Capacitor.getPlatform() as "ios" | "android" | "web";
  } catch {
    return "web";
  }
}

/* ---------------- Text to speech ---------------- */

export async function nativeSpeak(text: string, lang: string, rate: number, onWord?: (charIndex: number) => void) {
  const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
  const handle = onWord
    ? await TextToSpeech.addListener("onRangeStart", (info) => onWord(info.start))
    : null;
  try {
    // Native engines speak faster than browser voices at the same rate.
    await TextToSpeech.speak({ text, lang, rate: Math.max(0.3, Math.min(2, rate * 0.95)), pitch: 1, volume: 1, category: "playback" });
  } finally {
    await handle?.remove();
  }
}

export async function nativeStopSpeaking() {
  const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
  await TextToSpeech.stop().catch(() => {});
}

/* ---------------- Speech recognition ---------------- */

export function nativeListen(lang: string, onInterim?: (t: string) => void) {
  let stopFn: () => void = () => {};
  const result = (async () => {
    const { SpeechRecognition } = await import("@capacitor-community/speech-recognition");
    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== "granted") throw new Error("not-allowed");
    let latest = "";
    const partial = await SpeechRecognition.addListener("partialResults", (d) => {
      latest = d.matches?.[0] ?? latest;
      onInterim?.(latest);
    });
    return await new Promise<string>((resolve) => {
      let done = false;
      const finish = async () => {
        if (done) return;
        done = true;
        await partial.remove();
        await stateHandle?.remove();
        resolve(latest.trim());
      };
      let stateHandle: { remove: () => Promise<void> } | undefined;
      void SpeechRecognition.addListener("listeningState", (s) => {
        if (s.status === "stopped") void finish();
      }).then((h) => (stateHandle = h));
      stopFn = () => {
        void SpeechRecognition.stop().finally(finish);
      };
      SpeechRecognition.start({ language: lang, partialResults: true, popup: false, maxResults: 1 })
        .then((r) => {
          if (r?.matches?.[0]) latest = r.matches[0];
        })
        .catch(() => finish());
      // Safety stop after 60s.
      setTimeout(() => stopFn(), 60000);
    });
  })();
  return { stop: () => stopFn(), result };
}
