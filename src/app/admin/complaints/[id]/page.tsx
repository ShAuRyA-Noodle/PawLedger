import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplaintResolver } from "@/components/complaint-resolver";

export default async function ComplaintReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(schema.complaints).where(eq(schema.complaints.id, id)).limit(1);
  const c = rows[0];
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <Link href="/admin/complaints" className="text-sm text-slate hover:text-ink">← All complaints</Link>
      <header className="mt-6 mb-8">
        <Badge variant={c.status === "resolved" ? "sage" : c.status === "dismissed" ? "outline" : "coral"} className="mb-3">{c.status}</Badge>
        <h1 className="font-display text-3xl tracking-tight">Complaint about {c.aboutType}</h1>
        <p className="text-sm text-slate mt-1">filed {c.createdAt.toLocaleString("en-IN")} by {c.reporterEmail ?? "anon"} · public: {c.isPublic ? "yes" : "no"}</p>
      </header>

      <Card className="p-6 mb-6">
        <h2 className="font-display text-lg mb-3">What was reported</h2>
        <p className="text-slate whitespace-pre-line">{c.body}</p>
        {c.aboutId && <p className="mt-4 text-xs text-muted">Reference: <code className="bg-line/40 px-1 rounded">{c.aboutId}</code></p>}
      </Card>

      <ComplaintResolver complaintId={c.id} currentStatus={c.status} currentResolution={c.resolution} />
    </div>
  );
}
