import { redis } from "./upstash";

export type Notif = {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body?: string;
  target: { kind: "all" } | { kind: "user"; uid: string } | { kind: "session"; sessionId: string };
  ts: number;
};

export const NOTIFS_KEY = "bm:notifs";

export async function pushNotif(n: Notif) {
  await redis.lpush(NOTIFS_KEY, JSON.stringify(n));
  await redis.ltrim(NOTIFS_KEY, 0, 199);
}

export async function listNotifs(): Promise<Notif[]> {
  const raw = (await redis.lrange(NOTIFS_KEY, 0, 199).catch(() => [])) || [];
  return raw.map((s: string) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
}

export function relevantFor(n: Notif, uid?: string, sessionId?: string) {
  if (n.target.kind === "all") return true;
  if (n.target.kind === "user" && uid && n.target.uid === uid) return true;
  if (n.target.kind === "session" && sessionId && n.target.sessionId === sessionId) return true;
  return false;
}
