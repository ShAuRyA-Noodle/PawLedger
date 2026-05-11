import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

const isConfigured = () => stripe !== null;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type Input = {
  amountCents: number;
  animalId: string;
  animalName: string;
  donorEmail: string;
  donorName?: string;
  shelterStripeAccountId: string | null;
};

export async function createStripeCheckoutSession(input: Input) {
  if (!isConfigured()) {
    return { ok: false, error: "Stripe not configured. Set STRIPE_SECRET_KEY to enable USD payments." } as const;
  }
  try {
    const session = await stripe!.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"],
      customer_email: input.donorEmail,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: input.amountCents,
          product_data: {
            name: `PawLedger sponsorship — ${input.animalName}`,
            metadata: { animalId: input.animalId },
          },
        },
        quantity: 1,
      }],
      payment_intent_data: input.shelterStripeAccountId ? {
        application_fee_amount: Math.round(input.amountCents * 0.04),
        transfer_data: { destination: input.shelterStripeAccountId },
        on_behalf_of: input.shelterStripeAccountId,
      } : undefined,
      metadata: { animalId: input.animalId, donorEmail: input.donorEmail, donorName: input.donorName ?? "" },
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&animal=${input.animalId}`,
      cancel_url: `${baseUrl}/animals/${input.animalId}`,
    });
    return { ok: true, url: session.url! } as const;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Stripe checkout failed" } as const;
  }
}

export async function createStripeSubscriptionCheckout(input: Input) {
  if (!isConfigured()) {
    return { ok: false, error: "Stripe not configured. Recurring USD sponsorships disabled until STRIPE_SECRET_KEY is set." } as const;
  }
  try {
    const session = await stripe!.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "link"],
      customer_email: input.donorEmail,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: input.amountCents,
          recurring: { interval: "month" },
          product_data: {
            name: `PawLedger sponsorship — ${input.animalName}`,
            metadata: { animalId: input.animalId },
          },
        },
        quantity: 1,
      }],
      subscription_data: input.shelterStripeAccountId ? {
        application_fee_percent: 4,
        transfer_data: { destination: input.shelterStripeAccountId },
        on_behalf_of: input.shelterStripeAccountId,
        metadata: { animalId: input.animalId, donorEmail: input.donorEmail },
      } : undefined,
      metadata: { animalId: input.animalId, donorEmail: input.donorEmail, donorName: input.donorName ?? "" },
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}&animal=${input.animalId}`,
      cancel_url: `${baseUrl}/animals/${input.animalId}`,
    });
    return { ok: true, url: session.url! } as const;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Stripe subscription checkout failed" } as const;
  }
}

export function verifyStripeWebhook(rawBody: string, signature: string): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripe) return null;
  try {
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return null;
  }
}

export { stripe };
