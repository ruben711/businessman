"use client";
import { useEffect, useRef, useState } from "react";
import { getUid } from "@/lib/identity";
import { useMounted } from "@/lib/useMounted";

type Notif = {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body?: string;
  ts: number;
};

const READ_KEY = "bm-notifs-read";
const getRead = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); } catch { return new Set(); } };
const setRead = (s: Set<string>) => localStorage.setItem(READ_KEY, JSON.stringify([...s]));

export function NotificationBell() {
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [read, setReadState] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted) return;
    setReadState(getRead());
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/notifications?uid=${getUid()}`);
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setItems(d.notifications || []);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [mounted]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!mounted) return <div className="w-8 h-8" />;
  const unread = items.filter((i) => !read.has(i.id)).length;
  const typeChip = { info: "chip-info", success: "chip-acc", warning: "chip-warn", error: "chip-err" } as const;

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) { const all = new Set(items.map((i) => i.id)); setRead(all); setReadState(all); }
        }}
        className="btn btn-icon btn-ghost btn-sm relative"
      >
        <span className="text-[12px]">⌬</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-acc text-canvas font-pixel text-[7px] rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center anim-pulse">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] panel-elev shadow-lift z-50 max-h-[60vh] overflow-y-auto anim-in">
          <div className="px-3 py-2 border-b border-line/[0.06] flex items-center justify-between">
            <span className="label">Inbox</span>
            <span className="font-pixel text-[8px] text-ink-3 num">{items.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-ink-3 text-[12px]">Geen meldingen</div>
          ) : (
            <div>
              {items.map((n) => (
                <div key={n.id} className="row items-start flex-col !gap-1">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-medium text-ink text-[13px]">{n.title}</div>
                    <span className={`chip ${typeChip[n.type]}`}>{n.type}</span>
                  </div>
                  {n.body && <div className="text-[12px] text-ink-2">{n.body}</div>}
                  <div className="font-pixel text-[7px] text-ink-4 mt-1 num">{new Date(n.ts).toLocaleString("nl-BE")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
