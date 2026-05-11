"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SOSReportInput = z.object({
  species: z.enum(["dog", "cat", "cow", "bird", "rabbit", "horse", "donkey", "other"]),
  conditionDescription: z.string().min(10).max(2000),
  isInjured: z.boolean().default(false),
  isHitByVehicle: z.boolean().default(false),
  isAggressive: z.boolean().default(false),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().max(120).optional(),
  addressNote: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
  reporterPhone: z.string().max(20).optional(),
  reporterName: z.string().max(120).optional(),
});

export async function submitSOSReport(input: z.infer<typeof SOSReportInput>) {
  const parsed = SOSReportInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `sos:${ip}`, max: 5, windowSec: 600 });
  if (!rl.allowed) return { ok: false as const, error: "Too many SOS reports from this IP. Wait a few minutes." };

  const publicId = createId();
  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + 4);

  try {
    await db.insert(schema.sosReports).values({
      id: createId(),
      publicId,
      reporterPhone: parsed.data.reporterPhone,
      reporterName: parsed.data.reporterName,
      latitude: Math.round(parsed.data.latitude * 1e7),
      longitude: Math.round(parsed.data.longitude * 1e7),
      city: parsed.data.city,
      addressNote: parsed.data.addressNote,
      species: parsed.data.species,
      conditionDescription: parsed.data.conditionDescription,
      isInjured: parsed.data.isInjured,
      isHitByVehicle: parsed.data.isHitByVehicle,
      isAggressive: parsed.data.isAggressive,
      photoUrl: parsed.data.photoUrl,
      status: "reported",
      slaDeadlineAt: slaDeadline,
      microFundGoalPaise: 150000n,
    });
  } catch (err) {
    console.error("[sos] DB insert failed:", err);
    return { ok: false as const, error: "Could not save report. Try again." };
  }

  // Email admin / on-call shelter (when wired)
  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "PawLedger SOS <sos@pawledger.org>",
        to: process.env.SOS_ADMIN_EMAIL ?? "admin@pawledger.org",
        subject: `[SOS] ${parsed.data.species} in ${parsed.data.city ?? "—"} — ${parsed.data.isHitByVehicle ? "hit by vehicle" : "injured"}`,
        text: `New SOS report.\n\nLocation: ${parsed.data.latitude}, ${parsed.data.longitude}\nNote: ${parsed.data.addressNote ?? "—"}\nCondition: ${parsed.data.conditionDescription}\nReporter: ${parsed.data.reporterPhone ?? "anonymous"}\n\nDispatch: ${process.env.NEXT_PUBLIC_BASE_URL}/sos/${publicId}`,
      });
    } catch (e) { console.warn("[sos] email notify failed:", e); }
  }

  revalidatePath("/sos");
  return { ok: true as const, publicId };
}

const SOSDonateInput = z.object({
  publicId: z.string().min(8),
  amountPaise: z.number().int().positive(),
  donorEmail: z.email(),
  donorName: z.string().optional(),
});

export async function startSOSDonation(input: z.infer<typeof SOSDonateInput>) {
  const parsed = SOSDonateInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  const { createRazorpayOrder } = await import("@/lib/payments/razorpay");
  const order = await createRazorpayOrder({
    amountPaise: parsed.data.amountPaise,
    animalId: parsed.data.publicId, // SOS funded under publicId
    donorEmail: parsed.data.donorEmail,
  });
  if (!order.ok) return { ok: false as const, error: order.error };

  return { ok: true as const, orderId: order.orderId };
}
