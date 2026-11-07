import Link from "next/link";
import { PteView } from "@/components/PteView";
import { SessionGrid } from "@/components/Sessions";

export const metadata = { title: "PTE Practice · English Practice" };

export default function PtePage() {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/pte/example"
        className="rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-5 shadow-xl flex items-center gap-4 hover:-translate-y-0.5 transition"
      >
        <span className="text-5xl">🎬</span>
        <span className="flex-1">
          <span className="block text-sm font-semibold opacity-90">📘 Example chapter · start here</span>
          <span className="block text-2xl font-black">How to do a PTE session</span>
          <span className="block text-sm opacity-90">Guide videos with a model student for all 6 tasks, plus steps and tips. Free.</span>
        </span>
        <span className="text-3xl">→</span>
      </Link>
      <PteView />
      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold">🎯 PTE Sessions</h2>
        <p className="opacity-70">Each session takes you through all 6 task types in order, like a mini test, and gives you a total score at the end.</p>
        <SessionGrid kind="pte" />
      </section>
    </div>
  );
}
