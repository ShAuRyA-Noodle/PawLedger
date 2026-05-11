"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitCSRInquiry } from "@/app/actions/csr";

type Tier = "pilot" | "growth" | "enterprise";

export default function CSRContactPage() {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [cin, setCin] = useState("");
  const [csrPoolBudgetINR, setCSRPool] = useState("");
  const [preferredTier, setPreferredTier] = useState<Tier>("pilot");
  const [notes, setNotes] = useState("");

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitCSRInquiry({
        companyName, legalName, contactName, contactEmail,
        contactPhone: contactPhone || undefined,
        pan: pan || undefined, gstin: gstin || undefined, cin: cin || undefined,
        csrPoolBudgetINR: csrPoolBudgetINR ? Number(csrPoolBudgetINR) : undefined,
        preferredTier, notes: notes || undefined,
      });
      if (res.ok) setSubmitted(true);
      else setError(res.error);
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Badge variant="sage" className="mb-4">Inquiry received</Badge>
        <h1 className="font-display text-4xl tracking-tight mb-4">Thanks — we'll be in touch.</h1>
        <p className="text-slate">A team member will reach out within one business day with a sample CSR-1 + CSR-2 packet for {companyName}.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Badge variant="marigold" className="mb-3">Corporate CSR · contact</Badge>
      <h1 className="font-display text-4xl tracking-tight mb-3">Tell us about your CSR program.</h1>
      <p className="text-slate mb-10">We'll send a sample CSR packet for your sector before our intro call.</p>

      <Card className="p-8">
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Company name *</Label><Input className="mt-1.5" required value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            <div><Label>Legal name *</Label><Input className="mt-1.5" required value={legalName} onChange={e => setLegalName(e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Your name *</Label><Input className="mt-1.5" required value={contactName} onChange={e => setContactName(e.target.value)} /></div>
            <div><Label>Email *</Label><Input className="mt-1.5" type="email" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input className="mt-1.5" placeholder="+91 …" value={contactPhone} onChange={e => setContactPhone(e.target.value)} /></div>
            <div>
              <Label>Preferred tier</Label>
              <select value={preferredTier} onChange={e => setPreferredTier(e.target.value as Tier)} className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm">
                <option value="pilot">Pilot (free, single shelter, ₹1L cap)</option>
                <option value="growth">Growth (₹2L/yr, 5 shelters, ₹50L cap)</option>
                <option value="enterprise">Enterprise (custom, unlimited)</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><Label>PAN</Label><Input className="mt-1.5" value={pan} onChange={e => setPan(e.target.value)} /></div>
            <div><Label>GSTIN</Label><Input className="mt-1.5" value={gstin} onChange={e => setGstin(e.target.value)} /></div>
            <div><Label>CIN</Label><Input className="mt-1.5" value={cin} onChange={e => setCin(e.target.value)} /></div>
          </div>
          <div>
            <Label>FY 2026 CSR budget (₹, optional)</Label>
            <Input className="mt-1.5" type="number" placeholder="500000" value={csrPoolBudgetINR} onChange={e => setCSRPool(e.target.value)} />
          </div>
          <div>
            <Label>Anything else we should know?</Label>
            <Textarea className="mt-1.5" rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Existing CSR partners, focus areas, internal stakeholders, timeline…" />
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <Button onClick={onSubmit} fullWidth size="lg" variant="marigold" disabled={pending}>{pending ? "Sending…" : "Send inquiry"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
