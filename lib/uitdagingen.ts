import uitdagingen from "@/data/uitdagingen.json";
import { type Exercise } from "@/lib/exercises";

// Uitdagingen pool = enkel custom extreem-vragen (chapter 99).
// Diepgang-oefeningen blijven in hun eigen hoofdstuk-context.
export const CHALLENGE_POOL: Exercise[] = uitdagingen as Exercise[];
export const CHALLENGE_EXTREEM: Exercise[] = CHALLENGE_POOL;

export function findChallengeById(id: string): Exercise | undefined {
  return CHALLENGE_POOL.find((e) => e.id === id);
}
