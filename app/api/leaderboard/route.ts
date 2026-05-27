import { isUpstashEnabled, lbGetAll, lbUpsert } from "@/lib/upstash";

export const runtime = "edge";

export async function GET() {
  if (!isUpstashEnabled()) return Response.json({ users: [] });
  const users = await lbGetAll();
  return Response.json({ users });
}

export async function POST(req: Request) {
  if (!isUpstashEnabled()) return Response.json({ ok: false, reason: "no_upstash" });
  const body = await req.json().catch(() => ({}));
  const { uid, name, xp, solved, customTag, nameStyle, badges, customBadges } = body as any;
  if (!uid || typeof xp !== "number") return new Response("bad", { status: 400 });
  await lbUpsert({
    uid,
    name: (name || "User" + uid.slice(-4)).slice(0, 40),
    xp: Math.max(0, Math.min(999999, xp)),
    solved: Math.max(0, Math.min(99999, solved || 0)),
    lastSync: Date.now(),
    customTag,
    nameStyle,
    badges: Array.isArray(badges) ? badges.slice(0, 50) : undefined,
    customBadges: Array.isArray(customBadges) ? customBadges.slice(0, 20) : undefined,
  });
  return Response.json({ ok: true });
}
