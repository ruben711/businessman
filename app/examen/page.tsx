"use client";
import { useState, useEffect, useMemo } from "react";
import { exercises, checkAnswer, diffChipClass, type Exercise } from "@/lib/exercises";
import { useStore } from "@/lib/store";
import { syncLeaderboard } from "@/lib/leaderboardSync";

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const EXAM_SIZE = 12;
const DURATION = 20 * 60;

export default function ExamenPage() {
  const [items, setItems] = useState<Exercise[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(DURATION);
  const record = useStore((s) => s.recordAttempt);
  const reportExam = useStore((s) => s.reportExamScore);

  // Only these types support an inline exam-style input
  const EXAM_TYPES = new Set<Exercise["type"]>(["mc", "tf", "open"]);
  const examPool = exercises.filter((e) => EXAM_TYPES.has(e.type));

  useEffect(() => {
    if (!items || submitted) return;
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [items, submitted]);

  useEffect(() => { if (time === 0 && !submitted && items) submit(); }, [time]);

  function start() {
    setItems(pickRandom(examPool, EXAM_SIZE));
    setAnswers({});
    setSubmitted(false);
    setTime(DURATION);
  }

  function submit() {
    if (!items) return;
    setSubmitted(true);
    let correctCount = 0;
    items.forEach((ex) => {
      const ans = answers[ex.id];
      const ok = ans !== undefined && checkAnswer(ex, ans);
      if (ok) correctCount++;
      record(ex.id, ex.chapter, ok);
    });
    // Award perfect-exam badge if 100%
    if (correctCount === items.length) reportExam(correctCount, items.length);
    syncLeaderboard(true);
  }

  const score = useMemo(() => {
    if (!items || !submitted) return 0;
    return items.filter((ex) => checkAnswer(ex, answers[ex.id])).length;
  }, [items, submitted, answers]);

  if (!items) {
    return (
      <div className="max-w-[640px] mx-auto pt-12 anim-in">
        <div className="text-center">
          <div className="eyebrow mb-4">// BOSS FIGHT</div>
          <h1 className="text-[40px] font-semibold tracking-tight mb-3">Examensimulatie</h1>
          <p className="text-[14px] text-ink-2 max-w-[420px] mx-auto">
            {EXAM_SIZE} willekeurige vragen, {DURATION / 60} minuten. Score + modeloplossing achteraf.
          </p>
        </div>
        <div className="panel p-6 mt-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <Pill label="VRAGEN" value={String(EXAM_SIZE)} />
            <Pill label="TIJD" value={`${DURATION/60}m`} />
            <Pill label="POOL" value={String(examPool.length)} />
          </div>
          <button className="btn btn-primary btn-lg w-full mt-6" onClick={start}>▶ START EXAM</button>
        </div>
      </div>
    );
  }

  const mm = Math.floor(time / 60).toString().padStart(2, "0");
  const ss = (time % 60).toString().padStart(2, "0");
  const lowTime = time < 60;

  return (
    <div className="space-y-6">
      <header className="sticky top-[60px] z-20 bg-canvas/95 backdrop-blur -mx-8 px-8 py-4 border-b border-line/[0.06]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow">// EXAM IN PROGRESS</div>
            <div className="font-pixel text-[10px] text-ink mt-1">Q{Object.keys(answers).length} / {items.length}</div>
          </div>
          <div className="flex items-center gap-4">
            {!submitted && (
              <div className={`font-pixel text-[16px] num ${lowTime ? "text-err anim-pulse" : "text-acc"}`}>
                {mm}:{ss}
              </div>
            )}
            {submitted ? (
              <span className="chip chip-acc !text-[10px] !px-3 !py-1.5">SCORE {score}/{items.length}</span>
            ) : (
              <button className="btn btn-primary" onClick={submit}>Inleveren</button>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {items.map((ex, i) => {
          const ans = answers[ex.id];
          const ok = submitted && checkAnswer(ex, ans);
          return (
            <div key={ex.id} className={`panel p-5 ${submitted ? (ok ? "border-l-2 !border-l-acc" : "border-l-2 !border-l-err") : ""}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-pixel text-[9px] text-acc">Q{String(i + 1).padStart(2, "0")}</span>
                <span className="chip">H{ex.chapter}</span>
                <span className={diffChipClass(ex.difficulty)}>{ex.difficulty}</span>
              </div>
              <div className="text-[15px] mb-4 text-ink">{ex.question}</div>
              <ExamInput ex={ex} value={ans} onChange={(v) => setAnswers((a) => ({ ...a, [ex.id]: v }))} disabled={submitted} />
              {submitted && (
                <div className="mt-4 pt-4 border-t border-line/[0.06]">
                  <div className={`font-pixel text-[9px] ${ok ? "text-acc" : "text-err"}`}>{ok ? "✓ CORRECT" : "✗ INCORRECT"}</div>
                  {ex.explanation && <p className="text-[13px] text-ink-2 mt-2">{ex.explanation}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {submitted && (
        <div className="text-center pt-4">
          <button className="btn btn-primary" onClick={start}>New Exam</button>
        </div>
      )}
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label mb-2">{label}</div>
      <div className="font-pixel text-[14px] text-ink num">{value}</div>
    </div>
  );
}

function ExamInput({ ex, value, onChange, disabled }: { ex: Exercise; value: any; onChange: (v: any) => void; disabled?: boolean }) {
  if (ex.type === "mc") {
    return (
      <div className="space-y-1.5">
        {ex.options.map((opt, i) => (
          <label key={i} className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer text-[13px] transition ${
            value === i ? "bg-acc/[0.06] border-acc/40" : "border-line/[0.06] hover:bg-hover/40"
          }`}>
            <span className="font-pixel text-[9px] text-ink-3 mt-0.5">{String.fromCharCode(65 + i)}</span>
            <input type="radio" className="sr-only" checked={value === i} onChange={() => onChange(i)} disabled={disabled} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }
  if (ex.type === "tf") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <button disabled={disabled} onClick={() => onChange(true)} className={`btn ${value === true ? "btn-primary" : ""}`}>WAAR</button>
        <button disabled={disabled} onClick={() => onChange(false)} className={`btn ${value === false ? "btn-primary" : ""}`}>NIET WAAR</button>
      </div>
    );
  }
  if (ex.type === "open") {
    return <input className="input" value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder="Typ je antwoord…" />;
  }
  return <div className="text-[12px] text-ink-3 italic">Vraagtype niet in examen-modus.</div>;
}
