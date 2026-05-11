# PawLedger — Product Requirements Document

**Tagline:** Compassion you can prove.
**Status:** v0.1 (May 2026)
**Owner:** Founder
**Built by:** autonomous engineering session

---

## 1. One-Liner

A trust-first, recurring sponsorship platform for animal welfare. Donors sponsor a *named individual animal* monthly (₹100–₹2,500 / $5–$50), get weekly photo+video updates from the shelter, and see every rupee/dollar tagged on a public, append-only ledger. India primary, US secondary. Bolted on top: a geo-located **Street SOS** rescue dispatch network and a **Corporate CSR** SaaS layer.

---

## 2. Problem

1. **Donor trust crisis.** Every major animal charity (ASPCA, HSUS, WWP) has had a public spending scandal in the last 5 years; SMACC documented 1,022 fake-rescue Instagram links generating 572M views in 6 weeks (2024). Donors don't know where money goes.
2. **No India-native recurring sponsorship product.** Ketto, Milaap, ImpactGuru optimize for one-time medical campaigns. Animal Aid Unlimited and CUPA are single shelters, not platforms.
3. **Shelters can't compound.** They survive on ad-hoc fundraisers, Instagram reach, and one-off corporate cheques. They have no recurring base, no software, no payout rails, no compliance support.
4. **Street animals are invisible to capital.** 15M–70M street dogs in India. Rabies eradication 2030 deadline. Yet no software connects citizens-who-spot-injured-animals → shelters → funded vet care.
5. **Corporate CSR money rots.** ₹26,000+ cr/yr CSR pool in India. Animal welfare is a Schedule VII eligible category. No platform serves CSR teams with compliant SaaS for animal-impact reporting.

## 3. Wedge (Why now)

Three distinct, defensible wedges combined into one product:

1. **Identifiable-victim recurring sponsorship** — copy what works at Best Friends ($25/mo Guardian Angels), ASPCA ($19/mo flagship), Charity:Water ("The Spring") and *bring it to India* with INR/UPI rails and ₹300/mo sweet spot.
2. **Public on-ledger transparency** — every donation tagged at the line item (vet bill, food invoice, wages) with photo/video proof, append-only, exportable. Charity:Water's "100% model" reborn for animals.
3. **Geo-located SOS rescue dispatch** — Uber-for-injured-strays. Citizen reports + photo + GPS → nearest verified shelter dispatched → micro-donations fund the case → outcome posted publicly.

## 4. Non-Goals (v1)

