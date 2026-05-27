"use client";
import { getBadgeDef, type CustomBadge } from "@/lib/badges";

type Props = { id?: string; custom?: CustomBadge; size?: "sm" | "md" };

export function BadgeChip({ id, custom, size = "sm" }: Props) {
  let icon: string, name: string, color: string, desc: string;
  if (custom) {
    icon = custom.icon; name = custom.name; color = custom.color; desc = custom.desc || custom.name;
  } else if (id) {
    const def = getBadgeDef(id);
    if (!def) return null;
    icon = def.icon; name = def.name; color = def.color; desc = def.desc;
  } else return null;

  const wh = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  return (
    <span
      title={`${name} — ${desc}`}
      className={`inline-flex items-center justify-center ${wh} rounded-sm border text-[10px] shrink-0`}
      style={{ background: color + "15", borderColor: color + "55", color }}
    >
      {icon}
    </span>
  );
}

export function BadgeRow({ ids = [], customs = [], max = 6 }: { ids?: string[]; customs?: CustomBadge[]; max?: number }) {
  const items: { kind: "id" | "custom"; v: any }[] = [
    ...customs.map((c) => ({ kind: "custom" as const, v: c })),
    ...ids.map((i) => ({ kind: "id" as const, v: i })),
  ];
  const visible = items.slice(0, max);
  const remaining = items.length - visible.length;
  if (items.length === 0) return null;
  return (
    <div className="inline-flex items-center gap-1">
      {visible.map((it, i) =>
        it.kind === "id"
          ? <BadgeChip key={`b-${i}`} id={it.v} />
          : <BadgeChip key={`c-${i}`} custom={it.v} />
      )}
      {remaining > 0 && (
        <span className="text-[9px] text-ink-3 font-pixel">+{remaining}</span>
      )}
    </div>
  );
}
