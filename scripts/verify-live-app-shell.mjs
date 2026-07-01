#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { verifyLiveAppShell } from "./live-app-shell.mjs";

const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.PUBLISH_VERIFY_TIMEOUT_MS || "", 10) || 180000;
const DEFAULT_POLL_MS = Number.parseInt(process.env.PUBLISH_VERIFY_POLL_MS || "", 10) || 5000;
const CNAME_PATH = new URL("../CNAME", import.meta.url);

function parseArgs(argv) {
  const result = {
    timeoutMs: DEFAULT_TIMEOUT_MS,
    pollMs: DEFAULT_POLL_MS
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];
    if (arg === "--timeout-ms" && nextValue) {
      result.timeoutMs = Number.parseInt(nextValue, 10) || result.timeoutMs;
      index += 1;
      continue;
    }
    if (arg === "--poll-ms" && nextValue) {
      result.pollMs = Number.parseInt(nextValue, 10) || result.pollMs;
      index += 1;
    }
  }

  return result;
}

function resolveSiteUrl() {
  const configured = String(process.env.SITE_URL || "").trim();
  if (configured) return configured;

  if (existsSync(CNAME_PATH)) {
    const cname = readFileSync(CNAME_PATH, "utf8").trim().replace(/^https?:\/\//, "");
    if (cname) return `https://${cname}/`;
  }

  throw new Error("SITE_URL is required when CNAME is unavailable");
}

async function main() {
  const { timeoutMs, pollMs } = parseArgs(process.argv.slice(2));
  const siteUrl = resolveSiteUrl();
  const result = await verifyLiveAppShell({
    siteUrl,
    timeoutMs,
    pollMs,
    onRetry(message) {
      console.error(`WAIT: ${message}`);
    }
  });

  console.log("PASS: live app shell references a reachable Vite hashed bundle");
  console.log(`site=${siteUrl}`);
  console.log(`bundle=${result.bundleUrl}`);
}

main().catch((error) => {
  console.error("FAIL: live app shell verification failed");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
