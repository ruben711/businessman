"use client";
import { useEffect, useState } from "react";
import { StyledName } from "@/components/StyledName";
import { CustomTag, TAG_PRESETS } from "@/components/CustomTag";
import { getUid, getName, setName as setIdName } from "@/lib/identity";
import { useMounted } from "@/lib/useMounted";
import { useStore } from "@/lib/store";
import { syncLeaderboard } from "@/lib/leaderboardSync";
import { levelForXp } from "@/lib/store";

type Row = {
  uid: string; name: string; xp: number; solved: number;
  isAdmin?: boolean; customTag?: any; nameStyle?: any;
};

export default function LeaderboardPage() {
  const mounted = useMounted();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [me, setMe] = useState({ uid: "", name: "" });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [tab, setTab] = useState<"board" | "style">("board");
  const myStyle = useStore((s) => s.nameStyle);
  const setNameStyle = useStore((s) => s.setNameStyle);
  const myTag = useStore((s) => s.customTag);
  const setMyTag = useStore((s) => s.setCustomTag);

  useEffect(() => {
    if (!mounted) return;
    setMe({ uid: getUid(), name: getName() });
    setNameInput(getName());
    fetchBoard();
    const id = setInterval(fetchBoard, 20000);
    return () => clearInterval(id);
  }, [mounted]);

  async function fetchBoard() {
    try {
      const r = await fetch("/api/leaderboard");
      if (!r.ok) return;
      const d = await r.json();
      setRows(d.users || []);
    } catch {}
  }

  async function saveName() {
    setIdName(nameInput);
    setMe((m) => ({ ...m, name: nameInput }));
    setEditingName(false);
    await syncLeaderboard(true);
    fetchBoard();
  }

  async function saveStyle(s: any) {
    setNameStyle(s);
    await syncLeaderboard(true);
    setTimeout(fetchBoard, 500);
  }
  async function saveTag(t: any) {
    setMyTag(t);
    await syncLeaderboard(true);
    setTimeout(fetchBoard, 500);
  }

  return (
    <div className="space-y-6 anim-in">
      <header>
        <div className="eyebrow mb-3">// RANKED</div>
        <h1 className="text-[32px] font-semibold tracking-tight">Leaderboard</h1>
      </header>

      <div className="flex gap-1 border-b border-line/[0.06]">
        {(["board", "style"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-pixel text-[9px] tracking-[0.1em] border-b-2 transition ${
              tab === t ? "border-acc text-acc" : "border-transparent text-ink-3 hover:text-ink"
            }`}>
            {t === "board" ? "RANKING" : "MY · LOADOUT"}
          </button>
        ))}
      </div>

      {tab === "board" && (
        rows === null ? (
          <div className="text-ink-3 text-[13px]">Connecting…</div>
        ) : rows.length === 0 ? (
          <div className="panel p-12 text-center text-ink-3 text-[13px]">No players yet — be the first.</div>
        ) : (
          <div className="panel overflow-hidden">
            {rows.map((u, i) => {
              const isMe = u.uid === me.uid;
              const { level } = levelForXp(u.xp);
              const rankColor = i === 0 ? "text-warn" : i === 1 ? "text-ink-2" : i === 2 ? "text-info" : "text-ink-3";
              return (
                <div key={u.uid} className={`row ${isMe ? "!bg-acc/[0.04]" : ""}`}>
                  <span className={`font-pixel text-[12px] num w-8 ${rankColor}`}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StyledName name={u.name} style={u.nameStyle} isAdmin={u.isAdmin} />
                      {u.customTag && <CustomTag tag={u.customTag} />}
                      {isMe && <span className="chip chip-acc">YOU</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 font-pixel text-[8px] text-ink-4 num">
                      <span>LVL {level}</span><span>·</span><span>{u.solved} SOLVED</span>
                    </div>
                  </div>
                  <div className="font-pixel text-[12px] text-acc num">{u.xp}</div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === "style" && (
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="label mb-3">// DISPLAY NAME</div>
            {editingName ? (
              <div className="flex gap-2">
                <input className="input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={20} />
                <button className="btn btn-primary" onClick={saveName}>Save</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-[15px]"><StyledName name={me.name} style={myStyle} /></div>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingName(true)}>edit</button>
              </div>
            )}
          </div>

          <div className="panel p-5">
            <div className="label mb-4">// NAME · STYLING</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="label mb-2">Color</div>
                <input type="color" className="input h-10 p-1" value={myStyle?.color || "#6ee7b7"} onChange={(e) => saveStyle({ ...myStyle, color: e.target.value, gradient: undefined })} />
              </div>
              <div>
                <div className="label mb-2">Animation</div>
                <select className="input" value={myStyle?.animation || "none"} onChange={(e) => saveStyle({ ...myStyle, animation: e.target.value as any })}>
                  <option value="none">None</option>
                  <option value="rainbow">Rainbow</option>
                  <option value="pulse">Pulse</option>
                  <option value="shake">Shake</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>
              <div>
                <div className="label mb-2">Font</div>
                <select className="input" value={myStyle?.font || "default"} onChange={(e) => saveStyle({ ...myStyle, font: e.target.value as any })}>
                  <option value="default">Default</option>
                  <option value="display">Italic</option>
                  <option value="mono">Mono</option>
                  <option value="pixel">Pixel</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-7">
                <input type="checkbox" checked={!!myStyle?.glow} onChange={(e) => saveStyle({ ...myStyle, glow: e.target.checked })} className="accent-acc" />
                <span className="text-[13px]">Glow effect</span>
              </label>
            </div>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => saveStyle(undefined)}>Reset styling</button>
          </div>

          <div className="panel p-5">
            <div className="label mb-4">// CUSTOM · TAG</div>
            <div className="flex gap-2 flex-wrap mb-3">
              {TAG_PRESETS.map((t) => (
                <button key={t.label} onClick={() => saveTag(t)} className="hover:scale-105 transition">
                  <CustomTag tag={t} />
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => saveTag(undefined)}>No tag</button>
            </div>
            {myTag && (
              <div className="text-[13px] text-ink-2 mt-3">
                <span className="font-pixel text-[8px] mr-2">CURRENT:</span> <CustomTag tag={myTag} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
