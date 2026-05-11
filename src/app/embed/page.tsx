import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Embed widget" };

export default function EmbedPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <Badge variant="outline" className="mb-4">Embed widget</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-4">Add PawLedger to your site.</h1>
      <p className="text-slate text-lg max-w-xl mb-12">For vet clinics, pet brands, content creators. Free for nonprofits. ₹999/mo for commercial partners.</p>

      <Card className="p-8 mb-8">
        <h2 className="font-display text-2xl mb-4">Drop-in iframe (one line)</h2>
        <pre className="bg-charcoal text-cream p-4 rounded-lg text-xs overflow-x-auto">
{`<iframe
  src="https://pawledger.org/embed/widget?animal=AUTO&theme=light"
  width="360" height="520"
  style="border:0;border-radius:16px"
  title="Sponsor a rescued animal via PawLedger"
></iframe>`}
        </pre>
        <p className="text-xs text-muted mt-3">Set <code className="bg-line/40 px-1 rounded">animal=AUTO</code> for a featured animal that rotates daily, or <code className="bg-line/40 px-1 rounded">animal=&lt;slug&gt;</code> to feature a specific one.</p>
      </Card>

      <Card className="p-8 mb-8">
        <h2 className="font-display text-2xl mb-4">JS bundle (more control)</h2>
        <pre className="bg-charcoal text-cream p-4 rounded-lg text-xs overflow-x-auto">
{`<div id="pawledger-widget"></div>
<script src="https://cdn.pawledger.org/embed/v1.js" async></script>
<script>
  window.pawledger = {
    target: '#pawledger-widget',
    animal: 'bruno-bengaluru',  // or 'AUTO'
    theme: 'light',             // 'light' | 'dark'
    accentColor: '#f0a838',
    onSponsorComplete: (data) => {
      console.log('New sponsor:', data);
      // your analytics
    }
  };
</script>`}
        </pre>
      </Card>

      <Card className="p-8">
        <h2 className="font-display text-2xl mb-4">Revenue share (commercial partners)</h2>
        <p className="text-slate mb-4">If you're a vet clinic, pet brand, or content creator wanting to embed:</p>
        <ul className="space-y-2 text-sm text-slate mb-6">
          <li>• <strong>Free</strong> for nonprofits + AWBI-recognised orgs</li>
          <li>• <strong>₹999/mo</strong> for commercial partners (clinics, brands, creators)</li>
          <li>• Optional 5% revenue share on donations driven through your embed</li>
          <li>• Custom branding + white-label available on Enterprise</li>
        </ul>
        <Button asChild variant="marigold"><Link href="/contact">Get an embed key →</Link></Button>
      </Card>
    </div>
  );
}
