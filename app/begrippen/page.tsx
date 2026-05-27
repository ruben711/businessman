"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BEGRIPPEN_TERMS, BEGRIPPEN_EXERCISES, CATEGORIES } from "@/lib/begrippen";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { ExerciseRunner } from "@/components/ExerciseRunner";
import type { Exercise } from "@/lib/exercises";

function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let s = seed ?? Math.floor(Math.random() * 1e9);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BegrippenPage() {
  const mounted = useMounted();
  const states = useStore((s) => s.exerciseStates);
  const [mode, setMode] = useState<"menu" | "queue">("menu");
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [filterCat, setFilterCat] = useState<string | "all">("all");
  // Track which exercise we've moved past so the same instance doesn't refresh state
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const overall = useMemo(() => {
    const done = BEGRIPPEN_EXERCISES.filter((e) => states[e.id]?.solved).length;
    return { done, total: BEGRIPPEN_EXERCISES.length };
  }, [states]);

  function startMode(cat: string | "all", filter: "all" | "unsolved" | "wrong") {
    let pool = BEGRIPPEN_EXERCISES;
    if (cat !== "all") pool = pool.filter((e) => e.tags?.some((t) => t.toLowerCase() === cat.toLowerCase()));
    if (mounted) {
      if (filter === "unsolved") pool = pool.filter((e) => !states[e.id]?.solved);
      if (filter === "wrong") pool = pool.filter((e) => states[e.id]?.attempts && !states[e.id]?.solved);
    }
    if (pool.length === 0) return;
    setQueue(shuffle(pool));
    setIdx(0);
    setSeenIds(new Set());
    setFilterCat(cat);
    setMode("queue");
  }

  function next() {
    if (idx + 1 >= queue.length) {
      setMode("menu");
      return;
    }
    setSeenIds((s) => new Set(s).add(queue[idx].id));
    setIdx(idx + 1);
  }

  function prev() {
    if (idx === 0) return;
    setIdx(idx - 1);
  }

  function reshuffle() {
    setQueue(shuffle(queue));
    setIdx(0);
    setSeenIds(new Set());
  }

  function exit() {
    setMode("menu");
  }

  // ===== QUEUE MODE =====
  if (mode === "queue" && queue.length > 0) {
    const ex = queue[idx];
    const isLast = idx === queue.length - 1;
    const isMc = ex.type === "mc";
    return (
      <div className="anim-in max-w-[820px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <button onClick={exit} className="font-pixel text-[8px] tracking-[0.1em] text-ink-3 hover:text-acc transition">← MENU</button>
          <div className="flex items-center gap-2">
            <span className={`chip ${isMc ? "chip-info" : "chip-acc"}`}>{isMc ? "MC" : "FILL"}</span>
            <span className="font-pixel text-[9px] text-ink-3 num">{idx + 1} / {queue.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 bar"><div className="bar-fill" style={{ width: `${((idx + 1) / queue.length) * 100}%` }} /></div>

        {/* Exercise — keyed so React fully remounts ExerciseRunner between exercises */}
        <ExerciseRunner key={ex.id} exercise={ex} grouped />

        {/* Nav */}
        <div className="mt-8 pt-6 border-t border-line/[0.06] flex items-center justify-between gap-3">
          <button onClick={prev} disabled={idx === 0} className="btn btn-ghost btn-sm">← Vorige</button>
          <span className="font-pixel text-[8px] text-ink-3 num">{idx + 1} / {queue.length}</span>
          {isLast ? (
            <button onClick={exit} className="btn btn-primary">Klaar ✓</button>
          ) : (
            <button onClick={next} className="btn btn-primary">Volgende →</button>
          )}
        </div>
      </div>
    );
  }

  // ===== MENU MODE =====
  const perCat = CATEGORIES.map((cat) => {
    const items = BEGRIPPEN_EXERCISES.filter((e) => e.tags?.some((t) => t.toLowerCase() === cat.toLowerCase()));
    const done = items.filter((e) => states[e.id]?.solved).length;
    return { cat, total: items.length, done: mounted ? done : 0 };
  });

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3">// CODEX · DRILL</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Begrippen</h1>
        <p className="text-[13px] text-ink-2 mt-2 max-w-[60ch]">
          {BEGRIPPEN_TERMS.length} kerntermen, {BEGRIPPEN_EXERCISES.length} oefeningen (MC + invul door elkaar). Eén vraag per keer.
        </p>
      </header>

      {/* Overall progress */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">// VOLLEDIGE VOORTGANG</div>
          <span className="font-pixel text-[9px] text-ink num">{mounted ? overall.done : 0} / {overall.total}</span>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: `${overall.total === 0 ? 0 : ((mounted ? overall.done : 0) / overall.total) * 100}%` }} /></div>
      </div>

      {/* Quick-start big buttons */}
      <div className="grid sm:grid-cols-3 gap-3">
        <button onClick={() => startMode("all", "all")} className="panel panel-hover p-5 text-left group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-acc">▶ ALLES</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">Alle {BEGRIPPEN_EXERCISES.length} oefeningen</div>
          <div className="text-[11px] text-ink-3">MC + invul, willekeurig door elkaar</div>
        </button>

        <button onClick={() => startMode("all", "unsolved")} className="panel panel-hover p-5 text-left group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-warn">◐ ONOPGELOST</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">
            {mounted ? overall.total - overall.done : "—"} resterend
          </div>
          <div className="text-[11px] text-ink-3">Alleen wat je nog niet hebt opgelost</div>
        </button>

        <button onClick={() => startMode("all", "wrong")} className="panel panel-hover p-5 text-left group">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-err">✗ FOUTEN</span>
            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
          </div>
          <div className="text-[14px] font-medium text-ink mb-1">
            {mounted ? Object.values(states).filter((s) => s?.attempts && !s?.solved).length : "—"} fout gemaakt
          </div>
          <div className="text-[11px] text-ink-3">Herkans wat je fout had</div>
        </button>
      </div>

      {/* Per category */}
      <div>
        <div className="label mb-3">// PER CATEGORIE</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {perCat.map(({ cat, total, done }) => {
            const pct = total === 0 ? 0 : done / total;
            return (
              <button key={cat} onClick={() => startMode(cat, "all")} className="panel panel-hover p-4 text-left flex items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-ink truncate">{cat}</div>
                  <div className="font-pixel text-[8px] text-ink-3 num mt-1">{done} / {total}</div>
                  <div className="bar mt-2"><div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} /></div>
                </div>
                <span className="font-pixel text-[10px] text-ink-3 group-hover:text-acc transition">▶</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Term reference */}
      <details className="panel">
        <summary className="cursor-pointer px-5 py-3 list-none flex items-center gap-3 hover:bg-hover/40 transition">
          <span className="label">// TERMEN LIJST</span>
          <span className="ml-auto font-pixel text-[8px] text-ink-3">EXPAND ▾</span>
        </summary>
        <div className="px-5 pb-5 pt-2 border-t border-line/[0.06] space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <div className="font-pixel text-[9px] text-acc mb-2">{cat.toUpperCase()}</div>
              <ul className="space-y-1.5">
                {BEGRIPPEN_TERMS.filter((t) => t.cat === cat).map((t) => (
                  <li key={t.term} className="flex gap-3 text-[13px]">
                    <span className="text-ink font-medium min-w-[180px]">{t.term}</span>
                    <span className="text-ink-2">{t.def}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
