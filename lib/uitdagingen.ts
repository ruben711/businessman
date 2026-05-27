import uitdagingen from "@/data/uitdagingen.json";
import { exercises as allExercises, type Exercise } from "@/lib/exercises";

export const CHALLENGE_EXTREEM: Exercise[] = uitdagingen as Exercise[];

// All "boss-tier": custom extreem challenges + every diepgang from H1-7
export const CHALLENGE_POOL: Exercise[] = [
  ...CHALLENGE_EXTREEM,
  ...allExercises.filter((e) => e.difficulty === "diepgang"),
];

export function findChallengeById(id: string): Exercise | undefined {
  return CHALLENGE_POOL.find((e) => e.id === id);
}
