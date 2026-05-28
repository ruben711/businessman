"use client";
import type { NameStyle } from "@/lib/store";

const fontClass: Record<string, string> = {
  default: "",
  display: "font-body italic",
  mono: "font-mono",
  pixel: "font-pixel text-[10px] tracking-[0.06em]",
};
const animClass: Record<string, string> = {
  none: "", rainbow: "name-rainbow", pulse: "name-pulse", shake: "name-shake", shimmer: "name-shimmer",
};

export function StyledName({ name, style, isAdmin, isStaff }: { name: string; style?: NameStyle; isAdmin?: boolean; isStaff?: boolean }) {
  const s = style || {};
  const classes = [
    fontClass[s.font || "default"] || "",
    animClass[s.animation || "none"] || "",
    s.glow ? "name-glow" : "",
  ].filter(Boolean).join(" ");

  const styleObj: React.CSSProperties = {};
  if (s.gradient) {
    styleObj.background = `linear-gradient(90deg, ${s.gradient.from}, ${s.gradient.to})`;
    styleObj.WebkitBackgroundClip = "text";
    styleObj.backgroundClip = "text";
    styleObj.color = "transparent";
  } else if (s.color) {
    styleObj.color = s.color;
  }

  return (
    <span className="inline-flex items-center gap-2">
      {isAdmin && (
        <span className="admin-badge" title="Beheerder">
          <span className="crown">♛</span>ADMIN
        </span>
      )}
      {isStaff && !isAdmin && (
        <span className="staff-badge" title="Staff">
          <span className="gem">◈</span>STAFF
        </span>
      )}
      <span className={classes} style={styleObj}>{name}</span>
    </span>
  );
}
