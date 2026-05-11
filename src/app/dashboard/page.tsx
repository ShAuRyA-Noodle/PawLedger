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

export const metadata = { title: "Your dashboard" };

export default async function DonorDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/dashboard");
  const userId = session.user.id;

  const [subs, donations, totalsRow] = await Promise.all([
    db.select({
      id: schema.sponsorships.id,
      status: schema.sponsorships.status,
      amountPaise: schema.sponsorships.amountPaise,
      currency: schema.sponsorships.currency,
      startedAt: schema.sponsorships.startedAt,
      monthsActive: schema.sponsorships.monthsActive,
      totalContributedPaise: schema.sponsorships.totalContributedPaise,
      cardLast4: schema.sponsorships.cardLast4,
      animalSlug: schema.animals.slug,
      animalName: schema.animals.name,
      animalPhotoUrl: schema.animals.heroPhotoUrl,
      shelterName: schema.shelters.name,
    }).from(schema.sponsorships)
      .leftJoin(schema.animals, eq(schema.sponsorships.animalId, schema.animals.id))
      .leftJoin(schema.shelters, eq(schema.sponsorships.shelterId, schema.shelters.id))
      .where(eq(schema.sponsorships.donorId, userId))
      .orderBy(desc(schema.sponsorships.startedAt)),
    db.select({
      id: schema.donations.id,
      amountPaise: schema.donations.amountPaise,
      currency: schema.donations.currency,
      kind: schema.donations.kind,
      status: schema.donations.status,
      capturedAt: schema.donations.capturedAt,
      animalName: schema.animals.name,
      animalSlug: schema.animals.slug,
    }).from(schema.donations)
      .leftJoin(schema.animals, eq(schema.donations.animalId, schema.animals.id))
      .where(eq(schema.donations.donorId, userId))
      .orderBy(desc(schema.donations.capturedAt))
      .limit(20),
    db.select({
      total: sql<string>`coalesce(sum(amount_paise), 0)::text`,
      count: sql<number>`count(*)::int`,
    }).from(schema.donations).where(and(eq(schema.donations.donorId, userId), eq(schema.donations.status, "succeeded"))),
  ]);

  const totalGiven = BigInt(totalsRow[0]?.total ?? "0");
  const activeSubs = subs.filter(s => s.status === "active");
  const monthlyMrr = activeSubs.reduce((acc, s) => acc + s.amountPaise, 0n);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <div>
          <p className="text-slate text-sm">Hi {session.user.name?.split(" ")[0] ?? "there"} 👋</p>
          <h1 className="font-display text-5xl tracking-tight mt-1">Your impact</h1>
        </div>
        <Button asChild variant="marigold" size="lg">
          <Link href="/animals">Sponsor another animal →</Link>
        </Button>
      </header>

      {/* Totals */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <Stat label="Active sponsorships" value={activeSubs.length} hint={`${subs.length - activeSubs.length} cancelled or paused`} />
        </Card>
        <Card className="p-6">
          <Stat label="Monthly commitment" value={formatMoney(monthlyMrr, "INR")} hint={`= ${formatMoney(monthlyMrr * 12n, "INR")} / year`} />
        </Card>
        <Card className="p-6">
          <Stat label="Total given" value={formatMoney(totalGiven, "INR")} hint={`across ${totalsRow[0]?.count ?? 0} donations`} />
        </Card>
      </div>

      {/* Active sponsorships */}
      <section className="mb-16">
        <h2 className="font-display text-2xl mb-6">Animals you sponsor</h2>
        {activeSubs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate mb-6">You don't have any active sponsorships yet. Pick an animal to start.</p>
            <Button asChild variant="marigold"><Link href="/animals">Browse animals →</Link></Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSubs.map(s => (
              <Card key={s.id} className="overflow-hidden">
                <Link href={`/animals/${s.animalSlug}`}>
                  <div className="aspect-[4/3] bg-line relative">
                    {s.animalPhotoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.animalPhotoUrl} alt={s.animalName ?? ""} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </div>
                </Link>
                <CardContent className="pt-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-display text-xl">{s.animalName}</h3>
                    <Badge variant="sage">Active</Badge>
                  </div>
                  <p className="text-xs text-muted mb-3">{s.shelterName}</p>
                  <div className="text-sm text-slate space-y-1 mb-4">
                    <p><span className="text-muted">Monthly: </span><span className="font-mono">{formatMoney(s.amountPaise, s.currency)}</span></p>
                    <p><span className="text-muted">Total given: </span><span className="font-mono">{formatMoney(s.totalContributedPaise, s.currency)}</span></p>
                    <p><span className="text-muted">Months: </span>{s.monthsActive}</p>
                    {s.cardLast4 && <p><span className="text-muted">Card: </span>•••• {s.cardLast4}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" size="sm" fullWidth>
                      <Link href={`/dashboard/sponsorships/${s.id}`}>Manage</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/transparency/animals/${s.animalSlug}`}>Ledger</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Donations history */}
      <section>
        <h2 className="font-display text-2xl mb-6">Donation history</h2>
        {donations.length === 0 ? (
          <Card className="p-8 text-slate text-center">No donations yet.</Card>
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted border-b border-line">
                <tr><th className="text-left p-4">Date</th><th className="text-left p-4">Animal</th><th className="text-left p-4">Kind</th><th className="text-right p-4">Amount</th><th className="text-right p-4">Receipt</th></tr>
              </thead>
              <tbody>
                {donations.map(d => (
                  <tr key={d.id} className="border-b border-line/50 last:border-0">
                    <td className="p-4 text-slate">{d.capturedAt?.toLocaleDateString("en-IN") ?? "—"}</td>
                    <td className="p-4">{d.animalSlug ? <Link href={`/animals/${d.animalSlug}`} className="hover:underline">{d.animalName}</Link> : "—"}</td>
                    <td className="p-4 text-muted">{d.kind}</td>
                    <td className="p-4 text-right font-mono">{formatMoney(d.amountPaise, d.currency)}</td>
                    <td className="p-4 text-right">
                      <Link href={`/api/receipts/${d.id}`} className="text-marigold-deep hover:underline">PDF</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
        <p className="mt-4 text-xs text-muted">Annual 80G consolidated receipt is generated each January and emailed to {session.user.email}.</p>
      </section>
    </div>
  );
}