- Pet adoption marketplace (Petfinder/Adopt-a-Pet own this; we're sponsorship not rehoming).
- Foreign currency donations into India (FCRA bottleneck, Bill 2026 makes it riskier).
- Crypto/Web3 donations (regulatory ambiguity in India; defer).
- Native iOS/Android app (PWA-first; native deferred to v2).
- Veterinary EMR (we surface vet records, we don't replace VetSpec/PetDesk).

## 5. Users

| Persona | Goal | Key surfaces |
|---|---|---|
| **Donor (Indian, urban, 25–45)** | Sponsor a specific animal monthly, see proof of impact, share | Marketing site, animal browse, donate flow, donor dashboard, ledger view, mobile PWA |
| **Donor (NRI / international)** | Same, plus tax receipt for home country | Same + multi-currency switching |
| **Shelter (India)** | List rescued animals, get monthly recurring funding, post updates, receive payouts, generate compliant receipts | Shelter dashboard, animal CMS, payout panel, receipt generator |
| **Corporate CSR officer** | Allocate CSR budget across vetted causes, get 80G + CSR-1 compliant reports, branded impact dashboard | CSR portal, custom reports, API |
| **SOS reporter (citizen)** | Report an injured street animal in 30 seconds | Public report form (no auth required), follow-up via SMS/WhatsApp |
| **Admin (us)** | Moderate, verify shelters, review payouts, watch fraud signals, run platform | Admin panel |

## 6. Brand

- **Name:** PawLedger
- **Tagline:** Compassion you can prove.
- **Voice:** plain, calm, exact. Numbers + named animals. Never melodramatic. Never gory imagery.
- **Anti-patterns:** sad music, guilt copy, fake urgency, leaderboards by amount, pre-checked fee covers.

## 7. Feature List (40 features, grouped)

### A. Donor surfaces (1–10)
1. **Marketing landing** — hero with one specific animal, video loop, three-tier sponsorship widget above fold, trust signals.
2. **Animals browse** — filter by city, species, age, urgency, cost; infinite scroll, server-rendered.
3. **Animal profile page** — 5–8 photos, 30–60s video, 150–300 word story, vet record card, sponsors-so-far ticker, caregiver quote, share sheet.
4. **One-page sponsor flow** — single-page Stripe/Razorpay Payment Element with Apple Pay, Google Pay, UPI, card. Auth deferred to thank-you page.
5. **Recurring vs one-time toggle** — segmented pill, default monthly with "Most loved" badge, inline annual-impact calc.
6. **Donation tier cards** — INR ₹100/₹300/₹500/₹1000 + Custom (default ₹300); USD $5/$25/$50 + Custom (default $25).
7. **Cover-the-fee opt-in** — never pre-checked, exact rupee amount shown, A/B-tested.
8. **Donor dashboard** — sponsored animals grid, update feed, impact ledger, manage subscriptions (pause/change tier/swap animal/cancel).
9. **Per-animal ledger view** — vertical timeline of every rupee → line item → photo proof.
10. **Annual donor recap** — Spotify-Wrapped-style year-in-the-life-of-[Animal] page with photo grid + share buttons.

### B. Shelter surfaces (11–18)
11. **Shelter onboarding wizard** — entity type (Section 8/Trust/Society/501c3), 12A/80G/CSR-1/AWBI cert upload, KYC via IDfy (India) or Persona (US), bank/UPI penny-drop, video call.
12. **Animal CMS** — create/edit profile (photos, video, story, vet record), publish/unpublish, set funding goal.
13. **Weekly update composer** — photo+text or short-video update tied to a specific animal, scheduled or immediate, auto-distributed to all sponsors.
14. **Vet record uploader** — drag-drop PDFs/images, OCR'd into structured fields, surfaced on animal profile.
15. **Payout dashboard** — incoming sponsorships, processing fees, platform fee, net payout; T+1 default, T+0 instant for SOS cases via Cashfree.
16. **Compliance panel** — 80G/CSR-1 cert status + expiry alerts, AWBI re-recognition reminders.
17. **Shelter analytics** — recurring donors, churn, 12mo retention, MRR by animal, conversion funnel.
18. **In-kind donation tracking** — record physical donations (food bags, blankets, vet credits) with donor attribution and tax-receipt generation.

### C. Trust + transparency (19–24)
19. **Public transparency ledger** — append-only, per-animal + platform-wide; CSV export; cryptographic hash chain (SHA-256 chained, not on-chain to start).
20. **Per-rupee impact breakdown** — donation receipt shows ₹X direct care + ₹Y medical reserve + ₹Z platform/payment fees, line item.
21. **Public impact dashboard** — animals in care, MRR, avg cost per animal, mortality rate (yes — builds trust), payout latency, complaint resolution.
22. **Donor wall (opt-in)** — paginated grid of names + city + tenure, sortable.
23. **Trust badge stack** — Charity Navigator (when earned), GuideStar, BBB, AWBI, 80G live verification, SSL/Stripe lockup.
24. **Audit log + complaint flow** — anyone (donor, public) can flag a shelter, animal, or transaction; complaints + resolutions are public.

### D. Street SOS (25–28)
25. **Public SOS report** — no-auth, 30-sec form: photo, GPS, species, condition, contact (optional). Map preview before submit.
26. **Dispatcher console** — real-time queue for verified shelters in a 25km radius; first-claim wins; SLA timer; route-to-shelter Google Maps deep link.
27. **SOS micro-donate** — every reported case gets a public funding link instantly; donors fund a *specific* case with photo updates from the field.
28. **Outcome posting** — shelter must post outcome (treated/rehabilitated/euthanized humanely/no found) within 7 days; tied to public stats.

### E. Corporate CSR (29–32)
29. **CSR portal** — corporate buyer dashboards, multi-shelter grant pools, custom reports, branded impact pages.
30. **Compliant receipts** — auto-generated 80G + CSR-1 paperwork; quarterly impact reports as PDFs and shareable URLs.
31. **CSR API + webhook** — companies pull impact metrics into their internal sustainability dashboards (Workday, SAP, NetSuite connectors deferred).
32. **CSR fund-matching** — employer-match button on donor flow ("Acme Corp matches up to ₹10k/yr") integrated with HRIS via SAML/SCIM (deferred to v1.5).

### F. Growth + retention (33–37)
33. **Embeddable donate widget** — iframe + headless JS; 4 sizes; revenue-share or flat fee for partner vet clinics, pet brands, content creators.
34. **Referral program** — donor invite link → friend's first donation triggers a thank-you tied to the referrer (no monetary reward; this is charity).
35. **Apple Wallet sponsor pass** — `.pkpass` with animal photo, sponsor-since date, amount, tap to view dashboard.
36. **Web Share API + UTM-tagged share links** — every animal profile, donation receipt, milestone has a one-tap share producing pre-filled social cards.
37. **Sponsorship anniversary milestones** — 1mo, 6mo, 1yr, 5yr badges, push + email + dashboard banner; anniversary always tied to the *animal*, not gamified.

### G. Platform infrastructure (38–40)
38. **Card-update auto-rescue** — Stripe Smart Retries + network-token automatic card updater + dunning emails T-30/T-7/T-1 days.
39. **Self-serve cancel/pause/downgrade** — FTC click-to-cancel compliant; offers pause 1/3/6 mo + downgrade tier + animal switcher; one-click resubscribe valid 90 days.
40. **i18n (EN/HI v1; TA/MR/BN/TE deferred) + multi-currency (INR/USD v1)** — `next-intl`, ICU MessageFormat, locale-aware tax-deductibility copy.

> **Total: 40 features.** Beyond the 30 the user requested, with explicit v1 vs v1.5 vs v2 split.

## 8. Out-of-scope for v1 build (parked, noted)

- Native iOS/Android (PWA covers 90% of v1 use cases)
- Pet adoption listings
- Cryptocurrency donations
- FCRA-compliant USD-into-India routing
- Live video streaming from shelters
- Telemedicine / vet telehealth
- Donor advised fund integration
- HRIS-based corporate matching SCIM/SAML
- AI-generated impact reports (template-driven for v1)
- Animal microchip / RFID integration

## 9. Pricing & Monetization (v1)

| Stream | Mechanism | Take rate / fee |
|---|---|---|
| Recurring sponsorship | Razorpay Subscriptions / Stripe Subscriptions | **5% blended** (4% platform + 1% donor cover-fee opt-in) |
| One-time donation | Razorpay / Stripe one-time | Same 5% blended |
| Corporate CSR | Annual SaaS + per-grant fee | ₹2 lakh/yr base + 3% of routed CSR funds |
| Embed widget | Free for nonprofits, ₹999/mo for commercial partners | Plus 5% of donations |
| Vet-credit marketplace (v1.5) | Commission on vet bookings funded by donor balances | 10–15% |
| Premium donor tier | Optional ₹999/mo: tax-receipt automation + monthly impact merch | ₹999/mo flat |

**Path to $200–300k MRR (≈ ₹1.6–2.5 cr/mo):**
- 50,000 recurring donors @ avg ₹350/mo (5% take) = ₹8.75 lakh/mo
- 5 enterprise CSR contracts @ ₹15 lakh/yr (3% of ₹3 cr each) = ₹13.75 lakh/mo
- 200 partner-clinic embeds @ avg ₹3,000/mo flat + 5% volume = ₹6 lakh/mo
- 1,000 premium-tier donors @ ₹999 = ₹10 lakh/mo

Total: ~₹38 lakh/mo (~$45k MRR) at 50k donors. **To hit $200k MRR you need ~250k recurring donors + 25 CSR contracts + 1k partner embeds.** That's 18–36 months realistic, contingent on capital + distribution. Code does not produce this; growth does.

## 10. Success metrics (north star + leading)

- **NSM:** Active recurring sponsorships (count) × avg duration (months).
- **Activation:** 7-day donor activation = 1st recurring donation captured.
- **Retention:** 12-mo recurring retention ≥ 70% (industry: 71%).
- **Trust:** ledger transparency complaints / 1k transactions (target < 0.5).
- **Shelter happiness:** monthly NPS from shelter dashboard, target ≥ 50.
- **SOS resolution:** % of SOS reports with outcome posted within 7d (target ≥ 80%).
- **CSR conversion:** corporate trial → contract conversion ≥ 30%.

## 11. Risks (re-stated for the founder)

- Cannot guarantee revenue. See README.
- 80G/AWBI/CSR-1 = 4–10 month parallel workstream. Treat as critical path.
- DPDP Act standalone consent mandatory by **May 13, 2027** — build in now or retrofit later.
- Stripe Connect cross-border to India still not shipped May 2026.
- FCRA Amendment Bill 2026 = do not architect around foreign donations to Section 8.
- Card-testing fraud is the #1 hit on donation pages — Stripe Radar + Razorpay Risk Engine + CAPTCHA from day 1.
- 80G renewal cliff: many partner shelters lost 80G after Mar 31 2026. Verify every shelter at onboarding.
- Trust collapse from one scandal = death. Public ledger is the moat AND the brand.

## 12. Build sequence (8 weeks if a team, ~1 night for autonomous MVP scaffold)

1. Brand + PRD + architecture (this doc)
2. Monorepo scaffold + DB schema + Better Auth
3. Animal CMS + browse + profile
4. Donate flow (Razorpay test + Stripe test)
5. Donor dashboard + ledger
6. Shelter onboarding + dashboard + payouts
7. Admin panel + KYC review + payout queue
8. Email lifecycle (Resend + React Email)
9. Marketing site polish + transparency dashboard
10. SOS rescue map + dispatch
11. CSR portal + compliant receipts
12. Embed widget + Apple Wallet pass
13. PWA + i18n
14. Seed data + LAUNCH_CHECKLIST + outreach kit

(Autonomous run: tonight covers scaffold + features 1–9 to a working demo. SOS / CSR / embed / Wallet shipped as scaffolds with TODOs for founder to fill on wake.)
