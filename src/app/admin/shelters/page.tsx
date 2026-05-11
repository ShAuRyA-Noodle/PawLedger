import Link from "next/link";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Admin · Shelters" };

export default async function AdminShelters() {
  const shelters = await db.select().from(schema.shelters).orderBy(desc(schema.shelters.createdAt));

  const grouped = {
    pending: shelters.filter(s => s.kycStatus === "pending" || s.kycStatus === "in_review"),
    verified: shelters.filter(s => s.kycStatus === "verified"),
    rejected: shelters.filter(s => s.kycStatus === "rejected"),
    unsubmitted: shelters.filter(s => s.kycStatus === "unsubmitted"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">Shelters</h1>
        <p className="text-slate mt-2">{shelters.length} total · {grouped.pending.length} awaiting review</p>
      </header>

      {Object.entries(grouped).map(([key, list]) => list.length > 0 && (
        <section key={key} className="mb-10">
          <h2 className="font-display text-2xl mb-4 capitalize">{key} <span className="text-sm text-muted font-mono">{list.length}</span></h2>
          <Card>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted border-b border-line">
                <tr>
                  <th className="text-left p-4">Shelter</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">80G</th>
                  <th className="text-right p-4">Raised</th>
                  <th className="text-right p-4">Trust</th>
                  <th className="text-right p-4"></th>
                </tr>
              </thead>
              <tbody>
                {list.map(s => (
                  <tr key={s.id} className="border-b border-line/40 last:border-0">
                    <td className="p-4">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted">{s.legalName}</div>
                    </td>
                    <td className="p-4 text-slate">{s.city}, {s.state ?? "—"}</td>
                    <td className="p-4 text-xs text-slate">{s.email}<br/>{s.phone}</td>
                    <td className="p-4 text-xs">
                      {s.registration80g ? (
                        <Badge variant={s.registration80gExpiresAt && s.registration80gExpiresAt > new Date() ? "verified" : "coral"}>
                          {s.registration80gExpiresAt ? s.registration80gExpiresAt.toLocaleDateString("en-IN") : "—"}
                        </Badge>
                      ) : (<span className="text-muted">—</span>)}
                    </td>
                    <td className="p-4 text-right font-mono">{formatMoney(s.totalRaised, "INR", { compact: true })}</td>
                    <td className="p-4 text-right font-mono">{s.trustScore}/100</td>
                    <td className="p-4 text-right"><Link href={`/admin/shelters/${s.id}`} className="text-marigold-deep hover:underline">Review →</Link></td>
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
