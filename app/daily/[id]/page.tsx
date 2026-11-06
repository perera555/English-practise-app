import { notFound } from "next/navigation";
import { dailyTalks, FREE_DAILY } from "@/lib/daily";
import { DailyView } from "@/components/Daily";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return dailyTalks.map((t) => ({ id: t.id }));
}

export default async function DailyTalkPage(props: PageProps<"/daily/[id]">) {
  const { id } = await props.params;
  const talk = dailyTalks.find((t) => t.id === id);
  if (!talk) notFound();
  return (
    <Gate free={talk.n <= FREE_DAILY} what={`Daily talk: ${talk.title}`}>
      <DailyView talk={talk} />
    </Gate>
  );
}
