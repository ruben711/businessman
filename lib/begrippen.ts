import data from "@/data/begrippen.json";
import type { Exercise } from "@/lib/exercises";

export type Begrip = {
  term: string;
  def: string;
  cat: string;
  accept_extra: string[];
};

export const BEGRIPPEN_TERMS: Begrip[] = (data as any).terms;
export const BEGRIPPEN_EXERCISES: Exercise[] = (data as any).exercises;

export function exercisesForTerm(term: string): Exercise[] {
  return BEGRIPPEN_EXERCISES.filter((e) =>
    e.id.includes(term.toLowerCase().replace(/\s+/g, "-").replace(/,/g, "").replace(/'/g, "").slice(0, 30))
  );
}

export function getBegripById(id: string): Exercise | undefined {
  return BEGRIPPEN_EXERCISES.find((e) => e.id === id);
}

export const CATEGORIES = Array.from(new Set(BEGRIPPEN_TERMS.map((t) => t.cat)));
