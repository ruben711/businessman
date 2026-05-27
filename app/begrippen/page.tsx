"use client";
import { useState, useMemo } from "react";
import { BEGRIPPEN_TERMS, BEGRIPPEN_EXERCISES, CATEGORIES, type Begrip } from "@/lib/begrippen";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { ExerciseRunner } from "@/components/ExerciseRunner";

type TermProgress = {
  mc: boolean;
  fill: boolean;
};

function getProgress(states: Record<string, any>, idx: number, slug: string): TermProgress {
  const num = String(idx + 1).padStart(2, "0");
  return {
    mc:   !!states[`begrip-mc-${num}-${slug}`]?.solved,
    fill: !!states[`begrip-fill-${num}-${slug}`]?.solved,
  };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/,/g, "").replace(/'/g, "").slice(0, 30);
}

export default function BegrippenPage() {
  const mounted = useMounted();
  const states = useStore((s) => s.exerciseStates);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([CATEGORIES[0]]));
  const [openTerm, setOpenTerm] = useState<{ term: Begrip; idx: number } | null>(null);

  const stats = useMemo(() => {
    let mc = 0, fill = 0;
    BEGRIPPEN_TERMS.forEach((t, i) => {
      const p = getProgress(states, i, slugify(t.term));
      if (p.mc) mc++;
      if (p.fill) fill++;
    });
    return { mc, fill, total: BEGRIPPEN_TERMS.length };
  }, [states]);

  const byCat = useMemo(() => {
    const m: Record<string, { term: Begrip; idx: number }[]> = {};
    BEGRIPPEN_TERMS.forEach((t, idx) => {
      (m[t.cat] = m[t.cat] || []).push({ term: t, idx });
    });
    return m;
  }, []);

  const toggleCat = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  // Locate exercise objects for the open term
  const exercisesForOpen = useMemo(() => {
    if (!openTerm) return [] as any[];
    const slug = slugify(openTerm.term.term);
    const num = String(openTerm.idx + 1).padStart(2, "0");
    return [
      BEGRIPPEN_EXERCISES.find((e) => e.id === `begrip-mc-${num}-${slug}`),
      BEGRIPPEN_EXERCISES.find((e) => e.id === `begrip-fill-${num}-${slug}`),
    ].filter(Boolean);
  }, [openTerm]);

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3">// CODEX · DRILL</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Begrippen</h1>
        <p className="text-[13px] text-ink-2 mt-2 max-w-[60ch]">
          {BEGRIPPEN_TERMS.length} kerntermen uit de samenvatting. Voor elk begrip: meerkeuze (term → definitie) en invullen (definitie → term).
        </p>
      </header>

      {/* Stats bar */}
      <div className="panel p-4 grid grid-cols-3 gap-4">
        <StatBlock label="MC" done={mounted ? stats.mc : 0} total={stats.total} />
        <StatBlock label="FILL" done={mounted ? stats.fill : 0} total={stats.total} />
        <StatBlock label="TOTAL" done={mounted ? stats.mc + stats.fill : 0} total={stats.total * 2} />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const items = byCat[cat] || [];
          const isOpen = expanded.has(cat);
          const doneInCat = mounted
            ? items.reduce((sum, { term, idx }) => {
                const p = getProgress(states, idx, slugify(term.term));
                return sum + (p.mc ? 1 : 0) + (p.fill ? 1 : 0);
              }, 0)
            : 0;
          const totalInCat = items.length * 2;
          const pct = totalInCat === 0 ? 0 : doneInCat / totalInCat;

          return (
            <section key={cat} className="panel overflow-hidden">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-hover/40 transition text-left"
              >
                <div className="font-pixel text-[10px] text-acc num">{items.length.toString().padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-ink">{cat}</div>
                  <div className="font-pixel text-[8px] text-ink-3 num mt-1">{doneInCat} / {totalInCat}</div>
                </div>
                <div className="w-32 hidden md:block">
                  <div className="bar"><div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} /></div>
                </div>
                <span className={`font-pixel text-[10px] text-ink-3 transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
              </button>

              {isOpen && (
                <div className="border-t border-line/[0.06] bg-canvas/30 grid sm:grid-cols-2 gap-px bg-line/[0.04] anim-in">
                  {items.map(({ term, idx }) => {
                    const slug = slugify(term.term);
                    const p = mounted ? getProgress(states, idx, slug) : { mc: false, fill: false };
                    const fullyDone = p.mc && p.fill;
                    return (
                      <button
                        key={term.term}
                        onClick={() => setOpenTerm({ term, idx })}
                        className="bg-panel px-4 py-3 text-left flex items-center gap-3 hover:bg-hover/60 transition group"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          fullyDone ? "bg-acc shadow-[0_0_6px_rgb(110_231_183/0.6)]" :
                          (p.mc || p.fill) ? "bg-warn" : "bg-ink-4"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-ink truncate">{term.term}</div>
                          <div className="text-[11px] text-ink-3 truncate">{term.def}</div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <span className={`chip !text-[7px] !px-1.5 ${p.mc ? "chip-acc" : ""}`}>MC{p.mc ? " ✓" : ""}</span>
                          <span className={`chip !text-[7px] !px-1.5 ${p.fill ? "chip-acc" : ""}`}>FILL{p.fill ? " ✓" : ""}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Practice modal */}
      {openTerm && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 py-10 overflow-y-auto anim-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setOpenTerm(null)} />
          <div className="relative panel-elev shadow-lift w-full max-w-[820px] p-6">
            <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-line/[0.06]">
              <div>
                <div className="eyebrow mb-2">// {openTerm.term.cat.toUpperCase()}</div>
                <h2 className="text-[22px] font-semibold">{openTerm.term.term}</h2>
                <p className="text-[12px] text-ink-3 mt-1 italic">{openTerm.term.def}</p>
              </div>
              <button onClick={() => setOpenTerm(null)} className="btn btn-icon btn-ghost btn-sm" aria-label="Sluiten">×</button>
            </div>

            <div className="space-y-10">
              {exercisesForOpen.map((ex: any, i: number) => (
                <section key={ex.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-pixel text-[10px] text-acc">{i === 0 ? "01 · MEERKEUZE" : "02 · INVULLEN"}</span>
                    <div className="divider flex-1" />
                  </div>
                  <ExerciseRunner exercise={ex} grouped />
                </section>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-line/[0.06] flex justify-end">
              <button onClick={() => setOpenTerm(null)} className="btn btn-ghost">Sluiten</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total === 0 ? 0 : done / total;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label">{label}</span>
        <span className="font-pixel text-[9px] text-ink num">{done} / {total}</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} /></div>
    </div>
  );
}
