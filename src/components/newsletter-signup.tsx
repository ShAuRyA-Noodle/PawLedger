"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export function NewsletterSignup({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await subscribeNewsletter({ email, source });
    setStatus(res.ok ? "ok" : "err");
    setPending(false);
    if (res.ok) setEmail("");
  }

  if (status === "ok") {
    return <p className="text-sm text-sage">Subscribed. Watch your inbox for monthly impact stories.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
      <Button type="submit" variant="marigold" disabled={pending}>{pending ? "Subscribing…" : "Subscribe"}</Button>
    </form>
  );
}
