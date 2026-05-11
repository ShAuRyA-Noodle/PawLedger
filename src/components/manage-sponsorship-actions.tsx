"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TIERS, formatMoney, toSubunits } from "@/lib/money";
import { changeTier, pauseSponsorship, cancelSponsorship, resumeSponsorship } from "@/app/actions/manage-sponsor";

type Props = {
  sponsorshipId: string;
  currentStatus: "active" | "paused" | "cancelled" | "past_due" | "incomplete";
  currentAmountPaise: string;
  currency: "INR" | "USD";
};

export function ManageSponsorshipActions({ sponsorshipId, currentStatus, currentAmountPaise, currency }: Props) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"idle" | "cancel" | "pause" | "tier">("idle");
  const [pauseMonths, setPauseMonths] = useState<1 | 3 | 6>(3);
  const [tier, setTier] = useState<number>(Number(currentAmountPaise) / 100);
  const [reason, setReason] = useState("");

  const refresh = () => window.location.reload();

  const onCancel = () => startTransition(async () => {
    await cancelSponsorship({ sponsorshipId, reason });
    refresh();
  });

  const onPause = () => startTransition(async () => {
    await pauseSponsorship({ sponsorshipId, months: pauseMonths });
    refresh();
  });

  const onChangeTier = () => startTransition(async () => {
    await changeTier({ sponsorshipId, newAmountSubunits: toSubunits(tier, currency).toString() });
    refresh();
  });

  const onResume = () => startTransition(async () => {
    await resumeSponsorship({ sponsorshipId });
    refresh();
  });

  if (currentStatus === "cancelled") {
    return (
      <Card className="p-6">
        <Badge variant="coral" className="mb-3">Cancelled</Badge>
        <p className="text-sm text-slate mb-4">This sponsorship is cancelled. You won't be charged again.</p>
        <Button onClick={onResume} disabled={pending} variant="marigold">Resume sponsorship</Button>
      </Card>
    );
  }

  if (currentStatus === "paused") {
    return (
      <Card className="p-6 bg-marigold/5">
        <Badge variant="marigold" className="mb-3">Paused</Badge>
        <p className="text-sm text-slate mb-4">Your sponsorship is paused. Resume any time — same animal, same monthly amount.</p>
        <Button onClick={onResume} disabled={pending} variant="marigold">Resume</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-xl mb-2">Manage</h2>
      <p className="text-sm text-slate mb-6">All changes take effect at the end of the current billing cycle. No phone calls. No retention games.</p>

      {step === "idle" && (
        <div className="grid sm:grid-cols-3 gap-3">
          <Button variant="secondary" onClick={() => setStep("tier")}>Change amount</Button>
          <Button variant="secondary" onClick={() => setStep("pause")}>Pause 1–6 months</Button>
          <Button variant="ghost" onClick={() => setStep("cancel")}>Cancel</Button>
        </div>
      )}

      {step === "tier" && (
        <div>
          <p className="text-sm text-slate mb-3">Change monthly amount. Currently {formatMoney(BigInt(currentAmountPaise), currency)}.</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {TIERS[currency].map(t => (
              <label key={t.value} className={`p-3 border-2 rounded-lg cursor-pointer text-center ${tier === t.value ? "border-marigold-deep bg-marigold/10" : "border-line"}`}>
                <input type="radio" name="tier" value={t.value} checked={tier === t.value} onChange={() => setTier(t.value)} className="sr-only" />
                <span className="font-display text-lg">{t.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={onChangeTier} disabled={pending} variant="marigold">Save change</Button>
            <Button onClick={() => setStep("idle")} variant="ghost">Back</Button>
          </div>
        </div>
      )}

      {step === "pause" && (
        <div>
          <p className="text-sm text-slate mb-3">Take a break. We'll resume automatically and remind you a week before.</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 3, 6].map(m => (
              <label key={m} className={`p-3 border-2 rounded-lg cursor-pointer text-center ${pauseMonths === m ? "border-marigold-deep bg-marigold/10" : "border-line"}`}>
                <input type="radio" name="pause" checked={pauseMonths === m} onChange={() => setPauseMonths(m as 1 | 3 | 6)} className="sr-only" />
                <span className="font-display text-lg">{m}</span> month{m > 1 ? "s" : ""}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={onPause} disabled={pending} variant="marigold">Pause</Button>
            <Button onClick={() => setStep("idle")} variant="ghost">Back</Button>
          </div>
        </div>
      )}

      {step === "cancel" && (
        <div>
          <p className="text-sm text-slate mb-3">Sorry to see you go. Mind sharing why? (Helps us improve.)</p>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="h-11 w-full mb-3 rounded-md border border-line-strong bg-card px-3 text-sm"
          >
            <option value="">Choose a reason (optional)</option>
            <option>Financial — can't afford right now</option>
            <option>Want to support a different animal</option>
            <option>Life change (moving, family, etc.)</option>
            <option>Dissatisfied with updates</option>
            <option>Other</option>
          </select>
          <p className="text-xs text-muted mb-4">If financial, consider a <button type="button" onClick={() => { setStep("pause"); }} className="underline text-marigold-deep">pause</button> or <button type="button" onClick={() => { setStep("tier"); }} className="underline text-marigold-deep">downgrade</button> instead.</p>
          <div className="flex gap-2">
            <Button onClick={onCancel} disabled={pending} variant="danger">Confirm cancel</Button>
            <Button onClick={() => setStep("idle")} variant="ghost">Keep sponsorship</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
