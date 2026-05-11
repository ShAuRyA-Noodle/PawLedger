import Link from "next/link";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Admin · SOS dispatch" };

export default async function AdminSOSPage() {
  const reports = await db.select().from(schema.sosReports).orderBy(desc(schema.sosReports.createdAt)).limit(100);
  const buckets = {
    open: reports.filter(r => r.status === "reported"),
    claimed: reports.filter(r => r.status === "claimed" || r.status === "in_progress"),
    resolved: reports.filter(r => r.status === "resolved" || r.status === "unfound" || r.status === "expired"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">SOS dispatch</h1>
        <p className="text-slate mt-2">{reports.length} cases · {buckets.open.length} unclaimed</p>
      </header>

      {Object.entries(buckets).map(([key, list]) => list.length > 0 && (
        <section key={key} className="mb-10">
          <h2 className="font-display text-2xl mb-4 capitalize">{key} <span className="text-sm text-muted font-mono">{list.length}</span></h2>
          <Card>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted border-b border-line">
                <tr>
                  <th className="text-left p-4">Reported</th>
                  <th className="text-left p-4">Species</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-right p-4">Funding</th>
                  <th className="text-right p-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => (
                  <tr key={r.id} className="border-b border-line/40 last:border-0">
                    <td className="p-4 text-xs text-slate font-mono whitespace-nowrap">{r.createdAt.toISOString().slice(0, 10)}</td>
                    <td className="p-4 capitalize">{r.species}</td>
                    <td className="p-4 text-slate">{r.city ?? "—"}</td>
                    <td className="p-4 max-w-md truncate text-slate">{r.conditionDescription}</td>
                    <td className="p-4 text-right font-mono">{formatMoney(r.microFundRaisedPaise, "INR")}/{formatMoney(r.microFundGoalPaise, "INR")}</td>
                    <td className="p-4 text-right">
                      <Link href={`/sos/${r.publicId}`} className="text-marigold-deep hover:underline">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      ))}
    </div>
  );
}
