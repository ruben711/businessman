import { logEvent } from "@/lib/logger";
import { redis, isUpstashEnabled } from "@/lib/upstash";

export const runtime = "edge";

const seenIps = new Map<string, number>();
function rateLimit(ip: string) {
  const now = Date.now();
  const last = seenIps.get(ip) || 0;
  if (now - last < 1000) return false;
  seenIps.set(ip, now);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
  if (!rateLimit(ip)) return new Response("rate", { status: 429 });
  const body = await req.json().catch(() => ({}));
  const { event, uid, ...rest } = body as any;
  if (!event) return new Response("bad", { status: 400 });

  await logEvent(event, { uid, ...rest }, { ip });

  // also persist as a session event
  if (isUpstashEnabled() && uid) {
    const geo = req.headers.get("x-vercel-ip-country") || req.headers.get("x-vercel-ip-city") || "";
    const entry = JSON.stringify({ event, ts: Date.now(), data: rest });
    await redis.lpush(`bm:sess:${uid}:events`, entry).catch(() => {});
    await redis.ltrim(`bm:sess:${uid}:events`, 0, 49).catch(() => {});
    await redis.hset("bm:sessions", uid, JSON.stringify({ uid, name: rest.name || "", geo, lastSeen: Date.now() })).catch(() => {});
    await redis.expire(`bm:sess:${uid}:events`, 86400).catch(() => {});
  }
  return Response.json({ ok: true });
}
