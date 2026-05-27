// HMAC cookie auth using Web Crypto (Edge-compatible)

const COOKIE_NAME = "bm_admin";
const TTL_SECONDS = 60 * 60 * 24 * 7;

function b64url(buf: ArrayBuffer): string {
  const b = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return b.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}

async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: object, secret: string): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)).buffer);
  const k = await key(secret);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifyToken(token: string, secret: string): Promise<any | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sigB64] = token.split(".");
  const k = await key(secret);
  const ok = await crypto.subtle.verify("HMAC", k, b64urlDecode(sigB64), new TextEncoder().encode(body));
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${TTL_SECONDS}`;
}
export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  }
  return out;
}

export async function isAuthed(req: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const token = parseCookies(req.headers.get("cookie"))[COOKIE_NAME];
  if (!token) return false;
  const payload = await verifyToken(token, secret);
  return !!payload?.admin;
}

export { COOKIE_NAME, TTL_SECONDS };
