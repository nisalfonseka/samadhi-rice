/**
 * Lightweight fixed-window rate limiter backed by Upstash Redis over its REST
 * API (no SDK dependency). Fails OPEN — if Upstash is unset or unreachable we
 * never block a genuine user; the limiter only kicks in when Redis is healthy.
 */

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command: (string | number)[]): Promise<unknown> {
  const path = command.map((c) => encodeURIComponent(String(c))).join("/");
  const res = await fetch(`${URL}/${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
}

/* In-memory fallback for when Upstash isn't configured. Best-effort only —
   per server instance, so on serverless the effective limit is per-instance.
   Real protection comes from Upstash; this just covers local/single-instance. */
const mem = new Map<string, { count: number; reset: number }>();

function memLimit(id: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const e = mem.get(id);
  if (!e || e.reset < now) {
    mem.set(id, { count: 1, reset: now + windowSec * 1000 });
    if (mem.size > 5000) for (const [k, v] of mem) if (v.reset < now) mem.delete(k);
    return { success: true, remaining: limit - 1, limit };
  }
  e.count += 1;
  return { success: e.count <= limit, remaining: Math.max(0, limit - e.count), limit };
}

/**
 * Allow `limit` requests per `windowSec` for the given identifier.
 * Uses Upstash when configured, otherwise an in-memory fallback.
 */
export async function rateLimit(
  id: string,
  { limit, windowSec }: { limit: number; windowSec: number },
): Promise<RateLimitResult> {
  if (!URL || !TOKEN) return memLimit(id, limit, windowSec);

  const key = `rl:${id}`;
  try {
    const count = Number(await redis(["INCR", key]));
    if (count === 1) await redis(["EXPIRE", key, windowSec]);
    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      limit,
    };
  } catch {
    // Redis unreachable — fall back to the in-memory limiter rather than fail open.
    return memLimit(id, limit, windowSec);
  }
}
