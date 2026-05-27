import { isAuthed } from "@/lib/adminAuth";
import { pushNotif, type Notif } from "@/lib/notifications";

export const runtime = "edge";

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  const { title, body, type, target } = (await req.json()) as any;
  if (!title || !target) return new Response("bad", { status: 400 });
  const n: Notif = {
    id: "n_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    body,
    type: type || "info",
    target,
    ts: Date.now(),
  };
  await pushNotif(n);
  return Response.json({ ok: true });
}
