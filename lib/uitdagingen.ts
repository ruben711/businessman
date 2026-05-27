import uitdagingen from "@/data/uitdagingen.json";
import { type Exercise } from "@/lib/exercises";

export type ChallengeKind = "rekenen" | "theorie";

export const CHALLENGE_POOL: Exercise[] = uitdagingen as Exercise[];

export function kindOf(ex: Exercise): ChallengeKind {
  return ex.tags?.includes("kind:rekenen") ? "rekenen" : "theorie";
}

export const CHALLENGE_REKENEN: Exercise[] = CHALLENGE_POOL.filter((e) => kindOf(e) === "rekenen");
export const CHALLENGE_THEORIE: Exercise[] = CHALLENGE_POOL.filter((e) => kindOf(e) === "theorie");

export function findChallengeById(id: string): Exercise | undefined {
  return CHALLENGE_POOL.find((e) => e.id === id);
}
