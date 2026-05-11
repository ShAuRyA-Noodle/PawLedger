"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"magic" | "password">("magic");

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await signIn.magicLink({ email, callbackURL: "/dashboard" });
      if (res.error) setError(res.error.message ?? "Could not send magic link.");
      else setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await signIn.email({ email, password, callbackURL: "/dashboard" });
      if (res.error) setError(res.error.message ?? "Sign in failed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl tracking-tight mb-3">Welcome back</h1>
      <p className="text-slate mb-10">Sign in to manage your sponsorships, see updates, and access tax receipts.</p>

      <Card className="p-8">
        {magicSent ? (
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="font-display text-2xl mb-2">Check your email</h2>
            <p className="text-slate text-sm">A sign-in link is on its way to <strong>{email}</strong>. The link expires in 5 minutes.</p>
          </CardContent>
        ) : (
          <CardContent className="space-y-4">
            <form onSubmit={mode === "magic" ? handleMagic : handlePassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              {mode === "password" && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5" />
                </div>
              )}
              {error && <p className="text-sm text-coral">{error}</p>}
              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? "Working…" : mode === "magic" ? "Email me a sign-in link" : "Sign in"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(null); }}
                className="text-sm text-slate hover:text-ink underline"
              >
                {mode === "magic" ? "Use password instead" : "Use magic link instead"}
              </button>
            </div>
          </CardContent>
        )}
      </Card>

      <p className="mt-6 text-center text-sm text-slate">
        New here? <Link href="/sign-up" className="text-marigold-deep hover:underline">Create an account</Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted">
        Or just <Link href="/animals" className="underline hover:text-ink">browse animals</Link> — you can sponsor without an account, then claim it after.
      </p>
    </div>
  );
}
