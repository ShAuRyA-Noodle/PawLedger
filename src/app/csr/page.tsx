import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";

export const metadata = { title: "Corporate CSR" };

export default function CSRPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <Badge variant="marigold" className="mb-4">For corporate CSR</Badge>
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight leading-[1.05]">
              CSR that you can actually <em className="not-italic text-marigold-deep">prove</em>.
            </h1>
            <p className="mt-6 text-lg text-slate max-w-xl leading-relaxed">
              Section 135 of the Companies Act mandates 2% of net profits to CSR. Animal welfare is a Schedule VII eligible category. We make it easy to allocate CSR budget across vetted shelters and generate Form CSR-2 / CSR-1 compliant reports — with photo proof of impact your stakeholders can actually feel.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="marigold" size="xl"><Link href="/csr/contact">Talk to our team →</Link></Button>
              <Button asChild variant="ghost" size="xl"><Link href="/csr/sample-report">See a sample report</Link></Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card className="p-8 space-y-6">
              <h2 className="font-display text-2xl">Tiers</h2>
              {[
                { name: "Pilot", price: "Free", desc: "Single shelter, ₹1L pledge cap, basic reports", contact: "Self-serve" },
                { name: "Growth", price: "₹2L/yr", desc: "Up to 5 shelters, ₹50L pledge, branded quarterly reports, CSR-1 + CSR-2 paperwork", contact: "Onboarded by founder" },
                { name: "Enterprise", price: "Custom", desc: "Unlimited shelters, dedicated CSM, custom dashboards, API + webhook, SAML SSO, employee match", contact: "Founder-led" },
              ].map(t => (
                <div key={t.name} className="border-b border-line last:border-0 pb-6 last:pb-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-display text-xl">{t.name}</h3>
                    <span className="font-mono text-sm">{t.price}</span>
                  </div>
                  <p className="text-sm text-slate">{t.desc}</p>
                  <p className="text-xs text-muted mt-1">{t.contact}</p>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h2 className="font-display text-4xl tracking-tight mb-12">By the numbers</h2>
          <div className="grid sm:grid-cols-4 gap-8">
            <Stat label="CSR pool / year" value="₹26,000+ Cr" emphasis hint="MCA-mandated, FY 2024–25" />
            <Stat label="Animal welfare segment" value="~₹2,600 Cr" emphasis hint="Schedule VII eligible" />
            <Stat label="Compliance burden" value="Zero" emphasis hint="We file CSR-1, CSR-2, Form 10" />
            <Stat label="Reporting cadence" value="Quarterly" emphasis hint="Branded PDFs + dashboards" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h2 className="font-display text-4xl tracking-tight mb-4">15-minute intro?</h2>
        <p className="text-slate mb-8">Pricing, demo, sample report. No pressure.</p>
        <Button asChild variant="marigold" size="xl"><Link href="/csr/contact">Book a call →</Link></Button>
      </section>
    </div>
  );
}
