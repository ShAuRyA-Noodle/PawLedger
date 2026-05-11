"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

async function adminOnly() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  const r = await db.select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1);
  if (r[0]?.role !== "platform_admin") throw new Error("Forbidden");
  return session.user.id;
}

export async function setShelterKYC(input: { shelterId: string; status: "unsubmitted" | "pending" | "in_review" | "verified" | "rejected" }) {
  const userId = await adminOnly();
  const parsed = z.object({
    shelterId: z.string().min(1),
    status: z.enum(["unsubmitted", "pending", "in_review", "verified", "rejected"]),
  }).parse(input);

  const update: Record<string, unknown> = { kycStatus: parsed.status, updatedAt: new Date() };
  if (parsed.status === "verified") update.kycVerifiedAt = new Date();

  await db.update(schema.shelters).set(update).where(eq(schema.shelters.id, parsed.shelterId));
  await db.insert(schema.auditLog).values({
    id: createId(), actorId: userId, action: `shelter_kyc:${parsed.status}`,
    entityType: "shelter", entityId: parsed.shelterId,
  });
  revalidatePath(`/admin/shelters/${parsed.shelterId}`);
  revalidatePath("/admin/shelters");
}

export async function toggleShelterPublished(input: { shelterId: string; publish: boolean }) {
  const userId = await adminOnly();
  await db.update(schema.shelters).set({ isPublished: input.publish, updatedAt: new Date() }).where(eq(schema.shelters.id, input.shelterId));
  await db.insert(schema.auditLog).values({
    id: createId(), actorId: userId, action: input.publish ? "shelter_published" : "shelter_unpublished",
    entityType: "shelter", entityId: input.shelterId,
  });
  revalidatePath(`/admin/shelters/${input.shelterId}`);
  revalidatePath("/shelters");
}

export async function toggleShelterVerified(input: { shelterId: string; verify: boolean }) {
  const userId = await adminOnly();
  await db.update(schema.shelters).set({ isVerifiedShelter: input.verify, updatedAt: new Date() }).where(eq(schema.shelters.id, input.shelterId));
  await db.insert(schema.auditLog).values({
    id: createId(), actorId: userId, action: input.verify ? "shelter_verified" : "shelter_unverified",
    entityType: "shelter", entityId: input.shelterId,
  });
  revalidatePath(`/admin/shelters/${input.shelterId}`);
}
