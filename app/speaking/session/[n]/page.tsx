import { notFound } from "next/navigation";
import { SpeakingSession } from "@/components/Sessions";
import { SESSION_TOTALS } from "@/lib/sessions";

export function generateStaticParams() {
  return Array.from({ length: SESSION_TOTALS.speaking }, (_, i) => ({ n: String(i + 1) }));
}

export default async function Page(props: PageProps<"/speaking/session/[n]">) {
  const { n } = await props.params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > SESSION_TOTALS.speaking) notFound();
  return <SpeakingSession n={num} />;
}
