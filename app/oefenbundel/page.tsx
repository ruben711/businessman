"use client";
import { useState, useMemo } from "react";
import { OEFENBUNDEL_CATEGORIES, OEFENBUNDEL_EXERCISES } from "@/lib/oefenbundel";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { diffChipClass } from "@/lib/exercises";

export default function OefenbundelPage() {
  const mounted = useMounted();
  const states = useStore((s) => s.exerciseStates);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(OEFENBUNDEL_CATEGORIES));
  const [openId, setOpenId] = useState<string | null>(null);

  const byCat = useMemo(() => {
    const m: Record<string, typeof OEFENBUNDEL_EXERCISES> = {};
    for (const c of OEFENBUNDEL_CATEGORIES) m[c] = [];
    for (const e of OEFENBUNDEL_EXERCISES) (m[e.category] = m[e.category] || []).push(e);
    return m;
  }, []);

  const overall = useMemo(() => {
    const done = OEFENBUNDEL_EXERCISES.filter((e) => states[e.id]?.solved).length;
    return { done, total: OEFENBUNDEL_EXERCISES.length };
  }, [states]);

  const toggleCat = (c: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(c) ? n.delete(c) : n.add(c);
      return n;
    });

  const openEx = openId ? OEFENBUNDEL_EXERCISES.find((e) => e.id === openId) : null;

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3" style={{ color: "#f59e0b" }}>// OFFICIËLE BUNDEL</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Oefenbundel</h1>
        <p className="text-[13px] text-ink-2 mt-2 max-w-[62ch]">
          De {OEFENBUNDEL_EXERCISES.length} uitgewerkte oefeningen van docent T. Decoster — afschrijvingen, BTW-vereffening,
          kostprijs, break-even en personeelskost. Los op papier op en vink elke stap af; de modeloplossing staat onder elke stap.
        </p>
      </header>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">// VOORTGANG</div>
          <span className="font-pixel text-[9px] text-ink num">{mounted ? overall.done : 0} / {overall.total}</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${overall.total === 0 ? 0 : ((mounted ? overall.done : 0) / overall.total) * 100}%`, background: "#f59e0b" }} />
        </div>
      </div>

      <div className="space-y-3">
        {OEFENBUNDEL_CATEGORIES.map((cat) => {
          const items = byCat[cat] || [];
          if (items.length === 0) return null;
          const isOpen = expanded.has(cat);
          const done = mounted ? items.filter((e) => states[e.id]?.solved).length : 0;
          const pct = items.length === 0 ? 0 : done / items.length;
          return (
            <section key={cat} className="panel overflow-hidden">
              <button onClick={() => toggleCat(cat)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-hover/40 transition text-left">
                <div className="font-pixel text-[10px] num" style={{ color: "#f59e0b" }}>{items.length.toString().padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-ink">{cat}</div>
                  <div className="font-pixel text-[8px] text-ink-3 num mt-1">{done} / {items.length}</div>
                </div>
                <div className="w-32 hidden md:block">
                  <div className="bar"><div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%`, background: "#f59e0b" }} /></div>
                </div>
                <span className={`font-pixel text-[10px] text-ink-3 transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
              </button>

              {isOpen && (
                <div className="border-t border-line/[0.06] bg-canvas/30 anim-in">
                  {items.map((ex, i) => {
                    const st = mounted ? states[ex.id] : undefined;
                    const status = st?.solved ? "done" : st?.attempts ? "wip" : "todo";
                    return (
                      <button key={ex.id} onClick={() => setOpenId(ex.id)} className="row group w-full text-left">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          status === "done" ? "bg-acc shadow-[0_0_6px_rgb(110_231_183/0.6)]" :
                          status === "wip" ? "bg-warn" : "bg-ink-4"
                        }`} />
                        <span className="font-pixel text-[9px] num shrink-0" style={{ color: "#f59e0b" }}>
                          #{ex.id.replace("ob-", "")}
                        </span>
                        <span className={`${diffChipClass(ex.difficulty)} !text-[7px] !px-1.5 shrink-0`}>{ex.difficulty.slice(0, 4)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-ink truncate">{ex.question}</div>
                          <div className="text-[11px] text-ink-3 truncate">{(ex as any).context?.slice(0, 90)}…</div>
                        </div>
                        <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition shrink-0">▶</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Solve modal */}
      {openEx && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-10 overflow-y-auto anim-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpenId(null)} />
          <div className="relative panel-elev shadow-lift w-full max-w-[860px] p-6">
            <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-line/[0.06]">
              <div>
                <div className="eyebrow mb-2" style={{ color: "#f59e0b" }}>// OEFENING #{openEx.id.replace("ob-", "")} · {(openEx as any).category}</div>
                <h2 className="text-[20px] font-semibold">{openEx.question}</h2>
              </div>
              <button onClick={() => setOpenId(null)} className="btn btn-icon btn-ghost btn-sm" aria-label="Sluiten">×</button>
            </div>
            <ExerciseRunner key={openEx.id} exercise={openEx} grouped />
            <div className="mt-6 pt-4 border-t border-line/[0.06] flex justify-end">
              <button onClick={() => setOpenId(null)} className="btn btn-ghost">Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
