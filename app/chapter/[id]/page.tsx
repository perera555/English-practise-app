import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { chapters, getChapter } from "@/lib/content";
import { FREE } from "@/lib/sessions";
import { ChapterView } from "@/components/ChapterView";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return chapters.map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/chapter/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const c = getChapter(id);
  return { title: c ? `Ch ${c.chapter}: ${c.title} · SpeakUp English` : "Chapter" };
}

export default async function ChapterPage(props: PageProps<"/chapter/[id]">) {
  const { id } = await props.params;
  const lesson = getChapter(id);
  if (!lesson) notFound();
  const i = chapters.indexOf(lesson);
  return (
    <Gate free={lesson.chapter <= FREE.chapters} what={`Chapter ${lesson.chapter}: ${lesson.title}`}>
      <ChapterView lesson={lesson} prev={chapters[i - 1]} next={chapters[i + 1]} />
    </Gate>
  );
}
