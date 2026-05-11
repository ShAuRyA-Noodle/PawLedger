import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/admin");

  // For demo: only let users with role=platform_admin in
  const userRow = await db.select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1);
  if (userRow[0]?.role !== "platform_admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl tracking-tight mb-4">Admin only</h1>
        <p className="text-slate">This area is restricted to platform admins.</p>
      </div>
    );
  }

  const [shelterStats, animalStats, donationStats, sosStats, complaints] = await Promise.all([
    db.select({
      pending: sql<number>`count(*) filter (where kyc_status in ('pending','in_review','unsubmitted'))::int`,
      verified: sql<number>`count(*) filter (where kyc_status = 'verified')::int`,
      total: sql<number>`count(*)::int`,
    }).from(schema.shelters),
    db.select({
      published: sql<number>`count(*) filter (where is_published = true)::int`,
      total: sql<number>`count(*)::int`,
    }).from(schema.animals),
    db.select({
      total: sql<string>`coalesce(sum(amount_paise) filter (where status = 'succeeded'), 0)::text`,
      mrr: sql<string>`coalesce(sum(amount_paise) filter (where kind = 'recurring' and status = 'succeeded' and captured_at > now() - interval '31 days'), 0)::text`,
      count: sql<number>`count(*) filter (where status = 'succeeded')::int`,
    }).from(schema.donations),
    db.select({
      open: sql<number>`count(*) filter (where status in ('reported','claimed','in_progress'))::int`,
      total: sql<number>`count(*)::int`,
    }).from(schema.sosReports),
    db.select().from(schema.complaints).where(eq(schema.complaints.status, "open")).orderBy(desc(schema.complaints.createdAt)).limit(5),
  ]);

  const total = BigInt(donationStats[0]?.total ?? "0");
  const mrr = BigInt(donationStats[0]?.mrr ?? "0");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <Badge variant="coral" className="mb-3">Admin</Badge>
        <h1 className="font-display text-5xl tracking-tight">Platform overview</h1>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6"><Stat label="MRR (last 31d)" value={formatMoney(mrr, "INR", { compact: true })} emphasis /></Card>
        <Card className="p-6"><Stat label="Total raised" value={formatMoney(total, "INR", { compact: true })} emphasis hint={`${donationStats[0]?.count ?? 0} donations`} /></Card>
        <Card className="p-6"><Stat label="Verified shelters" value={shelterStats[0]?.verified ?? 0} hint={`${shelterStats[0]?.pending ?? 0} pending KYC`} /></Card>
        <Card className="p-6"><Stat label="Animals live" value={animalStats[0]?.published ?? 0} hint={`${animalStats[0]?.total ?? 0} total`} /></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        <AdminLink href="/admin/shelters" title="Shelter KYC queue" desc={`${shelterStats[0]?.pending ?? 0} shelters awaiting review`} urgent={(shelterStats[0]?.pending ?? 0) > 0} />
        <AdminLink href="/admin/payouts" title="Payout queue" desc="Review + release shelter payouts" />
        <AdminLink href="/admin/sos" title={`SOS dispatch (${sosStats[0]?.open ?? 0} open)`} desc="Active street-rescue cases needing dispatch" urgent={(sosStats[0]?.open ?? 0) > 5} />
        <AdminLink href="/admin/complaints" title="Complaints" desc={`${complaints.length} open complaints`} urgent={complaints.length > 0} />
        <AdminLink href="/admin/fraud" title="Fraud signals" desc="Card-testing, suspicious shelters, payout anomalies" />
        <AdminLink href="/admin/csr" title="CSR accounts" desc="Corporate buyers + grant pipelines" />
        <AdminLink href="/admin/analytics" title="Analytics" desc="Funnels, retention, donor cohorts" />
        <AdminLink href="/admin/audit" title="Audit log" desc="Every privileged action recorded" />
      </div>

      {complaints.length > 0 && (
        <Card className="p-6 mb-12">
          <h2 className="font-display text-2xl mb-4">Recent complaints</h2>
          <ul className="space-y-3 text-sm">
            {complaints.map(c => (
              <li key={c.id} className="flex justify-between p-3 rounded-lg hover:bg-line/30 transition-colors">
                <div>
                  <p className="text-ink">{c.body.slice(0, 80)}…</p>
                  <p className="text-xs text-muted mt-0.5">about {c.aboutType} · {c.createdAt.toLocaleDateString()}</p>
                </div>
                <Button asChild size="sm" variant="secondary"><Link href={`/admin/complaints/${c.id}`}>Review</Link></Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function AdminLink({ href, title, desc, urgent }: { href: string; title: string; desc: string; urgent?: boolean }) {
  return (
    <Link href={href}>
      <Card className={`p-5 hover:shadow-floating transition-shadow ${urgent ? "border-coral/50" : ""}`}>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-display text-xl">{title}</h3>
          {urgent && <Badge variant="coral">Action</Badge>}
        </div>
        <p className="text-sm text-slate">{desc}</p>
      </Card>
    </Link>
  );
}
