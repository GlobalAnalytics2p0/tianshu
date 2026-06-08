#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];

const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.PUBLISH_VERIFY_TIMEOUT_MS || "", 10) || 180000;
const DEFAULT_POLL_MS = Number.parseInt(process.env.PUBLISH_VERIFY_POLL_MS || "", 10) || 5000;
const MANIFEST_PATH = new URL("../src/resource/manifest.json", import.meta.url);
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

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function fail(message, details = []) {
  console.error(`FAIL: ${message}`);
  for (const line of details) console.error(`- ${line}`);
  process.exit(1);
}

function parseOriginRemote(remoteUrl) {
  const sshMatch = remoteUrl.match(/^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };

  const httpsMatch = remoteUrl.match(/^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2] };

  return null;
}

function buildSummary(manifest) {
  const books = manifest.books || [];
  return Object.fromEntries(
    ACTIVE_TITLES.map((title) => {
      const book = books.find((item) => item.title === title);
      const lastChapter = book?.chapters?.at(-1) || null;
      return [title, {
        chapterCount: book?.chapters?.length || 0,
        latestNumber: Number(lastChapter?.number || 0),
        latestGeneratedAt: lastChapter?.generatedAt || "",
        latestPath: lastChapter?.path || ""
      }];
    })
  );
}

function diffSummary(expected, actual, label) {
  const mismatches = [];

  for (const title of ACTIVE_TITLES) {
    const left = expected[title];
    const right = actual[title];
    if (!right) {
      mismatches.push(`${label} missing title ${title}`);
      continue;
    }

    if (
      left.chapterCount !== right.chapterCount ||
      left.latestNumber !== right.latestNumber ||
      left.latestGeneratedAt !== right.latestGeneratedAt ||
      left.latestPath !== right.latestPath
    ) {
      mismatches.push(
        `${label} mismatch for ${title}: local=${left.chapterCount}/${left.latestNumber}/${left.latestGeneratedAt} remote=${right.chapterCount}/${right.latestNumber}/${right.latestGeneratedAt}`
      );
    }
  }

  return mismatches;
}

function loadJsonFile(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

async function fetchJson(url) {
  const target = new URL(url);
  target.searchParams.set("ts", String(Date.now()));
  const response = await fetch(target, {
    headers: {
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache"
    }
  });
  if (!response.ok) {
    throw new Error(`${target} returned HTTP ${response.status}`);
  }
  return response.json();
}

function resolveSiteManifestUrl(owner, repo) {
  if (existsSync(CNAME_PATH)) {
    const cname = readFileSync(CNAME_PATH, "utf8").trim().replace(/^https?:\/\//, "");
    if (cname) return `https://${cname}/src/resource/manifest.json`;
  }

  const basePath = repo === `${owner}.github.io` ? "" : `/${repo}`;
  return `https://${owner}.github.io${basePath}/src/resource/manifest.json`;
}

async function main() {
  const { timeoutMs, pollMs } = parseArgs(process.argv.slice(2));
  const localManifest = loadJsonFile(MANIFEST_PATH);
  const localSummary = buildSummary(localManifest);
  const branch = runGit(["branch", "--show-current"]);
  const upstream = runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const [behindText, aheadText] = runGit(["rev-list", "--left-right", "--count", `${upstream}...HEAD`]).split(/\s+/);
  const behind = Number.parseInt(behindText, 10) || 0;
  const ahead = Number.parseInt(aheadText, 10) || 0;

  if (ahead !== 0 || behind !== 0) {
    fail("git branch is not fully published", [
      `branch=${branch}`,
      `upstream=${upstream}`,
      `ahead=${ahead}`,
      `behind=${behind}`
    ]);
  }

  const originUrl = runGit(["remote", "get-url", "origin"]);
  const remote = parseOriginRemote(originUrl);
  if (!remote) {
    fail("origin remote is not a supported github.com URL", [`origin=${originUrl}`]);
  }

  const rawManifestUrl = `https://raw.githubusercontent.com/${remote.owner}/${remote.repo}/${branch}/src/resource/manifest.json`;
  const siteManifestUrl = resolveSiteManifestUrl(remote.owner, remote.repo);

  const rawManifest = await fetchJson(rawManifestUrl);
  const rawMismatches = diffSummary(localSummary, buildSummary(rawManifest), "raw");
  if (rawMismatches.length > 0) {
    fail("raw GitHub manifest does not match local manifest after push", rawMismatches);
  }

  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  let lastMismatches = [];

  while (Date.now() <= deadline) {
    try {
      const siteManifest = await fetchJson(siteManifestUrl);
      const mismatches = diffSummary(localSummary, buildSummary(siteManifest), "live");
      if (mismatches.length === 0) {
        console.log(`PASS: site manifest matches local manifest for ${ACTIVE_TITLES.length} active titles`);
        console.log(`site=${siteManifestUrl}`);
        console.log(`branch=${branch}`);
        return;
      }
      lastMismatches = mismatches;
      lastError = "";
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      lastMismatches = [];
    }

    await delay(pollMs);
  }

  if (lastError) {
    fail("live site manifest could not be verified before timeout", [
      `site=${siteManifestUrl}`,
      `error=${lastError}`
    ]);
  }

  fail("live site manifest did not catch up before timeout", [
    `site=${siteManifestUrl}`,
    ...lastMismatches
  ]);
}

main().catch((error) => {
  fail("publication verification crashed", [error instanceof Error ? error.stack || error.message : String(error)]);
});
