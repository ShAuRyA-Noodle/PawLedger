"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

const Input = z.object({
  animalId: z.string().min(1),
  body: z.string().min(3).max(500),
  authorName: z.string().max(80).optional(),
});

export async function postSponsorMessage(input: z.infer<typeof Input>) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const session = await auth.api.getSession({ headers: await nextHeaders() });
  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `msg:${session?.user.id ?? ip}`, max: 5, windowSec: 600 });
  if (!rl.allowed) return { ok: false as const, error: "Too many messages. Slow down a bit." };

  // Auth requirement: only logged-in donors of the animal can post (cuts spam to zero).
  if (!session?.user) return { ok: false as const, error: "Please sign in to leave a message." };
  const sponsorshipExists = await db.select({ id: schema.sponsorships.id })
    .from(schema.sponsorships)
    .where(and(eq(schema.sponsorships.donorId, session.user.id), eq(schema.sponsorships.animalId, parsed.data.animalId)))
    .limit(1);
  if (!sponsorshipExists[0]) return { ok: false as const, error: "Only sponsors of this animal can post a message." };

  await db.insert(schema.sponsorMessages).values({
    animalId: parsed.data.animalId,
    authorUserId: session.user.id,
    authorName: parsed.data.authorName ?? session.user.name ?? "Sponsor",
    body: parsed.data.body,
    isApproved: true, // auto-approve from verified sponsors; admins can hide later
  });

  revalidatePath(`/animals`); // would need slug to revalidate exact page
  return { ok: true as const };
}
