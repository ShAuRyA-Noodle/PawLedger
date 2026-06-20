import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { generate80GReceiptPDF } from "@/lib/receipts";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const rows = await db.select({
    donation: schema.donations,
    shelter: schema.shelters,
    animal: schema.animals,
  }).from(schema.donations)
    .leftJoin(schema.shelters, eq(schema.donations.shelterId, schema.shelters.id))
    .leftJoin(schema.animals, eq(schema.donations.animalId, schema.animals.id))
    .where(eq(schema.donations.id, id))
    .limit(1);

  const row = rows[0];
  if (!row || row.donation.status !== "succeeded") {
    return NextResponse.json({ error: "Receipt not available" }, { status: 404 });
  }

  // Auth: a receipt PDF exposes donor PII (name, email) and shelter tax IDs
  // (PAN / 80G / 12A), so it must never be served anonymously. Only the
  // owning donor or a platform admin may fetch it. Guest donations
  // (donorId === null) are therefore admin-only.
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const isOwner = row.donation.donorId != null && row.donation.donorId === session.user.id;
  if (!isOwner) {
    const userRow = await db.select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1);
    if (userRow[0]?.role !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (!row.shelter) return NextResponse.json({ error: "Shelter missing" }, { status: 404 });

  const pdfBytes = await generate80GReceiptPDF({
    receiptNumber: row.donation.taxReceiptNumber ?? `PL-${row.donation.id.slice(0, 8).toUpperCase()}`,
    donationId: row.donation.id,
    donorName: row.donation.donorName ?? "Anonymous donor",
    donorEmail: row.donation.donorEmail ?? "",
    amountSubunits: row.donation.amountPaise,
    currency: row.donation.currency,
    capturedAt: row.donation.capturedAt ?? row.donation.createdAt,
    animalName: row.animal?.name ?? "general fund",
    shelterName: row.shelter.name,
    shelterLegalName: row.shelter.legalName,
    shelter80g: row.shelter.registration80g ?? "—",
    shelter12a: row.shelter.registration12a ?? "—",
    shelterPan: row.shelter.pan ?? "—",
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pawledger-receipt-${row.donation.id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
