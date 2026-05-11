# PawLedger — Architecture

## Stack (May 2026 defaults, research-backed)

| Layer | Pick | Why |
|---|---|---|
| Framework | Next.js 15 App Router | RSC streaming, edge-friendly, dominant ecosystem |
| Language | TypeScript 5.9+ | strict null, satisfies, const generics |
| Styling | Tailwind v4 + CSS variables | smaller runtime, native cascade layers, OKLCH |
| Components | shadcn/ui (latest) | unstyled primitives + Radix, fully owned code |
| Auth | Better Auth | 2FA + passkeys + organizations + RBAC out-of-box; Auth.js maintainers point new projects here |
| DB | Postgres on Neon | scale-to-zero, branching, free tier; bursty around campaigns |
| ORM | Drizzle | edge-friendly bundle, SQL-close, faster cold starts than Prisma 7 |
| Payments (India) | Razorpay Route + Subscriptions | NGO onboarding fast, UPI AutoPay + eMandate + cards |
| Payments (US) | Stripe Connect Express + Subscriptions | destination charges + on_behalf_of, 2.2% nonprofit rate possible |
| Payouts (instant SOS) | Cashfree Payouts API | T+0 IMPS/UPI/bank, best in IN for emergency disbursements |
| Image hosting | Cloudflare R2 + Cloudflare Images | zero egress, $5/100k delivered, transforms built-in |
| Email transactional | Resend + React Email | best DX, tx-only, no marketing co-mingling |
| Email lifecycle | Loops | non-tech editable sequences |
| Cron | Upstash QStash | survives Vercel deploys, edge-compat, 500 msg/d free |
| Background jobs | Trigger.dev | Apache 2.0, $10/mo entry, debugging UI |
| Search | Meilisearch (self-host or Cloud) | typo-tolerant, Rust, MIT |
| Maps | MapLibre GL JS + OSM via Protomaps | free tiles + Mapbox geocoding fallback ($0.75/1k) |
| Analytics | PostHog (EU region) | funnels + replay + flags + A/B in one |
| KYC India | IDfy | video-KYC + PAN/Aadhaar offline XML + bank penny-drop + MCA CIN check |
| KYC US | Persona | EIN + IRS Pub 78 + GuideStar/Candid Form 990 history |
| Hosting | Vercel | Next 15 native, edge functions, image opt |
| Monorepo | pnpm + Turborepo | 1.5 build cache, native ESM |

## Repo layout

```
pawledger/
├── apps/
│   ├── web/                     # Next.js 15 — public + donor + shelter + admin (single app, route-segment auth)
│   └── workers/                 # Trigger.dev jobs (receipts, dunning, weekly digest)
├── packages/
│   ├── db/                      # Drizzle schema + migrations + seed
│   ├── ui/                      # shadcn-derived shared primitives
│   ├── emails/                  # React Email templates
│   ├── lib/                     # currency, ledger crypto, validators (Zod)
│   ├── payments/                # Razorpay + Stripe + Cashfree wrappers
│   └── kyc/                     # IDfy + Persona client wrappers
├── docs/                        # PRD, ARCHITECTURE, LAUNCH_CHECKLIST, BRAND
├── research/                    # market, UX, legal research reports
├── outreach/                    # cold-outreach templates, PR kit, investor one-pager
└── pnpm-workspace.yaml
```

## Data model (high level)

Core entities:

- **users** (donor / shelter_admin / platform_admin)
- **shelters** (org metadata, KYC status, 12A/80G/AWBI/CSR-1 cert refs, payout creds)
- **animals** (shelter_id, species, name, story, photos[], video_url, status, vet_records[])
- **animal_updates** (animal_id, type, body, media_url, scheduled_at)
- **sponsorships** (donor_id, animal_id, tier, currency, status: active/paused/cancelled, gateway_subscription_id)
- **donations** (donor_id, animal_id?, sponsorship_id?, amount, currency, gateway_charge_id, captured_at, fee_breakdown)
- **ledger_entries** (donation_id?, animal_id, kind: in/out, line_item, vendor, amount, proof_url, hash, prev_hash)
- **payouts** (shelter_id, gateway, amount, currency, status, ledger_refs[])
- **sos_reports** (reporter_phone?, lat, lng, photo_url, species, condition, status, claimed_by_shelter_id?, outcome, micro_fund_total)
- **csr_accounts** (corp_name, contact, gst, csr_pool_id)
- **complaints** (about_type: shelter/animal/donation, body, status, resolution_url)
- **audit_log** (actor_id, action, entity, before, after, ts)

