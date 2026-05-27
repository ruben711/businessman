import { listNotifs, relevantFor } from "@/lib/notifications";
import { isUpstashEnabled } from "@/lib/upstash";

export const runtime = "edge";

export async function GET(req: Request) {
  if (!isUpstashEnabled()) return Response.json({ notifications: [] });
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") || undefined;
  const all = await listNotifs();
  const filtered = all.filter((n) => relevantFor(n, uid)).slice(0, 30);
  return Response.json({ notifications: filtered });
}
