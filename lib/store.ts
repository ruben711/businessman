"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkNewBadges, BadgeContext, BADGE_DEFS, CustomBadge } from "./badges";

export const XP_RULES_VERSION = 1;
export const XP_PER_CORRECT = 25;

export type Attempt = {
  id: string;
  exerciseId: string;
  chapter: number;
  correct: boolean;
  ts: number;
};

export type ExerciseState = {
  attempts: number;
  solved: boolean;
  solvedAt?: number;
  notes?: string;
  favorite?: boolean;
  lastAnswer?: unknown;
};

export type EarnedBadge = {
  id: string;
  earnedAt: number;
};

export type NameStyle = {
  color?: string;
  gradient?: { from: string; to: string };
  glow?: boolean;
  font?: "default" | "display" | "mono" | "pixel";
  particles?: "none" | "sparkle" | "snow" | "orbit" | "fire" | "stars" | "hearts";
  animation?: "none" | "rainbow" | "pulse" | "shake" | "shimmer";
};

export type CustomTag = {
  label: string;
  color: string;
  emoji?: string;
};

type Store = {
  xpRulesVersion: number;
  xp: number;
  solvedExerciseIds: string[];
  exerciseStates: Record<string, ExerciseState>;
  theoryProgress: Record<string, { read: boolean; readAt?: number }>;
  attempts: Attempt[];
  streak: { current: number; longest: number; lastDay?: string };
  badges: EarnedBadge[];          // catalog badges earned
  customBadges: CustomBadge[];    // admin-granted custom badges
  customTag?: CustomTag;
  nameStyle?: NameStyle;
  hasOnboarded: boolean;          // user picked or skipped name setup

  // mutators
  recordAttempt: (exerciseId: string, chapter: number, correct: boolean, ctxExtra?: { totalExercises?: number; perChapter?: Record<number, { done: number; total: number }> }) => { xpGained: number; firstSolve: boolean; newBadges: string[] };
  reportExamScore: (correct: number, total: number) => string[];
  setLastAnswer: (id: string, ans: unknown) => void;
  setNote: (id: string, note: string) => void;
  toggleFavorite: (id: string) => void;
  markTheoryRead: (key: string) => void;
  setCustomTag: (t?: CustomTag) => void;
  setNameStyle: (s?: NameStyle) => void;
  setOnboarded: () => void;
  addCustomBadge: (b: CustomBadge) => void;
  resetProgress: () => void;
  resetMode: (mode: "exercises" | "theory") => void;
};

function todayKey() { return new Date().toISOString().slice(0, 10); }

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      xpRulesVersion: XP_RULES_VERSION,
      xp: 0,
      solvedExerciseIds: [],
      exerciseStates: {},
      theoryProgress: {},
      attempts: [],
      streak: { current: 0, longest: 0 },
      badges: [],
      customBadges: [],
      hasOnboarded: false,

      recordAttempt: (exerciseId, chapter, correct, ctxExtra) => {
        const s = get();
        const prev = s.exerciseStates[exerciseId] || { attempts: 0, solved: false };
        const firstSolve = correct && !prev.solved;
        const xpGained = firstSolve ? XP_PER_CORRECT : 0;

        // streak
        const today = todayKey();
        let streak = s.streak;
        if (correct) {
          if (streak.lastDay !== today) {
            const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            const next = streak.lastDay === yest ? streak.current + 1 : 1;
            streak = { current: next, longest: Math.max(next, streak.longest), lastDay: today };
          }
        }

        const newSolved = firstSolve ? [...s.solvedExerciseIds, exerciseId] : s.solvedExerciseIds;

        // Compute badges
        const earnedSet = new Set(s.badges.map((b) => b.id));
        const ctx: BadgeContext = {
          solvedCount: newSolved.length,
          totalExercises: ctxExtra?.totalExercises ?? 0,
          streakCurrent: streak.current,
          alreadyEarned: earnedSet,
          perChapter: ctxExtra?.perChapter ?? {},
          hour: new Date().getHours(),
        };
        const newBadges = correct ? checkNewBadges(ctx) : [];
        const updatedBadges = newBadges.length
          ? [...s.badges, ...newBadges.map((id) => ({ id, earnedAt: Date.now() }))]
          : s.badges;

        set({
          xp: s.xp + xpGained,
          solvedExerciseIds: newSolved,
          exerciseStates: {
            ...s.exerciseStates,
            [exerciseId]: {
              ...prev,
              attempts: prev.attempts + 1,
              solved: prev.solved || correct,
              solvedAt: firstSolve ? Date.now() : prev.solvedAt,
            },
          },
          attempts: [
            { id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, exerciseId, chapter, correct, ts: Date.now() },
            ...s.attempts,
          ].slice(0, 200),
          streak,
          badges: updatedBadges,
        });
        return { xpGained, firstSolve, newBadges };
      },

      reportExamScore: (correct, total) => {
        const s = get();
        if (total === 0 || correct < total) return [];
        const earnedSet = new Set(s.badges.map((b) => b.id));
        const newBadges = checkNewBadges({
          solvedCount: s.solvedExerciseIds.length,
          totalExercises: 0,
          streakCurrent: s.streak.current,
          alreadyEarned: earnedSet,
          perChapter: {},
          examPerfect: true,
        });
        if (newBadges.length) {
          set({
            badges: [...s.badges, ...newBadges.map((id) => ({ id, earnedAt: Date.now() }))],
          });
        }
        return newBadges;
      },

      setLastAnswer: (id, ans) => set((s) => ({
        exerciseStates: {
          ...s.exerciseStates,
          [id]: { ...(s.exerciseStates[id] || { attempts: 0, solved: false }), lastAnswer: ans },
        },
      })),
      setNote: (id, note) => set((s) => ({
        exerciseStates: {
          ...s.exerciseStates,
          [id]: { ...(s.exerciseStates[id] || { attempts: 0, solved: false }), notes: note },
        },
      })),
      toggleFavorite: (id) => set((s) => {
        const cur = s.exerciseStates[id] || { attempts: 0, solved: false };
        return { exerciseStates: { ...s.exerciseStates, [id]: { ...cur, favorite: !cur.favorite } } };
      }),
      markTheoryRead: (key) => set((s) => ({
        theoryProgress: { ...s.theoryProgress, [key]: { read: true, readAt: Date.now() } },
      })),
      setCustomTag: (t) => set({ customTag: t }),
      setNameStyle: (style) => set({ nameStyle: style }),
      setOnboarded: () => set({ hasOnboarded: true }),
      addCustomBadge: (b) => set((s) => ({ customBadges: [...s.customBadges, b] })),

      resetProgress: () => set({
        xp: 0, solvedExerciseIds: [], exerciseStates: {}, theoryProgress: {},
        attempts: [], streak: { current: 0, longest: 0 }, badges: [], customBadges: [],
      }),
      resetMode: (mode) => set((s) => {
        if (mode === "theory") return { theoryProgress: {} };
        return { xp: 0, solvedExerciseIds: [], exerciseStates: {}, attempts: [], streak: { current: 0, longest: 0 }, badges: [] };
      }),
    }),
    { name: "bm-store-v1" }
  )
);

export function levelForXp(xp: number) {
  let level = 1;
  let need = 100;
  let total = 0;
  while (xp >= total + need) {
    total += need;
    level++;
    need = Math.round(need * 1.25);
  }
  return { level, intoLevel: xp - total, needForLevel: need, progress: (xp - total) / need };
}

export { BADGE_DEFS };
