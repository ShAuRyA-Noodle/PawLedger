export type Post = { title: string; excerpt: string; date: string; minutes: number; author: string; body: string };

export const POSTS: Record<string, Post> = {
  "introducing-pawledger": {
    title: "Why we built PawLedger",
    excerpt: "After years of watching the most kind-hearted donors get burned by opaque charities, we decided trust needed to be cryptographic — not just claimed.",
    date: "2026-05-12", minutes: 6, author: "PawLedger team",
    body: `India has somewhere between fifteen and seventy million street dogs. The official 2019 livestock census put it at fifteen million; most experienced rescuers think the real number is at least four times higher. Either way, it's the largest population of street animals on earth.

It's also the worst-served by donor capital. Indian retail giving has crossed ₹37,000 crore a year. The animal-welfare slice is small, and almost none of it flows recurringly. Most platforms — Ketto, Milaap, ImpactGuru — were built for one-time medical campaigns. Most shelters survive hand-to-mouth on Instagram virality and one-off cheques.

## The trust crisis is real

Meanwhile, big animal charities globally have a trust problem. CBS exposed ASPCA's spending. HSUS paid a $15.75M RICO settlement. In 2024, researchers found 1,022 fake animal-rescue accounts on Instagram alone, generating 572 million views. The most kind-hearted donors got burned the most.

> Every major animal charity has had a public spending scandal in the last five years.

We think this is a software-shaped hole.

## Three commitments

PawLedger is a recurring-sponsorship platform built around three commitments:

**One animal, one sponsor.** You pick a specific rescued animal — by name, with photos and a rescue story — and you commit ₹100, ₹300, or ₹500 a month for their care. You see their progress. You're not "supporting our cause" in the abstract; you're sponsoring **them**.

**Every rupee on the public ledger.** When you donate, an entry appears on a public, append-only, hash-chained ledger. When the shelter buys food, a vet visit, vaccinations — entries appear with vendor name, amount, and photo proof. If anyone tampers with a past entry, the chain visibly breaks.

**Verified shelters only.** Every shelter is registered (Section 8 / Trust / Society / 501c3), 80G-current, AWBI-recognised (or on path), and KYC'd. We re-verify quarterly. If anything goes wrong, anyone can file a public complaint that resolves in public.

We charge 4% to keep the lights on. Payment processing fees pass through at cost. Everything else goes to the shelter.

## What we are not

We're not a pet adoption marketplace (Petfinder owns that, well). We don't do crypto donations (regulatory ambiguity in India). We don't accept foreign donations into India (FCRA Bill 2026 makes that risky right now). We don't run a shelter ourselves — we partner with the people who already do this work, every day, on the ground.

Now go [pick an animal](/animals).`,
  },

  "hash-chained-ledger-explained": {
    title: "How a SHA-256 ledger keeps a charity honest",
    excerpt: "A 6-minute primer on hash chains, why they're not blockchain (and why that's good), and how to verify our chain yourself.",
    date: "2026-05-18", minutes: 7, author: "PawLedger engineering",
    body: `Most charity transparency reports are PDFs. PDFs can be edited, regenerated, and quietly republished. There's no way to know if last quarter's numbers match the original. That's a problem when public trust hinges on the document being unaltered.

We solved this with a tiny, ancient idea from cryptography: the **hash chain**.

## What it is

When you donate ₹500 on PawLedger, a row gets written to our ledger table. The row contains: shelter, animal, amount, vendor (where applicable), and the full set of fields. Then we compute a SHA-256 hash of the row's contents **plus the hash of the previous row**. We store that as the row's hash, and the previous hash as \`prev_hash\`.

That's it. That's the whole thing.

> Every entry's hash includes the hash of the entry before it. So editing any past entry breaks every entry after it — visibly.

## Why this matters

If a malicious admin tries to silently delete a ₹50,000 expense from three months ago, every entry made since then would no longer hash correctly. Anyone running our \`verify\` endpoint — \`/api/ledger/verify/[shelter]\` — would see the chain break and know exactly which block.

This is the same primitive blockchains use. The difference: blockchains add consensus and a token economy on top, both of which add cost (fees, latency, environmental impact, regulatory risk in India) and add nothing for our use case. We want tamper evidence, not distributed consensus.

## How to verify yourself

Pick any shelter on [/shelters](/shelters). Hit \`/api/ledger/verify/[shelter-id]\`. You'll get JSON back:

\`\`\`
{ "chain_valid": true, "head": "a3f7c2…", "verified_at": "2026-05-18T..." }
\`\`\`

If \`chain_valid\` is false, we have a problem and we'd want to know about it as much as you do.

## What we'd add later

Two upgrades on the roadmap:
- **Weekly head anchoring** — publish each shelter's chain head to a public Bitcoin OP_RETURN once a week. Total cost about $5/week. Adds external attestation without adopting a full blockchain.
- **Independent verifier program** — invite journalists and audit firms to run our verifier on a schedule and publish their results.

## Why we're talking about this

Trust is hard to earn back once you lose it. We'd rather be boring and verifiable than exciting and trust-me. The ledger is the moat.`,
  },

  "street-rescue-india-2026": {
    title: "The state of street animal rescue in India",
    excerpt: "15 million dogs by the official census. 60+ million by ground estimates. Rabies eradication 2030 deadline. Where the gaps are.",
    date: "2026-05-25", minutes: 9, author: "PawLedger field notes",
    body: `India has more street dogs than any country on earth. The 2019 livestock census put the number at 15 million; rescue operators in Delhi, Bengaluru, and Mumbai all say the real figure is 4–5x that. Either way, the math is uncomfortable.

The Indian government has committed to eliminating dog-mediated rabies by 2030 — a WHO-aligned deadline. That's four years from now. Meeting it requires sterilising and vaccinating somewhere between 30 and 50 million dogs in a window where the country has roughly 1,200 functional Animal Birth Control (ABC) centres.

The math gets harder, not easier.

## Where the bottleneck actually is

It is not a lack of compassion. India has a lifelong cultural tradition of street animal feeding; you'll see leftover roti and dahi at city junctions across the country. Every neighbourhood has at least one elderly aunty whose afternoon includes feeding the local pack.

The bottleneck is **infrastructure capital**:
- ABC centres need clinical space, surgical equipment, kennels, post-op recovery, transport, and trained staff
- Staff salaries are recurring; equipment is depreciating; nothing scales without predictable monthly cash flow
- Shelters survive on Instagram virality (high-variance) and one-off corporate cheques (lumpy)

## What recurring sponsorship actually unlocks

The single biggest difference between an animal welfare org with monthly recurring revenue and one without is **planning horizon**.

> A shelter with ₹2 lakh/month in committed sponsorships can hire one more vet. One more vet means 30 more sterilisations a week. That's 1,500 a year per shelter.

This is the lever PawLedger is built around. Not "give once when an Instagram reel goes viral", but "₹300 every month, automatically, for the next year". Multiplied across 50,000 donors and 100 shelters, that's how the rabies-2030 number stops feeling impossible.

## What ground rescue looks like

A typical SOS in Bengaluru, May 2026:
- Citizen spots a hit-by-vehicle case at 2:14pm
- Photo + GPS submitted via PawLedger SOS in 40 seconds
- Nearest verified shelter (within 4 km) gets a ping; their dispatcher accepts in 11 minutes
- Two-wheeler ambulance arrives in 26 minutes; on-scene splint and transport to vet
- Surgery cost: ₹4,200; PawLedger SOS micro-donation page raises it in under 8 hours from 31 donors
- Animal recovers; outcome posted publicly within 5 days

This is the loop we're scaling.

## What we still need

- **More verified shelters** in tier-2 and tier-3 cities (we're heaviest in Bengaluru, Delhi, Mumbai, Chennai)
- **Reliable ambulance partners** in cities where shelters can't run their own
- **Corporate CSR commitments** that fund infrastructure capital, not just operating costs
- **Vet partnerships** for rate-card discounts on shelter caseload

If you run, fund, or know a shelter we should onboard, please [apply](/for-shelters/apply) or [introduce us](/contact).`,
  },
};
