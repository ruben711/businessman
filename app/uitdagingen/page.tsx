"use client";
import { useState, useMemo } from "react";
import { CHALLENGE_POOL } from "@/lib/uitdagingen";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import { diffChipClass } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";

const TYPE_LABEL: Record<string, string> = {
  mc: "MC", tf: "T/F", open: "OPEN", cloze: "FILL", order: "ORDER", match: "MATCH", case: "CASE",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function UitdagingenPage() {
  const mounted = useMounted();
  const states = useStore((s) => s.exerciseStates);
  const [mode, setMode] = useState<"menu" | "queue">("menu");
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [idx, setIdx] = useState(0);

  const overall = useMemo(() => {
    const done = CHALLENGE_POOL.filter((e) => states[e.id]?.solved).length;
    return { done, total: CHALLENGE_POOL.length };
  }, [states]);

  function startMode(scope: "all" | "unsolved" | "wrong") {
    let pool: Exercise[] = CHALLENGE_POOL;
    if (mounted && scope === "unsolved") pool = pool.filter((e) => !states[e.id]?.solved);
    if (mounted && scope === "wrong") pool = pool.filter((e) => states[e.id]?.attempts && !states[e.id]?.solved);
    if (pool.length === 0) return;
    setQueue(shuffle(pool));
    setIdx(0);
    setMode("queue");
  }

  function next() {
    if (idx + 1 >= queue.length) { setMode("menu"); return; }
    setIdx(idx + 1);
  }
  function prev() { if (idx > 0) setIdx(idx - 1); }
  function exit() { setMode("menu"); }

  // ====== QUEUE MODE ======
  if (mode === "queue" && queue.length > 0) {
    const ex = queue[idx];
    const isLast = idx === queue.length - 1;
    return (
      <div className="anim-in max-w-[820px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button onClick={exit} className="font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition">← MENU</button>
          <div className="flex items-center gap-2">
            <span className="chip chip-diff-extreem">ELITE</span>
            <span className={diffChipClass(ex.difficulty)}>{ex.difficulty}</span>
            <span className="chip">{TYPE_LABEL[ex.type] || ex.type}</span>
            <span className="font-pixel text-[9px] text-ink-3 num">{idx + 1} / {queue.length}</span>
          </div>
        </div>

        <div className="mb-8 bar"><div className="bar-fill" style={{ width: `${((idx + 1) / queue.length) * 100}%`, background: "#a78bfa" }} /></div>

        <ExerciseRunner key={ex.id} exercise={ex} grouped />

        <div className="mt-8 pt-6 border-t border-line/[0.06] flex items-center justify-between gap-3">
          <button onClick={prev} disabled={idx === 0} className="btn btn-ghost btn-sm">← Vorige</button>
          <span className="font-pixel text-[8px] text-ink-3 num">{idx + 1} / {queue.length}</span>
          {isLast ? (
            <button onClick={exit} className="btn btn-primary">Run voltooid ✓</button>
          ) : (
            <button onClick={next} className="btn btn-primary">Volgende →</button>
          )}
        </div>
      </div>
    );
  }

  // ====== MENU MODE ======
  const wrongCount = mounted ? CHALLENGE_POOL.filter((e) => states[e.id]?.attempts && !states[e.id]?.solved).length : 0;

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3" style={{ color: "#a78bfa" }}>// BOSS RUSH</div>
        <h1 className="text-[32px] font-semibold tracking-tight">
          Uitdagingen <span style={{ color: "#a78bfa" }}>⚔</span>
        </h1>
        <p className="text-[13px] text-ink-2 mt-2 max-w-[60ch]">
          {CHALLENGE_POOL.length} extra-moeilijke vragen, alle hoofdstukken door elkaar — multi-step rekenwerk, tricky multiple choice en uitgebreide casussen.
        </p>
      </header>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">// VOLTOOID</div>
          <span className="font-pixel text-[9px] text-ink num">{overall.done} / {overall.total}</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${overall.total === 0 ? 0 : (overall.done / overall.total) * 100}%`, background: "#a78bfa", boxShadow: "0 0 8px rgb(167 139 250 / 0.5)" }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <button onClick={() => startMode("all")} className="panel panel-hover p-5 text-left group border-l-2 border-l-[#a78bfa]/40">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px]" style={{ color: "#a78bfa" }}>▶ BOSS RUN</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">Alle {CHALLENGE_POOL.length} vragen</div>
          <div className="text-[11px] text-ink-3">Volledige boss-rush, willekeurig geschud</div>
        </button>

        <button onClick={() => startMode("unsolved")} className="panel panel-hover p-5 text-left group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-warn">◐ ONOPGELOST</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">{mounted ? overall.total - overall.done : "—"} resterend</div>
          <div className="text-[11px] text-ink-3">Alleen wat je nog niet kraakte</div>
        </button>

        <button onClick={() => startMode("wrong")} className="panel panel-hover p-5 text-left group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-err">✗ FOUTEN</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">{wrongCount} fout</div>
          <div className="text-[11px] text-ink-3">Herkans wat je miste</div>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="label">// ALLE UITDAGINGEN</div>
          <span className="font-pixel text-[8px] text-ink-3 num">{CHALLENGE_POOL.length} items</span>
        </div>
        <div className="panel overflow-hidden">
          {CHALLENGE_POOL.map((ex) => {
            const st = mounted ? states[ex.id] : undefined;
            const status = st?.solved ? "done" : st?.attempts ? "wip" : "todo";
            return (
              <button
                key={ex.id}
                onClick={() => { setQueue([ex]); setIdx(0); setMode("queue"); }}
                className="row group w-full text-left"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  status === "done" ? "bg-acc shadow-[0_0_6px_rgb(110_231_183/0.6)]" :
                  status === "wip" ? "bg-warn" : "bg-ink-4"
                }`} />
                <span className="chip chip-diff-extreem !text-[7px] !px-1.5">ELITE</span>
                <span className="chip !text-[7px] !px-1.5 shrink-0">{TYPE_LABEL[ex.type] || ex.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink truncate">{ex.question}</div>
                </div>
                <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition shrink-0">▶</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
