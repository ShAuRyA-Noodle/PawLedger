"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitShelterApplication } from "@/app/actions/shelter-apply";

type EntityType = "section_8_company" | "trust" | "society" | "501c3" | "fiscal_sponsored" | "other";

type Form = {
  name: string; legalName: string; founded: string; entityType: EntityType; websiteUrl: string;
  city: string; state: string; pincode: string; email: string; phone: string; contactName: string;
  pan: string; registration12a: string; registration80g: string; registration80gExpiresAt: string;
  awbiRecognition: string; csr1: string;
  about: string; fundraisingHistory: string; references: string;
};

const empty: Form = {
  name: "", legalName: "", founded: "", entityType: "section_8_company", websiteUrl: "",
  city: "", state: "", pincode: "", email: "", phone: "", contactName: "",
  pan: "", registration12a: "", registration80g: "", registration80gExpiresAt: "",
  awbiRecognition: "", csr1: "",
  about: "", fundraisingHistory: "", references: "",
};

export default function ShelterApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(empty);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }));

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const res = await submitShelterApplication({
        name: form.name, legalName: form.legalName, founded: form.founded ? Number(form.founded) : undefined,
        entityType: form.entityType, websiteUrl: form.websiteUrl || undefined,
        city: form.city, state: form.state || undefined, pincode: form.pincode || undefined,
        email: form.email, phone: form.phone, contactName: form.contactName,
        pan: form.pan || undefined, registration12a: form.registration12a || undefined,
        registration80g: form.registration80g || undefined,
        registration80gExpiresAt: form.registration80gExpiresAt || undefined,
        awbiRecognition: form.awbiRecognition || undefined, csr1: form.csr1 || undefined,
        about: form.about || undefined, fundraisingHistory: form.fundraisingHistory || undefined, references: form.references || undefined,
      });
      if (res.ok) setSubmitted(res.applicationId);
      else setError(res.error);
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="text-6xl mb-6">✓</div>
        <h1 className="font-display text-4xl tracking-tight mb-4">Application received</h1>
        <p className="text-slate mb-2">We'll review within 3 business days and reach out via email + WhatsApp.</p>
        <p className="text-sm text-muted mt-4 font-mono">Application ID · {submitted.slice(0, 12)}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <Badge variant="marigold" className="mb-3">Step {step} of 4</Badge>
        <h1 className="font-display text-4xl tracking-tight">Apply to list your shelter</h1>
        <p className="text-slate mt-2">Takes ~10 minutes. Reviewed within 3 business days.</p>
      </header>

      <Card className="p-8">
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <h2 className="font-display text-2xl mb-4">Shelter basics</h2>
              <Field label="Shelter name (public)" required value={form.name} onChange={v => set("name", v)} />
              <Field label="Legal name (as on PAN/registration)" required value={form.legalName} onChange={v => set("legalName", v)} />
              <Field label="Founded year" type="number" value={form.founded} onChange={v => set("founded", v)} />
              <div>
                <Label>Entity type</Label>
                <select
                  value={form.entityType}
                  onChange={e => set("entityType", e.target.value as EntityType)}
                  className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm"
                >
                  <option value="section_8_company">Section 8 Company</option>
                  <option value="trust">Trust (Public)</option>
                  <option value="society">Society (Registered)</option>
                  <option value="501c3">501(c)(3) (US)</option>
                  <option value="fiscal_sponsored">Fiscally sponsored</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Field label="Website" type="url" placeholder="https://" value={form.websiteUrl} onChange={v => set("websiteUrl", v)} />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-2xl mb-4">Location & contact</h2>
              <Field label="City" required value={form.city} onChange={v => set("city", v)} />
              <Field label="State / Region" value={form.state} onChange={v => set("state", v)} />
              <Field label="Pincode / ZIP" value={form.pincode} onChange={v => set("pincode", v)} />
              <Field label="Email" type="email" required value={form.email} onChange={v => set("email", v)} />
              <Field label="Phone (with country code)" required placeholder="+91 …" value={form.phone} onChange={v => set("phone", v)} />
              <Field label="Primary contact name" required value={form.contactName} onChange={v => set("contactName", v)} />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-2xl mb-4">Compliance & registrations</h2>
              <p className="text-sm text-slate -mt-2 mb-2">We verify these against the Income Tax e-filing portal and AWBI public registry.</p>
              <Field label="PAN" placeholder="AAAAA0000A" value={form.pan} onChange={v => set("pan", v)} />
              <Field label="12A registration number" value={form.registration12a} onChange={v => set("registration12a", v)} />
              <Field label="80G registration number" value={form.registration80g} onChange={v => set("registration80g", v)} />
              <Field label="80G expiry date" type="date" value={form.registration80gExpiresAt} onChange={v => set("registration80gExpiresAt", v)} />
              <Field label="AWBI recognition number (if any)" value={form.awbiRecognition} onChange={v => set("awbiRecognition", v)} />
              <Field label="CSR-1 number (if any)" value={form.csr1} onChange={v => set("csr1", v)} />
              <p className="text-xs text-muted">If your 80G has expired, you can still apply — we'll help renew via Form 10AB before going live.</p>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display text-2xl mb-4">About your work</h2>
              <div>
                <Label>Tell us about your shelter (300 words max)</Label>
                <Textarea className="mt-1.5" rows={6} value={form.about} onChange={e => set("about", e.target.value)} />
              </div>
              <div>
                <Label>How do you currently fundraise?</Label>
                <Textarea className="mt-1.5" rows={3} value={form.fundraisingHistory} onChange={e => set("fundraisingHistory", e.target.value)} />
              </div>
              <div>
                <Label>Two references (other shelters, AWBI office, partner vet clinics)</Label>
                <Textarea className="mt-1.5" rows={3} value={form.references} onChange={e => set("references", e.target.value)} placeholder="Name, role, phone or email" />
              </div>
              <p className="text-xs text-muted">By submitting, you confirm all information is accurate and consent to our verification process.</p>
            </>
          )}

          {error && <p className="text-sm text-coral">{error}</p>}

          <div className="flex justify-between pt-4 border-t border-line">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || pending}>← Back</Button>
            {step < 4 ? (
              <Button variant="marigold" onClick={() => setStep(step + 1)} disabled={pending}>Next →</Button>
            ) : (
              <Button variant="marigold" onClick={onSubmit} disabled={pending}>{pending ? "Submitting…" : "Submit application"}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, type = "text", required, placeholder, value, onChange }: { label: string; type?: string; required?: boolean; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}{required && " *"}</Label>
      <Input type={type} required={required} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}
