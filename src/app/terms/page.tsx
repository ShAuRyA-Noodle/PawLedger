import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-lg text-slate">
      <Badge variant="outline" className="mb-4">Terms of service</Badge>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Terms</h1>
      <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2 className="font-display text-2xl text-ink mt-10">1. About these terms</h2>
      <p>PawLedger is operated by PawLedger Pvt. Ltd. ("we", "us"). By using the platform you agree to these terms. If you don't, please don't use the platform.</p>

      <h2 className="font-display text-2xl text-ink mt-10">2. The platform</h2>
      <p>We connect donors with verified animal welfare organisations ("shelters"). We facilitate payments to shelters and provide reporting tools. We are not a charitable organisation ourselves; donations are made <em>to</em> partner shelters. 80G receipts are issued by the recipient shelter.</p>

      <h2 className="font-display text-2xl text-ink mt-10">3. Fees</h2>
      <p>Platform fee: 4% of each donation. Payment processing fees pass through at cost (Razorpay/Stripe rates). All fees are itemised on the public ledger and on every receipt.</p>

      <h2 className="font-display text-2xl text-ink mt-10">4. Recurring sponsorships</h2>
      <p>You can pause, change tier, swap animals, or cancel any time from your dashboard. Cancellations take effect at the end of the current billing period unless you request immediate effect. We use FTC-style click-to-cancel: same number of clicks to cancel as to sign up. No phone calls required.</p>

      <h2 className="font-display text-2xl text-ink mt-10">5. Refunds</h2>
      <p>Donations are generally non-refundable since they are immediately committed to the shelter. We will refund duplicate or fraudulent charges, and at our discretion if a shelter is found to have misrepresented itself. Contact <a href="mailto:hello@pawledger.org" className="text-marigold-deep">hello@pawledger.org</a>.</p>

      <h2 className="font-display text-2xl text-ink mt-10">6. Tax deductibility</h2>
      <p>Donations to Indian-registered shelters with valid 80G are deductible up to 50% of the donation amount under Section 80G of the Income Tax Act, subject to applicable limits. We auto-issue compliant receipts. Always consult your tax advisor.</p>

      <h2 className="font-display text-2xl text-ink mt-10">7. Shelter responsibilities</h2>
      <p>Shelters are responsible for the accurate use of donated funds, timely posting of updates, vet record uploads, and outcome reporting. Shelters that violate our terms may be removed and remaining funds re-routed to alternative verified shelters.</p>

      <h2 className="font-display text-2xl text-ink mt-10">8. Prohibited use</h2>
      <p>No fake animal listings. No money laundering. No fundraising for activities outside animal welfare. No commercial breeding operations. No abuse, harassment, or hate speech.</p>

      <h2 className="font-display text-2xl text-ink mt-10">9. Liability</h2>
      <p>The platform is provided "as is". We make commercially reasonable efforts to verify shelters and prevent fraud, but we are not liable for the conduct of third parties. Our maximum liability is capped at the total fees you've paid us in the prior 12 months.</p>

      <h2 className="font-display text-2xl text-ink mt-10">10. Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the courts of Bengaluru, Karnataka.</p>
    </div>
  );
}
