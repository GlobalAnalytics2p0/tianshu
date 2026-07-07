#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const RECOVERY_HANDOFF_PATH = "tmp/automation-supervision/recovery-handoff.json";
export const DELETED_DIGEST = "deleted";
export const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

function runGit(args, encoding = "utf8") {
  return execFileSync("git", args, { encoding });
}

function nullDelimitedGitPaths(args) {
  return runGit(args, "buffer")
    .toString("utf8")
    .split("\u0000")
    .filter(Boolean);
}

export function isRecoveryContentPath(path) {
  if (path === "src/resource/manifest.json") return true;
  return ACTIVE_TITLES.some((title) => path.startsWith(`src/resource/${title}/`));
}

export function digestPath(path) {
  if (!existsSync(path)) return DELETED_DIGEST;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function recoveryDirtyPaths() {
  const tracked = nullDelimitedGitPaths(["diff", "--name-only", "-z", "HEAD", "--"]);
  const untracked = nullDelimitedGitPaths(["ls-files", "--others", "--exclude-standard", "-z", "--"]);
  return [...new Set([...tracked, ...untracked])]
    .filter(isRecoveryContentPath)
    .sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

export function readRecoveryHandoff() {
  if (!existsSync(RECOVERY_HANDOFF_PATH)) return null;
  return JSON.parse(readFileSync(RECOVERY_HANDOFF_PATH, "utf8"));
}

export function expectedRecoveryPaths(handoff) {
  const paths = new Set(Array.isArray(handoff?.changedPaths) ? handoff.changedPaths : []);
  for (const rename of handoff?.renamedPaths ?? []) {
    if (rename?.from) paths.add(rename.from);
    if (rename?.to) paths.add(rename.to);
  }
  return [...paths].sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

export function validateRecoveryHandoff({
  handoff,
  currentHead,
  dirtyPaths,
  digestForPath = digestPath,
  requireReady = true,
}) {
  const issues = [];
  if (!handoff) return { exists: false, valid: false, issues: ["No recovery handoff exists."] };

  if (handoff.ownerAutomationId !== "automation") {
    issues.push(`Unexpected recovery owner: ${handoff.ownerAutomationId ?? "missing"}.`);
  }
  if (requireReady && handoff.state !== "ready-for-coordinator") {
    issues.push(`Recovery handoff is not ready-for-coordinator: ${handoff.state ?? "missing"}.`);
  }
  if (!handoff.sourceHead || handoff.sourceHead !== currentHead) {
    issues.push(`Recovery source HEAD ${handoff.sourceHead ?? "missing"} does not match current HEAD ${currentHead}.`);
  }

  const expectedPaths = expectedRecoveryPaths(handoff);
  if (expectedPaths.length === 0) issues.push("Recovery handoff has no changed paths.");
  for (const path of expectedPaths) {
    if (!isRecoveryContentPath(path)) issues.push(`Recovery handoff contains an out-of-scope path: ${path}`);
  }

  for (const rename of handoff.renamedPaths ?? []) {
    if (!rename?.from || !rename?.to) {
      issues.push("Recovery handoff contains an incomplete rename record.");
      continue;
    }
    if (!(handoff.changedPaths ?? []).includes(rename.to)) {
      issues.push(`Renamed destination is absent from changedPaths: ${rename.to}`);
    }
  }

  const actualPaths = [...new Set(dirtyPaths ?? [])].sort((left, right) => left.localeCompare(right, "zh-Hant"));
  const expectedSet = new Set(expectedPaths);
  const actualSet = new Set(actualPaths);
  for (const path of expectedPaths) {
    if (!actualSet.has(path)) issues.push(`Registered recovery path is not dirty: ${path}`);
  }
  for (const path of actualPaths) {
    if (!expectedSet.has(path)) issues.push(`Dirty recovery path is absent from the handoff: ${path}`);
  }

  const pathDigests = handoff.pathDigests ?? {};
  for (const path of expectedPaths) {
    if (!pathDigests[path]) {
      issues.push(`Recovery handoff is missing a SHA-256/deletion digest: ${path}`);
      continue;
    }
    const actualDigest = digestForPath(path);
    if (actualDigest !== pathDigests[path]) {
      issues.push(`Recovery path digest changed after handoff: ${path}`);
    }
  }

  return {
    exists: true,
    valid: issues.length === 0,
    state: handoff.state,
    sourceHead: handoff.sourceHead,
    expectedPaths,
    dirtyPaths: actualPaths,
    issues,
  };
}

export function inspectRecoveryHandoff() {
  const handoff = readRecoveryHandoff();
  if (!handoff) return { exists: false, valid: false, issues: ["No recovery handoff exists."] };
  return validateRecoveryHandoff({
    handoff,
    currentHead: runGit(["rev-parse", "HEAD"]).trim(),
    dirtyPaths: recoveryDirtyPaths(),
  });
}

export function sealRecoveryHandoff() {
  const handoff = readRecoveryHandoff();
  if (!handoff) throw new Error("Cannot seal a missing recovery handoff.");
  if (handoff.state !== "ready-for-coordinator") {
    throw new Error(`Refusing to seal recovery handoff in state ${handoff.state ?? "missing"}.`);
  }

  const currentHead = runGit(["rev-parse", "HEAD"]).trim();
  const dirtyPaths = recoveryDirtyPaths();
  const structural = validateRecoveryHandoff({
    handoff: { ...handoff, pathDigests: Object.fromEntries(expectedRecoveryPaths(handoff).map((path) => [path, digestPath(path)])) },
    currentHead,
    dirtyPaths,
  });
  if (!structural.valid) throw new Error(structural.issues.join("\n"));

  const sealed = {
    ...handoff,
    sealedAt: new Date().toISOString(),
    pathDigests: Object.fromEntries(structural.expectedPaths.map((path) => [path, digestPath(path)])),
  };
  mkdirSync(dirname(RECOVERY_HANDOFF_PATH), { recursive: true });
  writeFileSync(RECOVERY_HANDOFF_PATH, `${JSON.stringify(sealed, null, 2)}\n`);
  return validateRecoveryHandoff({ handoff: sealed, currentHead, dirtyPaths });
}

export function clearRecoveryHandoff() {
  const dirtyPaths = recoveryDirtyPaths();
  if (dirtyPaths.length > 0) {
    throw new Error(`Refusing to clear recovery handoff while active content is dirty:\n${dirtyPaths.join("\n")}`);
  }
  if (existsSync(RECOVERY_HANDOFF_PATH)) unlinkSync(RECOVERY_HANDOFF_PATH);
  return { cleared: true, path: RECOVERY_HANDOFF_PATH };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = process.argv.includes("--seal")
      ? sealRecoveryHandoff()
      : process.argv.includes("--clear")
        ? clearRecoveryHandoff()
        : inspectRecoveryHandoff();
    console.log(JSON.stringify(result, null, 2));
    if ("valid" in result && !result.valid) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
