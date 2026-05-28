"use client";
import { useEffect, useState } from "react";
import { StyledName } from "@/components/StyledName";
import { CustomTag } from "@/components/CustomTag";
import { BadgeChip } from "@/components/BadgeChip";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"sessions" | "lb" | "notify">("lb");

  useEffect(() => {
    fetch("/api/admin/me").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) setAuthed(true);
    else { const data = await r.json().catch(() => ({})); setError(data.error || "Fout wachtwoord"); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  if (authed === null) return <div className="text-ink-3">Authenticating…</div>;

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto pt-16 anim-in">
        <div className="eyebrow text-center mb-4">// ADMIN · GATE</div>
        <h1 className="text-[24px] font-semibold text-center mb-6">Restricted Access</h1>
        <form onSubmit={login} className="panel p-5 space-y-3">
          <input type="password" className="input" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn btn-primary w-full">▶ Authenticate</button>
          {error && <div className="text-[12px] text-err text-center">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 anim-in">
      <header className="flex items-center justify-between">
        <div>
          <div className="eyebrow mb-2">// ADMIN · PANEL</div>
          <h1 className="text-[28px] font-semibold tracking-tight">Console</h1>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </header>
      <div className="flex gap-1 border-b border-line/[0.06]">
        {(["lb", "sessions", "notify"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 font-pixel text-[9px] tracking-[0.1em] border-b-2 transition ${
              tab === t ? "border-acc text-acc" : "border-transparent text-ink-3 hover:text-ink"
            }`}>
            {t === "lb" ? "LEADERBOARD" : t === "sessions" ? "LIVE · SESSIONS" : "NOTIFY"}
          </button>
        ))}
      </div>
      {tab === "lb" && <LbAdmin />}
      {tab === "sessions" && <Sessions />}
      {tab === "notify" && <NotifyTab />}
    </div>
  );
}

function LbAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantOpen, setGrantOpen] = useState<string | null>(null);
  const [bName, setBName] = useState(""); const [bIcon, setBIcon] = useState("◆");
  const [bColor, setBColor] = useState("#6ee7b7"); const [bDesc, setBDesc] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/leaderboard");
    const d = await r.json();
    setUsers(d.users || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(uid: string, patch: any) {
    await fetch("/api/admin/sessions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, patch }) });
    load();
  }
  async function del(uid: string) {
    if (!confirm("Verwijderen?")) return;
    await fetch("/api/admin/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) });
    load();
  }
  async function recalc() {
    await fetch("/api/admin/leaderboard/recalc", { method: "POST" });
    load();
  }
  async function grantBadge(uid: string) {
    if (!bName) return;
    await fetch("/api/admin/badge", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, badge: { name: bName, icon: bIcon, color: bColor, desc: bDesc } }),
    });
    setGrantOpen(null); setBName(""); setBDesc("");
    load();
  }
  async function revokeBadge(uid: string, badgeId: string) {
    if (!confirm("Badge intrekken?")) return;
    await fetch("/api/admin/badge", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, badgeId }),
    });
    load();
  }

  if (loading) return <div className="text-ink-3 text-[13px]">Loading…</div>;

  const ICON_PRESETS = ["◆","◉","★","♛","▲","▶","♦","✦","☾","☀","♥","✪","⚡","Ω"];

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><button className="btn btn-ghost btn-sm" onClick={recalc}>Recalc XP</button></div>
      {users.map((u) => (
        <div key={u.uid} className="panel p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <StyledName name={u.name} style={u.nameStyle} isAdmin={u.isAdmin} isStaff={u.isStaff} />
            {u.customTag && <CustomTag tag={u.customTag} />}
            <span className="font-pixel text-[7px] text-ink-4 ml-auto num">{u.uid}</span>
          </div>
          <div className="grid sm:grid-cols-4 gap-2 mt-3">
            <label className="block"><div className="label mb-1">Name</div><input className="input" defaultValue={u.name} onBlur={(e) => update(u.uid, { name: e.target.value })} /></label>
            <label className="block"><div className="label mb-1">XP</div><input type="number" className="input" defaultValue={u.xp} onBlur={(e) => update(u.uid, { xp: parseInt(e.target.value, 10) })} /></label>
            <label className="block"><div className="label mb-1">Solved</div><input type="number" className="input" defaultValue={u.solved} onBlur={(e) => update(u.uid, { solved: parseInt(e.target.value, 10) })} /></label>
            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked={!!u.isAdmin} onChange={(e) => update(u.uid, { isAdmin: e.target.checked })} className="accent-acc" /><span className="text-[13px]">Admin</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked={!!u.isStaff} onChange={(e) => update(u.uid, { isStaff: e.target.checked })} className="accent-acc" /><span className="text-[13px]">Staff</span></label>
            </div>
          </div>

          {/* Existing badges */}
          {((u.badges?.length || 0) + (u.customBadges?.length || 0)) > 0 && (
            <div className="mt-3 pt-3 border-t border-line/[0.06]">
              <div className="label mb-2">// BADGES</div>
              <div className="flex flex-wrap gap-2">
                {(u.badges || []).map((id: string) => <BadgeChip key={id} id={id} />)}
                {(u.customBadges || []).map((b: any) => (
                  <button key={b.id} onClick={() => revokeBadge(u.uid, b.id)} title="Intrekken" className="hover:opacity-60 transition">
                    <BadgeChip custom={b} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button className="btn btn-sm" onClick={() => setGrantOpen(grantOpen === u.uid ? null : u.uid)}>+ Custom badge</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(u.uid)}>Delete user</button>
          </div>

          {grantOpen === u.uid && (
            <div className="mt-3 pt-3 border-t border-line/[0.06] grid sm:grid-cols-[1fr_auto] gap-3 anim-in">
              <div className="space-y-2">
                <label className="block"><div className="label mb-1">Name</div><input className="input" value={bName} onChange={(e) => setBName(e.target.value)} placeholder="bv. OG-tester" /></label>
                <label className="block"><div className="label mb-1">Description (optioneel)</div><input className="input" value={bDesc} onChange={(e) => setBDesc(e.target.value)} placeholder="Korte uitleg…" /></label>
                <div className="flex items-center gap-2">
                  <div className="label">Icon</div>
                  {ICON_PRESETS.map((i) => (
                    <button key={i} onClick={() => setBIcon(i)} className={`w-7 h-7 border rounded-sm text-[12px] ${bIcon === i ? "border-acc bg-acc/10 text-acc" : "border-line/[0.06] text-ink-2"}`}>{i}</button>
                  ))}
                </div>
                <label className="flex items-center gap-2"><div className="label">Color</div><input type="color" className="h-7 w-12 bg-inset rounded border border-line/[0.06]" value={bColor} onChange={(e) => setBColor(e.target.value)} /></label>
              </div>
              <div className="flex flex-col gap-2 items-end justify-between">
                <div className="panel-elev p-3 flex items-center gap-2">
                  <BadgeChip custom={{ id: "preview", name: bName || "Preview", icon: bIcon, color: bColor }} size="md" />
                  <span className="text-[12px] text-ink-2">{bName || "Preview"}</span>
                </div>
                <button className="btn btn-primary" onClick={() => grantBadge(u.uid)} disabled={!bName}>Grant</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Sessions() {
  const [s, setS] = useState<any[]>([]);
  useEffect(() => {
    const f = () => fetch("/api/admin/sessions").then((r) => r.json()).then((d) => setS(d.sessions || []));
    f();
    const id = setInterval(f, 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-2">
      {s.length === 0 && <p className="text-ink-3 italic text-[13px]">No active sessions.</p>}
      {s.map((sess) => (
        <details key={sess.id} className="panel">
          <summary className="cursor-pointer flex justify-between px-4 py-3 text-[13px] list-none">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-acc anim-pulse"></span>{sess.name || sess.uid} · {sess.geo || "—"}</span>
            <span className="font-pixel text-[8px] text-ink-4 num">{sess.events?.length || 0} events</span>
          </summary>
          <div className="px-4 pb-3 text-[11px] space-y-1 max-h-60 overflow-y-auto border-t border-line/[0.06] pt-2">
            {(sess.events || []).map((e: any, i: number) => (
              <div key={i} className="flex gap-2 py-1 font-mono">
                <span className="text-ink-4 num">{new Date(e.ts).toLocaleTimeString("nl-BE")}</span>
                <span className="text-acc">{e.event}</span>
                <span className="text-ink-3 truncate">{JSON.stringify(e.data)}</span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function NotifyTab() {
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState(false);
  async function send() {
    await fetch("/api/admin/notify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, type, target: target === "all" ? { kind: "all" } : { kind: "user", uid: target } }),
    });
    setSent(true); setTitle(""); setBody("");
    setTimeout(() => setSent(false), 2000);
  }
  return (
    <div className="panel p-5 max-w-2xl space-y-3">
      <label className="block"><div className="label mb-1">Title</div><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="block"><div className="label mb-1">Body</div><textarea className="input min-h-[80px]" value={body} onChange={(e) => setBody(e.target.value)} /></label>
      <label className="block"><div className="label mb-1">Type</div>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="info">info</option><option value="success">success</option>
          <option value="warning">warning</option><option value="error">error</option>
        </select>
      </label>
      <label className="block"><div className="label mb-1">Target</div><input className="input" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="all of een uid" /></label>
      <button className="btn btn-primary" onClick={send} disabled={!title}>▶ Send</button>
      {sent && <div className="text-acc text-[12px]">✓ Sent</div>}
    </div>
  );
}
