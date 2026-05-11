import { notFound } from "next/navigation";
import { db, schema } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/money";
import { SponsorWidget } from "@/components/sponsor-widget";
import { SponsorMessageWall } from "@/components/sponsor-message-wall";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

async function getAnimal(slug: string) {
  const rows = await db
    .select()
    .from(schema.animals)
    .where(and(eq(schema.animals.slug, slug), eq(schema.animals.isPublished, true)))
    .limit(1);
  if (!rows[0]) return null;
  const animal = rows[0];

  const [photos, updates, vet, shelter, recentDonations, messages] = await Promise.all([
    db.select().from(schema.animalPhotos).where(eq(schema.animalPhotos.animalId, animal.id)).orderBy(schema.animalPhotos.ord),
    db.select().from(schema.animalUpdates).where(eq(schema.animalUpdates.animalId, animal.id)).orderBy(desc(schema.animalUpdates.publishedAt)).limit(10),
    db.select().from(schema.vetRecords).where(eq(schema.vetRecords.animalId, animal.id)).orderBy(desc(schema.vetRecords.visitDate)).limit(5),
    db.select().from(schema.shelters).where(eq(schema.shelters.id, animal.shelterId)).limit(1),
    db.select({ donorName: schema.donations.donorName, amountPaise: schema.donations.amountPaise, capturedAt: schema.donations.capturedAt }).from(schema.donations).where(and(eq(schema.donations.animalId, animal.id), eq(schema.donations.status, "succeeded"))).orderBy(desc(schema.donations.capturedAt)).limit(5),
    db.select({ id: schema.sponsorMessages.id, authorName: schema.sponsorMessages.authorName, body: schema.sponsorMessages.body, createdAt: schema.sponsorMessages.createdAt })
      .from(schema.sponsorMessages)
      .where(and(eq(schema.sponsorMessages.animalId, animal.id), eq(schema.sponsorMessages.isApproved, true), eq(schema.sponsorMessages.isHidden, false)))
      .orderBy(desc(schema.sponsorMessages.createdAt))
      .limit(20),
  ]);

  return { animal, photos, updates, vet, shelter: shelter[0], recentDonations, messages };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await getAnimal(slug);
    if (!data) return { title: "Animal not found" };
    return {
      title: `${data.animal.name} · Sponsor for ${formatMoney(data.animal.monthlyCostPaise || 30000n, "INR")}/mo`,
      description: data.animal.rescueStory?.slice(0, 160),
      openGraph: { images: data.animal.heroPhotoUrl ? [data.animal.heroPhotoUrl] : [] },
    };
  } catch {
    return { title: "Animal" };
  }
}

