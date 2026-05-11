import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <Badge variant="outline" className="mb-4">Contact</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-8">Get in touch</h1>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-xl mb-2">Donors</h2>
          <p className="text-sm text-slate">Questions about a sponsorship, receipt, or update? Reply to any email we've sent you, or write to <a href="mailto:hello@pawledger.org" className="text-marigold-deep underline">hello@pawledger.org</a>. We reply within 1 business day.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl mb-2">Shelters</h2>
          <p className="text-sm text-slate">For onboarding, payouts, compliance, or a bug in your dashboard: <a href="mailto:shelters@pawledger.org" className="text-marigold-deep underline">shelters@pawledger.org</a>. We're a small team; expect a human reply.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl mb-2">Corporate / CSR</h2>
          <p className="text-sm text-slate">Pricing, demo, sample CSR-1 packet: <a href="mailto:csr@pawledger.org" className="text-marigold-deep underline">csr@pawledger.org</a>. We typically reply within a few hours.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl mb-2">Press / partnerships</h2>
          <p className="text-sm text-slate"><a href="mailto:press@pawledger.org" className="text-marigold-deep underline">press@pawledger.org</a> — we have a brand kit + founder bio ready.</p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-xl mb-2">Security disclosure</h2>
          <p className="text-sm text-slate">Found a vulnerability? Please report responsibly to <a href="mailto:security@pawledger.org" className="text-marigold-deep underline">security@pawledger.org</a>. We acknowledge within 48 hours.</p>
        </Card>
      </div>
    </div>
  );
}
