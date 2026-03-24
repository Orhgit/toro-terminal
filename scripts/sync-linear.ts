import "dotenv/config";
import { createSyncIssue } from "../apps/webhook-gateway/src/services/linear.js";
import { execSync } from "node:child_process";

async function main(): Promise<void> {
  const commitHash = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();

  console.log(`[Toro Sync] Syncing commit ${commitHash.slice(0, 8)} to Linear...`);

  if (!process.env.LINEAR_API_KEY) {
    console.log("[Toro Sync] LINEAR_API_KEY not set — skipping Linear sync");
    return;
  }

  try {
    const result = await createSyncIssue(commitHash);
    console.log(`[Toro Sync] ✓ Issue created: ${result.identifier}`);
    console.log(`[Toro Sync]   URL: ${result.url}`);
  } catch (err) {
    console.error("[Toro Sync] ✗ Linear sync failed:", err);
    process.exit(1);
  }
}

main();
