#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const url = process.env.SUPABASE_URL || "";
const syncSecret = process.env.TIANSHU_SYNC_SECRET || "";
if (!url || !syncSecret) {
  console.log(JSON.stringify({ status: "skipped", reason: "platform-sync-not-configured" }));
  process.exit(0);
}

const manifestSource = readFileSync("src/resource/manifest.json", "utf8");
const manifest = JSON.parse(manifestSource);
const idempotencyKey = `catalog-${createHash("sha256").update(manifestSource).digest("hex").slice(0, 32)}`;
const books = manifest.books.map((book) => {
  const latestChapter = book.chapters?.at(-1);
  let latestContext = "";
  try {
    latestContext = latestChapter?.path ? readFileSync(latestChapter.path, "utf8").slice(-6000) : "";
  } catch {
    latestContext = "";
  }
  return { ...book, latestContext };
});
const response = await fetch(new URL("/functions/v1/sync-catalog", url), {
  method: "POST",
  headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey, "x-sync-secret": syncSecret },
  body: JSON.stringify({ books })
});
const result = await response.json().catch(() => ({}));
if (!response.ok || result.error) throw new Error(`Catalog sync failed: ${response.status} ${JSON.stringify(result.error || result)}`);
console.log(JSON.stringify({ status: "synced", ...result.data }));
