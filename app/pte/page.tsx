import { PteView } from "@/components/PteView";
import { SessionGrid } from "@/components/Sessions";

export const metadata = { title: "PTE Practice · English Practice" };

export default function PtePage() {
  return (
    <div className="flex flex-col gap-8">
      <PteView />
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">🎯 PTE Sessions</h2>
        <p className="opacity-70">Each session takes you through all 6 task types in order, like a mini test, and gives you a total score at the end.</p>
        <SessionGrid kind="pte" />
      </section>
    </div>
  );
}
