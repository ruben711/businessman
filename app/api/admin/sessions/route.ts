import { isAuthed } from "@/lib/adminAuth";
import { redis, isUpstashEnabled, LB_KEY, lbDelete, LB_SCORES_KEY } from "@/lib/upstash";

export const runtime = "edge";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  if (!isUpstashEnabled()) return Response.json({ sessions: [] });
  const all = await redis.hgetall("bm:sessions").catch(() => null);
  const sessions: any[] = [];
  if (all) {
    const entries = Array.isArray(all) ? (function() {
      const arr: any[] = []; for (let i = 0; i < all.length; i += 2) arr.push([all[i], all[i+1]]); return arr;
    })() : Object.entries(all);
    for (const [uid, raw] of entries as any) {
      try {
        const meta = JSON.parse(raw);
        if (Date.now() - (meta.lastSeen || 0) > 30 * 60 * 1000) continue;
        const events = (await redis.lrange(`bm:sess:${uid}:events`, 0, 49).catch(() => [])) || [];
        sessions.push({ id: uid, uid, ...meta, events: events.map((e: string) => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean) });
      } catch {}
    }
  }
  return Response.json({ sessions });
}

export async function PATCH(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  const { uid, patch } = (await req.json()) as any;
  if (!uid) return new Response("bad", { status: 400 });
  const raw = await redis.hget(LB_KEY, uid).catch(() => null);
  if (!raw) return new Response("not found", { status: 404 });
  const u = JSON.parse(raw);
  const next = { ...u, ...patch };
  await redis.hset(LB_KEY, uid, JSON.stringify(next));
  if (patch.xp !== undefined) await redis.zadd(LB_SCORES_KEY, next.xp, uid);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  const { uid } = (await req.json()) as any;
  if (!uid) return new Response("bad", { status: 400 });
  await lbDelete(uid);
  return Response.json({ ok: true });
}
