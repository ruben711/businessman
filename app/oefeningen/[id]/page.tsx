import Link from "next/link";
import { notFound } from "next/navigation";
import { exercises, getExercise, CHAPTERS, diffChipClass, type Exercise } from "@/lib/exercises";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { ScrollToExercise } from "@/components/ScrollToExercise";

function findNextGroup(currentChapter: number, currentDifficulty: string) {
  const allGroups: { ch: number; diff: string }[] = [];
  for (const c of CHAPTERS) {
    for (const d of ["basis", "midden", "diepgang"]) {
      if (exercises.some((e) => e.chapter === c.num && e.difficulty === d)) {
        allGroups.push({ ch: c.num, diff: d });
      }
    }
  }
  const idx = allGroups.findIndex((g) => g.ch === currentChapter && g.diff === currentDifficulty);
  if (idx === -1 || idx === allGroups.length - 1) return null;
  return allGroups[idx + 1];
}

export default function ExercisePage({ params }: { params: { id: string } }) {
  const target = getExercise(params.id);
  if (!target) notFound();

  const group = exercises
    .filter((e) => e.chapter === target.chapter && e.difficulty === target.difficulty)
    .sort((a, b) => a.id.localeCompare(b.id));

  const next = findNextGroup(target.chapter, target.difficulty);
  const nextExId = next ? exercises.find((e) => e.chapter === next.ch && e.difficulty === next.diff)?.id : null;
  const chapterTitle = CHAPTERS.find((c) => c.num === target.chapter)?.title || "";

  return (
    <div className="anim-in">
      <ScrollToExercise id={target.id} />

      <div className="flex items-center justify-between gap-3 mb-6">
        <Link href="/oefeningen" className="inline-flex items-center gap-2 font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition">
          ← QUEST LOG
        </Link>
        <div className="flex items-center gap-2">
          <span className="chip chip-acc">H{target.chapter}</span>
          <span className={diffChipClass(target.difficulty)}>{target.difficulty}</span>
          <span className="font-pixel text-[8px] text-ink-3 num">{group.length} oefeningen</span>
        </div>
      </div>

      <header className="mb-8">
        <div className="eyebrow mb-2">// {chapterTitle.toUpperCase()}</div>
        <h1 className="text-[28px] font-semibold tracking-tight">
          Niveau <span className={
            target.difficulty === "basis" ? "text-[#6ee7b7]" :
            target.difficulty === "midden" ? "text-warn" :
            "text-err"
          }>{target.difficulty}</span>
        </h1>
        <p className="text-[13px] text-ink-2 mt-2">Scroll door alle oefeningen van dit niveau. Klik onderaan voor de volgende groep.</p>
      </header>

      <div className="space-y-12">
        {group.map((ex, i) => (
          <section key={ex.id} id={ex.id} className="scroll-mt-[80px]">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-pixel text-[10px] text-acc num">{String(i + 1).padStart(2, "0")} / {String(group.length).padStart(2, "0")}</span>
              <div className="divider flex-1" />
              {ex.id === target.id && <span className="chip chip-acc">CURRENT</span>}
            </div>
            <ExerciseRunner exercise={ex} grouped />
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-line/[0.06]">
        {next && nextExId ? (
          <Link href={`/oefeningen/${nextExId}`} className="block panel panel-hover p-6 group">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="eyebrow mb-2">// NEXT</div>
                <div className="text-[16px] font-medium text-ink">
                  H{next.ch} · {CHAPTERS.find((c) => c.num === next.ch)?.title}
                </div>
                <div className="text-[12px] text-ink-3 mt-1 flex items-center gap-2">
                  Niveau <span className={diffChipClass(next.diff)}>{next.diff}</span>
                </div>
              </div>
              <span className="font-pixel text-[14px] text-ink-3 group-hover:text-acc transition">→</span>
            </div>
          </Link>
        ) : (
          <div className="panel p-6 text-center">
            <div className="font-pixel text-[10px] text-acc mb-2">// CAMPAIGN COMPLETE</div>
            <div className="text-[13px] text-ink-2 mb-4">Je hebt alle niveaus van alle hoofdstukken doorlopen.</div>
            <Link href="/examen" className="btn btn-primary">▶ Boss fight: Examen</Link>
          </div>
        )}
      </div>
    </div>
  );
}
