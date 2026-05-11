// Trigger.dev v3 config — scaffolded for jobs/weekly-digest, jobs/card-expiry, jobs/ledger-verify.
// Wire up real keys in .env (TRIGGER_API_KEY, TRIGGER_API_URL) and run `npx trigger.dev@latest dev`
// during development. See https://trigger.dev/docs.

export const config = {
  project: "proj_pawledger",
  dirs: ["./src/jobs"],
  runtime: "node",
  logLevel: "log",
  maxDuration: 600,
  retries: { enabledInDev: false, default: { maxAttempts: 3, factor: 2, minTimeoutInMs: 1000, maxTimeoutInMs: 30000 } },
};
