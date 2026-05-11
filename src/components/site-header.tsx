import Link from "next/link";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/animals", label: "Animals" },
  { href: "/sos", label: "Street SOS" },
  { href: "/transparency", label: "Transparency" },
  { href: "/for-shelters", label: "For shelters" },
  { href: "/csr", label: "Corporate" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-ink hover:opacity-80 transition-opacity">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-xl tracking-tight">pawledger</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className="hover:text-ink transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/sign-in" className="hidden sm:inline-flex items-center text-sm text-slate hover:text-ink px-3 py-2">
            Sign in
          </Link>
          <Link
            href="/animals"
            className="inline-flex items-center rounded-pill bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal transition-colors ml-2"
          >
            Sponsor a life
          </Link>
        </div>
      </div>
    </header>
  );
}
