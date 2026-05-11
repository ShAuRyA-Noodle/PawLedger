// Trigger.dev job — runs daily at 9am IST.
// For each active sponsorship with a card expiring in 30 / 7 / 1 days, send a dunning email.

import { db, schema } from "@/db";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { Resend } from "resend";
import { render } from "@react-email/render";
import CardExpiryEmail from "@/emails/card-expiry";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendCardExpiryReminders() {
  if (!resend) return { ok: false, reason: "email_not_configured" };

  const today = new Date();
  const triggers = [30, 7, 1];

  let sent = 0;
  for (const days of triggers) {
    const target = new Date(today);
    target.setDate(target.getDate() + days);
    const startOfDay = new Date(target); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(target); endOfDay.setHours(23, 59, 59, 999);

    const subs = await db.select({
      sub: schema.sponsorships, donorEmail: schema.user.email, donorName: schema.user.name, animalName: schema.animals.name,
    }).from(schema.sponsorships)
      .leftJoin(schema.user, eq(schema.sponsorships.donorId, schema.user.id))
      .leftJoin(schema.animals, eq(schema.sponsorships.animalId, schema.animals.id))
      .where(and(
        eq(schema.sponsorships.status, "active"),
        gte(schema.sponsorships.cardExpiresAt, startOfDay),
        lte(schema.sponsorships.cardExpiresAt, endOfDay)
      ));

    for (const row of subs) {
      if (!row.donorEmail || !row.animalName) continue;
      const html = await render(CardExpiryEmail({
        donorFirstName: row.donorName?.split(" ")[0] ?? "there",
        animalName: row.animalName,
        daysUntilExpiry: days,
        updateUrl: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org"}/dashboard/sponsorships/${row.sub.id}`,
        cardLast4: row.sub.cardLast4 ?? "—",
      }));
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
        to: row.donorEmail,
        subject: `Don't let ${row.animalName}'s sponsorship lapse`,
        html,
      });
      sent++;
    }
  }
  return { ok: true, sent };
}
