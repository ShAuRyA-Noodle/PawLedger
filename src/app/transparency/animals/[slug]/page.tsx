import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { verifyLedgerChain } from "@/lib/ledger";

export const metadata = { title: "Animal ledger" };

export default async function AnimalLedgerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let animal, shelter, entries, totals, chain;
  try {
    const rows = await db.select().from(schema.animals).where(eq(schema.animals.slug, slug)).limit(1);
    animal = rows[0];
    if (!animal) notFound();
    const shelterRows = await db.select().from(schema.shelters).where(eq(schema.shelters.id, animal.shelterId)).limit(1);
    shelter = shelterRows[0];
    entries = await db.select().from(schema.ledgerEntries).where(eq(schema.ledgerEntries.animalId, animal.id)).orderBy(desc(schema.ledgerEntries.occurredAt)).limit(200);
    const t = await db.select({
      donationsIn: sql<string>`coalesce(sum(amount_paise) filter (where kind = 'donation_in'), 0)::text`,
      expensesOut: sql<string>`coalesce(sum(amount_paise) filter (where kind = 'expense_out'), 0)::text`,
      fees: sql<string>`coalesce(sum(amount_paise) filter (where kind = 'fee'), 0)::text`,
    }).from(schema.ledgerEntries).where(eq(schema.ledgerEntries.animalId, animal.id));
    totals = t[0];
    chain = await verifyLedgerChain(animal.shelterId);
  } catch {
    return <div className="mx-auto max-w-2xl p-16 text-center text-slate">Database not connected.</div>;
  }

  const donationsIn = BigInt(totals?.donationsIn ?? "0");
  const expensesOut = BigInt(totals?.expensesOut ?? "0");
  const fees = BigInt(totals?.fees ?? "0");
  const balance = donationsIn + expensesOut + fees; // expenses + fees are negative

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <Link href={`/animals/${slug}`} className="text-sm text-slate hover:text-ink">← Back to {animal.name}</Link>

      <header className="mt-6 mb-12 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <Badge variant="marigold" className="mb-3">Public ledger · animal-level</Badge>
          <h1 className="font-display text-5xl tracking-tight">{animal.name}'s ledger</h1>
          <p className="text-slate mt-2">Cared for at <Link href={`/shelters/${shelter?.slug}`} className="underline">{shelter?.name}</Link>. Every line below is hash-chained to the previous.</p>
        </div>
        <Card className={`p-4 text-sm ${chain.valid ? "border-sage/40 bg-sage/5" : "border-coral/40 bg-coral/5"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full ${chain.valid ? "bg-sage" : "bg-coral"}`} />
            <span className="font-medium">{chain.valid ? "Chain intact" : "Chain broken"}</span>
          </div>
          <p className="text-xs text-muted font-mono">head: {chain.head?.slice(0, 12) ?? "—"}…</p>
        </Card>
      </header>

      <div className="grid sm:grid-cols-4 gap-6 mb-12">
        <Card className="p-5"><Stat label="Donations in" value={formatMoney(donationsIn, "INR")} /></Card>
        <Card className="p-5"><Stat label="Expenses out" value={formatMoney(-expensesOut, "INR")} /></Card>
        <Card className="p-5"><Stat label="Fees" value={formatMoney(-fees, "INR")} hint="Platform + payment" /></Card>
        <Card className={`p-5 ${balance < 0n ? "border-coral/30" : ""}`}><Stat label="Balance" value={formatMoney(balance, "INR")} hint="Available for care" /></Card>
      </div>

      {entries.length === 0 ? (
        <Card className="p-12 text-center text-slate">No ledger entries yet for {animal.name}. They'll appear here within seconds of any donation or expense.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted border-b border-line">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Kind</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Vendor</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-left p-4 hidden md:table-cell">Hash</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => {
                const isOut = e.amountPaise < 0n;
                return (
                  <tr key={e.id} className="border-b border-line/40 last:border-0 hover:bg-line/20">
                    <td className="p-4 text-slate font-mono text-xs whitespace-nowrap">{e.occurredAt.toISOString().slice(0, 10)}</td>
                    <td className="p-4"><Badge variant={isOut ? "coral" : "sage"}>{e.kind.replace("_", " ")}</Badge></td>
                    <td className="p-4 max-w-md">{e.description}</td>
                    <td className="p-4 text-muted">{e.vendor ?? "—"}</td>
                    <td className={`p-4 text-right font-mono whitespace-nowrap ${isOut ? "text-coral" : "text-sage"}`}>
                      {isOut ? "−" : "+"}{formatMoney(e.amountPaise > 0n ? e.amountPaise : -e.amountPaise, e.currency)}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-muted hidden md:table-cell">#{e.blockHeight} {e.hash.slice(0, 10)}…</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-8 flex items-center justify-between text-xs text-muted">
        <span>Audit yourself: <Link href={`/api/ledger/verify/${animal.shelterId}`} className="underline hover:text-ink">verify chain JSON →</Link></span>
        <Link href="/api/ledger/export.csv" className="underline hover:text-ink">Download all-platform CSV ↓</Link>
      </div>
    </div>
  );
}
