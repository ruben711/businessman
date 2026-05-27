"use client";
import { useEffect } from "react";
import { getUid, getName } from "@/lib/identity";
import { syncLeaderboard } from "@/lib/leaderboardSync";
import { useStore } from "@/lib/store";

export function ClientBoot() {
  useEffect(() => {
    getUid();
    getName();
    // ping
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "visitor", uid: getUid() }),
    }).catch(() => {});
    // initial leaderboard sync
    syncLeaderboard(true);

    // XP rules version migration (auto-recalc if rules change)
    const s = useStore.getState();
    if (s.xpRulesVersion < 1) {
      // future migration logic
    }
  }, []);
  return null;
}
