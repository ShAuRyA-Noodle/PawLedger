// Sliding-window rate limiter built on Upstash Redis.
// Falls back to an in-memory limiter if UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set
// (development convenience only — not safe across processes).

import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const memMap = new Map<string, number[]>();

type RateLimitOptions = { key: string; max: number; windowSec: number };

export async function checkRateLimit({ key, max, windowSec }: RateLimitOptions): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  if (redis) {
    const redisKey = `rl:${key}`;
    // ZADD now → ZREMRANGEBYSCORE old → ZCARD count → EXPIRE
    const tx = redis.multi();
    tx.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });
    tx.zremrangebyscore(redisKey, 0, windowStart);
    tx.zcard(redisKey);
    tx.expire(redisKey, windowSec * 2);
    const res = await tx.exec();
    const count = (res[2] as number) ?? 0;
    return { allowed: count <= max, remaining: Math.max(0, max - count), resetIn: windowSec };
  }

  // Fallback (in-memory)
  const arr = (memMap.get(key) ?? []).filter(t => t > windowStart);
  arr.push(now);
  memMap.set(key, arr);
  return { allowed: arr.length <= max, remaining: Math.max(0, max - arr.length), resetIn: windowSec };
}

export function ipFromRequest(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "anonymous";
}
