import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { and, eq, sql, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Your year in review" };

export default async function WrappedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/dashboard/wrapped");
  const userId = session.user.id;
  const year = new Date().getFullYear();

  const totals = await db.select({
    sum: sql<string>`coalesce(sum(amount_paise), 0)::text`,
    count: sql<number>`count(*)::int`,
    distinctAnimals: sql<number>`count(distinct animal_id)::int`,
    distinctShelters: sql<number>`count(distinct shelter_id)::int`,
    months: sql<number>`count(distinct date_trunc('month', captured_at))::int`,
  }).from(schema.donations).where(and(eq(schema.donations.donorId, userId), eq(schema.donations.status, "succeeded")));

  const topAnimals = await db.select({
    name: schema.animals.name,
    slug: schema.animals.slug,
    photo: schema.animals.heroPhotoUrl,
    total: sql<string>`coalesce(sum(donations.amount_paise), 0)::text`,
  }).from(schema.donations)
    .leftJoin(schema.animals, eq(schema.donations.animalId, schema.animals.id))
    .where(and(eq(schema.donations.donorId, userId), eq(schema.donations.status, "succeeded")))
    .groupBy(schema.animals.id, schema.animals.name, schema.animals.slug, schema.animals.heroPhotoUrl)
    .orderBy(desc(sql`sum(donations.amount_paise)`))
    .limit(3);

  const total = BigInt(totals[0]?.sum ?? "0");

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Badge variant="marigold" className="mb-3">Your {year} on PawLedger</Badge>
      <h1 className="font-display text-6xl tracking-tight leading-[0.95] mb-12">
        {session.user.name?.split(" ")[0] ?? "Friend"},<br/>
        you funded <em className="not-italic text-marigold-deep">care</em> for {totals[0]?.distinctAnimals ?? 0} animals.
      </h1>

      <div className="grid sm:grid-cols-3 gap-6 mb-16">
        <Card className="p-8">
          <p className="text-xs uppercase tracking-wider text-muted font-mono mb-3">Total this year</p>
          <p className="font-display text-5xl tracking-tight">{formatMoney(total, "INR", { compact: true })}</p>
        </Card>
        <Card className="p-8">
          <p className="text-xs uppercase tracking-wider text-muted font-mono mb-3">Donations</p>
          <p className="font-display text-5xl tracking-tight">{totals[0]?.count ?? 0}</p>
          <p className="text-sm text-slate mt-1">across {totals[0]?.months ?? 0} month{totals[0]?.months === 1 ? "" : "s"}</p>
        </Card>
        <Card className="p-8">
          <p className="text-xs uppercase tracking-wider text-muted font-mono mb-3">Shelters supported</p>
          <p className="font-display text-5xl tracking-tight">{totals[0]?.distinctShelters ?? 0}</p>
        </Card>
      </div>

      {topAnimals.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-3xl mb-6">Top three you backed</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {topAnimals.map((a, i) => (
              <Link key={a.slug} href={`/animals/${a.slug}`}>
                <Card className="overflow-hidden hover:shadow-floating transition-shadow">
                  <div className="aspect-square bg-line relative">
                    {a.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photo} alt={a.name ?? ""} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="absolute top-2 left-2 bg-cream rounded-full h-8 w-8 flex items-center justify-center font-display text-lg">{i + 1}</div>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg">{a.name}</p>
                    <p className="text-sm text-slate">{formatMoney(BigInt(a.total), "INR")}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center mt-16 mb-8">
        <Button size="xl" variant="marigold">Share your year</Button>
        <p className="text-xs text-muted mt-3">Image card auto-generated · respects privacy (no amount unless you opt in)</p>
      </div>
    </div>
  );
}
