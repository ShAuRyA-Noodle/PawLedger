import Link from "next/link";
import { db, schema } from "@/db";
import { and, eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Public complaints" };

export default async function ComplaintsPage() {
  let items: typeof schema.complaints.$inferSelect[] = [];
  try {
    items = await db.select().from(schema.complaints).where(eq(schema.complaints.isPublic, true)).orderBy(desc(schema.complaints.createdAt)).limit(50);
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Badge variant="outline" className="mb-3">Public complaints + resolutions</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-4">When something's wrong, you'll see it here.</h1>
      <p className="text-slate mb-10 max-w-2xl">Anyone — donors, journalists, members of the public — can file a complaint about a shelter, animal, donation, or about us. Both the complaint and our resolution are public.</p>

      <div className="mb-8">
        <Button asChild variant="marigold"><Link href="/complaints/new">File a complaint →</Link></Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-slate">No public complaints. (Yet.)</Card>
      ) : (
        <div className="space-y-4">
          {items.map(c => (
            <Card key={c.id} className="p-6">
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <Badge variant={c.status === "resolved" ? "sage" : c.status === "dismissed" ? "outline" : "coral"}>{c.status}</Badge>
                <span className="text-xs text-muted">{c.createdAt.toLocaleDateString("en-IN")} · about {c.aboutType}</span>
              </div>
              <p className="text-slate">{c.body}</p>
              {c.resolution && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Our response · {c.resolvedAt?.toLocaleDateString("en-IN")}</p>
                  <p className="text-sm">{c.resolution}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
