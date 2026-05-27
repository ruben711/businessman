import Link from "next/link";
import { notFound } from "next/navigation";
import { TheorySection } from "./TheorySection";
import { CHAPTERS } from "@/lib/exercises";

export default async function ChapterTheory({ params }: { params: { chapter: string } }) {
  const num = parseInt(params.chapter, 10);
  if (!num || num < 1 || num > 7) notFound();

  let data: any;
  try {
    data = (await import(`@/data/theorie/h${num}.json`)).default;
  } catch {
    return (
      <div className="space-y-6 anim-in">
        <Link href="/theorie" className="font-pixel text-[8px] text-ink-3 hover:text-acc">← BACK</Link>
        <h1 className="text-[28px] font-semibold">Hoofdstuk {num} — {CHAPTERS.find((c) => c.num === num)?.title}</h1>
        <div className="panel p-8 text-center text-ink-3 text-[13px]">Inhoud nog niet beschikbaar.</div>
      </div>
    );
  }

  return (
    <article className="max-w-[760px] mx-auto anim-in">
      <Link href="/theorie" className="inline-flex items-center gap-2 font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition">← ALL CHAPTERS</Link>

      <header className="mt-6 mb-10">
        <div className="chnum mb-4">CH·{String(num).padStart(2, "0")}</div>
        <h1 className="text-[40px] md:text-[48px] font-semibold tracking-[-0.02em] leading-[1.05]">{data.title}</h1>
        {data.subtitle && <p className="text-[16px] text-ink-2 mt-3 italic">{data.subtitle}</p>}
      </header>

      <div className="divider mb-8" />

      <div className="space-y-10">
        {data.sections.map((s: any) => (
          <TheorySection key={s.id} section={s} chapter={num} />
        ))}
      </div>

      {data.doelstellingen && (
        <section className="panel p-6 mt-12">
          <div className="label mb-4">// LEERDOELEN</div>
          <ul className="space-y-2">
            {data.doelstellingen.map((d: string, i: number) => (
              <li key={i} className="flex gap-3 text-[14px] text-ink-2">
                <span className="font-pixel text-[9px] text-acc mt-1">{String(i + 1).padStart(2, "0")}</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex items-center justify-between mt-12 pt-8 border-t border-line/[0.06] gap-3">
        {num > 1
          ? <Link href={`/theorie/${num - 1}`} className="btn btn-ghost">← H{num - 1}</Link>
          : <span />}
        <Link href={`/oefeningen?ch=${num}`} className="btn btn-primary">Oefeningen H{num} →</Link>
        {num < 7
          ? <Link href={`/theorie/${num + 1}`} className="btn btn-ghost">H{num + 1} →</Link>
          : <span />}
      </div>
    </article>
  );
}
