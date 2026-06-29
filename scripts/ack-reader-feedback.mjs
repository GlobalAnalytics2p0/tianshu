#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const chapter = process.argv.slice(2).join(" ").trim();
if (!chapter) throw new Error("Usage: node scripts/ack-reader-feedback.mjs <published chapter label>");
const url = process.env.SUPABASE_URL || "";
const syncSecret = process.env.TIANSHU_SYNC_SECRET || "";
if (!url || !syncSecret) {
  console.log(JSON.stringify({ status: "skipped", reason: "platform-sync-not-configured" }));
  process.exit(0);
}
const feedback = JSON.parse(readFileSync("tmp/reader-feedback/latest.json", "utf8"));
if (!feedback.feedbackIds?.length) {
  console.log(JSON.stringify({ status: "skipped", reason: "no-approved-feedback" }));
  process.exit(0);
}
const response = await fetch(new URL("/functions/v1/ack-feedback", url), {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": `feedback-${createHash("sha256").update(`${chapter}:${feedback.feedbackIds.join(",")}`).digest("hex").slice(0, 32)}`,
    "x-sync-secret": syncSecret
  },
  body: JSON.stringify({ feedbackIds: feedback.feedbackIds, chapter })
});
const result = await response.json().catch(() => ({}));
if (!response.ok || result.error) throw new Error(`Feedback ack failed: ${response.status} ${JSON.stringify(result.error || result)}`);
console.log(JSON.stringify({ status: "acknowledged", ...result.data }));
