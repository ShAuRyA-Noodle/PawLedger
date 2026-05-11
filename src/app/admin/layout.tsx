import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/shelters", label: "Shelters" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/sos", label: "SOS dispatch" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/csr", label: "CSR" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/admin");
  const userRow = await db.select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1);
  if (userRow[0]?.role !== "platform_admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Badge variant="coral" className="mb-3">Forbidden</Badge>
        <h1 className="font-display text-4xl mb-3">Admin only</h1>
        <p className="text-slate">This area is restricted to platform admins.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-cream sticky top-16 z-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex gap-1 overflow-x-auto py-2 text-sm">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className="px-3 py-1.5 rounded-md text-slate hover:bg-line/40 hover:text-ink whitespace-nowrap transition-colors">{item.label}</Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
