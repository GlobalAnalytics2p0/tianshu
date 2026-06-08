#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const DEFAULT_RETRIES = Number.parseInt(process.env.PUBLISH_RETRIES || "", 10) || 3;
const DEFAULT_RETRY_DELAY_MS = Number.parseInt(process.env.PUBLISH_RETRY_DELAY_MS || "", 10) || 5000;
const VERIFY_SCRIPT = new URL("./verify-site-publication.mjs", import.meta.url);

function parseArgs(argv) {
  const result = {
    retries: DEFAULT_RETRIES,
    retryDelayMs: DEFAULT_RETRY_DELAY_MS
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];
    if (arg === "--retries" && nextValue) {
      result.retries = Number.parseInt(nextValue, 10) || result.retries;
      index += 1;
      continue;
    }
    if (arg === "--retry-delay-ms" && nextValue) {
      result.retryDelayMs = Number.parseInt(nextValue, 10) || result.retryDelayMs;
      index += 1;
    }
  }

  return result;
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function runGitWithStatus(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
}

function isTransientGitHubError(text) {
  return [
    "Could not resolve hostname github.com",
    "Connection timed out",
    "Operation timed out",
    "Connection reset by peer",
    "kex_exchange_identification",
    "Connection closed by remote host",
    "Temporary failure in name resolution"
  ].some((needle) => text.includes(needle));
}

async function retryGit(label, args, retries, retryDelayMs) {
  let lastFailure = "";

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const result = runGitWithStatus(args);
    if (result.status === 0) {
      console.log(`PASS: ${label} (attempt ${attempt}/${retries})`);
      if (result.stdout) console.log(result.stdout);
      return result.stdout;
    }

    lastFailure = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const transient = isTransientGitHubError(lastFailure);
    console.error(`WARN: ${label} failed on attempt ${attempt}/${retries}`);
    if (lastFailure) console.error(lastFailure);

    if (!transient || attempt === retries) {
      throw new Error(`${label} failed: ${lastFailure || "unknown git error"}`);
    }

    await delay(retryDelayMs);
  }

  throw new Error(`${label} failed: ${lastFailure || "unknown git error"}`);
}

function fail(message, details = []) {
  console.error(`FAIL: ${message}`);
  for (const line of details) console.error(`- ${line}`);
  process.exit(1);
}

async function main() {
  const { retries, retryDelayMs } = parseArgs(process.argv.slice(2));
  const branch = runGit(["branch", "--show-current"]);
  const upstream = runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const remoteUrl = runGit(["remote", "get-url", "origin"]);
  const [behindText, aheadText] = runGit(["rev-list", "--left-right", "--count", `${upstream}...HEAD`]).split(/\s+/);
  const behind = Number.parseInt(behindText, 10) || 0;
  const ahead = Number.parseInt(aheadText, 10) || 0;

  console.log(`INFO: branch=${branch}`);
  console.log(`INFO: upstream=${upstream}`);
  console.log(`INFO: origin=${remoteUrl}`);
  console.log(`INFO: ahead=${ahead} behind=${behind}`);

  if (behind > 0) {
    fail("local branch is behind upstream; refusing to publish", [
      `branch=${branch}`,
      `upstream=${upstream}`,
      `ahead=${ahead}`,
      `behind=${behind}`
    ]);
  }

  await retryGit("origin ls-remote", ["ls-remote", "--exit-code", "origin", "HEAD"], retries, retryDelayMs);

  if (ahead > 0) {
    await retryGit("git push", ["push", "origin", `HEAD:${branch}`], retries, retryDelayMs);
  } else {
    console.log("INFO: no local-only commits to push");
  }

  const verify = spawnSync("node", [VERIFY_SCRIPT.pathname], { encoding: "utf8" });
  if (verify.stdout.trim()) console.log(verify.stdout.trim());
  if (verify.status !== 0) {
    fail("site verification failed after publish step", [verify.stderr.trim() || "verify script returned non-zero"]);
  }
}

main().catch((error) => {
  fail("publish-site-update crashed", [error instanceof Error ? error.stack || error.message : String(error)]);
});
