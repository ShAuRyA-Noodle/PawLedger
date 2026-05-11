# Sponsor-an-Animal Platform: UX & Conversion Playbook

## 1. Hero / Landing Page

- One specific animal face, eye-contact close-up at animal's eye level. Aggregate stats underperform individual identifiable victims (Slovic 2007).
- **Video > photo**: Autoplay muted 6–10s loop of animal moving. Use poster image + in-view `<video>` that plays once decoded.
- **Headline**: "Sponsor [Name]" + one-sentence stake ("Without monthly sponsors, Kaolad goes back on the street.").
- Three suggested amounts above fold, mid-tier pre-selected. Dollar-impact under each ("$25 = one week of food + meds").
- Single primary CTA, sticky on mobile scroll. Collapse global nav on donate pages.
- Hero as server component streaming animal data, donate widget as client island. `next/image` priority + `fetchPriority="high"` on LCP image. Target LCP <2.0s.

## 2. Sponsorship Flow

- Single-page donation if <6 fields, else 3-step (Amount → Details → Payment). Simpler forms ~39% higher conversion (Donorbox/Fundraise Up).
- **Required fields**: email, first name, payment method. Address only if shipping welcome packet — ask post-payment. Phone kills conversion ~5%; never require.
- **Auth timing**: Payment FIRST, account AFTER. Thank-you page = auth wall ("Set a password to track [Animal]'s updates"). Forcing signup before payment costs 20–30% of conversions.
- **Apple Pay**: +2% overall, +average gift $78.61 on mobile.
- **Google Pay**: +2.6% overall, +4% on Chrome users.
- Stripe Payment Element + wallets enabled + Link autofill. Apple Pay sheet must appear as default on iOS Safari.
- PayPal still #2 method after card — include.

## 3. Donation Amount UX

- **Tier cards**: 3 mobile (stacked or horizontal scroll snap), 4 max desktop. Selected = 3px accent border + checkmark + scale 1.02. Hit area ≥48×48 dp.
- **Default**: middle tier. **$15 / $25 / $50 / Custom**, default $25, monthly toggle ON.
- **Monthly toggle**: top of widget, segmented pill. Default monthly with "Most loved" badge — monthly $288/yr vs one-time $115. Inline: "$25/mo = $300/year of care for [Animal]".
- **Custom input**: `inputmode="decimal"`, `$` prefix as adornment, client-side floor at $5. Focus deselects tiers.
- **Upsells**: post-amount pre-payment: "Add a one-time $10 vet kit?" Don't stack >1.
- **Fee cover-up**: NEVER pre-checked (FTC dark-pattern risk). Phrase "Cover the $0.87 processing fee so 100% of $25 reaches [Animal]." Mixed evidence: ~50% cover (+5% gift, no conversion drop) vs one study (60% cover, conversion -38.5%, net revenue -20.5%). A/B test.

## 4. Animal Profile Page

Priority order:
1. Hero photo carousel, 5–8 minimum — face close-up first.
2. 30–60s vertical video (re-usable as Reel/Short). One thing — eating, getting petted, walking. Don't over-edit.
3. First-person story, 150–300 words. Past tense rescue, present tense recovery, future tense need. Animal's name 4–6 times.
4. Vet record summary as collapsible card.
5. "X sponsors so far" ticker + last 3 sponsor first names + cities. WebSocket/SSE.
6. Urgency: "Needs $X more this month" progress bar OR "Only N sponsors needed". Sparingly + truthfully.
7. Caregiver quote + name + photo.

Avoid: long medical jargon, multiple competing CTAs, autoplay sad music.

## 5. Donor Dashboard (12-Month Retention)

Recurring benchmarks: 71% retained at 12mo, 54% at 24mo. Average sustainer 16mo. Card expiry causes 30% of involuntary churn — fix first.

**Must-have**:
- Update feed: chronological cards (photo + 60-word update). 60-word personal update outperforms quarterly newsletter on every retention measure (RKD).
- Photo galleries with download (donors share = free acquisition).
- Milestone notifications: push + email + in-dashboard banner.
- Gift toggles ("send treats this week +$5") — Patreon model.
- Impact ledger: "Your $25 this month bought: 14 lbs food, 2 vet visits, 1 toy." Itemized.
- Card update prompts T-30. Stripe Smart Retries + automatic card updater (network token). +5–10 retention points.
- Self-serve pause/change tier/change animal — no support email.
- Annual recap (Spotify Wrapped for sponsors).

## 6. Transparency UI

Charity:Water pattern for animals:
- Per-dollar receipt: "$25 = $18 direct care, $4 medical reserve, $3 platform/payment fees." Honest about fees.
- Project/animal linkage: each monthly gift logged to specific animal's ledger. Donor sees timeline (vertical, like Stripe receipts).
- Public impact dashboard: animals in care, MRR, avg cost per animal, mortality rate (yes — builds trust).
- Annual financials as designed page, not PDF. Embed Charity Navigator/GuideStar widgets live.
- Each ledger line: small photo + one-line story.

## 7. Trust Signals

- Charity Navigator 4-star (live API embed)
- GuideStar/Candid Platinum Seal
- BBB Wise Giving Alliance
- Local equivalent (Give.org, ACNC)
- SSL/Stripe lockup near payment
- Recent donations ticker (anonymized opt-out)
- Donor wall — paginated grid, sortable
- Press logos
- Founder/CEO video on About
- Real annual report link

## 8. Mobile-First

