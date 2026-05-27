// Badge catalog with unlock conditions.
// Custom badges (admin-granted) live alongside but have id starting with "custom-".

export type BadgeDef = {
  id: string;
  name: string;
  icon: string;     // single emoji or short string
  color: string;    // accent for the badge
  desc: string;     // short description for tooltip / earned screen
  // hidden badges only show after earning
  hidden?: boolean;
};

export const BADGE_DEFS: BadgeDef[] = [
  { id: "first-blood",   name: "First Blood",   icon: "◆", color: "#6ee7b7", desc: "Eerste correcte oplossing." },
  { id: "ten-solved",    name: "Pacer",         icon: "▶", color: "#6ee7b7", desc: "10 oefeningen opgelost." },
  { id: "fifty-solved",  name: "Marathon",      icon: "▲", color: "#fbbf24", desc: "50 oefeningen opgelost." },
  { id: "hundred",       name: "Centurion",     icon: "★", color: "#fbbf24", desc: "100 oefeningen opgelost." },
  { id: "all-solved",    name: "Completionist", icon: "♛", color: "#f87171", desc: "Alle oefeningen opgelost.", hidden: true },

  { id: "streak-3",      name: "Streak · 3d",   icon: "🔥", color: "#fbbf24", desc: "3 dagen actief op rij." },
  { id: "streak-7",      name: "Streak · 7d",   icon: "🔥", color: "#f87171", desc: "Week actief op rij." },
  { id: "streak-14",     name: "Streak · 14d",  icon: "🔥", color: "#f87171", desc: "Twee weken op rij.", hidden: true },

  { id: "h1-clear",      name: "H1 Cleared",    icon: "①", color: "#6ee7b7", desc: "Alle oefeningen van H1 opgelost." },
  { id: "h2-clear",      name: "H2 Cleared",    icon: "②", color: "#6ee7b7", desc: "Alle oefeningen van H2 opgelost." },
  { id: "h3-clear",      name: "H3 Cleared",    icon: "③", color: "#6ee7b7", desc: "Alle oefeningen van H3 opgelost." },
  { id: "h4-clear",      name: "H4 Cleared",    icon: "④", color: "#6ee7b7", desc: "Alle oefeningen van H4 opgelost." },
  { id: "h5-clear",      name: "H5 Cleared",    icon: "⑤", color: "#6ee7b7", desc: "Alle oefeningen van H5 opgelost." },
  { id: "h6-clear",      name: "H6 Cleared",    icon: "⑥", color: "#6ee7b7", desc: "Alle oefeningen van H6 opgelost." },
  { id: "h7-clear",      name: "H7 Cleared",    icon: "⑦", color: "#6ee7b7", desc: "Alle oefeningen van H7 opgelost." },

  { id: "perfect-exam",  name: "Perfect Run",   icon: "◉", color: "#a78bfa", desc: "100% op een volledig examen.", hidden: true },
  { id: "owl",           name: "Night Owl",     icon: "☾", color: "#93c5fd", desc: "Oefening opgelost na middernacht.", hidden: true },
  { id: "early-bird",    name: "Early Bird",    icon: "☀", color: "#fbbf24", desc: "Oefening opgelost voor 7u 's morgens.", hidden: true },
];

export function getBadgeDef(id: string): BadgeDef | null {
  return BADGE_DEFS.find((b) => b.id === id) || null;
}

// Custom-badge payload (admin-granted) — stored on the leaderboard user, not in catalog
export type CustomBadge = { id: string; name: string; icon: string; color: string; desc?: string };

// Returns the list of catalog-badge IDs the user just unlocked given a state snapshot.
export type BadgeContext = {
  solvedCount: number;
  totalExercises: number;
  streakCurrent: number;
  alreadyEarned: Set<string>;
  perChapter: Record<number, { done: number; total: number }>;
  examPerfect?: boolean;
  hour?: number; // 0-23
};

export function checkNewBadges(ctx: BadgeContext): string[] {
  const out: string[] = [];
  const has = (id: string) => ctx.alreadyEarned.has(id);
  const grant = (id: string) => { if (!has(id)) { out.push(id); ctx.alreadyEarned.add(id); } };

  if (ctx.solvedCount >= 1)   grant("first-blood");
  if (ctx.solvedCount >= 10)  grant("ten-solved");
  if (ctx.solvedCount >= 50)  grant("fifty-solved");
  if (ctx.solvedCount >= 100) grant("hundred");
  if (ctx.totalExercises > 0 && ctx.solvedCount >= ctx.totalExercises) grant("all-solved");

  if (ctx.streakCurrent >= 3)  grant("streak-3");
  if (ctx.streakCurrent >= 7)  grant("streak-7");
  if (ctx.streakCurrent >= 14) grant("streak-14");

  for (const [chStr, info] of Object.entries(ctx.perChapter)) {
    const ch = parseInt(chStr, 10);
    if (info.total > 0 && info.done >= info.total) grant(`h${ch}-clear`);
  }

  if (ctx.examPerfect) grant("perfect-exam");
  if (ctx.hour !== undefined) {
    if (ctx.hour >= 0 && ctx.hour < 5)  grant("owl");
    if (ctx.hour >= 5 && ctx.hour < 7)  grant("early-bird");
  }

  return out;
}
