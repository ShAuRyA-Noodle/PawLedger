// Append-only ledger with per-shelter SHA-256 hash chain.
// Each entry stores prev_hash and hash. Tampering with any past entry breaks the chain.

import { createHash } from "node:crypto";
import { db, schema } from "@/db";
import { eq, desc, and } from "drizzle-orm";

type EntryInput = {
  shelterId: string;
  animalId?: string | null;
  donationId?: string | null;
  payoutId?: string | null;
  kind: typeof schema.ledgerKindEnum.enumValues[number];
  category?: typeof schema.expenseCategoryEnum.enumValues[number] | null;
  description: string;
  vendor?: string | null;
  amountPaise: bigint;
  currency?: "INR" | "USD";
  proofUrl?: string | null;
  occurredAt?: Date;
};

function canonicalJSON(input: Record<string, unknown>): string {
  const sortedKeys = Object.keys(input).sort();
  const obj: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    const v = input[key];
    obj[key] = typeof v === "bigint" ? v.toString() : v instanceof Date ? v.toISOString() : v;
  }
  return JSON.stringify(obj);
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function appendLedgerEntry(input: EntryInput) {
  return await db.transaction(async tx => {
    const last = await tx
      .select({ hash: schema.ledgerEntries.hash, blockHeight: schema.ledgerEntries.blockHeight })
      .from(schema.ledgerEntries)
      .where(eq(schema.ledgerEntries.shelterId, input.shelterId))
      .orderBy(desc(schema.ledgerEntries.blockHeight))
      .limit(1);

    const prevHash = last[0]?.hash ?? "0".repeat(64);
    const blockHeight = (last[0]?.blockHeight ?? -1) + 1;

    const payload = {
      shelter_id: input.shelterId,
      animal_id: input.animalId ?? null,
      donation_id: input.donationId ?? null,
      payout_id: input.payoutId ?? null,
      kind: input.kind,
      category: input.category ?? null,
      description: input.description,
      vendor: input.vendor ?? null,
      amount_paise: input.amountPaise,
      currency: input.currency ?? "INR",
      proof_url: input.proofUrl ?? null,
      occurred_at: input.occurredAt ?? new Date(),
      prev_hash: prevHash,
      block_height: blockHeight,
    };

    const hash = sha256Hex(prevHash + canonicalJSON(payload));

    const inserted = await tx
      .insert(schema.ledgerEntries)
      .values({
        shelterId: input.shelterId,
        animalId: input.animalId ?? null,
        donationId: input.donationId ?? null,
        payoutId: input.payoutId ?? null,
        kind: input.kind,
        category: input.category ?? null,
        description: input.description,
        vendor: input.vendor ?? null,
        amountPaise: input.amountPaise,
        currency: input.currency ?? "INR",
        proofUrl: input.proofUrl ?? null,
        occurredAt: input.occurredAt ?? new Date(),
        prevHash,
        hash,
        blockHeight,
      })
      .returning();

    return inserted[0];
  });
}

export async function verifyLedgerChain(shelterId: string): Promise<{ valid: boolean; brokenAt?: number; head?: string }> {
  const entries = await db
    .select()
    .from(schema.ledgerEntries)
    .where(eq(schema.ledgerEntries.shelterId, shelterId))
    .orderBy(schema.ledgerEntries.blockHeight);

  let prev = "0".repeat(64);
  for (const e of entries) {
    if (e.prevHash !== prev) return { valid: false, brokenAt: e.blockHeight };
    const payload = {
      shelter_id: e.shelterId,
      animal_id: e.animalId,
      donation_id: e.donationId,
      payout_id: e.payoutId,
      kind: e.kind,
      category: e.category,
      description: e.description,
      vendor: e.vendor,
      amount_paise: e.amountPaise,
      currency: e.currency,
      proof_url: e.proofUrl,
      occurred_at: e.occurredAt,
      prev_hash: e.prevHash,
      block_height: e.blockHeight,
    };
    const expected = sha256Hex(prev + canonicalJSON(payload));
    if (expected !== e.hash) return { valid: false, brokenAt: e.blockHeight };
    prev = e.hash;
  }
  return { valid: true, head: prev };
}

export async function getAnimalLedger(animalId: string) {
  return await db
    .select()
    .from(schema.ledgerEntries)
    .where(eq(schema.ledgerEntries.animalId, animalId))
    .orderBy(desc(schema.ledgerEntries.occurredAt));
}

export async function getShelterLedger(shelterId: string, limit = 100) {
  return await db
    .select()
    .from(schema.ledgerEntries)
    .where(eq(schema.ledgerEntries.shelterId, shelterId))
    .orderBy(desc(schema.ledgerEntries.occurredAt))
    .limit(limit);
}