- **PWA install**: never first visit. Trigger after successful donation OR 3+ animal profiles in one session. Custom in-app prompt explaining value.
- **Push**: opt-in *after* dashboard visit, explicit value prop. iOS 16.4+ supports web push only after PWA install.
- **Web Share API** on every animal profile + receipt. Pre-fill photo + name + URL with UTM.
- **Apple Wallet `.pkpass`** for active sponsors: photo, sponsor since date, monthly amount.
- 48dp tap targets, sticky bottom CTA, thumb-zone primary.

## 9. Storytelling (Instagram + YouTube)

**Reel/Short (60–90s)**:
1. Hook 0–2s: worst-state shot + on-screen text ("Found in a drain")
2. Conflict 2–15s: rescue moment
3. Transformation 15–60s: time-lapse recovery
4. Resolution 60–80s: clean, healthy, happy
5. CTA 80–90s: "Sponsor [Name] — link in bio"

Audio minimal — piano or natural sound. Avoid melodramatic music.

**YouTube long-form (8–15min)**: Full rescue vlog, first-person caregiver narration, vet visit with real medical detail.

**Before/after carousel**: 2-image swipe reveal. Highest save rate.

Cross-post: every long-form → 3–5 vertical clips.

## 10. Cancellation / Retention (FTC compliant)

Same clicks to cancel as to sign up.
1. Cancel link visible in settings, max 2 clicks from home.
2. Step 1: "Why?" radio (financial / life change / different animal / dissatisfied / other).
3. Step 2 conditional:
   - Financial → pause 1/3/6mo + downgrade tier (drop to $10/mo). Recurly: pause retains ~25% of churners.
   - Different animal → in-flow switcher.
   - Dissatisfied → Calendly link to human.
4. Step 3: Confirm + show what they'll lose. Final "send goodbye to [Animal]'s caregiver".
5. Confirmation email + frictionless one-click resubscribe valid 90 days.

Don't: hide cancel, require phone call, guilt copy, auto-resubscribe.

## 11. Gamification — Works vs Gross

**Works**:
- Sponsorship anniversaries with named milestones ("1 year with [Animal]")
- Impact badges tied to real outcomes ("Funded 10 vet visits")
- Public donor wall (opt-in)
- Annual recap / Wrapped
- Streak gentleness: "12 months supporting [Animal]" — relationship not gamified streak

**Gross**:
- Points/coins systems with no real-world tie
- Leaderboards by amount (alienates small donors, transactional feel)
- Limited-time pressure badges
- "Levels" gating access (Bronze/Silver/Gold) for charity

## 12. Accessibility + i18n

- WCAG 2.2 AA. Contrast 4.5:1 body, 3:1 large/UI. Donate buttons 7:1.
- 44×44 CSS px tap targets.
- Visible labels (not just placeholders), `aria-describedby` for errors, `aria-live="polite"` for amount recalc.
- Tier cards as `<fieldset>` + `<legend>`, radio inputs, arrow-key nav.
- Test with VoiceOver + NVDA — most fail at Apple Pay sheet handoff.
- Skip-to-donate at top of body.
- **i18n / RTL**: logical CSS (`margin-inline-start`), `dir="auto"`, ICU MessageFormat, `next-intl`.
- Currency: detect locale + override.
- `prefers-reduced-motion` for hero video + confetti.

## 13. Micro-Interactions

- Confetti on donation success — `canvas-confetti`, single burst 1.5s, respects reduced-motion. Pair with animal photo + "Thank you from [Animal]". Drives social shares.
- Tier card haptic-feel: scale + shadow on selection, 200ms ease-out.
- Live progress bars on animal pages — SSE animated fill.
- "X people donating now" ticker — WebSocket/SSE, throttled, anonymized. REAL DATA ONLY.
- Number count-up on impact stats (`IntersectionObserver`).
- Skeleton screens never spinners.
- Optimistic UI on dashboard actions.
- Inline form validation (debounced 300ms).
- Animal photo zoom on tap.

## 14. Email Templates

NP avg open 25–30%. Avoid "donate" in subject — use "give" or "help".

- **Thank-you (T+60s)**: "[Animal] has a new sponsor (you)" — animal photo top, what your $25 does, receipt collapsed, CTA dashboard, share. Sign from caregiver not org.
- **Weekly update (Mon AM)**: "[Animal]'s week in 3 photos" — 3 photos, ≤60 words, single CTA "View full update".
- **Milestone**: "[Animal] just hit a milestone — because of you" — share button.
- **Tax receipt (annual Jan)**: "Your 2026 receipt + a year with [Animal]" — receipt + 12-month photo grid.
- **Card-expiry rescue (T-30/T-7/T-1)**: "Don't let [Animal]'s sponsorship lapse" + Stripe Customer Portal link. Recovers 30%+ involuntary churn.
- **Reactivation (T+30 after cancel)**: "[Animal] misses you" — sparingly, with genuine update.

A/B every subject. Resend for transactional, Loops or Customer.io for lifecycle.

## v1 Build Order (8 weeks)

1. Wk 1–2: Animal profile + Stripe Payment Element (Apple/Google Pay/PayPal/Link), single-page donate
2. Wk 3–4: Donor dashboard + update feed + card mgmt + pause/change
3. Wk 5: Email lifecycle (Resend + React Email)
4. Wk 6: PWA shell + push opt-in + Apple Wallet pass
5. Wk 7: Transparency ledger + trust stack
6. Wk 8: Confetti + micro-interactions + a11y audit + PostHog A/B

Defer to v2: gamification, leaderboards, crypto, multi-currency.
Skip: pre-checked fee cover, points, leaderboards by amount, autoplay sad music, fake tickers.
