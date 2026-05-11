"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIERS, formatMoney, calcFees, toSubunits } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { createSponsorship } from "@/app/actions/sponsor";
import { track } from "@/lib/analytics";
import { useEffect } from "react";

type Props = {
  animalId: string;
  animalName: string;
  monthlyCostPaise: number;
  sponsorCount: number;
};

export function SponsorWidget({ animalId, animalName, monthlyCostPaise, sponsorCount }: Props) {
  const [currency] = useState<"INR" | "USD">("INR");
  const [isMonthly, setIsMonthly] = useState(true);
  const [tier, setTier] = useState<number>(TIERS[currency].find(t => t.isDefault)?.value ?? 300);
  const [custom, setCustom] = useState<string>("");
  const [coverFees, setCoverFees] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { track("sponsor_widget_opened", { animalId, animalName }); }, [animalId, animalName]);

  const amount = custom ? Number(custom) || 0 : tier;
  const subunits = toSubunits(amount, currency);
  const fees = calcFees(subunits, currency, coverFees);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (amount < (currency === "INR" ? 100 : 5)) {
      setError(`Minimum ${currency === "INR" ? "₹100" : "$5"}`);
      return;
    }
    if (!email) { setError("Email required"); return; }

    track("sponsor_started", { animalId, animalName, amount, currency, isMonthly });
    startTransition(async () => {
      try {
        const res = await createSponsorship({
          animalId, amountSubunits: subunits.toString(), currency, isMonthly, donorEmail: email, donorName: name, donorCoversFees: coverFees,
        });
        if (res.ok && res.checkoutUrl) {
          window.location.href = res.checkoutUrl;
        } else {
          setError(res.error ?? "Could not start sponsorship. Try again.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      }
    });
  }

  return (
    <div className="bg-card rounded-2xl border border-line shadow-soft p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-display text-2xl">Sponsor {animalName}</h3>
      </div>
      <p className="text-xs text-muted mb-5">{sponsorCount} active sponsor{sponsorCount === 1 ? "" : "s"} · cancel anytime</p>

      {/* Monthly / one-time toggle */}
      <div className="bg-line rounded-pill p-1 grid grid-cols-2 mb-5 text-sm font-medium">
        <button onClick={() => setIsMonthly(true)} className={cn("py-2 rounded-pill transition-all relative", isMonthly && "bg-cream text-ink shadow-soft")}>
          Monthly
          {isMonthly && <Badge variant="marigold" className="absolute -top-2 -right-2 text-[10px] py-0 px-1.5">Most loved</Badge>}
        </button>
        <button onClick={() => setIsMonthly(false)} className={cn("py-2 rounded-pill transition-all", !isMonthly && "bg-cream text-ink shadow-soft")}>
          One-time
        </button>
      </div>

      {/* Tier cards */}
      <fieldset className="grid grid-cols-2 gap-2 mb-3">
        <legend className="sr-only">Choose amount</legend>
        {TIERS[currency].map(t => (
          <label
            key={t.value}
            className={cn(
              "flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all",
              tier === t.value && !custom ? "border-marigold-deep bg-marigold/10" : "border-line hover:border-line-strong"
            )}
          >
            <input
              type="radio"
              name="tier"
              value={t.value}
              checked={tier === t.value && !custom}
              onChange={() => { setTier(t.value); setCustom(""); }}
              className="sr-only"
            />
            <span className="font-display text-2xl">{t.label}</span>
            <span className="text-xs text-slate mt-0.5">{t.impact}</span>
          </label>
        ))}
      </fieldset>

      {/* Custom amount */}
      <Input
        type="number"
        inputMode="decimal"
        placeholder="Custom amount"
        value={custom}
        onChange={e => { setCustom(e.target.value); }}
        className="mb-4"
        min={currency === "INR" ? 100 : 5}
        aria-label="Custom amount"
      />

      {/* Annual impact note */}
      {isMonthly && amount > 0 && (
        <p className="text-xs text-slate mb-4">
          {formatMoney(subunits, currency)}/mo = {formatMoney(subunits * 12n, currency)}/year of care for {animalName}.
        </p>
      )}

      {/* Email + name */}
      <div className="space-y-2 mb-3">
        <Input type="email" required placeholder="Email for receipts + updates" value={email} onChange={e => setEmail(e.target.value)} aria-label="Email" />
        <Input placeholder="First name (optional)" value={name} onChange={e => setName(e.target.value)} aria-label="Name" />
      </div>

      {/* Cover fees */}
      <label className="flex items-start gap-2 mb-5 cursor-pointer text-sm">
        <input type="checkbox" checked={coverFees} onChange={e => setCoverFees(e.target.checked)} className="mt-0.5" />
        <span className="text-slate">
          Cover the {formatMoney(fees.platformFee + fees.processingFee, currency)} processing fee — 100% of {formatMoney(subunits, currency)} reaches {animalName}.
        </span>
      </label>

      {error && <p className="text-sm text-coral mb-3">{error}</p>}

      <Button onClick={submit as never} fullWidth size="lg" variant="marigold" disabled={isPending || amount === 0}>
        {isPending ? "Setting up…" : isMonthly ? `Sponsor ${formatMoney(subunits, currency)}/month` : `Donate ${formatMoney(subunits, currency)} once`}
      </Button>

      <div className="mt-4 text-xs text-muted text-center space-y-1">
        <p>Secure payments via Razorpay (UPI, card, netbanking)</p>
        <p>Tax-deductible · 80G certified · Cancel in 2 clicks</p>
      </div>
    </div>
  );
}
