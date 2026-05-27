import { isAuthed } from "@/lib/adminAuth";
import { isUpstashEnabled, lbGetAll, LB_KEY, LB_SCORES_KEY, redis } from "@/lib/upstash";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  if (!isUpstashEnabled()) return Response.json({ ok: false });
  const users = await lbGetAll();
  // Example: rebalance — clamp negative XP, normalize sort
  for (const u of users) {
    u.xp = Math.max(0, Math.round(u.xp));
    await redis.hset(LB_KEY, u.uid, JSON.stringify(u));
    await redis.zadd(LB_SCORES_KEY, u.xp, u.uid);
  }
  return Response.json({ ok: true, count: users.length });
}
