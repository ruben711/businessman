// Edge-safe Upstash Redis REST client (no SDK)

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function isUpstashEnabled() {
  return !!(URL && TOKEN);
}

async function call(parts: (string | number)[]): Promise<any> {
  if (!URL || !TOKEN) throw new Error("Upstash not configured");
  const res = await fetch(`${URL}/${parts.map((p) => encodeURIComponent(String(p))).join("/")}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return data.result;
}

async function pipe(commands: (string | number)[][]): Promise<any[]> {
  if (!URL || !TOKEN) throw new Error("Upstash not configured");
  const res = await fetch(`${URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return data.map((d: any) => d.result);
}

export const redis = {
  get: (k: string) => call(["get", k]),
  set: (k: string, v: string) => call(["set", k, v]),
  del: (k: string) => call(["del", k]),
  hset: (k: string, field: string, v: string) => call(["hset", k, field, v]),
  hget: (k: string, field: string) => call(["hget", k, field]),
  hgetall: (k: string) => call(["hgetall", k]),
  hdel: (k: string, field: string) => call(["hdel", k, field]),
  keys: (pattern: string) => call(["keys", pattern]),
  zadd: (k: string, score: number, member: string) => call(["zadd", k, score, member]),
  zrevrange: (k: string, start: number, stop: number) => call(["zrevrange", k, start, stop, "WITHSCORES"]),
  zrem: (k: string, member: string) => call(["zrem", k, member]),
  incr: (k: string) => call(["incr", k]),
  expire: (k: string, sec: number) => call(["expire", k, sec]),
  lpush: (k: string, v: string) => call(["lpush", k, v]),
  lrange: (k: string, start: number, stop: number) => call(["lrange", k, start, stop]),
  ltrim: (k: string, start: number, stop: number) => call(["ltrim", k, start, stop]),
  pipe,
};

// ===== Leaderboard types =====
export type LbUser = {
  uid: string;
  name: string;
  xp: number;
  solved: number;
  lastSync: number;
  isAdmin?: boolean;
  customTag?: { label: string; color: string; emoji?: string };
  nameStyle?: any;
};

export const LB_KEY = "bm:lb"; // hash uid -> JSON
export const LB_SCORES_KEY = "bm:lb:scores"; // zset

export async function lbUpsert(u: LbUser) {
  // preserve customTag/nameStyle and isAdmin if existing
  const existingRaw = await redis.hget(LB_KEY, u.uid).catch(() => null);
  if (existingRaw) {
    try {
      const existing: LbUser = JSON.parse(existingRaw);
      u.customTag = u.customTag ?? existing.customTag;
      u.nameStyle = u.nameStyle ?? existing.nameStyle;
      u.isAdmin = u.isAdmin ?? existing.isAdmin;
    } catch {}
  }
  await redis.pipe([
    ["hset", LB_KEY, u.uid, JSON.stringify(u)],
    ["zadd", LB_SCORES_KEY, u.xp, u.uid],
  ]);
}

export async function lbGetAll(): Promise<LbUser[]> {
  const all = await redis.hgetall(LB_KEY).catch(() => null);
  if (!all) return [];
  const out: LbUser[] = [];
  // Upstash returns object or array; normalize
  if (Array.isArray(all)) {
    for (let i = 0; i < all.length; i += 2) {
      try { out.push(JSON.parse(all[i + 1])); } catch {}
    }
  } else {
    for (const k of Object.keys(all)) {
      try { out.push(JSON.parse((all as any)[k])); } catch {}
    }
  }
  return out.sort((a, b) => b.xp - a.xp);
}

export async function lbDelete(uid: string) {
  await redis.pipe([
    ["hdel", LB_KEY, uid],
    ["zrem", LB_SCORES_KEY, uid],
  ]);
}
