"use client";
import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { exercises, CHAPTERS } from "@/lib/exercises";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

function OefeningenInner() {
  const mounted = useMounted();
  const sp = useSearchParams();
  const [chapter, setChapter] = useState<number | "all">(sp.get("ch") ? parseInt(sp.get("ch") as string, 10) : "all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "todo" | "solved" | "favorites">("all");
  const states = useStore((s) => s.exerciseStates);

  const items = useMemo(() => {
    return exercises.filter((e) => {
      if (chapter !== "all" && e.chapter !== chapter) return false;
      if (difficulty !== "all" && e.difficulty !== difficulty) return false;
      if (mounted && filter === "todo" && states[e.id]?.solved) return false;
      if (mounted && filter === "solved" && !states[e.id]?.solved) return false;
      if (mounted && filter === "favorites" && !states[e.id]?.favorite) return false;
      return true;
    });
  }, [chapter, difficulty, filter, states, mounted]);

  return (
    <div className="space-y-6 anim-in">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-3">// QUEST LOG</div>
          <h1 className="text-[32px] font-semibold tracking-tight">Oefeningen</h1>
        </div>
        <span className="font-pixel text-[9px] text-ink-3 num">{items.length} / {exercises.length}</span>
      </header>

      <div className="panel p-4 flex flex-wrap gap-3 items-center">
        <select className="input max-w-[220px]" value={chapter} onChange={(e) => setChapter(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}>
          <option value="all">Alle hoofdstukken</option>
          {CHAPTERS.map((c) => <option key={c.num} value={c.num}>H{c.num} · {c.title}</option>)}
        </select>
        <select className="input max-w-[160px]" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="all">Alle niveaus</option>
          <option value="basis">Basis</option>
          <option value="midden">Midden</option>
          <option value="diepgang">Diepgang</option>
        </select>
        <div className="flex gap-1 ml-auto">
          {([
            { v: "all", l: "ALLE" },
            { v: "todo", l: "OPEN" },
            { v: "solved", l: "DONE" },
            { v: "favorites", l: "★" },
          ] as const).map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v as any)} className={`btn btn-sm ${filter === f.v ? "btn-primary" : "btn-ghost"}`}>{f.l}</button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="panel p-12 text-center text-ink-3 text-[13px]">Geen oefeningen die voldoen aan deze filters.</div>
      ) : (
        <div className="panel overflow-hidden">
          {items.map((e) => {
            const st = mounted ? states[e.id] : undefined;
            const status = st?.solved ? "done" : st?.attempts ? "wip" : "todo";
            return (
              <Link key={e.id} href={`/oefeningen/${e.id}`} className="row group">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === "done" ? "bg-acc shadow-[0_0_6px_rgb(110_231_183/0.6)]" :
                  status === "wip" ? "bg-warn" : "bg-ink-4"
                }`} />
                <span className="chip">H{e.chapter}</span>
                <span className="chip">{e.difficulty}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-ink truncate">{e.question}</div>
                </div>
                {st?.favorite && <span className="text-warn text-[10px]">★</span>}
                <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OefeningenPage() {
  return <Suspense fallback={<div className="text-ink-3">Laden…</div>}><OefeningenInner /></Suspense>;
}
