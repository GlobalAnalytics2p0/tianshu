#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const outputPath = "tmp/reader-feedback/latest.json";
const url = process.env.SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url || !serviceKey) {
  console.log(JSON.stringify({ status: "skipped", reason: "supabase-not-configured", outputPath }));
  process.exit(0);
}

const endpoint = new URL("/rest/v1/feedback_items", url);
endpoint.searchParams.set("select", "id,book_id,kind,summary,created_at");
endpoint.searchParams.set("status", "eq.approved");
endpoint.searchParams.set("order", "created_at.asc");
endpoint.searchParams.set("limit", "500");

const response = await fetch(endpoint, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
});
if (!response.ok) throw new Error(`Feedback sync failed: ${response.status} ${await response.text()}`);
const items = await response.json();
const grouped = Object.groupBy(items, (item) => item.book_id || "platform");
const payload = {
  generatedAt: new Date().toISOString(),
  privacy: "Approved, de-identified summaries only. User identity and raw message content are excluded.",
  itemCount: items.length,
  feedbackIds: items.map((item) => item.id),
  books: Object.fromEntries(Object.entries(grouped).map(([bookId, rows]) => [bookId, rows.map(({ id, kind, summary, created_at }) => ({ id, kind, summary, createdAt: created_at }))]))
};
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ status: "synced", itemCount: items.length, outputPath }));
