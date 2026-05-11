import { NextRequest, NextResponse } from "next/server";
import { stripe, verifyStripeWebhook } from "@/lib/payments/stripe";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { appendLedgerEntry } from "@/lib/ledger";
import { calcFees } from "@/lib/money";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const event = verifyStripeWebhook(raw, sig);
  if (!event) return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });

  console.log("[stripe] received event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const animalId = session.metadata?.animalId ?? null;
        const donorEmail = session.customer_email ?? session.metadata?.donorEmail ?? "";
        const donorName = session.metadata?.donorName ?? "";
        const amountCents = BigInt(session.amount_total ?? 0);

        let shelterId: string | null = null;
        if (animalId) {
          const a = await db.select({ shelterId: schema.animals.shelterId }).from(schema.animals).where(eq(schema.animals.id, animalId)).limit(1);
          shelterId = a[0]?.shelterId ?? null;
        }

        const fees = calcFees(amountCents, "USD", false);
        if (!shelterId) break;

        const inserted = await db.insert(schema.donations).values({
          donorEmail, donorName,
          shelterId, animalId,
          kind: session.mode === "subscription" ? "recurring" : "one_time",
          amountPaise: amountCents,
          currency: "USD",
          platformFeePaise: fees.platformFee,
          paymentFeePaise: fees.processingFee,
          netToShelterPaise: fees.netToShelter,
          gateway: "stripe",
          gatewayChargeId: session.payment_intent as string | null ?? session.id,
          gatewayOrderId: session.id,
          status: "succeeded",
          capturedAt: new Date(),
        }).returning();

        if (inserted[0]) {
          await appendLedgerEntry({
            shelterId, animalId,
            donationId: inserted[0].id,
            kind: "donation_in",
            description: `Donation via Stripe (${session.id})`,
            amountPaise: amountCents,
            currency: "USD",
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await db.update(schema.sponsorships).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(schema.sponsorships.gatewaySubscriptionId, sub.id));
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
