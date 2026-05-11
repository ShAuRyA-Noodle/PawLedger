import { db, schema } from "@/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Donor wall" };

export default async function DonorWallPage() {
  let donors: { name: string | null; total: string; firstAt: Date | null; count: number }[] = [];
  try {
    const rows = await db.select({
      name: schema.donations.donorName,
      total: sql<string>`coalesce(sum(amount_paise), 0)::text`,
      firstAt: sql<Date>`min(captured_at)`,
      count: sql<number>`count(*)::int`,
    }).from(schema.donations)
      .where(eq(schema.donations.status, "succeeded"))
      .groupBy(schema.donations.donorName)
      .orderBy(desc(sql`sum(amount_paise)`))
      .limit(120);
    donors = rows;
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <Badge variant="outline" className="mb-3">Donor wall · opt-in</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-3">Thank you to our sponsors.</h1>
      <p className="text-slate mb-12 max-w-2xl">Donors are listed by first name + city only. Amounts are bracketed for privacy. Opt-out any time from your dashboard.</p>

      {donors.length === 0 ? (
        <Card className="p-12 text-center text-slate">No donations yet.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {donors.map((d, i) => {
            const total = BigInt(d.total);
            const bracket = total >= 1000000n ? "Patron" : total >= 100000n ? "Champion" : total >= 10000n ? "Friend" : "Supporter";
            return (
              <Card key={i} className="p-4 hover:bg-card/80 transition-colors">
                <p className="font-display text-lg">{d.name?.split(" ")[0] ?? "Anonymous"}</p>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-xs text-muted">{d.count} donation{d.count === 1 ? "" : "s"}</span>
                  <Badge variant={total >= 100000n ? "marigold" : "outline"}>{bracket}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
