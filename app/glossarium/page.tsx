"use client";
import { useMemo, useState } from "react";
import glossarium from "@/data/glossarium.json";

export default function GlossariumPage() {
  const [q, setQ] = useState("");
  const [ch, setCh] = useState<"all" | number>("all");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return glossarium
      .filter((g) => ch === "all" || g.chapter === ch)
      .filter((g) => !t || g.term.toLowerCase().includes(t) || g.definition.toLowerCase().includes(t))
      .sort((a, b) => a.term.localeCompare(b.term, "nl"));
  }, [q, ch]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const g of filtered) {
      const letter = g.term[0].toUpperCase();
      (map[letter] = map[letter] || []).push(g);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3">// CODEX</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Glossarium</h1>
        <p className="text-[14px] text-ink-2 mt-3">{glossarium.length} termen, alfabetisch.</p>
      </header>

      <div className="panel p-4 flex gap-3 flex-wrap items-center">
        <input className="input max-w-md flex-1" placeholder="Zoek term of definitie…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={ch} onChange={(e) => setCh(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}>
          <option value="all">Alle hoofdstukken</option>
          {[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>Hoofdstuk {n}</option>)}
        </select>
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).sort().map((letter) => (
          <section key={letter}>
            <div className="flex items-center gap-3 mb-3">
              <div className="font-pixel text-[14px] text-acc">{letter}</div>
              <div className="divider flex-1" />
              <span className="font-pixel text-[8px] text-ink-4 num">{grouped[letter].length}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {grouped[letter].map((g) => (
                <div key={g.term} className="panel panel-hover p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[14px] font-medium text-ink">{g.term}</div>
                    <span className="chip">H{g.chapter}</span>
                  </div>
                  <p className="text-[12px] text-ink-2 leading-relaxed">{g.definition}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && <p className="text-ink-3 italic text-[13px]">Geen termen gevonden.</p>}
      </div>
    </div>
  );
}
