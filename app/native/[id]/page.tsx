import { notFound } from "next/navigation";
import { NATIVE_CONVOS } from "@/lib/advanced";
import { NativeConvoView } from "@/components/Native";
import { Gate } from "@/components/Premium";

export function generateStaticParams() {
  return NATIVE_CONVOS.map((c) => ({ id: c.id }));
}

export default async function NativeConvoPage(props: PageProps<"/native/[id]">) {
  const { id } = await props.params;
  const convo = NATIVE_CONVOS.find((c) => c.id === id);
  if (!convo) notFound();
  return (
    <Gate free={convo.n === 1} what={`The native conversation “${convo.title}”`}>
      <NativeConvoView convo={convo} />
    </Gate>
  );
}
