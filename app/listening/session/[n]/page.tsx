import { notFound } from "next/navigation";
import { ListeningSession } from "@/components/Sessions";
import { SESSION_TOTALS } from "@/lib/sessions";

export function generateStaticParams() {
  return Array.from({ length: SESSION_TOTALS.listening }, (_, i) => ({ n: String(i + 1) }));
}

export default async function Page(props: PageProps<"/listening/session/[n]">) {
  const { n } = await props.params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > SESSION_TOTALS.listening) notFound();
  return <ListeningSession n={num} />;
}
