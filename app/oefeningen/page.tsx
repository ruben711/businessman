"use client";
import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { exercises, CHAPTERS, type Exercise, diffChipClass } from "@/lib/exercises";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";

const TYPE_LABELS: Record<string, string> = {
  mc: "MC", tf: "T/F", open: "OPEN", cloze: "FILL", order: "ORDER", match: "MATCH", case: "CASE",
};

function OefeningenInner() {
  const mounted = useMounted();
  const sp = useSearchParams();
  const router = useRouter();
  const initialCh = sp.get("ch") ? parseInt(sp.get("ch") as string, 10) : null;
  const [difficulty, setDifficulty] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [filter, setFilter] = useState<"all" | "todo" | "solved" | "favorites">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set(initialCh ? [initialCh] : []));
  const states = useStore((s) => s.exerciseStates);

  // Sync URL when initial ch param is set
  useEffect(() => {
    if (initialCh && !expanded.has(initialCh)) setExpanded(new Set([initialCh]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCh]);

  const filterEx = (e: Exercise) => {
    if (difficulty !== "all" && e.difficulty !== difficulty) return false;
    if (type !== "all" && e.type !== type) return false;
    if (mounted && filter === "todo" && states[e.id]?.solved) return false;
    if (mounted && filter === "solved" && !states[e.id]?.solved) return false;
    if (mounted && filter === "favorites" && !states[e.id]?.favorite) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!e.question.toLowerCase().includes(s) && !e.tags.some((t) => t.toLowerCase().includes(s))) return false;
    }
    return true;
  };

  const byChapter = useMemo(() => {
    const m: Record<number, Exercise[]> = {};
    for (const c of CHAPTERS) m[c.num] = [];
    for (const e of exercises.filter(filterEx)) m[e.chapter].push(e);
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, type, filter, search, states, mounted]);

  const totalShown = Object.values(byChapter).reduce((a, b) => a + b.length, 0);

  const toggleChapter = (n: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(n) ? next.delete(n) : next.add(n);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(CHAPTERS.map((c) => c.num)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="space-y-6 anim-in">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-3">// QUEST LOG</div>
          <h1 className="text-[32px] font-semibold tracking-tight">Oefeningen</h1>
          <p className="text-[13px] text-ink-2 mt-2">Per hoofdstuk gegroepeerd · {exercises.length} totaal</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] text-ink-3 num">{totalShown} / {exercises.length}</span>
          <button onClick={expandAll} className="btn btn-ghost btn-sm">Open alle</button>
          <button onClick={collapseAll} className="btn btn-ghost btn-sm">Sluit alle</button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="panel p-4 flex flex-wrap gap-3 items-center">
        <input
          className="input max-w-[260px] flex-1"
          placeholder="Zoek op vraag of tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[150px]" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="all">Alle niveaus</option>
          <option value="basis">Basis</option>
          <option value="midden">Midden</option>
          <option value="diepgang">Diepgang</option>
        </select>
        <select className="input max-w-[140px]" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Alle types</option>
          <option value="mc">Meerkeuze</option>
          <option value="tf">Waar/Niet</option>
          <option value="open">Open</option>
          <option value="cloze">Invul</option>
          <option value="order">Volgorde</option>
          <option value="match">Match</option>
          <option value="case">Casus</option>
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

      {/* Chapter blocks */}
      <div className="space-y-3">
        {CHAPTERS.map((c) => {
          const list = byChapter[c.num];
          const totalInCh = exercises.filter((e) => e.chapter === c.num).length;
          const doneInCh = mounted
            ? exercises.filter((e) => e.chapter === c.num && states[e.id]?.solved).length
            : 0;
          const pct = totalInCh === 0 ? 0 : doneInCh / totalInCh;
          const isOpen = expanded.has(c.num);
          const isHidden = list.length === 0 && (search || difficulty !== "all" || type !== "all" || filter !== "all");

          if (isHidden) return null;

          return (
            <section key={c.num} className="panel overflow-hidden">
              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(c.num)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-hover/40 transition text-left"
              >
                <div className="font-pixel text-[14px] text-acc w-12 num">{String(c.num).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-ink">{c.title}</div>
                  <div className="flex items-center gap-3 mt-1.5 font-pixel text-[8px] text-ink-3 num">
                    <span>{list.length} / {totalInCh}</span>
                    <span className="text-ink-4">·</span>
                    <span>{doneInCh} SOLVED</span>
                  </div>
                </div>
                <div className="w-32 hidden md:block">
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                </div>
                <Link
                  href={`/theorie/${c.num}`}
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-ghost btn-sm hidden md:inline-flex"
                >
                  Theorie
                </Link>
                <span className={`font-pixel text-[10px] text-ink-3 transition-transform ${isOpen ? "rotate-90" : ""}`}>▸</span>
              </button>

              {/* Exercises */}
              {isOpen && (
                <div className="border-t border-line/[0.06] bg-canvas/30 anim-in">
                  {list.length === 0 ? (
                    <div className="px-5 py-6 text-center text-ink-4 text-[12px] italic">Geen oefeningen voor deze filters in dit hoofdstuk.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-px bg-line/[0.04]">
                      {list.map((e) => {
                        const st = mounted ? states[e.id] : undefined;
                        const status = st?.solved ? "done" : st?.attempts ? "wip" : "todo";
                        return (
                          <Link key={e.id} href={`/oefeningen/${e.id}`} className="bg-panel px-4 py-3 flex items-center gap-3 hover:bg-hover/60 transition group">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              status === "done" ? "bg-acc shadow-[0_0_6px_rgb(110_231_183/0.6)]" :
                              status === "wip" ? "bg-warn" : "bg-ink-4"
                            }`} />
                            <span className="chip shrink-0 !text-[7px] !px-1.5">{TYPE_LABELS[e.type]}</span>
                            <span className={`${diffChipClass(e.difficulty)} shrink-0 !text-[7px] !px-1.5`}>{e.difficulty.slice(0, 4)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] text-ink truncate">{e.question}</div>
                            </div>
                            {st?.favorite && <span className="text-warn text-[10px] shrink-0">★</span>}
                            <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition shrink-0">→</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {totalShown === 0 && (
        <div className="panel p-12 text-center">
          <div className="text-ink-3 text-[13px] mb-3">Niets gevonden met deze filters.</div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setDifficulty("all"); setType("all"); setFilter("all"); }}>Reset filters</button>
        </div>
      )}
    </div>
  );
}

export default function OefeningenPage() {
  return <Suspense fallback={<div className="text-ink-3">Laden…</div>}><OefeningenInner /></Suspense>;
}
