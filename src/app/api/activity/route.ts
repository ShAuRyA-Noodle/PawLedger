import { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SSE endpoint that streams recent ledger events as they arrive.
// Polls the DB every 3s for new entries (lightweight; replace with LISTEN/NOTIFY for production scale).
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let lastSeenAt: Date | null = null;

      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Initial: send the last 10 ledger entries
      try {
        const initial = await db.select({
          id: schema.ledgerEntries.id,
          kind: schema.ledgerEntries.kind,
          description: schema.ledgerEntries.description,
          amountPaise: schema.ledgerEntries.amountPaise,
          currency: schema.ledgerEntries.currency,
          occurredAt: schema.ledgerEntries.occurredAt,
          animalName: schema.animals.name,
          animalSlug: schema.animals.slug,
          shelterName: schema.shelters.name,
        }).from(schema.ledgerEntries)
          .leftJoin(schema.animals, eq(schema.ledgerEntries.animalId, schema.animals.id))
          .leftJoin(schema.shelters, eq(schema.ledgerEntries.shelterId, schema.shelters.id))
          .orderBy(desc(schema.ledgerEntries.occurredAt))
          .limit(10);
        for (const e of initial.reverse()) {
          send("entry", {
            id: e.id, kind: e.kind, description: e.description,
            amount: formatMoney(e.amountPaise > 0n ? e.amountPaise : -e.amountPaise, e.currency),
            isOut: e.amountPaise < 0n,
            animalName: e.animalName, animalSlug: e.animalSlug, shelterName: e.shelterName,
            occurredAt: e.occurredAt.toISOString(),
          });
          lastSeenAt = e.occurredAt;
        }
      } catch {}

      let aborted = false;
      req.signal.addEventListener("abort", () => { aborted = true; controller.close(); });

      const tick = async () => {
        if (aborted) return;
        try {
          const newer = await db.select({
            id: schema.ledgerEntries.id,
            kind: schema.ledgerEntries.kind,
            description: schema.ledgerEntries.description,
            amountPaise: schema.ledgerEntries.amountPaise,
            currency: schema.ledgerEntries.currency,
            occurredAt: schema.ledgerEntries.occurredAt,
            animalName: schema.animals.name,
            animalSlug: schema.animals.slug,
            shelterName: schema.shelters.name,
          }).from(schema.ledgerEntries)
            .leftJoin(schema.animals, eq(schema.ledgerEntries.animalId, schema.animals.id))
            .leftJoin(schema.shelters, eq(schema.ledgerEntries.shelterId, schema.shelters.id))
            .orderBy(desc(schema.ledgerEntries.occurredAt))
            .limit(5);
          for (const e of newer.reverse()) {
            if (lastSeenAt && e.occurredAt <= lastSeenAt) continue;
            send("entry", {
              id: e.id, kind: e.kind, description: e.description,
              amount: formatMoney(e.amountPaise > 0n ? e.amountPaise : -e.amountPaise, e.currency),
              isOut: e.amountPaise < 0n,
              animalName: e.animalName, animalSlug: e.animalSlug, shelterName: e.shelterName,
              occurredAt: e.occurredAt.toISOString(),
            });
            lastSeenAt = e.occurredAt;
          }
        } catch {}
        if (!aborted) setTimeout(tick, 3000);
      };
      setTimeout(tick, 3000);

      // Heartbeat
      const hb = setInterval(() => {
        if (aborted) { clearInterval(hb); return; }
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
