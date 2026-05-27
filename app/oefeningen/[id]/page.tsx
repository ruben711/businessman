import Link from "next/link";
import { notFound } from "next/navigation";
import { exercises, getExercise } from "@/lib/exercises";
import { ExerciseRunner } from "@/components/ExerciseRunner";

export default function ExercisePage({ params }: { params: { id: string } }) {
  const ex = getExercise(params.id);
  if (!ex) notFound();
  const idx = exercises.findIndex((e) => e.id === ex.id);
  const next = exercises[idx + 1]?.id;

  return (
    <div className="anim-in">
      <Link href="/oefeningen" className="inline-flex items-center gap-2 font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition mb-6">← QUEST LOG</Link>
      <ExerciseRunner exercise={ex} nextId={next} />
    </div>
  );
}
