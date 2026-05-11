"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setShelterKYC, toggleShelterPublished, toggleShelterVerified } from "@/app/actions/admin-shelter";

type Props = {
  shelterId: string;
  currentStatus: "unsubmitted" | "pending" | "in_review" | "verified" | "rejected";
  isPublished: boolean;
  isVerified: boolean;
};

export function ShelterModerationActions({ shelterId, currentStatus, isPublished, isVerified }: Props) {
  const [pending, startTransition] = useTransition();
  const refresh = () => window.location.reload();

  const setStatus = (status: "in_review" | "verified" | "rejected") => startTransition(async () => {
    await setShelterKYC({ shelterId, status });
    refresh();
  });

  const togglePublished = () => startTransition(async () => {
    await toggleShelterPublished({ shelterId, publish: !isPublished });
    refresh();
  });

  const toggleVerified = () => startTransition(async () => {
    await toggleShelterVerified({ shelterId, verify: !isVerified });
    refresh();
  });

  return (
    <div className="bg-card border border-line-strong rounded-xl p-5 flex flex-wrap items-center gap-3">
      <div className="text-sm text-slate mr-auto">
        Status: <Badge variant={currentStatus === "verified" ? "verified" : currentStatus === "rejected" ? "coral" : "outline"}>{currentStatus}</Badge>
      </div>
      <Button onClick={() => setStatus("in_review")} size="sm" variant="secondary" disabled={pending || currentStatus === "in_review"}>Mark in review</Button>
      <Button onClick={() => setStatus("verified")} size="sm" variant="primary" disabled={pending || currentStatus === "verified"}>Verify KYC</Button>
      <Button onClick={() => setStatus("rejected")} size="sm" variant="danger" disabled={pending || currentStatus === "rejected"}>Reject</Button>
      <Button onClick={togglePublished} size="sm" variant="secondary" disabled={pending}>{isPublished ? "Unpublish" : "Publish"}</Button>
      <Button onClick={toggleVerified} size="sm" variant="secondary" disabled={pending}>{isVerified ? "Remove verified" : "Mark verified"}</Button>
    </div>
  );
}
