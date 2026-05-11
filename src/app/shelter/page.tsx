import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Shelter dashboard" };

export default async function ShelterDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/shelter");

  // Find shelter membership
  const memberships = await db.select({
    shelter: schema.shelters,
    role: schema.shelterMembers.role,
  }).from(schema.shelterMembers)
    .leftJoin(schema.shelters, eq(schema.shelterMembers.shelterId, schema.shelters.id))
    .where(eq(schema.shelterMembers.userId, session.user.id))
    .limit(1);

  if (!memberships[0]?.shelter) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl tracking-tight mb-4">No shelter linked to this account</h1>
        <p className="text-slate mb-8">If you applied as a shelter, our team will email an invitation once your application is approved.</p>
        <Button asChild variant="marigold"><Link href="/for-shelters/apply">Apply to join →</Link></Button>
      </div>
    );
  }

  const shelter = memberships[0].shelter;
  const [animals, recentDonations, totals, pendingPayout] = await Promise.all([
    db.select().from(schema.animals).where(eq(schema.animals.shelterId, shelter.id)).orderBy(desc(schema.animals.createdAt)).limit(20),
    db.select().from(schema.donations).where(and(eq(schema.donations.shelterId, shelter.id), eq(schema.donations.status, "succeeded"))).orderBy(desc(schema.donations.capturedAt)).limit(10),
    db.select({
      mrr: sql<string>`coalesce(sum(amount_paise) filter (where status = 'active'), 0)::text`,
      count: sql<number>`count(*) filter (where status = 'active')::int`,
    }).from(schema.sponsorships).where(eq(schema.sponsorships.shelterId, shelter.id)),
    db.select({ total: sql<string>`coalesce(sum(amount_paise) filter (where status = 'queued'), 0)::text` }).from(schema.payouts).where(eq(schema.payouts.shelterId, shelter.id)),
  ]);

  const mrr = BigInt(totals[0]?.mrr ?? "0");
  const queuedPayout = BigInt(pendingPayout[0]?.total ?? "0");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="flex justify-between items-start mb-12">
        <div>
          <p className="text-slate text-sm">Welcome back to</p>
          <h1 className="font-display text-4xl tracking-tight mt-1">{shelter.name}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant={shelter.kycStatus === "verified" ? "verified" : "outline"}>
              KYC: {shelter.kycStatus}
            </Badge>
            {shelter.isPublished ? <Badge variant="sage">Published</Badge> : <Badge variant="default">Draft</Badge>}
            {shelter.registration80g && <Badge variant="outline">80G ✓</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link href="/shelter/animals/new">+ Add animal</Link></Button>
          <Button asChild variant="marigold"><Link href="/shelter/updates/new">Post update</Link></Button>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6"><Stat label="Active sponsors" value={totals[0]?.count ?? 0} /></Card>
        <Card className="p-6"><Stat label="MRR" value={formatMoney(mrr, "INR")} hint="recurring monthly" /></Card>
        <Card className="p-6"><Stat label="Animals listed" value={animals.length} hint={`${animals.filter(a => a.isPublished).length} published`} /></Card>
        <Card className="p-6"><Stat label="Payout queue" value={formatMoney(queuedPayout, "INR")} hint="next: T+1" /></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-2xl">Your animals</h2>
            <Link href="/shelter/animals" className="text-sm text-slate hover:text-ink">View all →</Link>
          </div>
          {animals.length === 0 ? (
            <p className="text-slate text-sm">No animals yet. <Link href="/shelter/animals/new" className="text-marigold-deep underline">Add your first one</Link>.</p>
          ) : (
            <div className="space-y-3">
              {animals.slice(0, 8).map(a => (
                <Link key={a.id} href={`/shelter/animals/${a.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-line/30 transition-colors">
                  <div className="h-12 w-12 rounded-md bg-line overflow-hidden flex-shrink-0">
                    {a.heroPhotoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.heroPhotoUrl} alt={a.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted">{a.species} · {a.sponsorCount} sponsors</p>
                  </div>
                  <Badge variant={a.isPublished ? "sage" : "default"}>{a.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-2xl mb-4">Recent donations</h2>
          {recentDonations.length === 0 ? (
            <p className="text-slate text-sm">Donations appear here once a sponsor signs up.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {recentDonations.map(d => (
                <li key={d.id} className="flex justify-between items-baseline">
                  <span className="text-slate truncate">{d.donorName?.split(" ")[0] ?? "Anonymous"} · {d.kind}</span>
                  <span className="font-mono text-ink">{formatMoney(d.amountPaise, d.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Compliance reminders */}
      {shelter.registration80gExpiresAt && new Date(shelter.registration80gExpiresAt).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 90 && (
        <Card className="mt-8 p-6 bg-coral/10 border-coral/30">
          <p className="text-sm font-medium mb-2">Heads up: 80G expires soon</p>
          <p className="text-sm text-slate">Your 80G certificate expires on {new Date(shelter.registration80gExpiresAt).toLocaleDateString("en-IN")}. Renew via Form 10AB to keep tax-deductibility for your donors. <Link href="/shelter/compliance" className="underline">Manage compliance →</Link></p>
        </Card>
      )}
    </div>
  );
}
