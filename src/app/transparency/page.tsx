import Link from "next/link";
import { db, schema } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Public transparency ledger" };

async function getData() {
  try {
    const [stats, recent] = await Promise.all([
      db.select({
        totalRaised: sql<string>`coalesce(sum(amount_paise) filter (where status = 'succeeded'), 0)::text`,
        donationCount: sql<number>`count(*) filter (where status = 'succeeded')::int`,
        platformFees: sql<string>`coalesce(sum(platform_fee_paise) filter (where status = 'succeeded'), 0)::text`,
        paymentFees: sql<string>`coalesce(sum(payment_fee_paise) filter (where status = 'succeeded'), 0)::text`,
        netToShelters: sql<string>`coalesce(sum(net_to_shelter_paise) filter (where status = 'succeeded'), 0)::text`,
      }).from(schema.donations),
      db.select({
        id: schema.ledgerEntries.id,
        kind: schema.ledgerEntries.kind,
        category: schema.ledgerEntries.category,
        description: schema.ledgerEntries.description,
        vendor: schema.ledgerEntries.vendor,
        amountPaise: schema.ledgerEntries.amountPaise,
        currency: schema.ledgerEntries.currency,
        proofUrl: schema.ledgerEntries.proofUrl,
        occurredAt: schema.ledgerEntries.occurredAt,
        hash: schema.ledgerEntries.hash,
        blockHeight: schema.ledgerEntries.blockHeight,
        animalSlug: schema.animals.slug,
        animalName: schema.animals.name,
        shelterName: schema.shelters.name,
      }).from(schema.ledgerEntries)
        .leftJoin(schema.animals, eq(schema.ledgerEntries.animalId, schema.animals.id))
        .leftJoin(schema.shelters, eq(schema.ledgerEntries.shelterId, schema.shelters.id))
        .orderBy(desc(schema.ledgerEntries.occurredAt))
        .limit(50),
    ]);
    return { stats: stats[0], recent };
  } catch {
    return { stats: null, recent: [] };
  }
}

export default async function TransparencyPage() {
  const { stats, recent } = await getData();
  const totalRaised = BigInt(stats?.totalRaised ?? "0");
  const platformFees = BigInt(stats?.platformFees ?? "0");
  const paymentFees = BigInt(stats?.paymentFees ?? "0");
  const netToShelters = BigInt(stats?.netToShelters ?? "0");

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <Badge variant="marigold" className="mb-4">Public ledger</Badge>
        <h1 className="font-display text-5xl sm:text-6xl tracking-tight max-w-3xl leading-[1.05]">
          Every rupee.<br/>Hash-chained. <em className="not-italic text-marigold-deep">Anyone can verify.</em>
        </h1>
        <p className="mt-6 text-lg text-slate max-w-2xl leading-relaxed">
          PawLedger uses an append-only public ledger with SHA-256 hash chaining per shelter. Each entry references the previous one. If anyone tampers with a past entry, the chain breaks visibly. <Link href="#how-it-works" className="text-marigold-deep underline">Read how it works ↓</Link>
        </p>
      </section>

      {/* Money flow */}
      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-3xl tracking-tight mb-10">Where every rupee goes</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            <Stat label="Total raised" value={formatMoney(totalRaised, "INR", { compact: true })} emphasis hint={`${stats?.donationCount ?? 0} donations`} />
            <Stat label="Net to shelters" value={formatMoney(netToShelters, "INR", { compact: true })} emphasis hint={totalRaised > 0n ? `${(Number(netToShelters * 100n / (totalRaised || 1n)))}%` : "—"} />
            <Stat label="Payment fees" value={formatMoney(paymentFees, "INR", { compact: true })} emphasis hint="At cost — Razorpay/Stripe" />
            <Stat label="Platform fee" value={formatMoney(platformFees, "INR", { compact: true })} emphasis hint="4% — keeps the lights on" />
          </div>
        </div>
      </section>

      {/* Live ledger */}
      <section id="ledger" className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-3xl tracking-tight">Recent ledger entries</h2>
          <Link href="/api/ledger/export.csv" className="text-sm text-marigold-deep hover:underline">Download CSV ↓</Link>
        </div>
        {recent.length === 0 ? (
          <Card className="p-12 text-center text-slate">No entries yet. Once donations + expenses happen, they appear here in real time.</Card>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted border-b border-line">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Kind</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Animal</th>
                  <th className="text-left p-4">Shelter</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-left p-4">Proof</th>
                  <th className="text-left p-4">Hash</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(e => {
                  const isOut = e.kind === "expense_out" || e.kind === "fee" || e.kind === "transfer";
                  return (
                    <tr key={e.id} className="border-b border-line/50 last:border-0 hover:bg-line/20">
                      <td className="p-4 text-slate font-mono text-xs">{e.occurredAt.toISOString().slice(0, 10)}</td>
                      <td className="p-4">
                        <Badge variant={isOut ? "coral" : "sage"}>{e.kind.replace("_", " ")}</Badge>
                      </td>
                      <td className="p-4 text-ink max-w-xs truncate">{e.description} {e.vendor && <span className="text-muted">· {e.vendor}</span>}</td>
                      <td className="p-4">
                        {e.animalSlug ? <Link href={`/animals/${e.animalSlug}`} className="hover:underline">{e.animalName}</Link> : "—"}
                      </td>
                      <td className="p-4 text-slate">{e.shelterName ?? "—"}</td>
                      <td className={`p-4 text-right font-mono ${isOut ? "text-coral" : "text-sage"}`}>
                        {isOut ? "−" : "+"}{formatMoney(e.amountPaise > 0n ? e.amountPaise : -e.amountPaise, e.currency)}
                      </td>
                      <td className="p-4">{e.proofUrl ? <a href={e.proofUrl} className="text-marigold-deep hover:underline" target="_blank" rel="noopener">view</a> : "—"}</td>
                      <td className="p-4 font-mono text-[10px] text-muted">#{e.blockHeight} {e.hash.slice(0, 8)}…</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <Badge variant="marigold" className="mb-4">How the chain works</Badge>
          <h2 className="font-display text-4xl tracking-tight mb-8">Tamper-evident, in three lines.</h2>
          <div className="grid md:grid-cols-3 gap-8 text-cream/80">
            <div>
              <span className="font-mono text-marigold">01.</span>
              <h3 className="font-display text-xl mt-2 mb-2">Each entry is hashed</h3>
              <p className="text-sm leading-relaxed">Every donation in or expense out gets a SHA-256 hash of its full contents.</p>
            </div>
            <div>
              <span className="font-mono text-marigold">02.</span>
              <h3 className="font-display text-xl mt-2 mb-2">Chained to the previous</h3>
              <p className="text-sm leading-relaxed">The hash includes the previous entry's hash. Editing any past entry breaks every entry after it.</p>
            </div>
            <div>
              <span className="font-mono text-marigold">03.</span>
              <h3 className="font-display text-xl mt-2 mb-2">Anyone can verify</h3>
              <p className="text-sm leading-relaxed">Fetch <code className="bg-charcoal px-1 rounded">/api/ledger/verify/[shelter]</code> — replays the chain and reports the head hash. Independent verifiers can cache the head weekly.</p>
            </div>
          </div>
          <Button asChild variant="marigold" size="lg" className="mt-10"><Link href="/api/ledger/verify/all">Verify the chain →</Link></Button>
        </div>
      </section>
    </div>
  );
}
