import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "For shelters" };

export default function ForSheltersPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <Badge variant="marigold" className="mb-6">For animal shelters</Badge>
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              Recurring funding.<br/>Built for the way you actually work.
            </h1>
            <p className="mt-6 text-lg text-slate max-w-xl leading-relaxed">
              List the animals in your care. We connect them with monthly sponsors. You post weekly photo updates. We handle payments, tax receipts, and compliance reporting. You focus on the animals.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="marigold" size="xl">
                <Link href="/for-shelters/apply">Apply to join →</Link>
              </Button>
              <Button asChild variant="ghost" size="xl">
                <Link href="/contact">Talk to a human</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="p-8">
              <h2 className="font-display text-2xl mb-6">What you get</h2>
              <ul className="space-y-4 text-sm text-slate">
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>Recurring monthly sponsorships starting from ₹100/donor</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>Auto-generated 80G receipts for every donor</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>T+1 payouts via Razorpay (T+0 instant for SOS via Cashfree)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>CSR-1 compliant reports for corporate donors</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>Photo + video CMS for animal updates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>Public ledger that builds your trust score</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sage">✓</span>
                  <span>Embed widgets for your own website</span>
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-line text-xs text-muted">
                Platform fee: <span className="text-ink font-mono">4%</span> of donations. Payment processing fees pass through at cost.
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <h2 className="font-display text-4xl tracking-tight mb-12">Requirements</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-display text-2xl mb-4">India shelters</h3>
              <ul className="space-y-3 text-sm text-slate">
                <li>• Section 8 Company, Registered Trust, or Society</li>
                <li>• Valid 12A registration</li>
                <li>• Valid 80G certificate (we verify expiry quarterly)</li>
                <li>• AWBI recognition <em>(preferred — required within 12 months of joining)</em></li>
                <li>• 2+ verifiable references (other shelters, AWBI office, vet clinics)</li>
                <li>• Photo of premises with at least 5 animals</li>
                <li>• Bank account in the registered legal name</li>
                <li>• Video call with our team before first payout {">"}  ₹25,000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display text-2xl mb-4">US shelters</h3>
              <ul className="space-y-3 text-sm text-slate">
                <li>• 501(c)(3) status (or fiscal sponsorship via PPF, HCB)</li>
                <li>• Listed in IRS Pub 78 / Tax Exempt Organization Search</li>
                <li>• Form 990 history available via GuideStar/Candid</li>
                <li>• EIN verification + principal ID via Persona</li>
                <li>• State charitable solicitation registration where applicable</li>
                <li>• Bank account in the registered legal name</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h2 className="font-display text-4xl tracking-tight mb-4">Onboarding takes 5–10 days</h2>
        <p className="text-slate mb-8">From application to first published animal profile.</p>
        <Button asChild variant="marigold" size="xl">
          <Link href="/for-shelters/apply">Apply now →</Link>
        </Button>
      </section>
    </div>
  );
}
