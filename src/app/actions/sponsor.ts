"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { calcFees } from "@/lib/money";
import { createRazorpayOrder, createRazorpaySubscription } from "@/lib/payments/razorpay";
import { createStripeCheckoutSession, createStripeSubscriptionCheckout } from "@/lib/payments/stripe";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

const SponsorSchema = z.object({
  animalId: z.string().min(1),
  amountSubunits: z.string(), // bigint as string
  currency: z.enum(["INR", "USD"]),
  isMonthly: z.boolean(),
  donorEmail: z.email(),
  donorName: z.string().optional().default(""),
  donorCoversFees: z.boolean(),
});

export async function createSponsorship(input: z.infer<typeof SponsorSchema>) {
  const parsed = SponsorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" } as const;

  const { animalId, amountSubunits: amountStr, currency, isMonthly, donorEmail, donorName, donorCoversFees } = parsed.data;
  const subunits = BigInt(amountStr);

  // Fetch animal + shelter
  const animalRows = await db.select().from(schema.animals).where(eq(schema.animals.id, animalId)).limit(1);
  const animal = animalRows[0];
  if (!animal || !animal.isPublished) return { ok: false, error: "Animal not available for sponsorship" } as const;

  const shelterRows = await db.select().from(schema.shelters).where(eq(schema.shelters.id, animal.shelterId)).limit(1);
  const shelter = shelterRows[0];
  if (!shelter) return { ok: false, error: "Shelter unavailable" } as const;

  const fees = calcFees(subunits, currency, donorCoversFees);
  const session = await auth.api.getSession({ headers: await headers() });
  const donorId = session?.user.id ?? null;

  // Pick gateway by currency
  if (currency === "INR") {
    if (isMonthly) {
      const sub = await createRazorpaySubscription({
        amountPaise: Number(fees.grossAmount),
        animalId, animalName: animal.name, donorEmail, donorName, shelterLinkedAccountId: shelter.razorpayLinkedAccountId,
      });
      if (!sub.ok) return { ok: false, error: sub.error } as const;
      return { ok: true, checkoutUrl: sub.shortUrl, gatewayId: sub.subscriptionId } as const;
    } else {
      const order = await createRazorpayOrder({
        amountPaise: Number(fees.grossAmount),
        animalId, donorEmail,
      });
      if (!order.ok) return { ok: false, error: order.error } as const;
      // For one-time: redirect to a hosted checkout page that we render
      return { ok: true, checkoutUrl: `/checkout/razorpay?order=${order.orderId}&animal=${animal.slug}&email=${encodeURIComponent(donorEmail)}` } as const;
    }
  } else {
    // USD via Stripe
    if (isMonthly) {
      const checkout = await createStripeSubscriptionCheckout({
        amountCents: Number(fees.grossAmount),
        animalId, animalName: animal.name, donorEmail, donorName, shelterStripeAccountId: shelter.stripeConnectAccountId,
      });
      if (!checkout.ok) return { ok: false, error: checkout.error } as const;
      return { ok: true, checkoutUrl: checkout.url } as const;
    } else {
      const checkout = await createStripeCheckoutSession({
        amountCents: Number(fees.grossAmount),
        animalId, animalName: animal.name, donorEmail, donorName, shelterStripeAccountId: shelter.stripeConnectAccountId,
      });
      if (!checkout.ok) return { ok: false, error: checkout.error } as const;
      return { ok: true, checkoutUrl: checkout.url } as const;
    }
  }
}
