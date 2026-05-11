"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/auth-client";
import { track } from "@/lib/analytics";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    track("signup_started", { marketingOptIn });
    try {
      const res = await signUp.email({ name, email, password, callbackURL: "/dashboard" });
      if (res.error) setError(res.error.message ?? "Sign-up failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl tracking-tight mb-3">Join PawLedger</h1>
      <p className="text-slate mb-10">Create an account to track your sponsorships, get weekly updates, and download tax receipts.</p>

      <Card className="p-8">
        <CardContent className="space-y-4">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" />
              <p className="text-xs text-muted mt-1">Min 8 characters. Use a passphrase you can remember.</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate cursor-pointer">
              <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} className="mt-1" />
              <span>Send me weekly digests of animal updates and impact stories. Unsubscribe in one click anytime.</span>
            </label>
            {error && <p className="text-sm text-coral">{error}</p>}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted pt-2">
            By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-slate">
        Already have an account? <Link href="/sign-in" className="text-marigold-deep hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
