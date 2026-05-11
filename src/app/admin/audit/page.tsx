import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Audit log" };

export default async function AdminAuditPage() {
  const entries = await db.select({
    e: schema.auditLog, actorEmail: schema.user.email, actorName: schema.user.name,
  }).from(schema.auditLog)
    .leftJoin(schema.user, eq(schema.auditLog.actorId, schema.user.id))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(200);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <header className="mb-10">
        <h1 className="font-display text-5xl tracking-tight">Audit log</h1>
        <p className="text-slate mt-2">Last 200 privileged actions</p>
      </header>

      <Card>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted border-b border-line">
            <tr>
              <th className="text-left p-4">When</th>
              <th className="text-left p-4">Actor</th>
              <th className="text-left p-4">Action</th>
              <th className="text-left p-4">Entity</th>
              <th className="text-left p-4">After</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ e, actorEmail, actorName }) => (
              <tr key={e.id} className="border-b border-line/40 last:border-0">
                <td className="p-4 text-xs text-muted font-mono whitespace-nowrap">{e.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
                <td className="p-4">{actorName ?? actorEmail ?? "system"}</td>
                <td className="p-4"><Badge variant="outline">{e.action}</Badge></td>
                <td className="p-4 text-xs font-mono">{e.entityType}/{e.entityId.slice(0, 8)}</td>
                <td className="p-4 text-xs text-muted truncate max-w-md">{e.afterJson ? JSON.stringify(e.afterJson) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
