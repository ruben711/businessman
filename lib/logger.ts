// Discord webhook logger (server-side)

const HOOK = process.env.DISCORD_WEBHOOK_URL;

async function hash(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).slice(0, 6).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const lastSent = new Map<string, number>();
function rateLimit(key: string, ms: number) {
  const now = Date.now();
  const prev = lastSent.get(key) || 0;
  if (now - prev < ms) return false;
  lastSent.set(key, now);
  return true;
}

export async function logEvent(event: string, data: Record<string, unknown> = {}, opts: { ip?: string } = {}) {
  if (!HOOK) return;
  const ipHash = opts.ip ? await hash(opts.ip) : "anon";
  const key = `${event}:${ipHash}`;
  if (!rateLimit(key, 5000)) return;
  try {
    await fetch(HOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "BM-Bot",
        embeds: [{
          title: event,
          color: 0x0f5132,
          fields: [
            { name: "user", value: `\`${ipHash}\``, inline: true },
            ...Object.entries(data).slice(0, 12).map(([k, v]) => ({
              name: k, value: String(v).slice(0, 200), inline: true,
            })),
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch {}
}
