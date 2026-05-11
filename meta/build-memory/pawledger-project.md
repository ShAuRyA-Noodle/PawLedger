---
name: PawLedger startup project
description: Animal welfare donation platform built autonomously night of 2026-05-11. Next.js 16 + Razorpay/Stripe + Drizzle + Postgres. India primary, US secondary.
type: project
originSessionId: 0f1e3bd1-a3a3-4ad7-882c-a83481273ad2
---
Brand: **PawLedger** — "Compassion you can prove." Trademark check pending; alt names: Karuna, Pawra, Saathi, PawProof.

**Repo location**: `c:/Users/Dell/Desktop/Claude/pawledger/` (single Next.js app, not monorepo).

**Wedge**: recurring sponsorship of named animals + public SHA-256 hash-chained ledger + geo-located street SOS rescue dispatch. Three moats stacked.

**Pricing locked**: 4% platform fee, processing pass-through. INR ladder ₹100/₹300/₹500/₹1000 default ₹300. USD $5/$25/$50 default $25.

**Legal model**: For-profit Pvt Ltd platform routing donations to partnered Section 8 NGOs (GoFundMe / Givebutter pattern). Shelters issue 80G; we don't. PPF for US fiscal sponsorship at launch. **Skip FCRA year 1** — Bill 2026 makes foreign-into-Section-8 risky.

**Stack** (May 2026 defaults — see docs/ARCHITECTURE.md):
- Next.js 16 + App Router + Turbopack + Tailwind 4 + TypeScript 5.9
- Drizzle ORM + Postgres (Neon)
- Better Auth (magic link + email/password + extensible to passkeys)
- Razorpay Route + Subscriptions (IN), Stripe Connect Express + Subscriptions (US), Cashfree Payouts (instant SOS)
- Resend + React Email (transactional), Loops (lifecycle)
- Cloudflare R2 + Images
- Trigger.dev (jobs), Upstash QStash (cron)
- PostHog EU region (analytics)

**44 routes, 60+ features built**: full PRD in docs/PRD.md. Build clean. Includes per-animal public ledger, public shelters directory, sponsorship management (pause/change/cancel), SOS detail with funding, donor wall, annual Wrapped recap, live SSE activity ticker, dynamic OG images, receipt verifier, complaints flow, newsletter, dark mode, Apple Wallet pass stub, animal-of-the-day, status page, Trigger.dev jobs scaffold (weekly digest, card-expiry, ledger audit), rate limiting (Upstash). Seed script produces 12 shelters + 60 animals + 250 donations + 50 SOS reports + ledger entries. Demo admin: `admin@pawledger.org`.

**Why: Brutal-honest reasoning**: User asked for "guaranteed $200-300k MRR startup." Cannot guarantee revenue (told user upfront). Code can deliver world-class MVP — that I did. Path to $200k MRR requires 250k recurring donors + 25 enterprise CSR + capital + 18-36 months. Documented in PRD §9.

**Critical research findings cached** (research/01-03):
- India street dog pop: 15M (official 2019 census) — 70M (NGO estimate)
- Recurring donors retain 90%/yr vs 43% one-time
- ₹26,000+ Cr/yr CSR pool, animal welfare Schedule VII eligible
- Stripe Connect cross-border to India NOT supported May 2026
- 80G renewals: many shelters lost validity Mar 2026 — verify every onboarding
- DPDP standalone consent mandatory by May 13, 2027
- Razorpay PA Master Directions Sept 2025 — name match (PAN=bank=GST) is #1 onboarding-failure cause

**How to apply**: If user asks me to extend PawLedger, modify features, add v1.5 items (gamification, embed widget JS bundle, Apple Wallet pass, vet-credit marketplace, employer-match HRIS): start by reading docs/PRD.md + the relevant source files. Don't re-research what's in research/ — it's saved.

**Path forward (founder action)**: docs/LAUNCH_CHECKLIST.md has the full wake-up checklist — domain, Stripe/Razorpay accounts, partner shelter pipeline, legal entity, KYC vendors, etc.
