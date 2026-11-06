import { notFound } from "next/navigation";
import { speeches } from "@/lib/motivation";
import { SpeechView } from "@/components/Motivation";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return speeches.map((s) => ({ id: s.id }));
}

export default async function SpeechPage(props: PageProps<"/motivation/[id]">) {
  const { id } = await props.params;
  const speech = speeches.find((s) => s.id === id);
  if (!speech) notFound();
  return (
    <Gate free={speech.n <= 3} what={`The speech “${speech.title}”`}>
      <SpeechView speech={speech} />
    </Gate>
  );
}
