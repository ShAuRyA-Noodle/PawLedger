import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { formatMoney } from "@/lib/money";
import { ShelterModerationActions } from "@/components/shelter-moderation-actions";

export default async function ShelterReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(schema.shelters).where(eq(schema.shelters.id, id)).limit(1);
  const shelter = rows[0];
  if (!shelter) notFound();

  const animals = await db.select().from(schema.animals).where(eq(schema.animals.shelterId, id)).limit(20);
  const recentDonations = await db.select().from(schema.donations).where(eq(schema.donations.shelterId, id)).orderBy(desc(schema.donations.capturedAt)).limit(10);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link href="/admin/shelters" className="text-sm text-slate hover:text-ink">← All shelters</Link>
      <header className="mt-6 mb-10 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <Badge variant={shelter.kycStatus === "verified" ? "verified" : shelter.kycStatus === "rejected" ? "coral" : "outline"} className="mb-3">KYC: {shelter.kycStatus}</Badge>
          <h1 className="font-display text-4xl tracking-tight">{shelter.name}</h1>
          <p className="text-slate mt-1">{shelter.legalName} · {shelter.city}, {shelter.state}</p>
        </div>
        <div className="flex gap-2">
          {shelter.isPublished && <Link href={`/shelters/${shelter.slug}`} className="text-sm text-slate hover:text-ink">Public page →</Link>}
        </div>
      </header>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <Card className="p-5"><Stat label="Total raised" value={formatMoney(shelter.totalRaised, "INR", { compact: true })} /></Card>
        <Card className="p-5"><Stat label="Animals" value={animals.length} hint={`${animals.filter(a => a.isPublished).length} published`} /></Card>
        <Card className="p-5"><Stat label="Trust score" value={`${shelter.trustScore}/100`} /></Card>
        <Card className="p-5"><Stat label="Founded" value={shelter.founded ?? "—"} /></Card>
      </div>

      <ShelterModerationActions shelterId={shelter.id} currentStatus={shelter.kycStatus} isPublished={shelter.isPublished} isVerified={shelter.isVerifiedShelter} />

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        <Card className="p-6">
          <h2 className="font-display text-xl mb-4">Compliance</h2>
          <dl className="space-y-2 text-sm">
            <Row label="PAN" value={shelter.pan} />
            <Row label="GSTIN" value={shelter.gstin} />
            <Row label="CIN" value={shelter.cin} />
            <Row label="12A" value={shelter.registration12a} />
            <Row label="80G" value={shelter.registration80g} />
            <Row label="80G expires" value={shelter.registration80gExpiresAt?.toLocaleDateString("en-IN")} />
            <Row label="AWBI" value={shelter.awbiRecognition} />
            <Row label="CSR-1" value={shelter.csr1} />
            <Row label="FCRA" value={shelter.fcraStatus} />
            <Row label="Razorpay LinkedAccount" value={shelter.razorpayLinkedAccountId} />
            <Row label="Stripe Connect" value={shelter.stripeConnectAccountId} />
            <Row label="Cashfree beneficiary" value={shelter.cashfreeBeneficiaryId} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl mb-4">Recent donations</h2>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-slate">No donations yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentDonations.map(d => (
                <li key={d.id} className="flex justify-between">
                  <span className="text-slate truncate">{d.donorName ?? "Anonymous"} · {d.kind}</span>
                  <span className="font-mono">{formatMoney(d.amountPaise, d.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h2 className="font-display text-xl mb-4">Animals listed ({animals.length})</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {animals.map(a => (
            <Link key={a.id} href={`/animals/${a.slug}`} className="flex gap-3 p-3 rounded-lg hover:bg-line/30">
              <div className="h-12 w-12 bg-line rounded-md overflow-hidden flex-shrink-0">
                {a.heroPhotoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.heroPhotoUrl} alt={a.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.name}</p>
                <p className="text-xs text-muted">{a.species} · {a.status}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-line/30 last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink font-mono text-xs text-right truncate">{value ?? "—"}</dd>
    </div>
  );
}
