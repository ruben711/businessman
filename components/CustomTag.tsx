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

export const TAG_PRESETS: CT[] = [
  { label: "STUDENT",  color: "#6ee7b7", emoji: "◆" },
  { label: "GRINDER",  color: "#fbbf24", emoji: "▲" },
  { label: "TOPPER",   color: "#a78bfa", emoji: "★" },
  { label: "ROOKIE",   color: "#60a5fa", emoji: "●" },
  { label: "LEGEND",   color: "#f87171", emoji: "♛" },
];
