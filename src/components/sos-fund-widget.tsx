"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { startSOSDonation } from "@/app/actions/sos";
import { track } from "@/lib/analytics";

type Props = { publicId: string; goalRaisedPaise: string; goalPaise: string; donorCount: number };

export function SOSFundWidget({ publicId }: Props) {
  const [tier, setTier] = useState(500);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const amount = custom ? Number(custom) : tier;
    if (!amount || amount < 50) { setError("Minimum ₹50."); return; }
    if (!email) { setError("Email required."); return; }
    track("sos_donation_started", { publicId, amount });
    startTransition(async () => {
      const res = await startSOSDonation({ publicId, amountPaise: amount * 100, donorEmail: email });
      if (!res.ok) { setError(res.error); return; }
      window.location.href = `/checkout/razorpay?order=${res.orderId}&email=${encodeURIComponent(email)}&animal=SOS-${publicId.slice(0, 8)}`;
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[100, 500, 1000].map(amt => (
          <button
            key={amt}
            onClick={() => { setTier(amt); setCustom(""); }}
            className={`p-3 border-2 rounded-lg text-center transition-all ${tier === amt && !custom ? "border-marigold-deep bg-marigold/10" : "border-line hover:border-line-strong"}`}
          >
            <span className="font-display text-lg">₹{amt}</span>
          </button>
        ))}
      </div>
      <Input type="number" inputMode="decimal" placeholder="Custom ₹ amount" value={custom} onChange={e => setCustom(e.target.value)} className="mb-3" min={50} />
      <Input type="email" required placeholder="Email for receipt" value={email} onChange={e => setEmail(e.target.value)} className="mb-3" />
      {error && <p className="text-sm text-coral mb-2">{error}</p>}
      <Button onClick={submit} fullWidth variant="marigold" size="lg" disabled={pending}>
        {pending ? "Setting up…" : `Donate ₹${custom || tier}`}
      </Button>
      <p className="text-xs text-muted text-center mt-3">100% to vet care · instant payout via Cashfree</p>
    </div>
  );
}
