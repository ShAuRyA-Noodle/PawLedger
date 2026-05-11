import { db, schema } from "@/db";
import { and, eq, sql } from "drizzle-orm";
import { TIERS, formatMoney } from "@/lib/money";

// Renders inside an iframe on partner sites. Minimal chrome.
export default async function EmbedWidget({ searchParams }: { searchParams: Promise<{ animal?: string; theme?: string; accent?: string }> }) {
  const sp = await searchParams;
  const theme = sp.theme === "dark" ? "dark" : "light";
  const accent = sp.accent ?? "#c9851a";

  let animal: { id: string; slug: string; name: string; heroPhotoUrl: string | null; city: string | null; sponsorCount: number; rescueStory: string | null } | null = null;
  try {
    if (sp.animal && sp.animal !== "AUTO") {
      const rows = await db.select({ id: schema.animals.id, slug: schema.animals.slug, name: schema.animals.name, heroPhotoUrl: schema.animals.heroPhotoUrl, city: schema.animals.city, sponsorCount: schema.animals.sponsorCount, rescueStory: schema.animals.rescueStory }).from(schema.animals).where(and(eq(schema.animals.slug, sp.animal), eq(schema.animals.isPublished, true))).limit(1);
      animal = rows[0] ?? null;
    } else {
      const rows = await db.select({ id: schema.animals.id, slug: schema.animals.slug, name: schema.animals.name, heroPhotoUrl: schema.animals.heroPhotoUrl, city: schema.animals.city, sponsorCount: schema.animals.sponsorCount, rescueStory: schema.animals.rescueStory }).from(schema.animals).where(eq(schema.animals.isPublished, true)).orderBy(sql`random()`).limit(1);
      animal = rows[0] ?? null;
    }
  } catch {}

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: theme === "dark" ? "#1a1817" : "#fbf7ed", color: theme === "dark" ? "#fbf7ed" : "#1f1f24", padding: 16 }}>
        <div style={{ borderRadius: 16, border: `1px solid ${theme === "dark" ? "#2a2727" : "#e8e3d4"}`, background: theme === "dark" ? "#22201f" : "#ffffff", overflow: "hidden" }}>
          {animal?.heroPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={animal.heroPhotoUrl} alt={animal.name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          )}
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 11, opacity: 0.6, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>Sponsor a life · pawledger</p>
            <h2 style={{ fontSize: 22, margin: "4px 0 6px", fontFamily: "Georgia, serif" }}>{animal?.name ?? "A rescued animal"}</h2>
            <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 12px", lineHeight: 1.5 }}>{animal?.rescueStory?.slice(0, 100) ?? "Recovering and looking for monthly sponsors."}…</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
              {TIERS.INR.slice(0, 3).map(t => (
                <div key={t.value} style={{ padding: 8, borderRadius: 8, border: `1px solid ${theme === "dark" ? "#2a2727" : "#e8e3d4"}`, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontFamily: "Georgia, serif" }}>{t.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{t.impact}</div>
                </div>
              ))}
            </div>
            <a
              href={`https://pawledger.org/animals/${animal?.slug ?? ""}?utm_source=embed`}
              target="_top"
              style={{ display: "block", textAlign: "center", background: accent, color: "#1f1f24", padding: "12px 16px", borderRadius: 999, textDecoration: "none", fontWeight: 500, fontSize: 14 }}
            >
              Sponsor on PawLedger →
            </a>
            <p style={{ fontSize: 10, opacity: 0.5, textAlign: "center", margin: "8px 0 0" }}>80G certified · Public ledger · Cancel anytime</p>
          </div>
        </div>
      </body>
    </html>
  );
}
