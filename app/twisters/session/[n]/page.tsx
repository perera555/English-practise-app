import { notFound } from "next/navigation";
import { TwisterSession } from "@/components/Sessions";
import { FREE, SESSION_TOTALS } from "@/lib/sessions";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return Array.from({ length: SESSION_TOTALS.twisters }, (_, i) => ({ n: String(i + 1) }));
}

export default async function Page(props: PageProps<"/twisters/session/[n]">) {
  const { n } = await props.params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > SESSION_TOTALS.twisters) notFound();
  return (
    <Gate free={num <= FREE.sessions} what={`Session ${num}`}>
      <TwisterSession n={num} />
    </Gate>
  );
}
