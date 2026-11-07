import { notFound } from "next/navigation";
import { PATTERNS, FREE_PATTERNS } from "@/lib/patterns";
import { PatternView } from "@/components/QuizZero";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export default async function PatternPage(props: PageProps<"/quiz/[id]">) {
  const { id } = await props.params;
  const p = PATTERNS.find((x) => x.id === id);
  if (!p) notFound();
  return (
    <Gate free={PATTERNS.indexOf(p) < FREE_PATTERNS} what={`The pattern “${p.title}”`}>
      <PatternView p={p} />
    </Gate>
  );
}
