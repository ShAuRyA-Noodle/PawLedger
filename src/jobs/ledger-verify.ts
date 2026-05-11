// Trigger.dev job — runs nightly.
// Re-verifies every shelter's hash chain end-to-end. Pages admins if any chain is broken.

import { db, schema } from "@/db";
import { verifyLedgerChain } from "@/lib/ledger";
import { eq } from "drizzle-orm";

export async function nightlyLedgerAudit() {
  const shelters = await db.select({ id: schema.shelters.id, name: schema.shelters.name }).from(schema.shelters).where(eq(schema.shelters.isPublished, true));
  const broken: { id: string; name: string; brokenAt: number }[] = [];
  const heads: { id: string; head: string }[] = [];

  for (const s of shelters) {
    const result = await verifyLedgerChain(s.id);
    if (!result.valid) broken.push({ id: s.id, name: s.name, brokenAt: result.brokenAt ?? -1 });
    else if (result.head) heads.push({ id: s.id, head: result.head });
  }

  if (broken.length > 0) {
    // TODO: page admins (Slack/PagerDuty). For now log loudly.
    console.error(`[ledger-audit] CHAIN BROKEN for ${broken.length} shelters`, broken);
  }

  // Persist daily heads (for external verifiers + future on-chain anchoring)
  // TODO: write to S3 or anchor to a public chain (Bitcoin OP_RETURN, ~$5/wk)

  return { ok: true, sheltersChecked: shelters.length, broken: broken.length, heads };
}
