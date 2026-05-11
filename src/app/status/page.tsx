import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "System status" };
export const revalidate = 30;

async function fetchStatus() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/status`, { cache: "no-store" });
    return await res.json() as { status: string; checks: Record<string, { ok: boolean; detail?: string; latencyMs?: number }> };
  } catch { return { status: "unknown", checks: {} as Record<string, { ok: boolean; detail?: string; latencyMs?: number }> }; }
}

export default async function StatusPage() {
  const s = await fetchStatus();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <Badge variant={s.status === "ok" ? "sage" : "coral"} className="mb-3">{s.status}</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-3">System status</h1>
      <p className="text-slate mb-10">Live, machine-readable at <code className="font-mono text-sm bg-line/40 px-2 py-1 rounded">/api/status</code>.</p>

      <Card>
        {Object.entries(s.checks).map(([name, c]) => (
          <div key={name} className="flex items-center justify-between p-5 border-b border-line/40 last:border-0">
            <div>
              <p className="font-medium capitalize">{name}</p>
              <p className="text-sm text-slate">{c.detail ?? (c.ok ? "operational" : "not operational")}</p>
            </div>
            <div className="flex items-center gap-3">
              {typeof c.latencyMs === "number" && <span className="text-xs font-mono text-muted">{c.latencyMs}ms</span>}
              <span className={`h-3 w-3 rounded-full ${c.ok ? "bg-sage" : "bg-coral"}`} />
            </div>
          </div>
        ))}
      </Card>

      <p className="mt-6 text-xs text-muted">Status auto-refreshes every 30 seconds. For incidents and historical uptime, see <a href="https://status.pawledger.org" className="underline">status.pawledger.org</a> (when configured).</p>
    </div>
  );
}
