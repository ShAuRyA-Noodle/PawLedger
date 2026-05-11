import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const entries = await db.select({
    id: schema.ledgerEntries.id,
    occurredAt: schema.ledgerEntries.occurredAt,
    kind: schema.ledgerEntries.kind,
    category: schema.ledgerEntries.category,
    description: schema.ledgerEntries.description,
    vendor: schema.ledgerEntries.vendor,
    amountPaise: schema.ledgerEntries.amountPaise,
    currency: schema.ledgerEntries.currency,
    proofUrl: schema.ledgerEntries.proofUrl,
    hash: schema.ledgerEntries.hash,
    blockHeight: schema.ledgerEntries.blockHeight,
    shelterName: schema.shelters.name,
    animalName: schema.animals.name,
  }).from(schema.ledgerEntries)
    .leftJoin(schema.shelters, eq(schema.ledgerEntries.shelterId, schema.shelters.id))
    .leftJoin(schema.animals, eq(schema.ledgerEntries.animalId, schema.animals.id))
    .orderBy(desc(schema.ledgerEntries.occurredAt));

  const rows = [
    ["id", "occurred_at", "kind", "category", "description", "vendor", "amount_paise", "currency", "shelter", "animal", "proof_url", "block_height", "hash"],
    ...entries.map(e => [
      e.id,
      e.occurredAt.toISOString(),
      e.kind,
      e.category ?? "",
      JSON.stringify(e.description),
      e.vendor ?? "",
      e.amountPaise.toString(),
      e.currency,
      e.shelterName ?? "",
      e.animalName ?? "",
      e.proofUrl ?? "",
      e.blockHeight.toString(),
      e.hash,
    ]),
  ];
  const csv = rows.map(r => r.join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pawledger-public-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
