"use server";

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

export async function resolveComplaint(input: { complaintId: string; status: "investigating" | "resolved" | "dismissed"; resolution?: string }) {
  const userId = await adminOnly();
  const updates: Record<string, unknown> = { status: input.status };
  if (input.status === "resolved" || input.status === "dismissed") updates.resolvedAt = new Date();
  if (input.resolution) updates.resolution = input.resolution;

  await db.update(schema.complaints).set(updates).where(eq(schema.complaints.id, input.complaintId));
  await db.insert(schema.auditLog).values({
    id: createId(), actorId: userId, action: `complaint:${input.status}`,
    entityType: "complaint", entityId: input.complaintId,
    afterJson: { resolution: input.resolution ?? null },
  });
  revalidatePath(`/admin/complaints/${input.complaintId}`);
  revalidatePath("/admin/complaints");
  revalidatePath("/complaints");
}
