"use client";
import { useEffect, useState } from "react";

let listener: ((xp: number) => void) | null = null;
export function fireXpToast(xp: number) { listener?.(xp); }

export function XpToastHost() {
  const [toasts, setToasts] = useState<{ id: number; xp: number }[]>([]);
  useEffect(() => {
    listener = (xp) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, xp }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1500);
    };
    return () => { listener = null; };
  }, []);
  return (
    <div className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="anim-xp">
          <div className="chip chip-acc !text-[12px] !px-3 !py-2 shadow-glow">
            <span>+{t.xp} XP</span>
          </div>
        </div>
      ))}
    </div>
  );
}
