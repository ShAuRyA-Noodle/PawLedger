import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/confetti";

export const metadata = { title: "Thank you" };

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ session_id?: string; animal?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <Confetti />
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="font-display text-5xl tracking-tight mb-4">Thank you.</h1>
      <p className="text-lg text-slate leading-relaxed mb-10">
        Your sponsorship is set up. The shelter will post a welcome update within a week, and you'll see every rupee on the public ledger.
      </p>

      <div className="bg-card border border-line rounded-xl p-6 text-left mb-10">
        <h2 className="font-display text-xl mb-4">What happens next</h2>
        <ol className="space-y-3 text-sm text-slate">
          <li><span className="font-mono text-muted">01.</span> A receipt is on its way to your email (check spam if you don't see it).</li>
          <li><span className="font-mono text-muted">02.</span> The shelter will post a welcome update on your sponsored animal's profile within 7 days.</li>
          <li><span className="font-mono text-muted">03.</span> Every donation appears on the public ledger within 24 hours of capture.</li>
          <li><span className="font-mono text-muted">04.</span> Annual 80G receipt is emailed in January for tax filing.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="marigold" size="lg">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        {sp.animal && (
          <Button asChild variant="secondary" size="lg">
            <Link href={`/animals/${sp.animal}`}>See the animal's page</Link>
          </Button>
        )}
      </div>

      <p className="mt-12 text-sm text-slate">
        Want to share? <Link href="/animals" className="text-marigold-deep underline">Pick an animal for a friend</Link>.
      </p>
    </div>
  );
}
