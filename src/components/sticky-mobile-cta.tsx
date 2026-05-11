"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = { animalName: string; animalSlug: string; monthlyAmount: string };

export function StickyMobileCTA({ animalName, animalSlug, monthlyAmount }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-line p-3 transition-transform ${visible ? "translate-y-0" : "translate-y-full"} shadow-deep`}
      role="region"
      aria-label="Sponsor call to action"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">Sponsor {animalName}</p>
          <p className="font-display text-lg">{monthlyAmount}/mo</p>
        </div>
        <Button asChild variant="marigold">
          <Link href={`#sponsor`}>Sponsor →</Link>
        </Button>
      </div>
    </div>
  );
}
