"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FileComplaintPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <Badge variant="sage" className="mb-3">Filed</Badge>
        <h1 className="font-display text-3xl mb-4">Complaint received.</h1>
        <p className="text-slate">A team member will review within 2 business days. You'll get an email when we respond. The complaint and our response will appear on the public complaints page once we reply.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Badge variant="outline" className="mb-3">File a complaint</Badge>
      <h1 className="font-display text-4xl tracking-tight mb-3">Something's wrong. Tell us.</h1>
      <p className="text-slate mb-10">Concerns about a shelter, an animal, a donation, or about how we run things. We respond publicly.</p>

      <Card className="p-8">
        <CardContent className="space-y-5">
          <div>
            <Label>About</Label>
            <select className="mt-1.5 h-11 w-full rounded-md border border-line-strong bg-card px-3 text-sm">
              <option>A specific shelter</option>
              <option>A specific animal</option>
              <option>A donation / receipt</option>
              <option>An SOS report</option>
              <option>The PawLedger platform itself</option>
            </select>
          </div>
          <div>
            <Label htmlFor="ref">Reference (URL, animal name, shelter name)</Label>
            <Input id="ref" className="mt-1.5" placeholder="https://pawledger.org/animals/bruno-bengaluru" />
          </div>
          <div>
            <Label htmlFor="body">What happened?</Label>
            <Textarea id="body" rows={6} className="mt-1.5" placeholder="Be specific. Include dates, amounts, what you observed, what you expected." />
          </div>
          <div>
            <Label htmlFor="email">Your email (we'll only contact you about this complaint)</Label>
            <Input id="email" type="email" className="mt-1.5" />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1" />
            <span>Make this complaint + our response public (recommended). Uncheck if your situation is sensitive.</span>
          </label>
          <Button onClick={() => setSubmitted(true)} fullWidth variant="marigold" size="lg">File complaint</Button>
        </CardContent>
      </Card>
    </div>
  );
}
