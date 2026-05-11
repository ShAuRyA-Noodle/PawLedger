import Link from "next/link";
import { LogoMark } from "./logo";
import { NewsletterSignup } from "./newsletter-signup";

const COLS = [
  {
    title: "Donate",
    items: [
      { href: "/animals", label: "Browse animals" },
      { href: "/sos", label: "Report a street animal" },
      { href: "/csr", label: "Corporate CSR" },
      { href: "/embed", label: "Embed widget" },
    ],
  },
  {
    title: "Trust",
    items: [
      { href: "/transparency", label: "Public ledger" },
      { href: "/transparency#impact", label: "Impact dashboard" },
      { href: "/transparency#financials", label: "Annual report" },
      { href: "/complaints", label: "File a complaint" },
    ],
  },
  {
    title: "About",
    items: [
      { href: "/about", label: "Our story" },
      { href: "/team", label: "Team" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/dpdp", label: "DPDP & data rights" },
      { href: "/security", label: "Security" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-line/70 bg-cream">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2 max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-2xl tracking-tight">pawledger</span>
            </Link>
            <p className="mt-4 text-sm text-slate leading-relaxed">
              Sponsor a rescued animal monthly. Every rupee tagged on a tamper-evident public ledger. India's first transparent recurring animal-welfare platform.
            </p>
            <div className="mt-6 flex gap-3 text-xs text-muted font-mono">
              <span>80G</span>
              <span aria-hidden>·</span>
              <span>CSR-1</span>
              <span aria-hidden>·</span>
              <span>AWBI partner</span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Monthly impact digest</p>
              <NewsletterSignup source="footer" />
            </div>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="font-medium text-ink mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-3 text-sm text-slate">
                {col.items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-ink transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-line flex flex-col md:flex-row justify-between gap-4 text-xs text-muted">
          <div>© {year} PawLedger. India's transparent animal-welfare platform.</div>
          <div className="font-mono">build {year}.05 · ledger v1.0 · donor.fund</div>
        </div>
      </div>
    </footer>
  );
}
