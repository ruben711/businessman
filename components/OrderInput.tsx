"use client";
import { useRef, useState } from "react";

const ROW_H = 52; // px per row slot (height + gap)

export function OrderInput({
  items,
  onChange,
  disabled,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState<{ grabIdx: number; deltaY: number } | null>(null);
  const startY = useRef(0);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>, i: number) {
    if (disabled) return;
    // Don't start drag from inside a button
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setDrag({ grabIdx: i, deltaY: 0 });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setDrag({ ...drag, deltaY: e.clientY - startY.current });
  }

  function commitDrop() {
    if (!drag) return;
    const shift = Math.round(drag.deltaY / ROW_H);
    const to = Math.max(0, Math.min(items.length - 1, drag.grabIdx + shift));
    if (to !== drag.grabIdx) {
      const next = [...items];
      const [moved] = next.splice(drag.grabIdx, 1);
      next.splice(to, 0, moved);
      onChange(next);
    }
    setDrag(null);
  }

  function visualIdx(originalIdx: number): number {
    if (!drag) return originalIdx;
    const { grabIdx, deltaY } = drag;
    const shift = Math.round(deltaY / ROW_H);
    const to = Math.max(0, Math.min(items.length - 1, grabIdx + shift));
    if (originalIdx === grabIdx) return to;
    if (grabIdx < to && originalIdx > grabIdx && originalIdx <= to) return originalIdx - 1;
    if (grabIdx > to && originalIdx < grabIdx && originalIdx >= to) return originalIdx + 1;
    return originalIdx;
  }

  function swap(i: number, j: number) {
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div
      className="relative select-none"
      style={{ height: items.length * ROW_H + "px" }}
      aria-label="Sleep om volgorde te wijzigen"
    >
      {items.map((it, i) => {
        const vi = visualIdx(i);
        const isDragging = drag?.grabIdx === i;
        const transform = isDragging
          ? `translate3d(0, ${i * ROW_H + drag!.deltaY}px, 0) scale(1.015)`
          : `translate3d(0, ${vi * ROW_H}px, 0)`;
        return (
          <div
            key={it}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={onPointerMove}
            onPointerUp={commitDrop}
            onPointerCancel={commitDrop}
            className={`absolute left-0 right-0 flex items-center gap-3 px-3 py-2.5 bg-elevated border rounded touch-none ${
              disabled
                ? "cursor-default border-line/[0.06]"
                : isDragging
                ? "z-10 cursor-grabbing border-acc/50 shadow-lift bg-hover"
                : "cursor-grab border-line/[0.06] hover:border-line/[0.10] active:cursor-grabbing"
            }`}
            style={{
              transform,
              transition: isDragging
                ? "none"
                : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), border-color 160ms, background-color 160ms, box-shadow 160ms",
              height: ROW_H - 8 + "px",
              willChange: isDragging ? "transform" : undefined,
            }}
          >
            <span className="text-ink-3 text-[14px] shrink-0 pointer-events-none" aria-hidden>⋮⋮</span>
            <span className="font-pixel text-[9px] text-acc w-6 shrink-0 num pointer-events-none">
              {String(vi + 1).padStart(2, "0")}
            </span>
            <span className="text-[14px] flex-1 pointer-events-none">{it}</span>
            <button
              type="button"
              disabled={disabled || i === 0 || !!drag}
              onClick={(e) => { e.stopPropagation(); swap(i, i - 1); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="btn btn-sm btn-icon"
              aria-label="Omhoog"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={disabled || i === items.length - 1 || !!drag}
              onClick={(e) => { e.stopPropagation(); swap(i, i + 1); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="btn btn-sm btn-icon"
              aria-label="Omlaag"
            >
              ↓
            </button>
          </div>
        );
      })}
    </div>
  );
}
