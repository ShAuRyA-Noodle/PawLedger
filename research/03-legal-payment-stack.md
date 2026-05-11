# Animal Welfare Donation Marketplace: Stack & Legal Brief (May 2026)

## 1. Stripe Connect (US side)

- **Account types**: Standard (shelter has own dashboard, $0 fee), Express ($2/active account/mo + $0.25 + 0.25% per payout, Stripe-hosted), Custom (white-label).
- **Use Express** for new shelters. Standard for those who demand own dashboard.
- **Charges**: destination charges with `on_behalf_of` set to shelter — shelter is merchant of record, platform controls flow.
- **Payouts**: rolling 2-day default US.
- **India**: Stripe is INVITE-ONLY in India May 2026. Connect cross-border payouts to India NOT SUPPORTED. Workaround: route INR via Razorpay/Cashfree, USD via Stripe.
- **Nonprofit rate**: 2.2% + $0.30 (vs 2.9% + $0.30) requires shelter is 501(c)(3) with >80% donation volume.
- **1099-K**: $20k+200tx federal threshold for 2026 (One Big Beautiful Bill); state thresholds lower in MA/VT/IL/MD/DC/NJ/VA.

**USE: Stripe Connect Express + destination charges + `on_behalf_of`.**

## 2. Razorpay Route (India)

- Splits charge across LinkedAccounts. Sub-merchant onboarding API-driven.
- **Sept 2025 RBI Master Directions**: bank account name = PAN name = GST legal name MUST match exactly. #1 onboarding-failure cause.
- **Pricing**: 2% on cards/UPI/netbanking (UPI free up to ₹2k); NGOs with 80G can negotiate ~1.6%.
- **Subscriptions**: UPI AutoPay, eMandate (NACH), cards. AutoPay cap ₹15,000/debit without additional auth.
- **Payout**: T+1 default; T+0 instant on request.
- **80G receipts**: Razorpay Payment Pages auto-generates. For custom marketplace flow, must generate yourself via `payment.captured` webhook.

**USE: Razorpay Route for collection + split, Razorpay Subscriptions for recurring, custom 80G PDF generation from webhooks.**

## 3. Cashfree (alternative)

- Easy Split = Route equivalent. Differences: instant settlements first-class (real T+0), Payouts API best in India for bulk disbursements, easier negotiation low-volume.
- **USE as fallback rail for instant SOS rescue payouts.** Razorpay primary for ergonomics.

## 4. Indian nonprofit registration

- **Best entity**: **Section 8 Company** (MCA-regulated, looks like company, easiest for CSR partners). Cost ₹14k-25k, 10-20 working days.
- **12A** (income tax exemption): provisional 1-3 mo, final 3-6 mo via Form 10A.
- **80G** (50% donor deduction): conversion-killer if missing. Indian donors expect it. Renewal 5 years via Form 10AB — many NGOs lost 80G in late 2025/early 2026 by missing.
- **CSR-1**: mandatory for corporate CSR. NEW web-based MCA filing live since July 14, 2025. Requires 12A + 80G + 3-year track record.
- **FCRA**: required for ANY foreign donation. **FCRA Amendment Bill 2026** (Mar 25, 2026) tightens further. Need SBI Main Branch FCRA account in Delhi. **DON'T promise foreign donations at launch.**
- **AWBI recognition**: required for shelters to receive govt schemes. Use as verification signal for shelters on platform.

**Timeline May 2026**: Section 8 (3wk) → PAN/TAN/bank (1wk) → 12A+80G provisional (6-10wk) → CSR-1 (2-4wk after) → FCRA (skip year 1).

**USE: Section 8 + 12A + 80G + CSR-1. Skip FCRA at launch.**

## 5. US 501(c)(3)

- **Form 1023-EZ**: $275, 2-4 wk, only if <$50k/yr revenue 3yr — donation marketplace blows past this.
- **Form 1023 long form**: $600, 3-9 months. Foundation/corporate match programs prefer.
- **State charitable solicitation**: 41 states require registration. Online "Donate" = solicits everywhere. Harbor Compliance package $4-8k yr 1 + state fees, ongoing $3-5k/yr.
- **Fiscal sponsorship (skip IRS queue)**:
  - **Players Philanthropy Fund (PPF)**: 6% of deposits, fast onboarding, 41 jurisdictions, 26 countries. Best <$1M/yr.
  - **Open Collective Foundation**: shut down most 501(c)(3) sponsorship in 2024. DON'T plan around.
  - Other: Social Good Fund, Hack Club Bank.

**USE: Launch under PPF (~6%) for first 12-18 months. File 1023 long form in parallel; spin out at $500k/yr.**

## 6. Hybrid model (for-profit + partner nonprofits)

- This IS what GoFundMe + Givebutter + Ketto + Milaap do.
- For-profit Delaware C-corp + Pvt Ltd India = the platform.
- Money flows direct shelter → donor receipt via Stripe Connect/Razorpay Route.
- Add PPF as fallback "house charity" for unregistered shelters.
- Pvt Ltd takes tech/service fee (taxable, 18% GST). Section 8 partner issues 80G.
- Watch: state charitable solicitation laws may apply to **commercial co-venturers** + **professional fundraisers** (CA/NY/FL/MA strict — registration + bonding + contract filing). Also UPMIFA, DAF rules, IRS "conduit" doctrine.

## 7. DPDP Act 2023 + GDPR

