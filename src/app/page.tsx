import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Progress } from "@/components/ui/progress";
import { db, schema } from "@/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { formatMoney } from "@/lib/money";
import { LiveTicker } from "@/components/live-ticker";

async function getFeaturedAnimals() {
  try {
    return await db
      .select({
        id: schema.animals.id,
        slug: schema.animals.slug,
        name: schema.animals.name,
        species: schema.animals.species,
        rescueStory: schema.animals.rescueStory,
        heroPhotoUrl: schema.animals.heroPhotoUrl,
        city: schema.animals.city,
        sponsorCount: schema.animals.sponsorCount,
        monthlyCostPaise: schema.animals.monthlyCostPaise,
        goalFundedPaise: schema.animals.goalFundedPaise,
        isUrgent: schema.animals.isUrgent,
        shelterName: schema.shelters.name,
      })
      .from(schema.animals)
      .leftJoin(schema.shelters, eq(schema.animals.shelterId, schema.shelters.id))
      .where(and(eq(schema.animals.isPublished, true), eq(schema.animals.status, "active")))
      .orderBy(desc(schema.animals.publishedAt))
      .limit(6);
  } catch {
    return [];
  }
}

async function getPlatformStats() {
  try {
    const [animals, shelters, donations] = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(schema.animals).where(eq(schema.animals.isPublished, true)),
      db.select({ c: sql<number>`count(*)::int` }).from(schema.shelters).where(eq(schema.shelters.isPublished, true)),
      db.select({ c: sql<number>`count(*)::int`, sum: sql<string>`coalesce(sum(amount_paise), 0)::text` }).from(schema.donations).where(eq(schema.donations.status, "succeeded")),
    ]);
    return {
      animals: animals[0]?.c ?? 0,
      shelters: shelters[0]?.c ?? 0,
      totalRaisedPaise: BigInt(donations[0]?.sum ?? "0"),
      donationCount: donations[0]?.c ?? 0,
    };
  } catch {
    return { animals: 0, shelters: 0, totalRaisedPaise: 0n, donationCount: 0 };
  }
}

