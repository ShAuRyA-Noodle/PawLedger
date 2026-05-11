"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";
import { headers as nextHeaders } from "next/headers";

const Input = z.object({ email: z.email(), source: z.string().max(64).optional() });

export async function subscribeNewsletter(input: { email: string; source?: string }) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid email" } as const;

  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `nl:${ip}`, max: 5, windowSec: 60 });
  if (!rl.allowed) return { ok: false, error: "Too many tries. Slow down a bit." } as const;

  try {
    await db.insert(schema.newsletterSubscribers).values({
      email: parsed.data.email,
      source: parsed.data.source ?? "footer",
    }).onConflictDoNothing();
  } catch {
    return { ok: false, error: "Subscription failed. Try again." } as const;
  }
  return { ok: true } as const;
}
