"use client";
import Link from "next/link";
import { CHAPTERS } from "@/lib/exercises";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

export default function TheoriePage() {
  const mounted = useMounted();
  const progress = useStore((s) => s.theoryProgress);

  return (
    <div className="space-y-8 anim-in">
      <header>
        <div className="eyebrow mb-3">// CAMPAIGN</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Theorie</h1>
        <p className="text-[14px] text-ink-2 mt-3 max-w-[60ch]">
          Zeven hoofdstukken. Markeer secties als gelezen om je voortgang te tracken.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {CHAPTERS.map((c) => {
          const read = mounted ? Object.keys(progress).filter((k) => k.startsWith(`h${c.num}-`) && progress[k]?.read).length : 0;
          return (
            <Link key={c.num} href={`/theorie/${c.num}`} className="panel panel-hover p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="chnum">CH·{String(c.num).padStart(2, "0")}</div>
                <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
              </div>
              <div className="text-[16px] font-medium text-ink mb-2">{c.title}</div>
              <div className="flex items-center gap-2 text-[11px] text-ink-3">
                <span className="font-pixel text-[8px] tracking-[0.1em]">{read > 0 ? `${read} READ` : "NOT STARTED"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
