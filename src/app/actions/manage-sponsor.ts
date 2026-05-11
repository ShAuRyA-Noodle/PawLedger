"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function ownerCheck(sponsorshipId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const rows = await db.select().from(schema.sponsorships).where(and(eq(schema.sponsorships.id, sponsorshipId), eq(schema.sponsorships.donorId, session.user.id))).limit(1);
  if (!rows[0]) throw new Error("Not found");
  return { sub: rows[0], userId: session.user.id };
}

export async function pauseSponsorship(input: { sponsorshipId: string; months: number }) {
  const { sub } = await ownerCheck(input.sponsorshipId);
  const months = z.number().int().min(1).max(12).parse(input.months);
  const pausedUntil = new Date();
  pausedUntil.setMonth(pausedUntil.getMonth() + months);
  await db.update(schema.sponsorships).set({ status: "paused", pausedUntil, updatedAt: new Date() }).where(eq(schema.sponsorships.id, sub.id));
  // TODO: hit Razorpay/Stripe to actually pause the gateway subscription
  revalidatePath(`/dashboard/sponsorships/${sub.id}`);
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function resumeSponsorship(input: { sponsorshipId: string }) {
  const { sub } = await ownerCheck(input.sponsorshipId);
  await db.update(schema.sponsorships).set({ status: "active", pausedUntil: null, cancelledAt: null, updatedAt: new Date() }).where(eq(schema.sponsorships.id, sub.id));
  // TODO: hit Razorpay/Stripe to resume
  revalidatePath(`/dashboard/sponsorships/${sub.id}`);
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function cancelSponsorship(input: { sponsorshipId: string; reason?: string }) {
  const { sub } = await ownerCheck(input.sponsorshipId);
  await db.update(schema.sponsorships).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(schema.sponsorships.id, sub.id));
  // TODO: hit Razorpay/Stripe to cancel; record reason in audit log
  await db.insert(schema.auditLog).values({
    actorId: sub.donorId, action: "sponsorship_cancelled", entityType: "sponsorship", entityId: sub.id,
    afterJson: { reason: input.reason ?? null },
  });
  revalidatePath(`/dashboard/sponsorships/${sub.id}`);
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

export async function changeTier(input: { sponsorshipId: string; newAmountSubunits: string }) {
  const { sub } = await ownerCheck(input.sponsorshipId);
  const newAmount = BigInt(input.newAmountSubunits);
  if (newAmount <= 0n) throw new Error("Invalid amount");
  await db.update(schema.sponsorships).set({ amountPaise: newAmount, updatedAt: new Date() }).where(eq(schema.sponsorships.id, sub.id));
  // TODO: update gateway subscription plan
  revalidatePath(`/dashboard/sponsorships/${sub.id}`);
  return { ok: true } as const;
}
