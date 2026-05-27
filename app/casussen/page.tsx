import Link from "next/link";
import casussen from "@/data/casussen.json";
import { CHAPTERS } from "@/lib/exercises";

export default function CasussenPage() {
  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3">// SIDE QUESTS</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Casussen</h1>
        <p className="text-[14px] text-ink-2 mt-3 max-w-[60ch]">
          Uitgewerkte business-scenario's met stap-voor-stap modeloplossingen. Vink af zodra je begrijpt.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {casussen.map((c) => {
          const ch = CHAPTERS.find((x) => x.num === c.chapter);
          return (
            <Link key={c.id} href={`/oefeningen/${c.exerciseId}`} className="panel panel-hover p-5 group">
              <div className="flex items-center gap-2 mb-3">
                <span className="chip chip-acc">H{c.chapter}</span>
                <span className="font-pixel text-[8px] text-ink-3">{ch?.title}</span>
              </div>
              <div className="text-[16px] font-medium text-ink mb-2">{c.title}</div>
              <p className="text-[13px] text-ink-2 leading-relaxed">{c.summary}</p>
              <div className="mt-4 font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">START →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
