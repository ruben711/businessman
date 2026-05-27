"use client";
import { useEffect, useState } from "react";
import { getUid, getName, setName } from "@/lib/identity";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { syncLeaderboard } from "@/lib/leaderboardSync";

function genRandomName() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return "User" + n;
}

export function WelcomeModal() {
  const mounted = useMounted();
  const onboarded = useStore((s) => s.hasOnboarded);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const [input, setInput] = useState("");
  const [random, setRandom] = useState("");

  useEffect(() => {
    if (!mounted) return;
    setRandom(genRandomName());
    setInput("");
  }, [mounted]);

  if (!mounted || onboarded) return null;

  async function chooseRandom() {
    const name = random || genRandomName();
    setName(name);
    setOnboarded();
    await syncLeaderboard(true);
  }

  async function chooseCustom() {
    const clean = input.trim().slice(0, 20);
    if (!clean) return;
    setName(clean);
    setOnboarded();
    await syncLeaderboard(true);
  }

  async function skip() {
    // Don't change the auto-generated name — just mark onboarded
    setOnboarded();
    await syncLeaderboard(true);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 anim-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={skip} />
      <div className="relative panel-elev shadow-lift w-full max-w-[460px] p-6">
        <div className="eyebrow mb-2">// NEW PLAYER</div>
        <h2 className="text-[22px] font-semibold mb-1">Welkom op het leaderboard</h2>
        <p className="text-[13px] text-ink-2 mb-5">
          Kies een naam die zichtbaar is op het publieke leaderboard, of speel anoniem met een willekeurige tag.
        </p>

        <div className="space-y-3">
          <div>
            <div className="label mb-2">// CUSTOM</div>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="bv. Ruben_V"
                maxLength={20}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") chooseCustom(); }}
                autoFocus
              />
              <button className="btn btn-primary" onClick={chooseCustom} disabled={!input.trim()}>Gebruik</button>
            </div>
          </div>

          <div className="divider my-4" />

          <div>
            <div className="label mb-2">// RANDOM</div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 panel px-3 py-2 font-mono text-[14px] text-ink">{random || "—"}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setRandom(genRandomName())} aria-label="Reroll">⟳</button>
              <button className="btn" onClick={chooseRandom}>Gebruik</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-line/[0.06]">
          <button className="text-[11px] text-ink-3 hover:text-ink transition font-pixel tracking-[0.08em]" onClick={skip}>
            SKIP →
          </button>
        </div>
      </div>
    </div>
  );
}
