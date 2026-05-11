import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-lg text-slate">
      <Badge variant="outline" className="mb-4">Privacy notice</Badge>
      <h1 className="font-display text-5xl tracking-tight text-ink mb-2">Privacy</h1>
      <p className="text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2 className="font-display text-2xl text-ink mt-10">Data fiduciary</h2>
      <p>PawLedger Pvt. Ltd. is the data fiduciary for the platform. The DPO can be reached at <a href="mailto:dpo@pawledger.org" className="text-marigold-deep">dpo@pawledger.org</a>.</p>

      <h2 className="font-display text-2xl text-ink mt-10">What we collect</h2>
      <ul>
        <li>Account: email, name, optional phone, optional city, password hash, locale.</li>
        <li>Donation: amount, currency, payment processor charge ID, fee breakdown, the animal/shelter the donation is tied to.</li>
        <li>Operational: IP address (for fraud detection only), user agent, referring URL.</li>
        <li>Communication preferences: marketing opt-in/out, channel preferences.</li>
      </ul>

      <h2 className="font-display text-2xl text-ink mt-10">What we do <em>not</em> collect</h2>
      <ul>
        <li>Card or UPI account details — Stripe and Razorpay handle these directly. We never see them.</li>
        <li>Aadhaar numbers (we use Aadhaar offline XML for shelter KYC only, never for donors).</li>
      </ul>

      <h2 className="font-display text-2xl text-ink mt-10">Who we share with</h2>
      <ul>
        <li><strong>Recipient shelters</strong>: name, donation amount (so they can issue 80G receipt), and your sponsorship history with that specific shelter.</li>
        <li><strong>Payment processors</strong> (Razorpay, Stripe, Cashfree): only what's needed to process your payment.</li>
        <li><strong>Email providers</strong> (Resend, Loops): your email + name to deliver receipts and updates.</li>
        <li><strong>Tax authorities</strong>: aggregate donation totals as required by law (Section 80G reporting).</li>
        <li><strong>Never</strong>: we never sell or rent your data to third parties. Zero exceptions.</li>
      </ul>

      <h2 className="font-display text-2xl text-ink mt-10">Your rights (DPDP / GDPR)</h2>
      <ul>
        <li>Access — download all your data from your dashboard.</li>
        <li>Correction — edit your profile any time.</li>
        <li>Erasure — delete your account; donation records are retained as required by tax law (anonymised after retention period).</li>
        <li>Portability — JSON export of all your data.</li>
        <li>Withdraw consent — unsubscribe from marketing in one click.</li>
      </ul>

      <h2 className="font-display text-2xl text-ink mt-10">Retention</h2>
      <p>Account data: until you delete it. Donation receipts and tax records: 8 years (income tax act). Logs: 90 days.</p>

      <h2 className="font-display text-2xl text-ink mt-10">Security</h2>
      <p>TLS for all traffic. AES-256 at rest. PCI SAQ A self-attestation with quarterly ASV scans. Secrets rotated quarterly. Breach notification within 72 hours to the Data Protection Board and affected users.</p>

      <h2 className="font-display text-2xl text-ink mt-10">Cookies</h2>
      <p>Strictly necessary cookies for sign-in. Analytics and product cookies require explicit opt-in via the cookie banner. We use PostHog (EU region) for product analytics.</p>

      <h2 className="font-display text-2xl text-ink mt-10">Contact</h2>
      <p>Questions or to exercise your rights: <a href="mailto:privacy@pawledger.org" className="text-marigold-deep">privacy@pawledger.org</a> or DPO at <a href="mailto:dpo@pawledger.org" className="text-marigold-deep">dpo@pawledger.org</a>.</p>
    </div>
  );
}
