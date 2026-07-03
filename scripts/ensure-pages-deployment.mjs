#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.PAGES_DEPLOY_TIMEOUT_MS || "", 10) || 180000;
const DEFAULT_POLL_MS = Number.parseInt(process.env.PAGES_DEPLOY_POLL_MS || "", 10) || 5000;
const WORKFLOW = "Build and deploy Tianshu Pages";

function parseArgs(argv) {
  const options = { retry: false, timeoutMs: DEFAULT_TIMEOUT_MS, pollMs: DEFAULT_POLL_MS };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--retry") options.retry = true;
    if (arg === "--timeout-ms" && value) {
      options.timeoutMs = Number.parseInt(value, 10) || options.timeoutMs;
      index += 1;
    }
    if (arg === "--poll-ms" && value) {
      options.pollMs = Number.parseInt(value, 10) || options.pollMs;
      index += 1;
    }
  }
  return options;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function repoFromOrigin(origin) {
  const match = origin.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Unsupported GitHub origin: ${origin}`);
  return match[1];
}

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function runs(repo, sha) {
  const output = gh([
    "run", "list", "--repo", repo, "--workflow", WORKFLOW, "--commit", sha, "--limit", "20",
    "--json", "databaseId,status,conclusion,headSha,createdAt,url"
  ]);
  return JSON.parse(output || "[]").filter((run) => run.headSha === sha);
}

function newest(items) {
  return [...items].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0] || null;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const branch = git(["branch", "--show-current"]);
  const sha = git(["rev-parse", "HEAD"]);
  const repo = repoFromOrigin(git(["remote", "get-url", "origin"]));
  let current = newest(runs(repo, sha));

  if (current?.status === "completed" && current.conclusion === "success") {
    console.log(`PASS: Pages workflow succeeded for ${sha}`);
    console.log(`run=${current.url}`);
    return;
  }

  if (!options.retry) {
    fail(current
      ? `Pages workflow is ${current.status}/${current.conclusion || "pending"} for ${sha}; ${current.url}`
      : `No Pages workflow run found for ${sha}`);
  }

  if (current?.status === "completed") {
    console.log(`INFO: retrying failed Pages workflow for ${sha}`);
    gh(["run", "rerun", String(current.databaseId), "--failed", "--repo", repo]);
  } else if (!current) {
    console.log(`INFO: dispatching Pages workflow for ${sha}`);
    gh(["workflow", "run", "deploy-pages.yml", "--repo", repo, "--ref", branch]);
  }

  const deadline = Date.now() + options.timeoutMs;
  while (Date.now() <= deadline) {
    current = newest(runs(repo, sha));
    if (current?.status === "completed") {
      if (current.conclusion === "success") {
        console.log(`PASS: Pages workflow succeeded for ${sha}`);
        console.log(`run=${current.url}`);
        return;
      }
      fail(`Pages workflow failed for ${sha}; ${current.url}`);
    }
    await delay(options.pollMs);
  }

  fail(`Pages workflow did not finish within ${options.timeoutMs}ms for ${sha}${current ? `; ${current.url}` : ""}`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
