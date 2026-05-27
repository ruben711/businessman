"use client";
import { useEffect } from "react";
import { getUid, getName } from "@/lib/identity";
import { syncLeaderboard } from "@/lib/leaderboardSync";
import { useStore } from "@/lib/store";

export function ClientBoot() {
  useEffect(() => {
    getUid();
    getName();
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "visitor", uid: getUid() }),
    }).catch(() => {});

    syncLeaderboard(true);

    // Pull any admin-granted custom badges down into local state
    (async () => {
      try {
        const r = await fetch("/api/leaderboard");
        if (!r.ok) return;
        const data = await r.json();
        const me = (data.users || []).find((u: any) => u.uid === getUid());
        if (me?.customBadges) {
          const local = useStore.getState().customBadges;
          // Only update if the server has something we don't, to avoid overwriting local
          if (me.customBadges.length !== local.length) {
            useStore.setState({ customBadges: me.customBadges });
          }
        }
      } catch {}
    })();

    const s = useStore.getState();
    if (s.xpRulesVersion < 1) {
      // future migration logic
    }
  }, []);
  return null;
}
