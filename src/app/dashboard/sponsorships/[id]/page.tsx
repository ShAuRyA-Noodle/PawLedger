import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat } from "@/components/ui/stat";
import { formatMoney } from "@/lib/money";
import { ManageSponsorshipActions } from "@/components/manage-sponsorship-actions";

export const metadata = { title: "Manage sponsorship" };

export default async function ManageSponsorshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/sign-in?next=/dashboard/sponsorships/${id}`);

  const rows = await db.select({
    sub: schema.sponsorships,
    animal: schema.animals,
    shelter: schema.shelters,
  }).from(schema.sponsorships)
    .leftJoin(schema.animals, eq(schema.sponsorships.animalId, schema.animals.id))
    .leftJoin(schema.shelters, eq(schema.sponsorships.shelterId, schema.shelters.id))
    .where(and(eq(schema.sponsorships.id, id), eq(schema.sponsorships.donorId, session.user.id)))
    .limit(1);

  if (!rows[0]) notFound();
  const { sub, animal, shelter } = rows[0];

  const recentDonations = await db.select().from(schema.donations).where(eq(schema.donations.sponsorshipId, id)).orderBy(desc(schema.donations.capturedAt)).limit(20);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Link href="/dashboard" className="text-sm text-slate hover:text-ink">← Dashboard</Link>

      <header className="mt-6 mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Badge variant={sub.status === "active" ? "sage" : sub.status === "paused" ? "outline" : "coral"} className="mb-3">{sub.status}</Badge>
          <h1 className="font-display text-4xl tracking-tight">Sponsoring {animal?.name}</h1>
          <p className="text-slate mt-1">at {shelter?.name} · since {sub.startedAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
        {animal && (
          <Button asChild variant="secondary"><Link href={`/animals/${animal.slug}`}>Visit {animal.name}'s page →</Link></Button>
        )}
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Card className="p-5"><Stat label="Monthly" value={formatMoney(sub.amountPaise, sub.currency)} /></Card>
        <Card className="p-5"><Stat label="Total given" value={formatMoney(sub.totalContributedPaise, sub.currency)} hint={`${sub.monthsActive} months`} /></Card>
        <Card className="p-5"><Stat label="Card" value={sub.cardLast4 ? `•••• ${sub.cardLast4}` : "UPI"} hint={sub.cardExpiresAt ? `expires ${sub.cardExpiresAt.toLocaleDateString("en-IN")}` : ""} /></Card>
      </div>

      <ManageSponsorshipActions
        sponsorshipId={sub.id}
        currentStatus={sub.status as "active" | "paused" | "cancelled" | "past_due" | "incomplete"}
        currentAmountPaise={sub.amountPaise.toString()}
        currency={sub.currency}
      />

      <Card className="mt-10 p-6">
        <h2 className="font-display text-xl mb-4">Donation history for this sponsorship</h2>
        {recentDonations.length === 0 ? (
          <p className="text-sm text-slate">First charge will appear here on the next billing cycle.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="text-left p-2">Date</th><th className="text-right p-2">Amount</th><th className="text-right p-2">Receipt</th></tr>
            </thead>
            <tbody>
              {recentDonations.map(d => (
                <tr key={d.id} className="border-t border-line/40">
                  <td className="p-2 text-slate">{d.capturedAt?.toLocaleDateString("en-IN") ?? "—"}</td>
                  <td className="p-2 text-right font-mono">{formatMoney(d.amountPaise, d.currency)}</td>
                  <td className="p-2 text-right"><Link href={`/api/receipts/${d.id}`} className="text-marigold-deep hover:underline">PDF</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
