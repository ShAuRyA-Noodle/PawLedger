import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Blog" };

const POSTS = [
  {
    slug: "introducing-pawledger",
    title: "Why we built PawLedger",
    excerpt: "After years of watching the most kind-hearted donors get burned by opaque charities, we decided trust needed to be cryptographic — not just claimed.",
    date: "2026-05-12",
    minutes: 6,
  },
  {
    slug: "hash-chained-ledger-explained",
    title: "How a SHA-256 ledger keeps a charity honest",
    excerpt: "A 6-minute primer on hash chains, why they're not blockchain (and why that's good), and how to verify our chain yourself.",
    date: "2026-05-18",
    minutes: 7,
  },
  {
    slug: "street-rescue-india-2026",
    title: "The state of street animal rescue in India",
    excerpt: "15 million dogs by the official census. 60+ million by ground estimates. Rabies eradication 2030 deadline. Where the gaps are.",
    date: "2026-05-25",
    minutes: 9,
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <Badge variant="outline" className="mb-3">Blog</Badge>
      <h1 className="font-display text-5xl tracking-tight mb-3">Field notes.</h1>
      <p className="text-slate mb-12">Stories from the shelters, postmortems from our build, and the occasional rant about how charity tech is broken.</p>

      <div className="space-y-6">
        {POSTS.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`}>
            <Card className="p-6 hover:shadow-floating transition-shadow">
              <p className="text-xs text-muted font-mono mb-2">{p.date} · {p.minutes} min read</p>
              <h2 className="font-display text-2xl mb-2">{p.title}</h2>
              <p className="text-slate">{p.excerpt}</p>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">Want monthly impact stories in your inbox? Subscribe in the footer.</p>
    </div>
  );
}