export default async function AnimalProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data;
  try {
    data = await getAnimal(slug);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate">
        <p>Database not connected. Set DATABASE_URL in .env to view animal profiles.</p>
      </div>
    );
  }
  if (!data) notFound();
  const { animal, photos, updates, vet, shelter, recentDonations, messages } = data;
  const heroPhotos = photos.length > 0 ? photos : (animal.heroPhotoUrl ? [{ id: "hero", url: animal.heroPhotoUrl, caption: null, photographer: null, takenAt: null }] : []);
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <Link href="/animals" className="text-sm text-slate hover:text-ink">← All animals</Link>

      <div className="mt-6 grid lg:grid-cols-12 gap-12">
        {/* LEFT: photos + content */}
        <div className="lg:col-span-7 space-y-12">
          {/* Photo gallery */}
          <div>
            <div className="aspect-[4/3] bg-line rounded-2xl overflow-hidden relative">
              {heroPhotos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroPhotos[0].url} alt={animal.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-9xl">🐾</div>
              )}
              {animal.isUrgent && <Badge variant="coral" className="absolute top-4 left-4">Urgent care</Badge>}
            </div>
            {heroPhotos.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {heroPhotos.slice(1, 6).map(p => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt={p.caption ?? animal.name} className="aspect-square object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="font-display text-5xl tracking-tight">{animal.name}</h1>
              <Badge variant="outline">{animal.species}</Badge>
              {animal.sex && animal.sex !== "unknown" && <Badge variant="outline">{animal.sex}</Badge>}
            </div>
            <p className="text-slate text-sm">{animal.city ?? "—"} · cared for at <Link href={`/shelters/${shelter?.slug}`} className="underline hover:text-ink">{shelter?.name ?? "Verified shelter"}</Link></p>
          </div>

          {/* Story */}
          {animal.rescueStory && (
            <section>
              <h2 className="font-display text-2xl mb-3">How {animal.name} came to us</h2>
              <p className="text-slate leading-relaxed whitespace-pre-line">{animal.rescueStory}</p>
            </section>
          )}
          {animal.currentStory && (
            <section>
              <h2 className="font-display text-2xl mb-3">Where {animal.name} is now</h2>
              <p className="text-slate leading-relaxed whitespace-pre-line">{animal.currentStory}</p>
            </section>
          )}
          {animal.currentNeeds && (
            <Card className="p-6 bg-marigold/10 border-marigold/30">
              <p className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Current needs</p>
              <p className="text-slate">{animal.currentNeeds}</p>
            </Card>
          )}

          {/* Vet records */}
          {vet.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-4">Vet records</h2>
              <div className="space-y-3">
                {vet.map(v => (
                  <Card key={v.id} className="p-4 flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium">{v.diagnosis ?? "Visit"}</span>
                        <span className="text-xs text-muted">{v.visitDate.toLocaleDateString("en-IN")}</span>
                      </div>
                      <p className="text-sm text-slate">{v.treatment ?? "—"}</p>
                      <p className="text-xs text-muted mt-1">{v.vetName ? `Vet: ${v.vetName}` : ""} {v.clinicName && ` · ${v.clinicName}`}</p>
                    </div>
                    {v.costPaise > 0n && (
                      <span className="font-mono text-sm text-slate ml-4">{formatMoney(v.costPaise, "INR")}</span>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Updates feed */}
          <section>
            <h2 className="font-display text-2xl mb-4">Updates from {shelter?.name ?? "the shelter"}</h2>
            {updates.length === 0 ? (
              <Card className="p-6 text-sm text-slate">No updates yet. Sponsors will see weekly photo + text updates here.</Card>
            ) : (
              <div className="space-y-4">
                {updates.map(u => (
                  <Card key={u.id} className="p-5">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-medium">{u.title ?? u.kind.replace("_", " ")}</span>
                      <span className="text-xs text-muted">{u.publishedAt.toLocaleDateString("en-IN")}</span>
                    </div>
                    <p className="text-sm text-slate leading-relaxed whitespace-pre-line">{u.body}</p>
                    {u.mediaUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.mediaUrl} alt="" className="mt-3 rounded-lg max-h-72 object-cover" />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          <SponsorMessageWall animalId={animal.id} animalName={animal.name} initialMessages={messages} isSignedIn={!!session?.user} />
        </div>

        {/* RIGHT: sponsor widget */}
        <aside className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <SponsorWidget animalId={animal.id} animalName={animal.name} monthlyCostPaise={Number(animal.monthlyCostPaise)} sponsorCount={animal.sponsorCount} />

            {recentDonations.length > 0 && (
              <Card className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted font-mono mb-3">Recent sponsors</p>
                <ul className="space-y-2 text-sm">
                  {recentDonations.map((d, i) => (
                    <li key={i} className="flex justify-between text-slate">
                      <span>{d.donorName?.split(" ")[0] ?? "Anonymous"}</span>
                      <span className="font-mono">{formatMoney(d.amountPaise, "INR")}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="text-xs text-muted text-center">
              <Link href={`/transparency/animals/${animal.slug}`} className="underline hover:text-ink">
                View {animal.name}'s public ledger →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
