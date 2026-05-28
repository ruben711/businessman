import data from "@/data/oefenbundel.json";
import type { Exercise } from "@/lib/exercises";

export const OEFENBUNDEL_CATEGORIES: string[] = (data as any).categories;
export const OEFENBUNDEL_EXERCISES: (Exercise & { category: string })[] = (data as any).exercises;

export function bundelById(id: string) {
  return OEFENBUNDEL_EXERCISES.find((e) => e.id === id);
}

export function bundelByCategory(cat: string) {
  return OEFENBUNDEL_EXERCISES.filter((e) => e.category === cat);
}