Detail in `packages/db/src/schema.ts`.

## Ledger crypto (transparency)

Each `ledger_entries` row stores `prev_hash` + `hash = SHA-256(prev_hash || serialized_row)`. Per-animal chain. Tamper-evident without the cost of an actual blockchain. Public verifier endpoint exposes the latest head hash and lets anyone replay. v2 candidate: anchor weekly head hashes to a public chain (Bitcoin OP_RETURN, ~$5/wk) for external attestation.

## Auth + RBAC

Better Auth with:
- email + magic link primary
- passkeys (WebAuthn) for shelter admins (high-value accounts)
- 2FA TOTP for platform admins
- organizations plugin: shelters are orgs with members + roles
- session JWT, edge-verified

Roles: `donor`, `shelter_member`, `shelter_admin`, `platform_admin`. Route-segment middleware enforces.

## Payments

- **Razorpay**: Subscriptions for recurring (UPI AutoPay/eMandate/card), Route for split (platform fee retained, rest to shelter LinkedAccount), webhooks → ledger writer.
- **Stripe**: Subscriptions for recurring USD, Connect Express + destination charges + `on_behalf_of`, 2.2% nonprofit rate when shelter qualifies, webhooks → ledger writer.
- **Cashfree Payouts**: instant SOS disbursements (IMPS/UPI/bank), called from dispatch flow.
- All gateway events idempotent via Trigger.dev queue; double-write to ledger only after capture confirmation.

## Email lifecycle

Transactional via Resend + React Email components in `packages/emails`:
- post-donation thank-you (T+60s), card-expiry rescue (T-30/-7/-1), milestone, weekly digest, tax receipt (annual), reactivation (T+30 after cancel).

## Compliance

- **PCI**: SAQ A self-attestation; never touch raw PAN/CVV; quarterly ASV scan via SecurityMetrics ($200-500/yr).
- **DPDP / GDPR**: cookie banner with granular toggles, separate marketing opt-in, data export+delete in user settings, public privacy notice listing data fiduciary + retention + recipients, breach playbook with 72-hr notification.
- **80G**: PDF generated server-side from canonical receipt data, signed by Section 8 partner; cert validity verified at shelter onboarding via Income Tax e-filing portal.
- **CSR-1 / Form 10AB**: status pulled from MCA + Income Tax APIs (manual at v1, scraping or third-party sync at v1.5).

## Observability + ops

- Logs: structured JSON via `pino`, ingested into PostHog for product events + Axiom for application logs.
- Errors: Sentry.
- Uptime: BetterStack.
- Backups: Neon point-in-time + nightly snapshot to R2.
- Feature flags + experiments: PostHog.
- Status page: BetterStack.

## Deployment

- **Vercel** for `apps/web` (production, preview per branch).
- **Trigger.dev cloud** for workers (or self-host on Fly.io for cost).
- **Neon** for DB (scale-to-zero, branch-per-PR for staging).
- **Cloudflare** for R2 + Images + DNS + WAF.
- **Upstash** for QStash (cron) + Redis (rate limit, sessions cache).

## Security checklist

- All secrets in Vercel encrypted env vars; rotated quarterly.
- Restricted Stripe + Razorpay keys; least privilege.
- CSP headers + SRI on third-party scripts.
- Rate limit: per-IP and per-user via Upstash Redis (sliding window).
- CSRF: same-origin checks + SameSite cookies.
- Input validation: Zod everywhere at API boundaries.
- File uploads: signed URLs to R2, MIME + magic-byte sniff, size cap, AV scan via Cloudflare.
- Secrets scanning in CI: `gitleaks`.
- Dependency audit: `pnpm audit` in CI; Renovate for updates.