- DPDP rules notified Nov 13, 2025. Standalone clear consent notice mandatory by **May 13, 2027** — build for it now.
- Consent: free, specific, informed, unconditional, unambiguous, clear affirmative action. NO pre-ticked boxes.
- Withdrawal as easy as giving consent.
- Breach notification: 72 hours, no de minimis threshold.
- Children <18: verifiable parental consent.
- GDPR triggered if targeting EU. Geo-block EU at signup until ready.
- Required: granular cookie banner, separate donation receipt vs marketing email opt-in, data export+delete in user settings, public privacy notice, breach playbook.

## 8. Auth/SaaS Stack (May 2026 defaults)

| Need | Pick | Why |
|---|---|---|
| Auth | **Better Auth** | MIT, 2FA + passkeys + orgs + RBAC built-in. Auth.js v5 maintainers point new projects here. Clerk only for $0.02/MAU budget post-10k. |
| DB | **Neon** | Postgres, scale-to-zero, instant branching, 100 free projects. |
| ORM | **Drizzle** | Edge-friendly, SQL-close, faster cold starts. |
| Image | **Cloudflare R2 + Images** | Zero egress, $5/100k delivered. |
| Email txn | **Resend** + React Email | Best DX. |
| Email marketing | **Loops** | Non-tech can edit sequences. |
| Cron | **Upstash QStash** | Survives Vercel deploys, edge-compatible, 500 msg/day free. |
| Jobs | **Trigger.dev** | Apache 2.0, $10/mo entry, better debugging UI than Inngest. |
| Search | **Meilisearch** | Typo-tolerant, Rust, 7x faster index, MIT. |
| Maps | **MapLibre GL JS + OSM via Protomaps/MapTiler** + Mapbox geocoding fallback | Cheap. |
| Analytics | **PostHog Cloud (EU region)** | Funnels + replay + flags + A/B in one. DPDP/GDPR-safer. |

## 9. PCI Burden

- Stripe Checkout/Elements = SAQ A (22 questions, 15-30 min).
- **2025 update**: SAQ A now requires quarterly ASV scans even for redirect/iframe (PCI DSS v4.0.1). $200-500/yr ASV (SecurityMetrics, Trustwave).
- Never touch raw PAN/CVV — would jump to SAQ A-EP/D, audit cost 50-100x.
- Real burden: TLS everywhere, no card data in logs, vendor due diligence, annual self-attestation.

## 10. Anti-fraud / KYC

**Fraud signals**:
1. Card-testing (donation pages = #1 target, $1-5 amounts). Stripe Radar rule "block if >3 attempts/IP/hr". Razorpay Risk Engine + CAPTCHA.
2. Fake shelter onboarding with stolen PAN/EIN.
3. Money laundering via round-trip donations to controlled shelters.

**KYC stack**:
- **India**: **IDfy** or **Signzy** — video-KYC, PAN/Aadhaar (offline XML), bank penny-drop, Section 8 CIN check via MCA API, 12A/80G OCR + manual, AWBI cross-check. CKYC 2.0 live Feb 2026 with DigiLocker.
- **US**: **Persona** or **Sumsub** — shelter principal ID + EIN + IRS Pub 78 + GuideStar/Candid Form 990 history.
- **Manual review tier**: shelter onboarding requires (a) address with utility bill, (b) photo of shelter with ≥5 animals, (c) reference from another verified shelter or AWBI/local SPCA, (d) video call before first payout >₹25k/$300.

**Payout fraud controls**: hold first payout 7-14 days, cap monthly payout per shelter until trust score grows, monitor for spikes (donation matched to payout = self-dealing).

**USE: Persona (US) + IDfy (India) automated; tiered manual review for first $300/₹25k payout; Stripe Radar + Razorpay Risk Engine.**

## 11. May 2026 Gotchas

- **RBI Master Directions PA (Sept 15, 2025)**: name match (PAN=bank=GST), 100% data localization, foreign data copies purged 24h. #1 onboarding-failure cause.
- **FCRA Amendment Bill 2026**: govt can seize assets of de-registered orgs. Don't architect around foreign donations to Section 8.
- **DPDP Rules**: standalone consent notice mandatory by May 13, 2027.
- **CSR-1 web form replacement (July 14, 2025)**: old PDFs no longer accepted.
- **12A/80G renewal cliff**: 2021-cohort 5-year renewals expired March 31, 2026. Verify every shelter's 80G via Income Tax e-filing portal before listing.
- **PCI SAQ A** now requires ASV quarterly scans.
- **Stripe Connect cross-border to India** still not shipped May 2026.
- **1099-K**: $20k+200tx federal for 2026; state thresholds lower.
- **Token-theft wave** hitting AI/marketplace: rotate Stripe restricted keys quarterly, scope to least privilege, alert on `account.application.deauthorized`.
- **Open Collective Foundation** shut down most US fiscal sponsorship 2024. Use PPF/HCB.

## TL;DR

**Legal**: Delaware C-corp + Pvt Ltd India; PPF fiscal sponsor at launch (US); Section 8 + 12A + 80G + CSR-1 in India parallel; skip FCRA year 1.
**Payments**: Razorpay Route + Subscriptions (India), Stripe Connect Express + Subscriptions (US), Cashfree Payouts as instant-settle SOS fallback.
**Tech**: Next.js 15 + Better Auth + Drizzle + Neon + Cloudflare R2/Images + Resend + Loops + Trigger.dev + QStash + Meilisearch + MapLibre/OSM + PostHog (EU).
**Compliance**: SAQ A + quarterly ASV; Persona + IDfy KYC; manual review for first payouts; cookie consent + standalone DPDP notice; verify 80G validity every onboarding.
