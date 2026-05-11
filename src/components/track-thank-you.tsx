"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function TrackThankYou({ animal, sessionId }: { animal: string | null; sessionId: string | null }) {
  useEffect(() => { track("sponsor_completed", { animal, sessionId }); }, [animal, sessionId]);
  return null;
}
