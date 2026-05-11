import Link from "next/link";
import { db, schema } from "@/db";
import { desc, eq, and, or } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Street SOS" };

async function getOpen() {
  try {
    return await db.select().from(schema.sosReports).where(or(eq(schema.sosReports.status, "reported"), eq(schema.sosReports.status, "claimed"), eq(schema.sosReports.status, "in_progress"))).orderBy(desc(schema.sosReports.createdAt)).limit(20);
  } catch { return []; }
}

export default async function SOSPage() {
  const open = await getOpen();
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Badge variant="coral" className="mb-4">Street SOS</Badge>
          <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
            Spotted an injured street animal?<br/><em className="not-italic text-coral">30 seconds. We'll dispatch.</em>
          </h1>
          <p className="mt-6 text-lg text-slate max-w-xl leading-relaxed">
            Snap a photo. Drop a pin. We route to the nearest verified shelter in your city. Donors fund vet care for the case in real time. Outcome posted publicly within 7 days.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="danger" size="xl"><Link href="/sos/report">Report a case →</Link></Button>
            <Button asChild variant="ghost" size="xl"><Link href="#open">See active cases</Link></Button>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-sm">
            <div><p className="font-mono text-xs text-muted">CITIES LIVE</p><p className="font-display text-3xl mt-1">8</p></div>
            <div><p className="font-mono text-xs text-muted">AVG DISPATCH</p><p className="font-display text-3xl mt-1">23m</p></div>
            <div><p className="font-mono text-xs text-muted">RESOLUTION</p><p className="font-display text-3xl mt-1">82%</p></div>
          </div>
        </div>
        <div className="lg:col-span-5">
          <Card className="p-8">
            <h2 className="font-display text-2xl mb-4">Need help right now?</h2>
            <p className="text-sm text-slate mb-6">If you have an animal in front of you and they need care, take a photo, share location, and we'll route to the closest shelter. Most cities respond within an hour during the day.</p>
            <Button asChild fullWidth variant="danger" size="lg"><Link href="/sos/report">Open report form →</Link></Button>
            <div className="mt-4 text-xs text-muted text-center">Or call our partner helpline: <a href="tel:+919900099000" className="underline">+91 99000 99000</a></div>
          </Card>
          <Card className="mt-4 p-6 bg-coral/5 border-coral/20">
            <p className="text-sm font-medium mb-2">Important safety</p>
            <ul className="text-sm text-slate space-y-1">
              <li>• Do not approach aggressive or rabid animals</li>
              <li>• Do not move severely injured animals without guidance</li>
              <li>• If hit by vehicle: cordon area, photo from distance, call</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Open cases */}
      <section id="open" className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl tracking-tight">Active cases</h2>
            <span className="text-sm text-slate">{open.length} open</span>
          </div>
          {open.length === 0 ? (
            <Card className="p-12 text-center text-slate">No open cases right now. Spotted one? <Link href="/sos/report" className="underline text-marigold-deep">Report now</Link>.</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {open.map(c => {
                const pct = Number(c.microFundRaisedPaise * 100n / (c.microFundGoalPaise || 1n));
                return (
                  <Card key={c.id} className="overflow-hidden">
                    <div className="aspect-[4/3] bg-line relative">
                      {c.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.photoUrl} alt={c.species} className="absolute inset-0 h-full w-full object-cover" />
                      )}
                      <Badge variant="coral" className="absolute top-3 left-3">{c.status}</Badge>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted mb-1 font-mono">SOS #{c.publicId.slice(0, 8)}</p>
                      <h3 className="font-display text-lg mb-2 capitalize">{c.species} · {c.city ?? "Unknown city"}</h3>
                      <p className="text-sm text-slate line-clamp-2 mb-4">{c.conditionDescription}</p>
                      <Progress value={pct} className="mb-2" />
                      <div className="flex justify-between text-xs text-slate mb-4">
                        <span>{formatMoney(c.microFundRaisedPaise, "INR")} of {formatMoney(c.microFundGoalPaise, "INR")}</span>
                        <span>{c.donorCount} donors</span>
                      </div>
                      <Button asChild fullWidth size="sm" variant="marigold">
                        <Link href={`/sos/${c.publicId}`}>Fund this case →</Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
