import { notFound } from "next/navigation";
import { stories, FREE_STORIES } from "@/lib/stories";
import { StoryView } from "@/components/Stories";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return stories.map((s) => ({ id: s.id }));
}

export default async function StoryPage(props: PageProps<"/stories/[id]">) {
  const { id } = await props.params;
  const story = stories.find((s) => s.id === id);
  if (!story) notFound();
  return (
    <Gate free={story.n <= FREE_STORIES} what={`The story “${story.title}”`}>
      <StoryView story={story} />
    </Gate>
  );
}
