"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resolveComplaint } from "@/app/actions/admin-complaint";

type Props = { complaintId: string; currentStatus: "open" | "investigating" | "resolved" | "dismissed"; currentResolution: string | null };

export function ComplaintResolver({ complaintId, currentStatus, currentResolution }: Props) {
  const [resolution, setResolution] = useState(currentResolution ?? "");
  const [pending, startTransition] = useTransition();

  const submit = (status: "investigating" | "resolved" | "dismissed") => startTransition(async () => {
    await resolveComplaint({ complaintId, status, resolution: resolution || undefined });
    window.location.reload();
  });

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg mb-3">Respond</h2>
      <Textarea rows={5} placeholder="What did you find? What action did you take?" value={resolution} onChange={e => setResolution(e.target.value)} className="mb-3" />
      <div className="flex gap-2">
        <Button onClick={() => submit("investigating")} variant="secondary" size="sm" disabled={pending || currentStatus === "investigating"}>Mark investigating</Button>
        <Button onClick={() => submit("resolved")} variant="primary" size="sm" disabled={pending || !resolution}>Resolve</Button>
        <Button onClick={() => submit("dismissed")} variant="ghost" size="sm" disabled={pending}>Dismiss</Button>
      </div>
      <p className="text-xs text-muted mt-3">If complaint is public, your response will appear on /complaints once submitted.</p>
    </Card>
  );
}
