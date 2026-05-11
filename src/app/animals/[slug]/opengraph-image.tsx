import { ImageResponse } from "next/og";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: { slug: string } }) {
  let animal: { name: string; rescueStory: string | null; heroPhotoUrl: string | null; species: string; city: string | null; sponsorCount: number } | null = null;
  try {
    const rows = await db.select({
      name: schema.animals.name,
      rescueStory: schema.animals.rescueStory,
      heroPhotoUrl: schema.animals.heroPhotoUrl,
      species: schema.animals.species,
      city: schema.animals.city,
      sponsorCount: schema.animals.sponsorCount,
    }).from(schema.animals).where(and(eq(schema.animals.slug, params.slug), eq(schema.animals.isPublished, true))).limit(1);
    animal = rows[0] ?? null;
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", background: "#fbf7ed", fontFamily: "system-ui",
        }}
      >
        {animal?.heroPhotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={animal.heroPhotoUrl} alt="" width="500" height="630" style={{ objectFit: "cover" }} />
        )}
        <div style={{ flex: 1, padding: "60px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0a838" }} />
            <span style={{ fontSize: 22, color: "#1f1f24", fontWeight: 600 }}>pawledger</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontSize: 18, color: "#7a7a82", letterSpacing: 2, textTransform: "uppercase" }}>
              Sponsor a life · {animal?.city ?? "—"}
            </span>
            <h1 style={{ fontSize: 88, color: "#1f1f24", margin: 0, lineHeight: 1, fontFamily: "Georgia, serif" }}>
              {animal?.name ?? "—"}
            </h1>
            <p style={{ fontSize: 24, color: "#404048", margin: 0, lineHeight: 1.4, maxWidth: 540 }}>
              {animal?.rescueStory ? animal.rescueStory.slice(0, 140) + "…" : "A rescued animal needing monthly sponsors."}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 18, color: "#7a7a82" }}>
              {animal?.sponsorCount ?? 0} sponsors so far
            </span>
            <span style={{ fontSize: 18, color: "#c9851a", fontWeight: 600 }}>
              pawledger.org →
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
