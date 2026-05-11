import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { and, eq, sql } from "drizzle-orm";

// Deterministic animal-of-the-day: same animal for all visitors on the same calendar day.
// Pick is row-numbered by day-of-year mod animal count, so it rotates daily.
export const revalidate = 3600;

export default async function AnimalOfTheDay() {
  try {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const rows = await db.select({ slug: schema.animals.slug }).from(schema.animals).where(and(eq(schema.animals.isPublished, true), eq(schema.animals.status, "active"))).orderBy(schema.animals.publishedAt);
    if (rows.length === 0) redirect("/animals");
    const pick = rows[dayOfYear % rows.length];
    redirect(`/animals/${pick.slug}?utm=animal-of-the-day`);
  } catch {
    redirect("/animals");
  }
}
