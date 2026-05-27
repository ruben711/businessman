"use client";
import type { CustomTag as CT } from "@/lib/store";

export function CustomTag({ tag }: { tag?: CT }) {
  if (!tag) return null;
  return (
    <span
      className="inline-flex items-center gap-1 chip"
      style={{ background: tag.color + "15", borderColor: tag.color + "55", color: tag.color }}
    >
      {tag.emoji && <span className="text-[9px]">{tag.emoji}</span>}
      <span>{tag.label}</span>
    </span>
  );
}

// Preset list with XP unlock thresholds.
// Order = display order (low to high XP).
export type TagPreset = CT & { xpRequired: number };

export const TAG_PRESETS: TagPreset[] = [
  { label: "STUDENT",  color: "#9ca3af", emoji: "◆", xpRequired: 0 },
  { label: "ROOKIE",   color: "#60a5fa", emoji: "●", xpRequired: 100 },
  { label: "PACER",    color: "#6ee7b7", emoji: "▶", xpRequired: 250 },
  { label: "GRINDER",  color: "#fbbf24", emoji: "▲", xpRequired: 500 },
  { label: "TOPPER",   color: "#a78bfa", emoji: "★", xpRequired: 1000 },
  { label: "ELITE",    color: "#f472b6", emoji: "♦", xpRequired: 2000 },
  { label: "LEGEND",   color: "#f87171", emoji: "♛", xpRequired: 4000 },
  { label: "MYTHIC",   color: "#22d3ee", emoji: "✦", xpRequired: 8000 },
];
