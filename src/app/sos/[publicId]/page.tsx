import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";

export async function generateMetadata({ params }: { params: Promise<{ publicId: string }> }) {
  try {
    const { publicId } = await params;
    const rows = await db.select({ species: schema.sosReports.species, city: schema.sosReports.city }).from(schema.sosReports).where(eq(schema.sosReports.publicId, publicId)).limit(1);
    if (!rows[0]) return { title: "SOS case" };
    return { title: `SOS · ${rows[0].species} in ${rows[0].city ?? "—"}` };
  } catch { return { title: "SOS case" }; }
}

export default async function SOSDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  let report, claimedBy;
  try {
    const rows = await db.select().from(schema.sosReports).where(eq(schema.sosReports.publicId, publicId)).limit(1);
    report = rows[0];
    if (!report) notFound();
    if (report.claimedByShelterId) {
      const c = await db.select().from(schema.shelters).where(eq(schema.shelters.id, report.claimedByShelterId)).limit(1);
      claimedBy = c[0];
    }
  } catch {
    return <div className="mx-auto max-w-2xl p-16 text-center text-slate">Database not connected.</div>;
  }
  const lat = report.latitude / 1e7;
  const lng = report.longitude / 1e7;
  const pct = Number(report.microFundRaisedPaise * 100n / (report.microFundGoalPaise || 1n));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      <Link href="/sos" className="text-sm text-slate hover:text-ink">← All SOS cases</Link>

      <div className="mt-6 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="aspect-[4/3] bg-line rounded-2xl overflow-hidden relative mb-6">
            {report.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={report.photoUrl} alt="SOS report" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <Badge variant="coral" className="absolute top-3 left-3">{report.status}</Badge>
          </div>

          <p className="text-xs font-mono text-muted mb-2">SOS #{report.publicId.slice(0, 12)}</p>
          <h1 className="font-display text-4xl tracking-tight mb-2 capitalize">{report.species} in {report.city ?? "Unknown"}</h1>
          <p className="text-slate leading-relaxed mb-6">{report.conditionDescription}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {report.isInjured && <Badge variant="coral">Injured</Badge>}
            {report.isHitByVehicle && <Badge variant="coral">Hit by vehicle</Badge>}
            {report.isAggressive && <Badge variant="coral">Aggressive — keep distance</Badge>}
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Reported</h3>
              <p className="text-sm">{report.createdAt.toLocaleString("en-IN")}</p>
            </Card>
            {claimedBy && (
              <Card className="p-4">
                <h3 className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Claimed by</h3>
                <p className="text-sm"><Link href={`/shelters/${claimedBy.slug}`} className="hover:underline">{claimedBy.name}</Link> · {claimedBy.phone}</p>
                <p className="text-xs text-muted mt-1">at {report.claimedAt?.toLocaleString("en-IN")}</p>
              </Card>
            )}
            {report.outcome && (
              <Card className="p-4 bg-sage/5 border-sage/30">
                <h3 className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Outcome</h3>
                <p className="text-sm font-medium capitalize">{report.outcome.replace("_", " ")}</p>
                {report.outcomeNote && <p className="text-sm text-slate mt-1">{report.outcomeNote}</p>}
                {report.outcomePostedAt && <p className="text-xs text-muted mt-1">posted {report.outcomePostedAt.toLocaleDateString("en-IN")}</p>}
              </Card>
            )}
            <Card className="p-4">
              <h3 className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Location</h3>
              <p className="text-sm font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
              {report.addressNote && <p className="text-sm text-slate mt-1">{report.addressNote}</p>}
              <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-marigold-deep hover:underline mt-2 inline-block">Open in Google Maps →</a>
            </Card>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <Card className="p-6 sticky top-24">
            <h2 className="font-display text-2xl mb-2">Fund this case</h2>
            <p className="text-xs text-muted mb-4">100% of donations to SOS cases go to the responding shelter for vet costs. Disbursed instant via Cashfree.</p>

            <Progress value={pct} className="mb-2" />
            <div className="flex justify-between text-xs text-slate mb-5">
              <span>{formatMoney(report.microFundRaisedPaise, "INR")}</span>
              <span>{formatMoney(report.microFundGoalPaise, "INR")} goal</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[100, 500, 1000].map(amt => (
                <button key={amt} className="p-3 border border-line rounded-lg text-sm hover:border-marigold-deep transition-colors">
                  <span className="font-display text-lg">₹{amt}</span>
                </button>
              ))}
            </div>
            <Button fullWidth variant="marigold" size="lg" disabled>
              Donate now
            </Button>
            <p className="text-xs text-muted text-center mt-3">{report.donorCount} donor{report.donorCount === 1 ? "" : "s"} so far</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
