import { notFound } from "next/navigation";
import { SpeakingSession } from "@/components/Sessions";
import { FREE, SESSION_TOTALS } from "@/lib/sessions";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return Array.from({ length: SESSION_TOTALS.speaking }, (_, i) => ({ n: String(i + 1) }));
}

export default async function Page(props: PageProps<"/speaking/session/[n]">) {
  const { n } = await props.params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > SESSION_TOTALS.speaking) notFound();
  return (
    <Gate free={num <= FREE.sessions} what={`Session ${num}`}>
      <SpeakingSession n={num} />
    </Gate>
  );
}
