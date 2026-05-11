import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";

// Apple Wallet .pkpass stub. Production version uses passkit-generator with a
// signing certificate from Apple Developer + PassTypeID. This stub returns the
// pass.json (the human-readable spec) so the founder can drop in signing later.
export async function GET(req: NextRequest, { params }: { params: Promise<{ sponsorshipId: string }> }) {
  const { sponsorshipId } = await params;
  const session = await auth.api.getSession({ headers: await nextHeaders() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    sub: schema.sponsorships, animal: schema.animals, shelter: schema.shelters,
  }).from(schema.sponsorships)
    .leftJoin(schema.animals, eq(schema.sponsorships.animalId, schema.animals.id))
    .leftJoin(schema.shelters, eq(schema.sponsorships.shelterId, schema.shelters.id))
    .where(and(eq(schema.sponsorships.id, sponsorshipId), eq(schema.sponsorships.donorId, session.user.id)))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { sub, animal, shelter } = rows[0];

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.org.pawledger.sponsor",
    serialNumber: sub.id,
    teamIdentifier: "ZZZZZZ123",
    organizationName: "PawLedger",
    description: `Sponsor of ${animal?.name} at ${shelter?.name}`,
    foregroundColor: "rgb(31, 31, 36)",
    backgroundColor: "rgb(251, 247, 237)",
    labelColor: "rgb(122, 122, 130)",
    logoText: "PawLedger",
    storeCard: {
      headerFields: [
        { key: "since", label: "SINCE", value: sub.startedAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) },
      ],
      primaryFields: [
        { key: "animal", label: "SPONSORING", value: animal?.name ?? "—" },
      ],
      secondaryFields: [
        { key: "monthly", label: "MONTHLY", value: `${sub.currency === "INR" ? "₹" : "$"}${Number(sub.amountPaise) / 100}` },
        { key: "months", label: "MONTHS", value: sub.monthsActive.toString() },
      ],
      auxiliaryFields: [
        { key: "shelter", label: "AT", value: shelter?.name ?? "—" },
      ],
      backFields: [
        { key: "manage", label: "Manage", value: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org"}/dashboard/sponsorships/${sub.id}` },
        { key: "verify", label: "Public ledger", value: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org"}/transparency/animals/${animal?.slug ?? ""}` },
      ],
    },
    barcodes: [
      { format: "PKBarcodeFormatQR", message: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org"}/dashboard/sponsorships/${sub.id}`, messageEncoding: "iso-8859-1" },
    ],
  };

  // For real .pkpass: sign with WWDR + Apple cert + zip the directory.
  // For stub: return the JSON spec; founder wires passkit-generator + cert on launch.
  return NextResponse.json(passJson, {
    headers: {
      "Content-Type": "application/json",
      "X-Stub": "true",
      "X-Note": "Real .pkpass requires Apple Developer cert. See LAUNCH_CHECKLIST.md §3.",
    },
  });
}
