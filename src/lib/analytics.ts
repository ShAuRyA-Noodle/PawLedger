// Tiny analytics helper that wraps PostHog if configured, otherwise no-ops.
// Use from client components only.

"use client";

import posthog from "posthog-js";

type EventName =
  | "sponsor_widget_opened"
  | "sponsor_started"
  | "sponsor_completed"
  | "sponsorship_paused"
  | "sponsorship_cancelled"
  | "sponsorship_resumed"
  | "tier_changed"
  | "sos_reported"
  | "sos_donation_started"
  | "complaint_filed"
  | "shelter_application_submitted"
  | "csr_inquiry_submitted"
  | "newsletter_signup"
  | "signin_started"
  | "signup_started"
  | "wrapped_viewed"
  | "wrapped_shared"
  | "share_clicked"
  | "embed_widget_viewed";

const enabled = () => typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;

export function track(event: EventName, properties?: Record<string, unknown>) {
  if (!enabled()) return;
  try { posthog.capture(event, properties); } catch {}
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (!enabled()) return;
  try { posthog.identify(userId, properties); } catch {}
}

export function reset() {
  if (!enabled()) return;
  try { posthog.reset(); } catch {}
}
