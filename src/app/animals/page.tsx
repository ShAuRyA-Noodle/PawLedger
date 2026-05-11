import Link from "next/link";
import { db, schema } from "@/db";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type SearchParams = { city?: string; species?: string; q?: string; urgent?: string };

async function searchAnimals(params: SearchParams) {
  try {
    const where = [eq(schema.animals.isPublished, true), eq(schema.animals.status, "active")];
    if (params.city) where.push(eq(schema.animals.city, params.city));
    if (params.species) where.push(eq(schema.animals.species, params.species as never));
    if (params.urgent === "1") where.push(eq(schema.animals.isUrgent, true));
    if (params.q) {
      const q = `%${params.q}%`;
      where.push(or(ilike(schema.animals.name, q), ilike(schema.animals.rescueStory, q))!);
    }

    return await db
      .select({
        id: schema.animals.id,
        slug: schema.animals.slug,
        name: schema.animals.name,
        species: schema.animals.species,
        rescueStory: schema.animals.rescueStory,
        heroPhotoUrl: schema.animals.heroPhotoUrl,
        city: schema.animals.city,
        sponsorCount: schema.animals.sponsorCount,
        isUrgent: schema.animals.isUrgent,
        shelterName: schema.shelters.name,
      })
      .from(schema.animals)
      .leftJoin(schema.shelters, eq(schema.animals.shelterId, schema.shelters.id))
      .where(and(...where))
      .orderBy(desc(schema.animals.isUrgent), desc(schema.animals.publishedAt))
      .limit(60);
  } catch {
    return [];
  }
}

async function getCities() {
  try {
    const rows = await db
      .selectDistinct({ city: schema.animals.city })
      .from(schema.animals)
      .where(and(eq(schema.animals.isPublished, true), sql`${schema.animals.city} is not null`));
    return rows.map(r => r.city!).filter(Boolean).sort();
  } catch {
    return [];
  }
}

export const metadata = { title: "Animals to sponsor" };

export default async function AnimalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [animals, cities] = await Promise.all([searchAnimals(params), getCities()]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <header className="mb-12">
        <Badge variant="outline" className="mb-4">Browse</Badge>
        <h1 className="font-display text-5xl tracking-tight mb-3">Animals seeking sponsors</h1>
        <p className="text-slate max-w-2xl">
          Each animal lives at a verified shelter. Pick someone, sponsor monthly, and you'll get weekly photo updates with vet records and a public ledger of every rupee spent on their care.
        </p>
      </header>

      {/* Filters */}
      <form className="mb-10 grid sm:grid-cols-4 gap-3">
        <Input name="q" placeholder="Search by name or story" defaultValue={params.q ?? ""} />
        <select
          name="species"
          defaultValue={params.species ?? ""}
          className="h-11 rounded-md border border-line-strong bg-card px-3 text-sm"
        >
          <option value="">All species</option>
          <option value="dog">Dogs</option>
          <option value="cat">Cats</option>
          <option value="cow">Cows</option>
          <option value="bird">Birds</option>
          <option value="other">Other</option>
        </select>
        <select
          name="city"
          defaultValue={params.city ?? ""}
          className="h-11 rounded-md border border-line-strong bg-card px-3 text-sm"
        >
          <option value="">All cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="h-11 rounded-md bg-ink text-cream text-sm font-medium hover:bg-charcoal transition-colors">
          Filter
        </button>
      </form>

      <div className="mb-6 flex items-center justify-between text-sm text-slate">
        <span>{animals.length} animal{animals.length === 1 ? "" : "s"} matching</span>
        <Link href="/animals?urgent=1" className="text-coral hover:underline">
          Show urgent only →
        </Link>
      </div>

      {animals.length === 0 ? (
        <Card className="p-12 text-center text-slate">
          No animals match. Try clearing filters, or <Link href="/sos" className="text-marigold-deep underline">report a street animal in distress</Link>.
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animals.map(a => (
            <Link key={a.id} href={`/animals/${a.slug}`} className="group">
              <Card className="overflow-hidden h-full hover:shadow-floating transition-shadow">
                <div className="aspect-[4/3] bg-line relative overflow-hidden">
                  {a.heroPhotoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.heroPhotoUrl} alt={a.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  {a.isUrgent && <Badge variant="coral" className="absolute top-3 left-3">Urgent</Badge>}
                  <Badge variant="default" className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm">{a.species}</Badge>
                </div>
                <CardContent className="pt-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-display text-xl">{a.name}</h3>
                    <span className="text-xs text-muted font-mono">{a.city}</span>
                  </div>
                  <p className="text-sm text-slate line-clamp-2 mb-4 leading-relaxed">{a.rescueStory ?? "Recovering. Needs sponsors."}</p>
                  <div className="text-xs text-muted">{a.sponsorCount} sponsors · {a.shelterName}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
