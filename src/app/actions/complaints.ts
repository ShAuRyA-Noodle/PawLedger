"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers as nextHeaders } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const Input = z.object({
  aboutType: z.enum(["shelter", "animal", "donation", "sos", "platform"]),
  aboutId: z.string().optional(),
  body: z.string().min(20).max(4000),
  reporterEmail: z.email(),
  isPublic: z.boolean().default(true),
});

export async function submitComplaint(input: z.infer<typeof Input>) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `complaint:${ip}`, max: 3, windowSec: 600 });
  if (!rl.allowed) return { ok: false as const, error: "Too many complaints from this IP. Slow down." };

  const id = createId();
  try {
    await db.insert(schema.complaints).values({
      id,
      reporterEmail: parsed.data.reporterEmail,
      aboutType: parsed.data.aboutType,
      aboutId: parsed.data.aboutId,
      body: parsed.data.body,
      status: "open",
      isPublic: parsed.data.isPublic,
    });
  } catch (err) {
    console.error("[complaint] insert failed:", err);
    return { ok: false as const, error: "Could not save complaint. Try again." };
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
        to: parsed.data.reporterEmail,
        subject: "We received your complaint",
        text: `Thank you for filing this complaint with PawLedger.\n\nReference: ${id}\n\nWe respond within 2 business days. ${parsed.data.isPublic ? "Once we respond, both your complaint and our response will appear on /complaints." : "We'll keep this private and contact you directly."}\n\n— PawLedger`,
      });
    } catch (e) { console.warn("[complaint] email failed:", e); }
  }

  revalidatePath("/complaints");
  return { ok: true as const, id };
}
