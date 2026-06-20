import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return { title: `Receipt ${number}` };
}

export default async function ReceiptVerifyPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  // Receipt numbers are derived from donation id prefix, e.g. PL-{first8 upper}
  const idHint = number.startsWith("PL-") ? number.slice(3).toLowerCase() : number;

  let donation, shelter, animal;
  try {
    const rows = await db.select({
      donation: schema.donations, shelter: schema.shelters, animal: schema.animals,
    }).from(schema.donations)
      .leftJoin(schema.shelters, eq(schema.donations.shelterId, schema.shelters.id))
      .leftJoin(schema.animals, eq(schema.donations.animalId, schema.animals.id))
      .where(eq(schema.donations.id, idHint))
      .limit(1);
    donation = rows[0]?.donation; shelter = rows[0]?.shelter; animal = rows[0]?.animal;
  } catch {}

  if (!donation) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Badge variant="coral" className="mb-3">Not found</Badge>
        <h1 className="font-display text-3xl mb-4">Receipt not found</h1>
        <p className="text-slate">No record matches receipt number <code className="bg-line/40 px-2 py-1 rounded font-mono">{number}</code>. Either the receipt was issued in error, or the donation hasn't captured yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Badge variant="sage" className="mb-3">✓ Verified · live record from PawLedger</Badge>
      <h1 className="font-display text-4xl tracking-tight mb-3">Receipt {number}</h1>
      <p className="text-slate mb-8">This donation appears in our public ledger. Anyone can independently verify the chain.</p>

      <Card className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted font-mono mb-1">Date</p>
            <p className="font-medium">{donation.capturedAt?.toLocaleDateString("en-IN", { dateStyle: "long" }) ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted font-mono mb-1">Amount</p>
            <p className="font-display text-2xl">{formatMoney(donation.amountPaise, donation.currency)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted font-mono mb-1">Donor</p>
            <p className="font-medium">{donation.donorName ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted font-mono mb-1">Method</p>
            <p className="capitalize">{donation.gateway}</p>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <p className="text-xs uppercase tracking-wider text-muted font-mono mb-2">For care of</p>
          {animal ? (
            <Link href={`/animals/${animal.slug}`} className="block">
              <p className="font-display text-2xl underline-offset-4 hover:underline">{animal.name}</p>
              <p className="text-sm text-slate">{shelter?.name}</p>
            </Link>
          ) : (
            <p>{shelter?.name ?? "General fund"}</p>
          )}
        </div>

        <div className="border-t border-line pt-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate">Direct to shelter</span><span className="font-mono">{formatMoney(donation.netToShelterPaise, donation.currency)}</span></div>
          <div className="flex justify-between"><span className="text-slate">Platform fee (4%)</span><span className="font-mono text-coral">{formatMoney(donation.platformFeePaise, donation.currency)}</span></div>
          <div className="flex justify-between"><span className="text-slate">Payment processing</span><span className="font-mono text-coral">{formatMoney(donation.paymentFeePaise, donation.currency)}</span></div>
        </div>

        <div className="border-t border-line pt-6 text-xs font-mono text-muted space-y-1">
          <p>donation_id: {donation.id}</p>
          <p>gateway_charge_id: {donation.gatewayChargeId ?? "—"}</p>
          <p>verified_at: {new Date().toISOString()}</p>
        </div>
      </Card>

      <p className="mt-6 text-sm text-slate">The official PDF receipt (with donor and tax details) is private. Sign in to your <Link href="/dashboard" className="text-marigold-deep hover:underline">donor dashboard</Link> to download it.</p>
    </div>
  );
}
