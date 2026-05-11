"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.posthog.com";

if (typeof window !== "undefined" && KEY) {
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false, // we capture manually below
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    person_profiles: "identified_only",
    autocapture: false,
    loaded: ph => { if (process.env.NODE_ENV === "development") ph.opt_out_capturing(); },
  });
}

function PageviewCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!KEY || typeof window === "undefined") return;
    const url = pathname + (searchParams.size ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: window.location.origin + url });
  }, [pathname, searchParams]);
  return null;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  if (!KEY) return <>{children}</>;
  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}><PageviewCapture /></Suspense>
      {children}
    </PostHogProvider>
  );
}
