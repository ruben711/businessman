import { clearCookieHeader } from "@/lib/adminAuth";

export const runtime = "edge";

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": clearCookieHeader() },
  });
}
