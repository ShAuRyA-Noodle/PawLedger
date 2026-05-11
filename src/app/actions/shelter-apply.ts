"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers as nextHeaders } from "next/headers";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const Input = z.object({
  name: z.string().min(2).max(120),
  legalName: z.string().min(2).max(160),
  founded: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  entityType: z.enum(["section_8_company", "trust", "society", "501c3", "fiscal_sponsored", "other"]),
  city: z.string().min(2).max(80),
  state: z.string().max(80).optional(),
  pincode: z.string().max(12).optional(),
  email: z.email(),
  phone: z.string().min(7).max(20),
  contactName: z.string().max(120),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  pan: z.string().max(15).optional(),
  registration12a: z.string().max(60).optional(),
  registration80g: z.string().max(60).optional(),
  registration80gExpiresAt: z.string().optional(), // ISO date string
  awbiRecognition: z.string().max(60).optional(),
  csr1: z.string().max(60).optional(),
  about: z.string().max(2000).optional(),
  fundraisingHistory: z.string().max(2000).optional(),
  references: z.string().max(2000).optional(),
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export async function submitShelterApplication(input: z.infer<typeof Input>) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `apply:${ip}`, max: 3, windowSec: 3600 });
  if (!rl.allowed) return { ok: false as const, error: "Too many applications from this IP." };

  const id = createId();
  const slug = `${slugify(parsed.data.name)}-${id.slice(0, 6)}`;
  try {
    await db.insert(schema.shelters).values({
      id, slug,
      name: parsed.data.name,
      legalName: parsed.data.legalName,
      founded: parsed.data.founded,
      entityType: parsed.data.entityType,
      about: parsed.data.about,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      email: parsed.data.email,
      phone: parsed.data.phone,
      websiteUrl: parsed.data.websiteUrl ?? null,
      pan: parsed.data.pan,
      registration12a: parsed.data.registration12a,
      registration80g: parsed.data.registration80g,
      registration80gExpiresAt: parsed.data.registration80gExpiresAt ? new Date(parsed.data.registration80gExpiresAt) : null,
      awbiRecognition: parsed.data.awbiRecognition,
      csr1: parsed.data.csr1,
      kycStatus: "pending",
      isPublished: false,
      isVerifiedShelter: false,
    });
    await db.insert(schema.auditLog).values({
      id: createId(),
      action: "shelter_applied",
      entityType: "shelter",
      entityId: id,
      afterJson: { name: parsed.data.name, contactName: parsed.data.contactName, references: parsed.data.references },
    });
  } catch (err) {
    console.error("[shelter-apply] insert failed:", err);
    return { ok: false as const, error: "Could not submit application. Email us at shelters@pawledger.org." };
  }

  if (resend) {
    try {
      await Promise.all([
        resend.emails.send({
          from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
          to: parsed.data.email,
          subject: "We received your shelter application",
          text: `Thank you for applying to PawLedger.\n\nApplication ID: ${id}\n\nWe review within 3 business days. We'll reach out via email + WhatsApp on ${parsed.data.phone}. If everything checks out, we'll schedule a 30-minute video call to walk you through your dashboard.\n\n— PawLedger team`,
        }),
        resend.emails.send({
          from: process.env.RESEND_FROM ?? "PawLedger <hello@pawledger.org>",
          to: process.env.ADMIN_EMAIL ?? "admin@pawledger.org",
          subject: `[Shelter apply] ${parsed.data.name} — ${parsed.data.city}`,
          text: `New shelter application.\n\nName: ${parsed.data.name}\nLegal: ${parsed.data.legalName}\nCity: ${parsed.data.city}, ${parsed.data.state ?? "—"}\nContact: ${parsed.data.contactName} · ${parsed.data.phone} · ${parsed.data.email}\nEntity: ${parsed.data.entityType}\n12A: ${parsed.data.registration12a ?? "—"} | 80G: ${parsed.data.registration80g ?? "—"} | AWBI: ${parsed.data.awbiRecognition ?? "—"}\n\nReview: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/shelters/${id}`,
        }),
      ]);
    } catch (e) { console.warn("[shelter-apply] email failed:", e); }
  }

  return { ok: true as const, applicationId: id };
}
