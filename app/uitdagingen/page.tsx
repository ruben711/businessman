"use client";
import { useState, useMemo } from "react";
import { CHALLENGE_POOL, CHALLENGE_REKENEN, CHALLENGE_THEORIE, kindOf, type ChallengeKind } from "@/lib/uitdagingen";
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

const KIND_COLOR: Record<ChallengeKind, string> = {
  rekenen: "#22d3ee",   // cyaan
  theorie: "#a78bfa",   // paars
};

const KIND_ICON: Record<ChallengeKind, string> = {
  rekenen: "🧮",
  theorie: "📖",
};

const KIND_LABEL: Record<ChallengeKind, string> = {
  rekenen: "REKENEN",
  theorie: "THEORIE",
};

export default function UitdagingenPage() {
  const mounted = useMounted();
  const states = useStore((s) => s.exerciseStates);
  const [mode, setMode] = useState<"menu" | "queue">("menu");
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [listFilter, setListFilter] = useState<"all" | ChallengeKind>("all");

  const stats = useMemo(() => {
    const allDone = CHALLENGE_POOL.filter((e) => states[e.id]?.solved).length;
    const rekDone = CHALLENGE_REKENEN.filter((e) => states[e.id]?.solved).length;
    const theDone = CHALLENGE_THEORIE.filter((e) => states[e.id]?.solved).length;
    const wrong = CHALLENGE_POOL.filter((e) => states[e.id]?.attempts && !states[e.id]?.solved).length;
    return {
      allDone, rekDone, theDone, wrong,
      allTotal: CHALLENGE_POOL.length,
      rekTotal: CHALLENGE_REKENEN.length,
      theTotal: CHALLENGE_THEORIE.length,
    };
  }, [states]);

  function startQueue(pool: Exercise[]) {
    if (pool.length === 0) return;
    setQueue(shuffle(pool));
    setIdx(0);
    setMode("queue");
  }

  function startKind(kind: ChallengeKind) {
    startQueue(kind === "rekenen" ? CHALLENGE_REKENEN : CHALLENGE_THEORIE);
  }

  function startScope(scope: "all" | "unsolved" | "wrong") {
    let pool: Exercise[] = CHALLENGE_POOL;
    if (mounted && scope === "unsolved") pool = pool.filter((e) => !states[e.id]?.solved);
    if (mounted && scope === "wrong") pool = pool.filter((e) => states[e.id]?.attempts && !states[e.id]?.solved);
    startQueue(pool);
  }

  function next() { if (idx + 1 >= queue.length) { setMode("menu"); return; } setIdx(idx + 1); }
  function prev() { if (idx > 0) setIdx(idx - 1); }
  function exit() { setMode("menu"); }

  // ====== QUEUE MODE ======
  if (mode === "queue" && queue.length > 0) {
    const ex = queue[idx];
    const isLast = idx === queue.length - 1;
    const k = kindOf(ex);
    return (
      <div className="anim-in max-w-[820px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button onClick={exit} className="font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition">← MENU</button>
          <div className="flex items-center gap-2">
            <span className="chip" style={{ background: KIND_COLOR[k] + "15", borderColor: KIND_COLOR[k] + "55", color: KIND_COLOR[k] }}>
              {KIND_LABEL[k]}
            </span>
            <span className={diffChipClass(ex.difficulty)}>{ex.difficulty}</span>
            <span className="chip">{TYPE_LABEL[ex.type] || ex.type}</span>
            <span className="font-pixel text-[9px] text-ink-3 num">{idx + 1} / {queue.length}</span>
          </div>
        </div>

        <div className="mb-8 bar"><div className="bar-fill" style={{ width: `${((idx + 1) / queue.length) * 100}%`, background: KIND_COLOR[k] }} /></div>

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
  const visible = listFilter === "all"
    ? CHALLENGE_POOL
    : (listFilter === "rekenen" ? CHALLENGE_REKENEN : CHALLENGE_THEORIE);

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3" style={{ color: "#a78bfa" }}>// BOSS RUSH</div>
        <h1 className="text-[32px] font-semibold tracking-tight">
          Uitdagingen <span style={{ color: "#a78bfa" }}>⚔</span>
        </h1>
        <p className="text-[13px] text-ink-2 mt-2 max-w-[60ch]">
          {CHALLENGE_POOL.length} extra-moeilijke vragen, alle hoofdstukken door elkaar — gesplitst in pure rekenoefeningen en diepe theorie.
        </p>
      </header>

      {/* Overall progress */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">// VOLTOOID</div>
          <span className="font-pixel text-[9px] text-ink num">{mounted ? stats.allDone : 0} / {stats.allTotal}</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{
            width: `${stats.allTotal === 0 ? 0 : ((mounted ? stats.allDone : 0) / stats.allTotal) * 100}%`,
            background: "linear-gradient(to right, #22d3ee, #a78bfa)",
            boxShadow: "0 0 8px rgb(167 139 250 / 0.4)",
          }} />
        </div>
      </div>

      {/* Two big sections: REKENEN + THEORIE */}
      <div className="grid md:grid-cols-2 gap-3">
        {(["rekenen","theorie"] as ChallengeKind[]).map((k) => {
          const total = k === "rekenen" ? stats.rekTotal : stats.theTotal;
          const done = mounted ? (k === "rekenen" ? stats.rekDone : stats.theDone) : 0;
          const pct = total === 0 ? 0 : done / total;
          const color = KIND_COLOR[k];
          return (
            <button
              key={k}
              onClick={() => startKind(k)}
              className="panel panel-hover p-6 text-left group relative overflow-hidden"
              style={{ borderLeft: `2px solid ${color}55` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">{KIND_ICON[k]}</span>
                  <span className="font-pixel text-[11px] tracking-[0.12em]" style={{ color }}>{KIND_LABEL[k]}</span>
                </div>
                <span className="font-pixel text-[9px] text-ink-3 num">{done} / {total}</span>
              </div>
              <div className="text-[15px] font-medium text-ink mb-3">
                {k === "rekenen" ? "Multi-step calc & formules" : "Tricky concepts & casussen"}
              </div>
              <div className="bar mb-3">
                <div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%`, background: color }} />
              </div>
              <div className="flex items-center justify-between font-pixel text-[8px] tracking-[0.1em]" style={{ color }}>
                <span>▶ START RUN</span>
                <span className="opacity-60 group-hover:opacity-100 transition">→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Combined options */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button onClick={() => startScope("all")} className="panel panel-hover p-4 text-left group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px]" style={{ color: "#a78bfa" }}>⚔ FULL BOSS RUN</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[13px] text-ink-2">Alle {CHALLENGE_POOL.length} door elkaar</div>
        </button>
        <button onClick={() => startScope("unsolved")} className="panel panel-hover p-4 text-left group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-warn">◐ ONOPGELOST</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[13px] text-ink-2">{mounted ? stats.allTotal - stats.allDone : "—"} resterend</div>
        </button>
        <button onClick={() => startScope("wrong")} className="panel panel-hover p-4 text-left group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-err">✗ FOUTEN</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[13px] text-ink-2">{mounted ? stats.wrong : "—"} fout gemaakt</div>
        </button>
      </div>

      {/* List view */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="label">// ALLE UITDAGINGEN</div>
          <div className="flex items-center gap-1">
            {([
              { v: "all", l: "ALLE", n: stats.allTotal },
              { v: "rekenen", l: "REKENEN", n: stats.rekTotal },
              { v: "theorie", l: "THEORIE", n: stats.theTotal },
            ] as const).map((f) => (
              <button
                key={f.v}
                onClick={() => setListFilter(f.v as any)}
                className={`btn btn-sm ${listFilter === f.v ? "btn-primary" : "btn-ghost"}`}
              >
                {f.l} <span className="opacity-60 ml-1">{f.n}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel overflow-hidden">
          {visible.map((ex) => {
            const st = mounted ? states[ex.id] : undefined;
            const status = st?.solved ? "done" : st?.attempts ? "wip" : "todo";
            const k = kindOf(ex);
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
                <span
                  className="chip !text-[7px] !px-1.5 shrink-0"
                  style={{ background: KIND_COLOR[k] + "15", borderColor: KIND_COLOR[k] + "55", color: KIND_COLOR[k] }}
                >
                  {KIND_LABEL[k]}
                </span>
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