export default async function HomePage() {
  const [animals, stats] = await Promise.all([getFeaturedAnimals(), getPlatformStats()]);
  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <Badge variant="marigold" className="mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-marigold-deep animate-pulse" />
                Live ledger · India's first
              </Badge>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-ink">
                Sponsor a life.<br />
                See <em className="not-italic text-marigold-deep">every rupee</em>.
              </h1>
              <p className="mt-6 text-lg text-slate leading-relaxed max-w-xl">
                Pick a rescued animal. Sponsor their care for ₹300/month. Get weekly photo updates from the shelter, and watch every rupee land on a public, tamper-evident ledger.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="xl" variant="marigold">
                  <Link href="/animals">Find an animal to sponsor</Link>
                </Button>
                <Button asChild size="xl" variant="ghost">
                  <Link href="/transparency">See the public ledger →</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  Tax-deductible (80G)
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  AWBI partner shelters only
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sage" />
                  Cancel anytime, no pressure
                </span>
              </div>
            </div>

            {/* Hero card — featured animal preview */}
            <div className="lg:col-span-5">
              <Card className="overflow-hidden">
                <div className="aspect-square w-full bg-gradient-to-br from-marigold/30 via-cream to-sage/20 relative overflow-hidden">
                  {animals[0]?.heroPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={animals[0].heroPhotoUrl} alt={`${animals[0].name}, a rescued ${animals[0].species}`} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-7xl">🐶</div>
                  )}
                  {animals[0]?.isUrgent && (
                    <Badge variant="coral" className="absolute top-4 left-4">URGENT</Badge>
                  )}
                </div>
                <CardContent className="pt-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display text-2xl">{animals[0]?.name ?? "Bruno"}</h3>
                    <span className="text-xs text-muted font-mono">{animals[0]?.city ?? "Bengaluru"}</span>
                  </div>
                  <p className="text-sm text-slate leading-relaxed mb-5">
                    {animals[0]?.rescueStory ? animals[0].rescueStory.slice(0, 140) + "…" : "Rescued from a busy junction in May. Recovering from a hind-leg fracture. Looking for sponsors to fund vet visits + food for the next 3 months."}
                  </p>
                  <Progress value={animals[0] ? Math.min(100, Number(animals[0].goalFundedPaise) / Number(animals[0].monthlyCostPaise || 1n) * 100) : 62} className="mb-3" />
                  <div className="flex justify-between text-xs text-muted mb-5">
                    <span>{animals[0]?.sponsorCount ?? 14} sponsors so far</span>
                    <span>{animals[0]?.monthlyCostPaise ? `${formatMoney(animals[0].monthlyCostPaise, "INR")} / mo goal` : "₹4,500 / mo goal"}</span>
                  </div>
                  <Button asChild fullWidth variant="primary">
                    <Link href={animals[0] ? `/animals/${animals[0].slug}` : "/animals"}>
                      Sponsor {animals[0]?.name ?? "Bruno"} →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TICKER — real ledger entries via SSE */}
      <section className="border-y border-line bg-card">
        <LiveTicker />
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat label="Animals in care" value={stats.animals.toLocaleString("en-IN")} emphasis />
          <Stat label="Verified shelters" value={stats.shelters.toLocaleString("en-IN")} emphasis />
          <Stat label="Total raised" value={formatMoney(stats.totalRaisedPaise, "INR", { compact: true })} emphasis hint="100% routed to shelters" />
          <Stat label="Ledger entries" value={stats.donationCount.toLocaleString("en-IN")} emphasis hint="Public + tamper-evident" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <div className="max-w-2xl mb-16">
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
              Three steps. <em className="not-italic text-slate">No fine print.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Pick an animal", body: "Browse rescued dogs, cats, cows. Each profile has photos, vet records, and a real story written by their caregiver." },
              { n: "02", title: "Sponsor monthly", body: "Pick a tier from ₹100–₹2,500. UPI, card, or net banking. Pause or cancel anytime in two clicks." },
              { n: "03", title: "Watch every rupee", body: "Weekly photo updates from the shelter. Every donation appears on a public ledger with line-item proof." },
            ].map(s => (
              <Card key={s.n} className="p-8">
                <span className="font-mono text-xs text-muted">{s.n}</span>
                <h3 className="font-display text-2xl mt-3 mb-3">{s.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{s.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ANIMALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Badge variant="outline" className="mb-4">Animals seeking sponsors</Badge>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight">Pick someone to back this month.</h2>
          </div>
          <Link href="/animals" className="text-sm text-slate hover:text-ink hidden sm:block">View all →</Link>
        </div>
        {animals.length === 0 ? (
          <Card className="p-12 text-center text-slate">
            Animals will appear here once shelters publish profiles. <Link href="/for-shelters" className="text-marigold-deep underline">Are you a shelter?</Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.slice(0, 6).map(a => (
              <Link key={a.id} href={`/animals/${a.slug}`} className="group">
                <Card className="overflow-hidden h-full hover:shadow-floating transition-shadow">
                  <div className="aspect-[4/3] bg-line relative overflow-hidden">
                    {a.heroPhotoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.heroPhotoUrl} alt={a.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    {a.isUrgent && <Badge variant="coral" className="absolute top-3 left-3">Urgent</Badge>}
                  </div>
                  <CardContent className="pt-5">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-display text-xl">{a.name}</h3>
                      <span className="text-xs text-muted font-mono">{a.city}</span>
                    </div>
                    <p className="text-sm text-slate line-clamp-2 mb-4 leading-relaxed">
                      {a.rescueStory ?? "Rescued and recovering. Needs monthly sponsors."}
                    </p>
                    <div className="text-xs text-muted">
                      {a.sponsorCount} sponsors · {a.shelterName}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TRUST */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <Badge variant="marigold" className="mb-6">Why we exist</Badge>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight">
                Donor trust is dead.<br />We're rebuilding it on a ledger.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-8 text-cream/80 leading-relaxed">
              <p>
                In 2024 alone, researchers documented 1,022 fake animal-rescue accounts on Instagram alone — generating 572 million views. Real shelters lost donors to scammers. Big charities lost donors to scandal: ASPCA spending exposés, HSUS's $15.75M RICO settlement.
              </p>
              <p>
                Most charities ask you to trust them. We don't. Every rupee that lands on PawLedger is logged, line-item by line-item, with vendor names, photo proof, and a SHA-256 hash chained to the previous entry. <Link href="/transparency" className="text-marigold underline underline-offset-4">Anyone can verify the chain</Link>.
              </p>
              <p>
                We work only with shelters that hold valid 80G certificates and AWBI recognition. We verify before listing — and re-verify quarterly. If something goes wrong, file a complaint and watch it resolve in public.
              </p>
              <Button asChild variant="marigold" size="lg">
                <Link href="/transparency">Read the ledger →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl text-center px-4 sm:px-6 py-32">
        <h2 className="font-display text-5xl sm:text-6xl tracking-tight">
          One animal.<br />Every month.<br /><em className="not-italic text-marigold-deep">Real proof.</em>
        </h2>
        <p className="mt-8 text-lg text-slate max-w-xl mx-auto">
          Sponsorship starts at ₹100/month. Cancel in two clicks. We keep 4% to keep the lights on. The rest goes to the animal — and you'll see exactly where.
        </p>
        <div className="mt-12">
          <Button asChild size="xl" variant="marigold">
            <Link href="/animals">Find your sponsor →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
