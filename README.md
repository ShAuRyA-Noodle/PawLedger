# PawLedger

> **Compassion you can prove.**
> A trust-first, recurring sponsorship platform for animal welfare. Donors sponsor named individual animals monthly. Every rupee tagged on a public, hash-chained ledger. India primary, US secondary. With Street SOS rescue dispatch + Corporate CSR layer.

Built with Next.js 16, TypeScript, Tailwind 4, Drizzle ORM, Better Auth, Razorpay, Stripe, Postgres (Neon), Resend, Cloudflare R2.

---

## Quick start

```bash
pnpm install
cp .env.example .env       # fill in values (see docs/LAUNCH_CHECKLIST.md)
pnpm db:push               # apply schema to Postgres
pnpm db:seed               # populate demo data (12 shelters, 60 animals, 250 donations)
pnpm dev                   # http://localhost:3000
```

Demo admin: `admin@pawledger.org` (use magic link in dev — link prints to console if RESEND_API_KEY isn't set).

---

## Package scripts

| Script | Use |
|---|---|
| `pnpm dev` | start dev server |
| `pnpm build` | production build |
| `pnpm typecheck` | TS-only sanity check |
| `pnpm db:generate` | generate Drizzle migrations from schema |
| `pnpm db:push` | apply schema to dev DB (no migration files) |
| `pnpm db:seed` | seed demo data |
| `pnpm db:studio` | open Drizzle Studio |

---

## What's built (40 features across 7 surfaces)

See [`docs/PRD.md`](./docs/PRD.md) for the full feature list, and [`docs/LAUNCH_CHECKLIST.md`](./docs/LAUNCH_CHECKLIST.md) for what you need to provide on wake-up to go live.

Highlights:
- Marketing landing + animals browse + animal profile + sponsor flow (Razorpay + Stripe)
- Donor dashboard, shelter dashboard, admin panel
- Public, SHA-256-chained transparency ledger with verify endpoint + CSV export
- Razorpay + Stripe webhook handlers wired to ledger
- 80G receipt PDF generator
- React Email templates (thank-you, weekly update, card expiry)
- SOS rescue (public report + listing)
- CSR portal
- Embed widget (iframe + JS)
- PWA manifest, robots.txt, sitemap
- Seed script (12 shelters, 60 animals, 250 donations, ledger entries)

---

## Tech stack (May 2026 defaults)

| Layer | Pick |
|---|---|
| Framework | Next.js 16 + App Router |
| Language | TypeScript 5.9 |
| Styling | Tailwind 4 + OKLCH palette |
| Auth | Better Auth |
| DB | Postgres on Neon |
| ORM | Drizzle |
| Payments (IN) | Razorpay Route + Subscriptions |
| Payments (US) | Stripe Connect Express + Subscriptions |
| Payouts (instant SOS) | Cashfree Payouts API |
| Image hosting | Cloudflare R2 + Images |
| Email | Resend + React Email |
| Cron | Upstash QStash |
| Background jobs | Trigger.dev |
| Search | Meilisearch |
| Maps | MapLibre GL JS + OSM |
| Analytics | PostHog (EU region) |
| KYC | IDfy (IN) + Persona (US) |
| Hosting | Vercel |

Full rationale in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## Repo layout

```
pawledger/
├── src/
│   ├── app/                  # Next.js App Router routes
│   ├── components/           # UI + brand
│   ├── db/                   # schema + seed
│   ├── lib/                  # auth, money, ledger, payments, receipts
│   └── emails/               # React Email templates
├── docs/                     # PRD, ARCHITECTURE, BRAND, LAUNCH_CHECKLIST
├── research/                 # market, UX, legal research reports
├── outreach/                 # cold-outreach templates, PR kit, investor one-pager
└── drizzle/                  # generated migrations (after first `db:generate`)
```

---

## Brand decisions locked

- **Name**: PawLedger (trademark check pending)
- **Tagline**: "Compassion you can prove."
- **Pricing**: 4% platform fee + payment processing pass-through
- **Tier ladder (INR)**: ₹100 / ₹300 / ₹500 / ₹1,000 — default ₹300
- **Tier ladder (USD)**: $5 / $25 / $50 — default $25
- **Legal model**: For-profit Pvt Ltd platform routing donations to partner Section 8 NGOs (GoFundMe / Givebutter pattern). Shelters issue 80G; we don't.
- **Geographic scope**: India primary, US secondary. No FCRA at launch.
- **Trust wedge**: SHA-256 hash-chained per-shelter ledger, append-only, publicly verifiable.

---

## Brutal honesty up-top

This codebase ships a world-class technical product. It does **not** ship $200–300k MRR — that comes from execution + capital + time. See [`docs/LAUNCH_CHECKLIST.md`](./docs/LAUNCH_CHECKLIST.md) §7 for what code can and cannot do.

---

## License

Proprietary. © PawLedger Pvt. Ltd.
