"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers as nextHeaders } from "next/headers";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const Input = z.object({
  companyName: z.string().min(2).max(160),
  legalName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(120),
  contactEmail: z.email(),
  contactPhone: z.string().max(20).optional(),
  pan: z.string().max(15).optional(),
  gstin: z.string().max(20).optional(),
  cin: z.string().max(30).optional(),
  csrPoolBudgetINR: z.number().int().nonnegative().optional(),
  preferredTier: z.enum(["pilot", "growth", "enterprise"]).default("pilot"),
  notes: z.string().max(2000).optional(),
});

export async function submitCSRInquiry(input: z.infer<typeof Input>) {
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const h = await nextHeaders();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit({ key: `csr:${ip}`, max: 5, windowSec: 3600 });
  if (!rl.allowed) return { ok: false as const, error: "Too many inquiries from this IP." };

  const id = createId();
  try {
    await db.insert(schema.csrAccounts).values({
      id,
      companyName: parsed.data.companyName,
      legalName: parsed.data.legalName,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      pan: parsed.data.pan,
      gstin: parsed.data.gstin,
      cin: parsed.data.cin,
      tier: parsed.data.preferredTier,
      annualPledgePaise: parsed.data.csrPoolBudgetINR ? BigInt(parsed.data.csrPoolBudgetINR * 100) : 0n,
    });
  } catch (err) {
    console.error("[csr] insert failed:", err);
    return { ok: false as const, error: "Could not record inquiry." };
  }

  if (resend) {
    try {
      await Promise.all([
        resend.emails.send({
          from: process.env.RESEND_FROM ?? "PawLedger <csr@pawledger.org>",
          to: parsed.data.contactEmail,
          subject: "Thank you for your CSR inquiry",
          text: `Hi ${parsed.data.contactName.split(" ")[0]},\n\nThank you for your interest in PawLedger as your animal-welfare CSR partner. We will reach out within 1 business day with a sample CSR-1 + CSR-2 packet for ${parsed.data.companyName}.\n\nMeanwhile, you can explore our public ledger at ${process.env.NEXT_PUBLIC_BASE_URL}/transparency.\n\n— PawLedger`,
        }),
        resend.emails.send({
          from: process.env.RESEND_FROM ?? "PawLedger <csr@pawledger.org>",
          to: process.env.CSR_LEAD_EMAIL ?? process.env.ADMIN_EMAIL ?? "csr@pawledger.org",
          subject: `[CSR inquiry] ${parsed.data.companyName} — ${parsed.data.preferredTier}`,
          text: `New CSR inquiry.\n\nCompany: ${parsed.data.companyName} (${parsed.data.legalName})\nContact: ${parsed.data.contactName} · ${parsed.data.contactEmail} · ${parsed.data.contactPhone ?? "—"}\nTier: ${parsed.data.preferredTier}\nBudget: ${parsed.data.csrPoolBudgetINR ? `₹${parsed.data.csrPoolBudgetINR.toLocaleString("en-IN")}` : "not stated"}\nNotes: ${parsed.data.notes ?? "—"}\n\nAdmin: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/csr/${id}`,
        }),
      ]);
    } catch (e) { console.warn("[csr] email failed:", e); }
  }

  return { ok: true as const, id };
}
