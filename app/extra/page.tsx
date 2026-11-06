import { Suspense } from "react";
import { ExtraView } from "@/components/Extra";

export const metadata = { title: "SpeakUp English" };

export default function ExtraPage() {
  return (
    <Suspense fallback={<p className="opacity-60">Loading…</p>}>
      <ExtraView />
    </Suspense>
  );
}
