import exercisesJson from "@/data/oefeningen.json";

export type ExerciseType =
  | "mc"            // meerkeuze
  | "tf"            // waar/niet waar
  | "open"          // open vraag, korte tekst
  | "cloze"         // invul-zin
  | "order"         // volgorde
  | "match"         // matching pairs
  | "case";         // sub-vragen casus

export type Difficulty = "basis" | "midden" | "diepgang";

export type ExerciseBase = {
  id: string;
  chapter: number;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  context?: string;       // optional scenario / casus context
  explanation?: string;
  hint?: string;
};

export type MCExercise = ExerciseBase & {
  type: "mc";
  options: string[];
  correctIndex: number;
};

export type TFExercise = ExerciseBase & {
  type: "tf";
  correct: boolean;
};

export type OpenExercise = ExerciseBase & {
  type: "open";
  accept: string[]; // accepted answer variants (lowercased compare)
};

export type ClozeExercise = ExerciseBase & {
  type: "cloze";
  text: string;             // "BTW staat voor {{0}} {{1}} ..."
  blanks: { accept: string[] }[];
};

export type OrderExercise = ExerciseBase & {
  type: "order";
  items: string[];          // correct order
};

export type MatchExercise = ExerciseBase & {
  type: "match";
  pairs: { left: string; right: string }[];
};

export type CaseExercise = ExerciseBase & {
  type: "case";
  steps: { prompt: string; modelAnswer: string }[];
};

export type Exercise =
  | MCExercise | TFExercise | OpenExercise | ClozeExercise
  | OrderExercise | MatchExercise | CaseExercise;

export const exercises: Exercise[] = exercisesJson as Exercise[];

export function getExercise(id: string) {
  return exercises.find((e) => e.id === id);
}

export function exercisesForChapter(ch: number) {
  return exercises.filter((e) => e.chapter === ch);
}

export const CHAPTERS = [
  { num: 1, title: "Starten als zelfstandige" },
  { num: 2, title: "Keuze van de ondernemingsvorm" },
  { num: 3, title: "Financiering van de onderneming" },
  { num: 4, title: "Verzekeringen" },
  { num: 5, title: "Boekhouding als beleidsinstrument" },
  { num: 6, title: "Kostprijsberekening" },
  { num: 7, title: "Het sociaal statuut" },
] as const;

export function checkAnswer(ex: Exercise, ans: unknown): boolean {
  const norm = (s: string) => s.toString().trim().toLowerCase().replace(/\s+/g, " ");
  switch (ex.type) {
    case "mc":
      return typeof ans === "number" && ans === ex.correctIndex;
    case "tf":
      return typeof ans === "boolean" && ans === ex.correct;
    case "open":
      if (typeof ans !== "string") return false;
      return ex.accept.some((a) => norm(a) === norm(ans));
    case "cloze": {
      if (!Array.isArray(ans)) return false;
      if (ans.length !== ex.blanks.length) return false;
      return ex.blanks.every((b, i) =>
        typeof ans[i] === "string" && b.accept.some((a) => norm(a) === norm(ans[i] as string))
      );
    }
    case "order":
      if (!Array.isArray(ans)) return false;
      return ans.length === ex.items.length && ex.items.every((it, i) => it === ans[i]);
    case "match":
      if (!Array.isArray(ans)) return false;
      return ans.length === ex.pairs.length && ex.pairs.every((p, i) =>
        (ans[i] as any)?.left === p.left && (ans[i] as any)?.right === p.right);
    case "case":
      // case exercises are self-graded — "correct" means user marked all steps as done
      return Array.isArray(ans) && ans.length === ex.steps.length && ans.every(Boolean);
  }
}
