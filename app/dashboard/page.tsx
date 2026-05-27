"use client";
import Link from "next/link";
import { useStore, levelForXp } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { CHAPTERS, exercises } from "@/lib/exercises";
import { BadgeChip } from "@/components/BadgeChip";
import { BADGE_DEFS } from "@/lib/badges";

export default function Dashboard() {
  const mounted = useMounted();
  const xp = useStore((s) => s.xp);
  const solved = useStore((s) => s.solvedExerciseIds);
  const attempts = useStore((s) => s.attempts);
  const streak = useStore((s) => s.streak);
  const badges = useStore((s) => s.badges);
  const customBadges = useStore((s) => s.customBadges);
  const reset = useStore((s) => s.resetProgress);
  const resetMode = useStore((s) => s.resetMode);

  if (!mounted) return <div className="text-ink-3">Laden…</div>;
  const { level, intoLevel, needForLevel, progress } = levelForXp(xp);

  return (
    <div className="space-y-10 anim-in">
      <header>
        <div className="eyebrow mb-3">// PROFILE / STATS</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Dashboard</h1>
      </header>

      <div className="grid md:grid-cols-4 gap-3">
        <Stat label="LEVEL" value={String(level)} sub={`${intoLevel} / ${needForLevel} XP`} bar={progress} />
        <Stat label="TOTAL XP" value={String(xp)} sub={`${solved.length} solved`} />
        <Stat label="STREAK" value={`${streak.current}d`} sub={`PB: ${streak.longest}d`} />
        <Stat label="BADGES" value={`${badges.length + customBadges.length}`} sub={`${BADGE_DEFS.length} total + custom`} />
      </div>

      {(badges.length > 0 || customBadges.length > 0) && (
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="label">// EARNED · BADGES</div>
            <Link href="/leaderboard" className="font-pixel text-[8px] text-ink-3 hover:text-acc transition tracking-[0.1em]">VIEW ALL →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {customBadges.map((b) => <BadgeChip key={b.id} custom={b} size="md" />)}
            {badges.map((b) => <BadgeChip key={b.id} id={b.id} size="md" />)}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-[10px] tracking-[0.12em] text-ink-2">CAMPAIGN · CHAPTERS</h2>
          <span className="font-pixel text-[8px] text-ink-4 num">{solved.length} / {exercises.length}</span>
        </div>
        <div className="grid gap-2">
          {CHAPTERS.map((c) => {
            const total = exercises.filter((e) => e.chapter === c.num).length;
            const done = solved.filter((id) => exercises.find((e) => e.id === id)?.chapter === c.num).length;
            const pct = total === 0 ? 0 : (done / total);
            return (
              <Link key={c.num} href={`/theorie/${c.num}`} className="panel panel-hover px-5 py-4 flex items-center gap-5 group">
                <div className="font-pixel text-[12px] text-acc w-10">{String(c.num).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-ink mb-1.5">{c.title}</div>
                  <div className="bar">
                    <div className="bar-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                </div>
                <div className="font-pixel text-[9px] text-ink-3 num w-20 text-right">{done} / {total}</div>
                <span className="font-pixel text-[8px] text-ink-4 group-hover:text-acc transition">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-pixel text-[10px] tracking-[0.12em] text-ink-2 mb-4">RECENT ACTIVITY</h2>
        {attempts.length === 0 ? (
          <div className="panel p-8 text-center text-ink-3 text-[13px]">No attempts yet — start a quest.</div>
        ) : (
          <div className="panel overflow-hidden">
            {attempts.slice(0, 12).map((a) => (
              <Link key={a.id} href={`/oefeningen/${a.exerciseId}`} className="row hover:!bg-hover/40">
                <span className={`font-pixel text-[10px] w-4 ${a.correct ? "text-acc" : "text-err"}`}>{a.correct ? "✓" : "✗"}</span>
                <span className="chip">H{a.chapter}</span>
                <span className="text-[13px] flex-1 truncate text-ink">{a.exerciseId}</span>
                <span className="font-pixel text-[8px] text-ink-4 num">{new Date(a.ts).toLocaleString("nl-BE")}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="panel p-6">
        <div className="label mb-4">// DANGER ZONE</div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Reset oefen-voortgang?")) resetMode("exercises"); }}>Reset oefeningen</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm("Reset theorie-voortgang?")) resetMode("theory"); }}>Reset theorie</button>
          <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Volledig resetten?")) reset(); }}>Hard reset</button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, bar }: { label: string; value: string; sub: string; bar?: number }) {
  return (
    <div className="panel p-5">
      <div className="label mb-3">{label}</div>
      <div className="font-pixel text-[18px] text-ink num">{value}</div>
      <div className="text-[11px] text-ink-3 mt-2 num">{sub}</div>
      {bar !== undefined && (
        <div className="bar mt-3"><div className="bar-fill" style={{ width: `${Math.round(bar * 100)}%` }} /></div>
      )}
    </div>
  );
}
