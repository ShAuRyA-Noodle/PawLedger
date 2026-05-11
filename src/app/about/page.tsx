import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <Badge variant="outline" className="mb-4">About</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-8">Why we built PawLedger</h1>

      <div className="prose prose-lg text-slate space-y-6 leading-relaxed">
        <p>India has somewhere between 15 and 70 million street dogs. The official 2019 livestock census put it at 15 million — most experienced rescuers think the real number is at least 4× that. Either way, it's the largest population of street animals on earth.</p>

        <p>It's also the worst-served by donor capital. Indian retail giving has crossed ₹37,000 crore a year. The animal-welfare slice is tiny, and almost none of it flows recurringly. Most platforms — Ketto, Milaap, ImpactGuru — were built for one-time medical campaigns. Most shelters survive hand-to-mouth on Instagram virality and one-off cheques.</p>

        <p>Meanwhile, big animal charities globally have a trust problem. CBS exposed ASPCA's spending. HSUS paid a $15.75M RICO settlement. In 2024, researchers found 1,022 fake animal-rescue accounts on Instagram alone, generating 572 million views. The most kind-hearted donors got burned the most.</p>

        <p className="font-display text-2xl text-ink">We think this is a software-shaped hole.</p>

        <p>PawLedger is a recurring-sponsorship platform built around three commitments:</p>

        <ol className="space-y-4 list-decimal pl-6">
          <li><strong>One animal, one sponsor.</strong> You pick a specific rescued animal — by name, with photos and a rescue story — and you commit ₹100, ₹300, or ₹500 a month for their care. You see their progress. You're not "supporting our cause" in the abstract; you're sponsoring <em>them</em>.</li>
          <li><strong>Every rupee on the public ledger.</strong> When you donate, an entry appears on a public, append-only, hash-chained ledger. When the shelter buys food, a vet visit, vaccinations, an entry appears with vendor name + amount + photo proof. If anyone tampers with a past entry, the chain visibly breaks.</li>
          <li><strong>Verified shelters only.</strong> Every shelter is registered (Section 8 / Trust / Society / 501c3), 80G-current, AWBI-recognised (or on path), and KYC'd. We re-verify quarterly. If anything goes wrong, anyone can file a public complaint that resolves in public.</li>
        </ol>

        <p>We charge 4% to keep the lights on. Payment processing fees pass through at cost. Everything else goes to the shelter.</p>

        <p className="font-display text-2xl text-ink mt-12">What we are not</p>

        <p>We're not a pet adoption marketplace (Petfinder owns that, well). We don't do crypto donations (regulatory ambiguity in India). We don't accept foreign donations into India (FCRA Bill 2026 makes that risky right now). We don't run a shelter ourselves — we partner with the people who already do this work, every day, on the ground.</p>

        <Button asChild variant="marigold" size="lg" className="mt-10">
          <Link href="/animals">Pick an animal to sponsor →</Link>
        </Button>
      </div>
    </div>
  );
}
