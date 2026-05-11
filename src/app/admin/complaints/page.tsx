import Link from "next/link";
import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Complaints" };

export default async function AdminComplaintsPage() {
  const complaints = await db.select().from(schema.complaints).orderBy(desc(schema.complaints.createdAt)).limit(200);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">Complaints</h1>
        <p className="text-slate mt-2">{complaints.length} total · {complaints.filter(c => c.status === "open").length} open</p>
      </header>

      {complaints.length === 0 ? (
        <Card className="p-12 text-center text-slate">No complaints filed.</Card>
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <Card key={c.id} className="p-5 flex justify-between gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-baseline mb-1">
                  <Badge variant={c.status === "resolved" ? "sage" : c.status === "dismissed" ? "outline" : "coral"}>{c.status}</Badge>
                  <span className="text-xs text-muted">about {c.aboutType} · {c.createdAt.toLocaleDateString("en-IN")} · {c.reporterEmail ?? "—"}</span>
                </div>
                <p className="text-sm text-slate line-clamp-2">{c.body}</p>
              </div>
              <Link href={`/admin/complaints/${c.id}`} className="text-sm text-marigold-deep hover:underline whitespace-nowrap">Resolve →</Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
