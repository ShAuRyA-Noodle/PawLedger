import type { MetadataRoute } from "next";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org";
  const fixedRoutes: MetadataRoute.Sitemap = [
    "", "/animals", "/sos", "/transparency", "/for-shelters", "/csr", "/about", "/contact", "/privacy", "/terms", "/embed",
  ].map(p => ({ url: `${baseUrl}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1.0 : 0.7 }));

  let animalRoutes: MetadataRoute.Sitemap = [];
  try {
    const animals = await db.select({ slug: schema.animals.slug, updatedAt: schema.animals.updatedAt }).from(schema.animals).where(eq(schema.animals.isPublished, true));
    animalRoutes = animals.map(a => ({ url: `${baseUrl}/animals/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "weekly", priority: 0.6 }));
  } catch {}

  return [...fixedRoutes, ...animalRoutes];
}
