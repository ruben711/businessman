import { signToken, cookieHeader, TTL_SECONDS } from "@/lib/adminAuth";

export const runtime = "edge";

const attempts = new Map<string, { count: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anon";
  const rec = attempts.get(ip) || { count: 0, until: 0 };
  if (rec.until > Date.now()) {
    return Response.json({ error: "Te veel pogingen, probeer later" }, { status: 429 });
  }
  const { password } = (await req.json().catch(() => ({}))) as any;
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET;
  if (!expected || !secret) return Response.json({ error: "Niet geconfigureerd" }, { status: 500 });
  if (password !== expected) {
    rec.count += 1;
    if (rec.count >= 5) { rec.until = Date.now() + 15 * 60 * 1000; rec.count = 0; }
    attempts.set(ip, rec);
    return Response.json({ error: "Fout wachtwoord" }, { status: 401 });
  }
  attempts.delete(ip);
  const token = await signToken(
    { admin: true, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + TTL_SECONDS },
    secret
  );
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": cookieHeader(token) },
  });
}
