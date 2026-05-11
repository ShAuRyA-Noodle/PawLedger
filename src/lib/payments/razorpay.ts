import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const rzp = keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

const isConfigured = () => rzp !== null;

type OrderInput = {
  amountPaise: number;
  animalId: string;
  donorEmail: string;
};

export async function createRazorpayOrder(input: OrderInput) {
  if (!isConfigured()) {
    return { ok: false, error: "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to enable INR payments." } as const;
  }
  try {
    const order = await rzp!.orders.create({
      amount: input.amountPaise,
      currency: "INR",
      notes: { animalId: input.animalId, donorEmail: input.donorEmail },
      receipt: `pl_${Date.now()}`,
    });
    return { ok: true, orderId: order.id } as const;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Razorpay order failed" } as const;
  }
}

type SubInput = {
  amountPaise: number;
  animalId: string;
  animalName: string;
  donorEmail: string;
  donorName?: string;
  shelterLinkedAccountId: string | null;
};

export async function createRazorpaySubscription(input: SubInput) {
  if (!isConfigured()) {
    return { ok: false, error: "Razorpay not configured. Recurring sponsorships disabled until RAZORPAY_KEY_ID is set." } as const;
  }
  try {
    // Step 1: ensure a Plan exists for this amount (Razorpay requires plans for subscriptions)
    // For demo, create plan inline. In production, cache plans by amount.
    const plan = await rzp!.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: `PawLedger sponsorship — ${input.animalName}`,
        amount: input.amountPaise,
        currency: "INR",
        description: `Monthly sponsorship of ${input.animalName} via PawLedger`,
      },
      notes: { animalId: input.animalId },
    });
    const sub = await rzp!.subscriptions.create({
      plan_id: plan.id,
      customer_notify: 1,
      total_count: 120, // 10 years; donor cancels anytime
      notes: { animalId: input.animalId, donorEmail: input.donorEmail, donorName: input.donorName ?? "" },
      // Razorpay Route: transfers happen via webhook handler when each invoice paid
    });
    return { ok: true, subscriptionId: sub.id, shortUrl: sub.short_url } as const;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Razorpay subscription failed" } as const;
  }
}

export function verifyRazorpayWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signature === expected;
}
