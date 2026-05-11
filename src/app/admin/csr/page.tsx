import Link from "next/link";
import { db, schema } from "@/db";
import { desc, eq, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Admin · CSR" };

export default async function AdminCSRPage() {
  const accounts = await db.select().from(schema.csrAccounts).orderBy(desc(schema.csrAccounts.createdAt));
  const grants = await db.select({
    sum: sql<string>`coalesce(sum(amount_paise), 0)::text`,
    count: sql<number>`count(*)::int`,
  }).from(schema.csrGrants);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">CSR accounts</h1>
        <p className="text-slate mt-2">{accounts.length} corporate accounts</p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Card className="p-5"><Stat label="Accounts" value={accounts.length} /></Card>
        <Card className="p-5"><Stat label="Grants" value={grants[0]?.count ?? 0} /></Card>
        <Card className="p-5"><Stat label="Routed" value={formatMoney(BigInt(grants[0]?.sum ?? "0"), "INR", { compact: true })} /></Card>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 text-center text-slate">No CSR accounts yet — first inquiries land here when corporates fill the contact form.</Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted border-b border-line">
              <tr>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-left p-4">Tier</th>
                <th className="text-right p-4">Annual pledge</th>
                <th className="text-left p-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="border-b border-line/40 last:border-0">
                  <td className="p-4">
                    <div className="font-medium">{a.companyName}</div>
                    <div className="text-xs text-muted">{a.legalName}</div>
                  </td>
                  <td className="p-4 text-xs text-slate">{a.contactName}<br/>{a.contactEmail}</td>
                  <td className="p-4 capitalize"><Badge variant={a.tier === "enterprise" ? "marigold" : "outline"}>{a.tier}</Badge></td>
                  <td className="p-4 text-right font-mono">{formatMoney(a.annualPledgePaise, "INR", { compact: true })}</td>
                  <td className="p-4 text-xs text-muted">{a.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
