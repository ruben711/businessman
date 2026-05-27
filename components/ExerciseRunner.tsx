"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/exercises";
import { checkAnswer, exercises as allExercises, CHAPTERS, diffChipClass } from "@/lib/exercises";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { fireXpToast } from "./XpToast";
import { syncLeaderboard } from "@/lib/leaderboardSync";
import { BadgeChip } from "./BadgeChip";

export function ExerciseRunner({ exercise, nextId, grouped }: { exercise: Exercise; nextId?: string; grouped?: boolean }) {
  const mounted = useMounted();
  const ex = exercise;
  const state = useStore((s) => s.exerciseStates[ex.id]);
  const record = useStore((s) => s.recordAttempt);
  const setLast = useStore((s) => s.setLastAnswer);
  const setNote = useStore((s) => s.setNote);
  const toggleFav = useStore((s) => s.toggleFavorite);

  const [answer, setAnswer] = useState<any>(initialAnswer(ex));
  const [feedback, setFeedback] = useState<null | { correct: boolean; xpGained: number; newBadges: string[] }>(null);
  const [showModel, setShowModel] = useState(false);
  const [note, setNoteVal] = useState("");

  useEffect(() => {
    if (mounted && state?.lastAnswer != null) setAnswer(state.lastAnswer);
    if (mounted && state?.notes) setNoteVal(state.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, ex.id]);

  function submit() {
    const ok = checkAnswer(ex, answer);
    // Build chapter context for badge unlocks
    const perChapter: Record<number, { done: number; total: number }> = {};
    const st = useStore.getState().exerciseStates;
    for (const c of CHAPTERS) {
      const ids = allExercises.filter((e) => e.chapter === c.num).map((e) => e.id);
      const total = ids.length;
      let done = ids.filter((id) => st[id]?.solved).length;
      // include this attempt if it's a first-solve
      if (ok && ex.chapter === c.num && !st[ex.id]?.solved) done += 1;
      perChapter[c.num] = { done, total };
    }
    const totalExercises = allExercises.length;

    const { xpGained, newBadges } = record(ex.id, ex.chapter, ok, { totalExercises, perChapter });
    setLast(ex.id, answer);
    setFeedback({ correct: ok, xpGained, newBadges });
    if (ok && xpGained > 0) fireXpToast(xpGained);
    // Auto-reveal model solution on correct answer
    if (ok && ex.explanation) setShowModel(true);
    syncLeaderboard();
  }

  const attempts = state?.attempts || 0;
  const canShowModel = attempts >= 3 || !!feedback;

  return (
    <div className="space-y-5">
      {ex.context && (
        <div className="panel p-5">
          <div className="label mb-3">// CONTEXT</div>
          <div className="text-[14px] leading-relaxed text-ink/90">{ex.context}</div>
        </div>
      )}
      <div>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="chip chip-acc">H{ex.chapter}</span>
              <span className={diffChipClass(ex.difficulty)}>{ex.difficulty}</span>
              <span className="chip">{ex.type}</span>
            </div>
            <h1 className="text-[22px] font-semibold leading-snug text-ink">{ex.question}</h1>
          </div>
          <button onClick={() => toggleFav(ex.id)} className="btn btn-icon btn-ghost btn-sm" aria-label="Favoriet">
            <span className={state?.favorite ? "text-warn" : "text-ink-3"}>★</span>
          </button>
        </div>

        <div className="panel p-5 mb-5">
          <Renderer ex={ex} answer={answer} setAnswer={setAnswer} disabled={!!feedback?.correct} />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button className="btn btn-primary" onClick={submit} disabled={feedback?.correct}>Verbeter</button>
          {feedback && (
            <button className="btn btn-ghost" onClick={() => { setFeedback(null); setAnswer(initialAnswer(ex)); }}>
              Opnieuw
            </button>
          )}
          {canShowModel && ex.explanation && (
            <button className="btn btn-ghost" onClick={() => setShowModel((s) => !s)}>
              {showModel ? "Verberg" : "Toon"} modeloplossing
            </button>
          )}
          {/* Old "next" button only shown in standalone (non-grouped) mode */}
          {!grouped && nextId && (
            <Link href={`/oefeningen/${nextId}`} className="btn ml-auto">Volgende →</Link>
          )}
        </div>

        {feedback && (
          <div className={`panel p-4 mb-5 anim-in ${feedback.correct ? "border-l-2 border-l-acc" : "border-l-2 border-l-err"}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-pixel text-[10px] ${feedback.correct ? "text-acc" : "text-err"}`}>
                {feedback.correct ? "✓ CORRECT" : "✗ INCORRECT"}
              </span>
              {feedback.correct && feedback.xpGained > 0 && (
                <span className="chip chip-acc">+{feedback.xpGained} XP</span>
              )}
              {feedback.newBadges?.length > 0 && (
                <span className="flex items-center gap-2 ml-2">
                  <span className="font-pixel text-[8px] text-warn tracking-[0.1em]">UNLOCKED</span>
                  {feedback.newBadges.map((id) => <BadgeChip key={id} id={id} />)}
                </span>
              )}
            </div>
            {!feedback.correct && ex.hint && <div className="text-[13px] text-ink-2 mt-2">{ex.hint}</div>}
          </div>
        )}

        {showModel && ex.explanation && (
          <div className="panel p-5 mb-5 anim-in">
            <div className="label mb-3">// MODELOPLOSSING</div>
            <div className="text-[14px] leading-relaxed text-ink/90">{ex.explanation}</div>
          </div>
        )}

        <details className="panel group overflow-hidden">
          <summary className="cursor-pointer flex items-center gap-3 px-4 py-3 list-none hover:bg-hover/40 transition">
            <span className="label">// NOTITIE</span>
            {note?.trim() && <span className="chip chip-acc !text-[7px] !px-1.5">SAVED</span>}
            <span className="ml-auto font-pixel text-[8px] text-ink-3 group-open:hidden">EXPAND ▾</span>
            <span className="ml-auto font-pixel text-[8px] text-acc hidden group-open:inline">COLLAPSE ▴</span>
          </summary>
          <div className="px-4 pb-4 pt-2 border-t border-line/[0.06]">
            <textarea
              className="input text-[13px]"
              value={note}
              onChange={(e) => { setNoteVal(e.target.value); setNote(ex.id, e.target.value); }}
              placeholder="Persoonlijke aantekening…"
            />
          </div>
        </details>
      </div>
    </div>
  );
}

function initialAnswer(ex: Exercise): any {
  switch (ex.type) {
    case "mc": return -1;
    case "tf": return null;
    case "open": return "";
    case "cloze": return ex.blanks.map(() => "");
    case "order": return [...ex.items].sort(() => Math.random() - 0.5);
    case "match": return ex.pairs.map((p) => ({ left: p.left, right: "" }));
    case "case": return ex.steps.map(() => false);
  }
}

function Renderer({ ex, answer, setAnswer, disabled }: { ex: Exercise; answer: any; setAnswer: (a: any) => void; disabled?: boolean }) {
  if (ex.type === "mc") {
    return (
      <div className="space-y-2">
        {ex.options.map((opt, i) => (
          <label key={i} className={`flex items-start gap-3 p-3 rounded cursor-pointer border transition ${
            answer === i ? "bg-acc/[0.06] border-acc/40" : "border-line/[0.06] hover:bg-hover/40 hover:border-line/[0.10]"
          }`}>
            <span className="font-pixel text-[10px] text-ink-3 w-4 mt-0.5">{String.fromCharCode(65 + i)}</span>
            <input type="radio" name={ex.id} className="sr-only" checked={answer === i} onChange={() => setAnswer(i)} disabled={disabled} />
            <span className="text-[14px] text-ink flex-1">{opt}</span>
            {answer === i && <span className="text-acc text-[12px]">●</span>}
          </label>
        ))}
      </div>
    );
  }
  if (ex.type === "tf") {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[{v: true, l: "WAAR"}, {v: false, l: "NIET WAAR"}].map((o) => (
          <button key={o.l} disabled={disabled}
            onClick={() => setAnswer(o.v)}
            className={`btn h-12 ${answer === o.v ? "btn-primary" : ""}`}>{o.l}</button>
        ))}
      </div>
    );
  }
  if (ex.type === "open") {
    return <input className="input text-[15px]" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Typ je antwoord…" disabled={disabled} />;
  }
  if (ex.type === "cloze") {
    const parts = ex.text.split(/\{\{(\d+)\}\}/g);
    return (
      <div className="text-[15px] leading-loose text-ink">
        {parts.map((p, i) =>
          i % 2 === 0 ? <span key={i}>{p}</span> : (
            <input
              key={i}
              className="inline-block mx-1 px-2 py-1 bg-inset border-b-2 border-acc/50 focus:border-acc focus:outline-none w-32 text-center text-acc font-pixel text-[10px]"
              value={answer[parseInt(p, 10)] || ""}
              onChange={(e) => { const next = [...answer]; next[parseInt(p, 10)] = e.target.value; setAnswer(next); }}
              disabled={disabled}
            />
          )
        )}
      </div>
    );
  }
  if (ex.type === "order") {
    return (
      <div className="space-y-2">
        {answer.map((it: string, i: number) => (
          <div key={it} className="flex items-center gap-3 p-2.5 bg-elevated border border-line/[0.06] rounded">
            <span className="font-pixel text-[9px] text-acc w-6">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[14px] flex-1">{it}</span>
            <button disabled={disabled || i === 0} onClick={() => {
              const next = [...answer]; [next[i-1], next[i]] = [next[i], next[i-1]]; setAnswer(next);
            }} className="btn btn-sm btn-icon">↑</button>
            <button disabled={disabled || i === answer.length - 1} onClick={() => {
              const next = [...answer]; [next[i+1], next[i]] = [next[i], next[i+1]]; setAnswer(next);
            }} className="btn btn-sm btn-icon">↓</button>
          </div>
        ))}
      </div>
    );
  }
  if (ex.type === "match") {
    const rightOptions = ex.pairs.map((p) => p.right);
    return (
      <div className="space-y-2">
        {ex.pairs.map((p, i) => (
          <div key={p.left} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className="text-[14px] text-ink">{p.left}</div>
            <span className="text-ink-4">→</span>
            <select
              className="input"
              value={answer[i]?.right || ""}
              onChange={(e) => {
                const next = [...answer];
                next[i] = { left: p.left, right: e.target.value };
                setAnswer(next);
              }}
              disabled={disabled}
            >
              <option value="">— kies —</option>
              {rightOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>
    );
  }
  if (ex.type === "case") {
    return (
      <div className="space-y-3">
        {ex.steps.map((step, i) => (
          <details key={i} className="panel-elev group overflow-hidden">
            <summary className="cursor-pointer flex items-start gap-3 p-4 list-none">
              <span className="font-pixel text-[9px] text-acc mt-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[14px] flex-1">{step.prompt}</span>
              <input
                type="checkbox"
                checked={!!answer[i]}
                onChange={(e) => { const next = [...answer]; next[i] = e.target.checked; setAnswer(next); }}
                onClick={(e) => e.stopPropagation()}
                disabled={disabled}
                className="mt-1 accent-acc"
              />
              <span className="text-ink-3 text-[10px] mt-1 group-open:rotate-180 transition">▾</span>
            </summary>
            <div className="px-4 pb-4 pt-2 border-t border-line/[0.06]">
              <div className="label mb-2">// OPLOSSING</div>
              <div className="text-[13px] leading-relaxed text-ink-2">{step.modelAnswer}</div>
            </div>
          </details>
        ))}
      </div>
    );
  }
  return null;
}
