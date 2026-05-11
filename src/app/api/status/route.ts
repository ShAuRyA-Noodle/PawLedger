import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

type Check = { ok: boolean; detail?: string; latencyMs?: number };

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T | null; ms: number; err?: string }> {
  const t0 = Date.now();
  try { return { result: await fn(), ms: Date.now() - t0 }; }
  catch (e) { return { result: null, ms: Date.now() - t0, err: e instanceof Error ? e.message : "unknown" }; }
}

export async function GET() {
  const checks: Record<string, Check> = {};

  // DB
  const dbCheck = await timed(() => db.execute(sql`select 1`));
  checks.database = dbCheck.err
    ? { ok: false, detail: dbCheck.err, latencyMs: dbCheck.ms }
    : { ok: true, latencyMs: dbCheck.ms };

  // Razorpay — actually ping `/v1/payments` HEAD-style with key auth
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const rz = await timed(async () => {
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const r = await fetch("https://api.razorpay.com/v1/payments?count=1", {
        headers: { Authorization: `Basic ${auth}` },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok && r.status !== 401) throw new Error(`HTTP ${r.status}`);
      return r.status;
    });
    checks.razorpay = rz.err ? { ok: false, detail: rz.err, latencyMs: rz.ms } : { ok: true, latencyMs: rz.ms, detail: `auth ok (${rz.result})` };
  } else {
    checks.razorpay = { ok: false, detail: "RAZORPAY_KEY_ID not configured" };
  }

  // Stripe — ping account
  if (process.env.STRIPE_SECRET_KEY) {
    const st = await timed(async () => {
      const r = await fetch("https://api.stripe.com/v1/account", {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json() as { id?: string };
      return j.id;
    });
    checks.stripe = st.err ? { ok: false, detail: st.err, latencyMs: st.ms } : { ok: true, latencyMs: st.ms, detail: st.result ?? "ok" };
  } else {
    checks.stripe = { ok: false, detail: "STRIPE_SECRET_KEY not configured" };
  }

  // Resend — verify by listing domains (very cheap)
  if (process.env.RESEND_API_KEY) {
    const re = await timed(async () => {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(4000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.status;
    });
    checks.email = re.err ? { ok: false, detail: re.err, latencyMs: re.ms } : { ok: true, latencyMs: re.ms };
  } else {
    checks.email = { ok: false, detail: "RESEND_API_KEY not configured" };
  }

  // Better Auth secret
  checks.auth = process.env.BETTER_AUTH_SECRET
    ? { ok: true, detail: "secret configured" }
    : { ok: false, detail: "BETTER_AUTH_SECRET not set — sessions insecure" };

  // Upstash redis (rate-limit backing store)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const up = await timed(async () => {
      const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
        signal: AbortSignal.timeout(2500),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.status;
    });
    checks.rate_limit = up.err ? { ok: false, detail: up.err, latencyMs: up.ms } : { ok: true, latencyMs: up.ms };
  } else {
    checks.rate_limit = { ok: false, detail: "Upstash not configured — using in-memory fallback (single-process only)" };
  }

  const allOk = Object.values(checks).every(c => c.ok);
  return NextResponse.json({ status: allOk ? "ok" : "degraded", checks, generatedAt: new Date().toISOString() }, {
    status: allOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
