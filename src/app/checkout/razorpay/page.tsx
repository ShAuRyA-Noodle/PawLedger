"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function RazorpayCheckoutPage() {
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const animal = sp.get("animal");
  const email = sp.get("email") ?? "";
  const [scriptReady, setScriptReady] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) { setScriptReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.body.appendChild(s);
  }, []);

  const open = () => {
    if (!window.Razorpay || !orderId) return;
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: orderId,
      name: "PawLedger",
      description: animal ? `Sponsor for ${animal}` : "Donation",
      prefill: { email },
      theme: { color: "#c9851a" },
      handler: () => {
        window.location.href = `/thank-you?animal=${animal ?? ""}`;
      },
      modal: { ondismiss: () => setOpened(false) },
    });
    rzp.open();
    setOpened(true);
  };

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Badge variant="coral" className="mb-3">Missing order</Badge>
        <h1 className="font-display text-3xl mb-3">Checkout link invalid</h1>
        <p className="text-slate">Please return to the animal page and start your sponsorship again.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Badge variant="marigold" className="mb-3">Secure checkout</Badge>
      <h1 className="font-display text-4xl tracking-tight mb-8">One-time donation</h1>
      <Card className="p-8">
        <CardContent className="space-y-4 text-center">
          {!scriptReady && <p className="text-sm text-slate">Loading secure checkout…</p>}
          {scriptReady && (
            <>
              <p className="text-sm text-slate">{opened ? "Razorpay window is open. Complete payment there." : "Click below to open the Razorpay checkout window."}</p>
              <Button onClick={open} variant="marigold" size="lg" fullWidth disabled={opened}>
                {opened ? "Checkout open" : "Open Razorpay"}
              </Button>
              <p className="text-xs text-muted">UPI · Cards · Net banking · Wallets</p>
            </>
          )}
          <p className="text-xs text-muted font-mono mt-6">Order · {orderId.slice(0, 18)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
