import { NextRequest, NextResponse } from "next/server";
import { verifyLedgerChain } from "@/lib/ledger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ shelter: string }> }) {
  const { shelter } = await params;
  const result = await verifyLedgerChain(shelter);
  return NextResponse.json({
    shelterId: shelter,
    chain_valid: result.valid,
    head: result.head ?? null,
    broken_at: result.brokenAt ?? null,
    verified_at: new Date().toISOString(),
    method: "SHA-256 chained, per-shelter",
  });
}
