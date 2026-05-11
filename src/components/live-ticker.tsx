"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; kind: string; description: string; amount: string; isOut: boolean; animalName: string | null; animalSlug: string | null; shelterName: string | null; occurredAt: string };

export function LiveTicker() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.EventSource) return;
    const es = new EventSource("/api/activity");
    es.addEventListener("entry", e => {
      const data = JSON.parse((e as MessageEvent).data) as Entry;
      setEntries(prev => [data, ...prev].slice(0, 20));
    });
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, []);

  if (entries.length === 0) {
    return (
      <div className="overflow-hidden py-4">
        <div className="marquee text-sm text-slate font-mono">
          <div className="flex gap-8">
            <span>· Connecting to live ledger…</span>
            <span>· Ledger entries appear here in real time</span>
            <span>· No fake data — every line is a real donation or expense</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden py-4">
      <div className="marquee text-sm text-slate font-mono">
        <div className="flex gap-8">
          {entries.map(e => (
            <span key={e.id} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${e.isOut ? "bg-coral" : "bg-sage"}`} />
              <span className={e.isOut ? "text-coral/80" : "text-sage/80"}>{e.isOut ? "−" : "+"}{e.amount}</span>
              <span>{e.description.slice(0, 50)}{e.description.length > 50 ? "…" : ""}</span>
              {e.animalName && <span className="text-muted">· {e.animalName}</span>}
            </span>
          ))}
          {/* duplicate for marquee loop */}
          {entries.map(e => (
            <span key={e.id + "-2"} className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${e.isOut ? "bg-coral" : "bg-sage"}`} />
              <span className={e.isOut ? "text-coral/80" : "text-sage/80"}>{e.isOut ? "−" : "+"}{e.amount}</span>
              <span>{e.description.slice(0, 50)}{e.description.length > 50 ? "…" : ""}</span>
              {e.animalName && <span className="text-muted">· {e.animalName}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
