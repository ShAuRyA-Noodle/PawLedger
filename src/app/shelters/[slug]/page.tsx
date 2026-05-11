import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await db.select({ name: schema.shelters.name, about: schema.shelters.about }).from(schema.shelters).where(eq(schema.shelters.slug, slug)).limit(1);
    if (!rows[0]) return { title: "Shelter" };
    return { title: rows[0].name, description: rows[0].about ?? undefined };
  } catch { return { title: "Shelter" }; }
}

export default async function ShelterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let shelter, animals, stats;
  try {
    const rows = await db.select().from(schema.shelters).where(and(eq(schema.shelters.slug, slug), eq(schema.shelters.isPublished, true))).limit(1);
    shelter = rows[0];
    if (!shelter) notFound();
    animals = await db.select({
      id: schema.animals.id, slug: schema.animals.slug, name: schema.animals.name, species: schema.animals.species,
      heroPhotoUrl: schema.animals.heroPhotoUrl, sponsorCount: schema.animals.sponsorCount, isUrgent: schema.animals.isUrgent,
      monthlyCostPaise: schema.animals.monthlyCostPaise, goalFundedPaise: schema.animals.goalFundedPaise,
    }).from(schema.animals).where(and(eq(schema.animals.shelterId, shelter.id), eq(schema.animals.isPublished, true))).orderBy(desc(schema.animals.publishedAt));
    const t = await db.select({
      mrr: sql<string>`coalesce(sum(amount_paise) filter (where status = 'active'), 0)::text`,
      activeSponsors: sql<number>`count(*) filter (where status = 'active')::int`,
    }).from(schema.sponsorships).where(eq(schema.sponsorships.shelterId, shelter.id));
    stats = t[0];
  } catch {
    return <div className="mx-auto max-w-2xl p-16 text-center text-slate">Database not connected.</div>;
  }

  const mrr = BigInt(stats?.mrr ?? "0");

  return (
    <div>
      <section className="bg-card border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Badge variant="verified" className="mb-3">Verified shelter · trust score {shelter.trustScore}/100</Badge>
          <h1 className="font-display text-5xl sm:text-6xl tracking-tight">{shelter.name}</h1>
          <p className="text-slate mt-2 text-lg">{shelter.city}, {shelter.state} · founded {shelter.founded}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {shelter.registration12a && <Badge variant="outline">12A · {shelter.registration12a}</Badge>}
            {shelter.registration80g && <Badge variant="outline">80G · valid until {shelter.registration80gExpiresAt?.toLocaleDateString("en-IN")}</Badge>}
            {shelter.awbiRecognition && <Badge variant="outline">AWBI · {shelter.awbiRecognition}</Badge>}
            {shelter.csr1 && <Badge variant="outline">CSR-1 · {shelter.csr1}</Badge>}
            <Badge variant="outline">PAN · {shelter.pan}</Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="prose prose-lg text-slate max-w-none">
              <p className="leading-relaxed">{shelter.about}</p>
            </div>

            <div>
              <h2 className="font-display text-3xl mb-6">Animals available for sponsorship</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {animals.map(a => (
                  <Link key={a.id} href={`/animals/${a.slug}`}>
                    <Card className="overflow-hidden hover:shadow-floating transition-shadow">
                      <div className="flex">
                        <div className="h-28 w-28 bg-line flex-shrink-0 relative">
                          {a.heroPhotoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.heroPhotoUrl} alt={a.name} className="absolute inset-0 h-full w-full object-cover" />
                          )}
                          {a.isUrgent && <Badge variant="coral" className="absolute top-1 left-1 text-[10px]">Urgent</Badge>}
                        </div>
                        <div className="p-4 flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <h3 className="font-display text-lg">{a.name}</h3>
                            <span className="text-xs text-muted">{a.species}</span>
                          </div>
                          <p className="text-xs text-slate mt-1">{a.sponsorCount} sponsors</p>
                          <p className="text-xs text-muted mt-1">{formatMoney(a.monthlyCostPaise, "INR")}/mo goal</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <Card className="p-6">
              <h3 className="font-display text-xl mb-4">By the numbers</h3>
              <div className="space-y-4">
                <Stat label="Animals in care" value={shelter.animalsInCare} />
                <Stat label="Active sponsors" value={stats?.activeSponsors ?? 0} />
                <Stat label="Monthly recurring" value={formatMoney(mrr, "INR")} />
                <Stat label="Total raised" value={formatMoney(shelter.totalRaised, "INR", { compact: true })} hint="Lifetime via PawLedger" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg mb-3">Trust + transparency</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-slate">Public ledger</span><Link href={`/api/ledger/verify/${shelter.id}`} className="text-marigold-deep hover:underline">verify chain →</Link></li>
                <li className="flex justify-between"><span className="text-slate">Last KYC</span><span className="text-ink">{shelter.kycVerifiedAt?.toLocaleDateString("en-IN") ?? "—"}</span></li>
                <li className="flex justify-between"><span className="text-slate">Trust score</span><span className="font-mono">{shelter.trustScore}/100</span></li>
              </ul>
              <Link href={`/complaints/new?shelter=${shelter.slug}`} className="text-xs text-slate underline hover:text-ink mt-4 inline-block">Concern? File a complaint</Link>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-lg mb-2">Contact</h3>
              <p className="text-sm text-slate">{shelter.email}<br/>{shelter.phone}</p>
              {shelter.websiteUrl && <a href={shelter.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-marigold-deep hover:underline">{shelter.websiteUrl} →</a>}
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
