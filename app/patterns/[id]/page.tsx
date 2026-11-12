import { notFound } from "next/navigation";
import { BOOKS, getBook } from "@/lib/sentencePatterns";
import { BookView } from "@/components/SentencePatterns";

export function generateStaticParams() {
  return BOOKS.map((b) => ({ id: b.id }));
}

export async function generateMetadata(props: PageProps<"/patterns/[id]">) {
  const { id } = await props.params;
  const b = getBook(id);
  return { title: `${b ? b.title : "Sentence Patterns"} · SpeakUp English` };
}

export default async function BookPage(props: PageProps<"/patterns/[id]">) {
  const { id } = await props.params;
  if (!getBook(id)) notFound();
  return <BookView id={id} />;
}
