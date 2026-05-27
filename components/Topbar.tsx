"use client";
import Link from "next/link";
import { useStore, levelForXp } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { NotificationBell } from "./NotificationBell";

export function Topbar() {
  const mounted = useMounted();
  const xp = useStore((s) => s.xp);
  const solved = useStore((s) => s.solvedExerciseIds.length);
  const streak = useStore((s) => s.streak.current);
  const { level, progress } = mounted ? levelForXp(xp) : { level: 1, progress: 0 };

  return (
    <header className="h-[60px] border-b border-line/[0.06] bg-canvas/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-8 gap-8">
      {/* Player stats — gaming HUD style */}
      <div className="flex items-center gap-6 flex-1">
        <Stat label="LVL" value={mounted ? String(level) : "—"} />
        <div className="hidden md:flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[8px] tracking-[0.12em] text-ink-3">XP</span>
            <span className="font-pixel text-[9px] text-acc num">{mounted ? xp : 0}</span>
          </div>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${mounted ? Math.round(progress * 100) : 0}%` }} />
          </div>
        </div>
        <div className="hidden lg:block divider-strong w-px h-6 bg-line/[0.06]" />
        <Stat label="SOLVED" value={mounted ? String(solved) : "—"} />
        <Stat label="STREAK" value={mounted ? `${streak}` : "—"} suffix="d" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Link href="/dashboard" className="btn btn-ghost btn-sm">Profile</Link>
      </div>
    </header>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-[42px]">
      <span className="font-pixel text-[8px] tracking-[0.12em] text-ink-3">{label}</span>
      <span className="font-pixel text-[11px] text-ink num">{value}{suffix && <span className="text-ink-3 ml-0.5">{suffix}</span>}</span>
    </div>
  );
}
