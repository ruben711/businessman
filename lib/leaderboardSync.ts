"use client";
import { useStore } from "./store";
import { getUid, getName } from "./identity";

let syncing = false;
let lastSync = 0;

export async function syncLeaderboard(force = false) {
  if (syncing) return;
  if (!force && Date.now() - lastSync < 4000) return;
  syncing = true;
  try {
    const s = useStore.getState();
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: getUid(),
        name: getName(),
        xp: s.xp,
        solved: s.solvedExerciseIds.length,
        // null = expliciet gewist (vs ontbrekend = behouden op server)
        nameStyle: s.nameStyle ?? null,
        customTag: s.customTag ?? null,
        badges: s.badges.map((b) => b.id),
        customBadges: s.customBadges,
      }),
    });
    lastSync = Date.now();
  } catch {} finally { syncing = false; }
}
