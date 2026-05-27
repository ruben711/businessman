import { isAuthed } from "@/lib/adminAuth";

export const runtime = "edge";

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return new Response("unauthorized", { status: 401 });
  return Response.json({ ok: true });
}
