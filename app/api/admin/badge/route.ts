import { isAuthed } from "@/lib/adminAuth";
import { redis, isUpstashEnabled, LB_KEY, type LbUser } from "@/lib/upstash";

export const runtime = "edge";

// Grant a custom badge to a user
export async function POST(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  if (!isUpstashEnabled()) return Response.json({ ok: false, reason: "no_upstash" });
  const body = await req.json().catch(() => ({}));
  const { uid, badge } = body as any;
  if (!uid || !badge?.name || !badge?.icon) return new Response("bad", { status: 400 });
  const raw = await redis.hget(LB_KEY, uid).catch(() => null);
  if (!raw) return new Response("not found", { status: 404 });
  const u: LbUser = JSON.parse(raw);
  const customBadges = u.customBadges || [];
  const id = "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  customBadges.push({
    id,
    name: String(badge.name).slice(0, 32),
    icon: String(badge.icon).slice(0, 4),
    color: String(badge.color || "#6ee7b7").slice(0, 7),
    desc: badge.desc ? String(badge.desc).slice(0, 120) : undefined,
  });
  u.customBadges = customBadges.slice(-20);
  await redis.hset(LB_KEY, uid, JSON.stringify(u));
  return Response.json({ ok: true, badge: customBadges[customBadges.length - 1] });
}

// Revoke a custom badge
export async function DELETE(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  if (!isUpstashEnabled()) return Response.json({ ok: false });
  const { uid, badgeId } = (await req.json()) as any;
  if (!uid || !badgeId) return new Response("bad", { status: 400 });
  const raw = await redis.hget(LB_KEY, uid).catch(() => null);
  if (!raw) return new Response("not found", { status: 404 });
  const u: LbUser = JSON.parse(raw);
  u.customBadges = (u.customBadges || []).filter((b) => b.id !== badgeId);
  await redis.hset(LB_KEY, uid, JSON.stringify(u));
  return Response.json({ ok: true });
}
