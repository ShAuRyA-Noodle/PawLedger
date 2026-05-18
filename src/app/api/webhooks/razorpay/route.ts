import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/payments/razorpay";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { appendLedgerEntry } from "@/lib/ledger";
import { calcFees } from "@/lib/money";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhook(raw, sig)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; payload: Record<string, { entity: Record<string, unknown> }> };
  // Defang webhook-supplied strings before they hit the structured log;
  // attacker-controlled CR/LF would otherwise forge fresh log lines.
  const sanitize = (v: unknown) => String(v ?? "").replace(/[\r\n\t]/g, " ").slice(0, 120);
  console.log("[razorpay] received event:", sanitize(event.event));

  try {
    switch (event.event) {
      case "payment.captured":
      case "subscription.charged": {
        const payment = event.payload.payment?.entity as Record<string, unknown> | undefined;
        if (!payment) break;

        const animalId = (payment.notes as Record<string, string> | undefined)?.animalId ?? null;
        const donorEmail = (payment.notes as Record<string, string> | undefined)?.donorEmail ?? (payment.email as string | undefined) ?? "";
        const amountPaise = BigInt((payment.amount as number | undefined) ?? 0);

        // Resolve shelter via animal
        let shelterId: string | null = null;
        if (animalId) {
          const a = await db.select({ shelterId: schema.animals.shelterId }).from(schema.animals).where(eq(schema.animals.id, animalId)).limit(1);
          shelterId = a[0]?.shelterId ?? null;
        }
        if (!shelterId) {
          console.error("[razorpay] cannot resolve shelter for payment", sanitize(payment.id));
          break;
        }

        const fees = calcFees(amountPaise, "INR", false);
        const inserted = await db.insert(schema.donations).values({
          donorEmail,
          shelterId,
          animalId,
          kind: event.event === "subscription.charged" ? "recurring" : "one_time",
          amountPaise,
          currency: "INR",
          platformFeePaise: fees.platformFee,
          paymentFeePaise: fees.processingFee,
          netToShelterPaise: fees.netToShelter,
          gateway: "razorpay",
          gatewayChargeId: payment.id as string,
          status: "succeeded",
          capturedAt: new Date(),
        }).returning();

        if (inserted[0]) {
          await appendLedgerEntry({
            shelterId, animalId,
            donationId: inserted[0].id,
            kind: "donation_in",
            description: `Donation captured via Razorpay (${payment.id})`,
            amountPaise,
            currency: "INR",
          });
          await appendLedgerEntry({
            shelterId,
            kind: "fee",
            category: "platform_fee",
            description: "PawLedger platform fee (4%)",
            amountPaise: -fees.platformFee,
            currency: "INR",
          });
          await appendLedgerEntry({
            shelterId,
            kind: "fee",
            category: "payment_fee",
            description: "Razorpay processing fee",
            amountPaise: -fees.processingFee,
            currency: "INR",
          });
        }
        break;
      }
      case "subscription.activated": {
        const sub = event.payload.subscription?.entity as Record<string, unknown> | undefined;
        if (!sub) break;
        await db.update(schema.sponsorships).set({ status: "active", updatedAt: new Date() }).where(eq(schema.sponsorships.gatewaySubscriptionId, sub.id as string));
        break;
      }
      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription?.entity as Record<string, unknown> | undefined;
        if (!sub) break;
        await db.update(schema.sponsorships).set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() }).where(eq(schema.sponsorships.gatewaySubscriptionId, sub.id as string));
        break;
      }
      case "payment.failed": {
        const payment = event.payload.payment?.entity as Record<string, unknown> | undefined;
        if (!payment) break;
        await db.insert(schema.donations).values({
          donorEmail: (payment.email as string | undefined) ?? "",
          shelterId: null,
          kind: "one_time",
          amountPaise: BigInt((payment.amount as number | undefined) ?? 0),
          currency: "INR",
          gateway: "razorpay",
          gatewayChargeId: payment.id as string,
          status: "failed",
        });
        break;
      }
    }
  } catch (err) {
    console.error("[razorpay webhook] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
