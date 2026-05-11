"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postSponsorMessage } from "@/app/actions/sponsor-messages";

type Message = { id: string; authorName: string | null; body: string; createdAt: Date };

export function SponsorMessageWall({ animalId, animalName, initialMessages, isSignedIn }: { animalId: string; animalName: string; initialMessages: Message[]; isSignedIn: boolean }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (body.length < 3) return;
    startTransition(async () => {
      const res = await postSponsorMessage({ animalId, body });
      if (res.ok) {
        setMessages(m => [{ id: Math.random().toString(), authorName: "You", body, createdAt: new Date() }, ...m]);
        setBody("");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <section>
      <h2 className="font-display text-2xl mb-4">Messages from {animalName}'s sponsors</h2>

      {isSignedIn ? (
        <Card className="p-5 mb-6">
          <Textarea
            rows={3}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={`Leave a note for ${animalName} or other sponsors…`}
            maxLength={500}
            className="mb-3"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted">{body.length}/500</span>
            <Button onClick={submit} disabled={pending || body.length < 3} variant="marigold" size="sm">
              {pending ? "Posting…" : "Post message"}
            </Button>
          </div>
          {error && <p className="text-sm text-coral mt-2">{error}</p>}
        </Card>
      ) : (
        <Card className="p-5 mb-6 bg-line/10 text-sm text-slate">
          <a href="/sign-in" className="underline text-marigold-deep">Sign in</a> as a sponsor to leave a message.
        </Card>
      )}

      {messages.length === 0 ? (
        <p className="text-sm text-slate">No messages yet — be the first.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-medium text-sm">{m.authorName ?? "Sponsor"}</span>
                <span className="text-xs text-muted">{new Date(m.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <p className="text-sm text-slate whitespace-pre-line">{m.body}</p>
            </Card>
          ))}
        </ul>
      )}
    </section>
  );
}
