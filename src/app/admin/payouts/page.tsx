import Link from "next/link";
import { db, schema } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Admin · Payouts" };

export default async function AdminPayoutsPage() {
  const payouts = await db.select({
    payout: schema.payouts, shelterName: schema.shelters.name,
  }).from(schema.payouts)
    .leftJoin(schema.shelters, eq(schema.payouts.shelterId, schema.shelters.id))
    .orderBy(desc(schema.payouts.createdAt))
    .limit(200);

  const totals = await db.select({
    queued: sql<string>`coalesce(sum(amount_paise) filter (where status = 'queued'), 0)::text`,
    processing: sql<string>`coalesce(sum(amount_paise) filter (where status = 'processing'), 0)::text`,
    paidYTD: sql<string>`coalesce(sum(amount_paise) filter (where status = 'paid' and paid_at > date_trunc('year', now())), 0)::text`,
  }).from(schema.payouts);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">Payouts</h1>
        <p className="text-slate mt-2">{payouts.length} payouts on record</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Card className="p-5"><Stat label="Queued" value={formatMoney(BigInt(totals[0]?.queued ?? "0"), "INR", { compact: true })} hint="Awaiting release" /></Card>
        <Card className="p-5"><Stat label="Processing" value={formatMoney(BigInt(totals[0]?.processing ?? "0"), "INR", { compact: true })} hint="In flight T+1" /></Card>
        <Card className="p-5"><Stat label="Paid YTD" value={formatMoney(BigInt(totals[0]?.paidYTD ?? "0"), "INR", { compact: true })} /></Card>
      </div>

      {payouts.length === 0 ? (
        <Card className="p-12 text-center text-slate">No payouts yet — first one cuts when a shelter has accumulated ₹500+ in donations.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted border-b border-line">
              <tr>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Shelter</th>
                <th className="text-left p-4">Gateway</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-right p-4">Donations</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Paid</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(({ payout: p, shelterName }) => (
                <tr key={p.id} className="border-b border-line/40 last:border-0">
                  <td className="p-4 text-slate font-mono text-xs">{p.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="p-4">{shelterName ?? "—"}</td>
                  <td className="p-4 capitalize">{p.gateway}</td>
                  <td className="p-4 text-right font-mono">{formatMoney(p.amountPaise, p.currency)}</td>
                  <td className="p-4 text-right text-muted">{p.donationsCovered}</td>
                  <td className="p-4">
                    <Badge variant={p.status === "paid" ? "sage" : p.status === "failed" ? "coral" : p.status === "processing" ? "marigold" : "outline"}>{p.status}</Badge>
                  </td>
                  <td className="p-4 text-xs text-muted">{p.paidAt?.toLocaleDateString("en-IN") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
