import Link from "next/link";
import { db, schema } from "@/db";
import { and, eq, desc, sql } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "All verified shelters" };

export default async function SheltersPage() {
  let shelters: { id: string; slug: string; name: string; city: string; state: string | null; logoUrl: string | null; coverUrl: string | null; trustScore: number; about: string | null; isVerifiedShelter: boolean; registration80g: string | null; awbiRecognition: string | null; totalRaised: bigint; animalsInCare: number }[] = [];
  try {
    shelters = await db.select({
      id: schema.shelters.id, slug: schema.shelters.slug, name: schema.shelters.name,
      city: schema.shelters.city, state: schema.shelters.state, logoUrl: schema.shelters.logoUrl, coverUrl: schema.shelters.coverUrl,
      trustScore: schema.shelters.trustScore, about: schema.shelters.about, isVerifiedShelter: schema.shelters.isVerifiedShelter,
      registration80g: schema.shelters.registration80g, awbiRecognition: schema.shelters.awbiRecognition,
      totalRaised: schema.shelters.totalRaised, animalsInCare: schema.shelters.animalsInCare,
    }).from(schema.shelters).where(eq(schema.shelters.isPublished, true)).orderBy(desc(schema.shelters.trustScore));
  } catch {}

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-12">
        <Badge variant="outline" className="mb-3">Verified shelters</Badge>
        <h1 className="font-display text-5xl tracking-tight">{shelters.length} partner shelters</h1>
        <p className="text-slate mt-2 max-w-2xl">Each one verified for 80G validity, AWBI recognition, financial track record, and on-the-ground operations. Re-verified quarterly.</p>
      </header>

      {shelters.length === 0 ? (
        <Card className="p-12 text-center text-slate">No shelters yet — apply to be one of the first <Link href="/for-shelters/apply" className="underline text-marigold-deep">here</Link>.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map(s => (
            <Link key={s.id} href={`/shelters/${s.slug}`} className="group">
              <Card className="overflow-hidden h-full hover:shadow-floating transition-shadow">
                <div className="aspect-[16/9] bg-gradient-to-br from-marigold/30 via-cream to-sage/20" />
                <div className="p-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display text-xl">{s.name}</h3>
                    <span className="text-xs text-muted font-mono">{s.city}</span>
                  </div>
                  <p className="text-sm text-slate line-clamp-2 mb-4 leading-relaxed">{s.about ?? "Verified animal welfare organisation."}</p>
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    {s.registration80g && <Badge variant="verified">80G</Badge>}
                    {s.awbiRecognition && <Badge variant="verified">AWBI</Badge>}
                    {s.isVerifiedShelter && <Badge variant="sage">Verified</Badge>}
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>{s.animalsInCare} in care</span>
                    <span>{formatMoney(s.totalRaised, "INR", { compact: true })} raised</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
