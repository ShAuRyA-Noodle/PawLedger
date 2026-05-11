// Trigger.dev job — runs every Monday 8am IST.
// Sends a weekly digest email to every active sponsor with their animal's most recent update.
//
// To wire: install @trigger.dev/sdk, configure TRIGGER_API_KEY, and run `npx trigger.dev@latest dev`.
//
// This file is a scaffold — replace the `defineJob` import once you install the SDK.

import { db, schema } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WeeklyUpdateEmail from "@/emails/weekly-update";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWeeklyDigest() {
  if (!resend) {
    console.warn("[weekly-digest] RESEND_API_KEY not configured — skipping.");
    return { ok: false, reason: "email_not_configured" };
  }

  // Fetch active sponsorships with their animal's latest update
  const subs = await db.select({
    sub: schema.sponsorships,
    donorEmail: schema.user.email,
    donorName: schema.user.name,
    animalName: schema.animals.name,
    animalSlug: schema.animals.slug,
    shelterName: schema.shelters.name,
  }).from(schema.sponsorships)
    .leftJoin(schema.user, eq(schema.sponsorships.donorId, schema.user.id))
    .leftJoin(schema.animals, eq(schema.sponsorships.animalId, schema.animals.id))
    .leftJoin(schema.shelters, eq(schema.sponsorships.shelterId, schema.shelters.id))
    .where(eq(schema.sponsorships.status, "active"));

  let sent = 0;
  for (const row of subs) {
    if (!row.donorEmail || !row.animalName) continue;
    const latestUpdate = await db.select().from(schema.animalUpdates).where(eq(schema.animalUpdates.animalId, row.sub.animalId!)).orderBy(desc(schema.animalUpdates.publishedAt)).limit(1);
    if (!latestUpdate[0]) continue;

    const html = await render(WeeklyUpdateEmail({
      donorFirstName: row.donorName?.split(" ")[0] ?? "there",
      animalName: row.animalName,
      updateBody: latestUpdate[0].body,
      updatePhotoUrl: latestUpdate[0].mediaUrl ?? undefined,
      animalUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org"}/animals/${row.animalSlug}`,
      monthsActive: row.sub.monthsActive,
      shelterName: row.shelterName ?? "the shelter",
    }));

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
      to: row.donorEmail,
      subject: `${row.animalName}'s week in 3 photos`,
      html,
    });
    sent++;
  }
  return { ok: true, sent };
}
