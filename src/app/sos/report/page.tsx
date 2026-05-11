"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { submitSOSReport } from "@/app/actions/sos";

type Form = {
  species: "dog" | "cat" | "cow" | "bird" | "rabbit" | "horse" | "donkey" | "other";
  conditionDescription: string;
  isInjured: boolean;
  isHitByVehicle: boolean;
  isAggressive: boolean;
  city: string;
  addressNote: string;
  reporterPhone: string;
  reporterName: string;
};

export default function SOSReportPage() {
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<{ publicId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    species: "dog", conditionDescription: "",
    isInjured: false, isHitByVehicle: false, isAggressive: false,
    city: "", addressNote: "", reporterPhone: "", reporterName: "",
  });

  const grabLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported by this browser."); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setError(null); },
      err => setError("Could not get location: " + err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setError("Photo too large (max 8 MB)."); return; }
    // Convert to data URL for preview; in production we POST to /api/upload that signs a put-URL to R2
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = () => {
    setError(null);
    if (!coords) { setError("Location required."); setStep(2); return; }
    if (form.conditionDescription.length < 10) { setError("Please describe the condition (at least 10 characters)."); setStep(1); return; }

    startTransition(async () => {
      const res = await submitSOSReport({
        species: form.species,
        conditionDescription: form.conditionDescription,
        isInjured: form.isInjured,
        isHitByVehicle: form.isHitByVehicle,
        isAggressive: form.isAggressive,
        latitude: coords.lat, longitude: coords.lng,
        city: form.city || undefined,
        addressNote: form.addressNote || undefined,
        photoUrl: photoUrl ?? undefined,
        reporterPhone: form.reporterPhone || undefined,
        reporterName: form.reporterName || undefined,
      });
      if (res.ok) setSubmitted({ publicId: res.publicId });
      else setError(res.error);
    });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Badge variant="sage" className="mb-4">Reported · case open</Badge>
        <h1 className="font-display text-4xl tracking-tight mb-4">Thank you for caring.</h1>
        <p className="text-slate mb-2">Your report has been routed to verified shelters in the area.</p>
        <p className="text-slate mb-6">Most cases get a dispatch confirmation within 30 minutes during daylight.</p>
        <p className="text-sm text-muted mb-8 font-mono">Case ID · {submitted.publicId.slice(0, 12)}</p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="marigold"><Link href={`/sos/${submitted.publicId}`}>Track this case</Link></Button>
          <Button asChild variant="secondary"><Link href="/sos">All cases</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Badge variant="coral" className="mb-3">SOS · Step {step} of 3</Badge>
      <h1 className="font-display text-4xl tracking-tight mb-8">Report a street animal</h1>

      <Card className="p-8">
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <h2 className="font-display text-xl">1. The animal</h2>
              <div>
                <Label>Species</Label>
                <select
                  value={form.species}
                  onChange={e => setForm({ ...form, species: e.target.value as Form["species"] })}
                  className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm"
                >
                  <option value="dog">dog</option><option value="cat">cat</option><option value="cow">cow</option>
                  <option value="bird">bird</option><option value="rabbit">rabbit</option>
                  <option value="horse">horse</option><option value="donkey">donkey</option><option value="other">other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="cond">What's wrong? (1–2 sentences)</Label>
                <Textarea
                  id="cond" rows={3} className="mt-1.5"
                  placeholder="e.g. Hind leg dragging, limping. Bleeding from a small cut on side."
                  value={form.conditionDescription}
                  onChange={e => setForm({ ...form, conditionDescription: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-3 rounded-md border border-line cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isInjured} onChange={e => setForm({ ...form, isInjured: e.target.checked })} /> Injured
                </label>
                <label className="flex items-center gap-2 p-3 rounded-md border border-line cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isHitByVehicle} onChange={e => setForm({ ...form, isHitByVehicle: e.target.checked })} /> Hit by vehicle
                </label>
                <label className="flex items-center gap-2 p-3 rounded-md border border-line cursor-pointer text-sm">
                  <input type="checkbox" checked={form.isAggressive} onChange={e => setForm({ ...form, isAggressive: e.target.checked })} /> Aggressive — keep distance
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-xl">2. Photo + location</h2>
              <div>
                <Label>Photo (recommended — helps shelter assess)</Label>
                <Input type="file" accept="image/*" capture="environment" onChange={onPhotoChange} className="mt-1.5" />
                {photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="preview" className="mt-3 max-h-48 rounded-md object-cover" />
                )}
              </div>
              <div>
                <Label>Location</Label>
                {coords ? (
                  <div className="mt-1.5 flex items-center justify-between p-3 rounded-md bg-sage/10 border border-sage/30">
                    <span className="text-sm font-mono">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                    <button type="button" onClick={() => setCoords(null)} className="text-xs underline">Clear</button>
                  </div>
                ) : (
                  <Button type="button" onClick={grabLocation} fullWidth variant="secondary" className="mt-1.5">
                    📍 Use my current location
                  </Button>
                )}
                <Input className="mt-2" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                <Input className="mt-2" placeholder="Address note (e.g. behind blue gate, near temple)" value={form.addressNote} onChange={e => setForm({ ...form, addressNote: e.target.value })} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-xl">3. Your contact (optional)</h2>
              <p className="text-sm text-slate -mt-3">We'll only use this to send you an update on what happened to the animal. No marketing, ever.</p>
              <div>
                <Label htmlFor="phone">Phone (preferred)</Label>
                <Input id="phone" type="tel" placeholder="+91 …" className="mt-1.5" value={form.reporterPhone} onChange={e => setForm({ ...form, reporterPhone: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" className="mt-1.5" value={form.reporterName} onChange={e => setForm({ ...form, reporterName: e.target.value })} />
              </div>
            </>
          )}

          {error && <p className="text-sm text-coral">{error}</p>}

          <div className="flex justify-between pt-4 border-t border-line">
            <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || pending}>← Back</Button>
            {step < 3 ? (
              <Button variant="marigold" onClick={() => setStep(step + 1)} disabled={pending}>Next →</Button>
            ) : (
              <Button variant="danger" onClick={onSubmit} disabled={pending}>{pending ? "Sending…" : "Send SOS"}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
