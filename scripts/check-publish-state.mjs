#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { inspectBatch } from "./automation-batch-state.mjs";

const PUBLISH_SCRIPT = new URL("./publish-site-update.mjs", import.meta.url);
const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];
const ACTIVE_NOTE_NAMES = new Set([
  "風格規則.md",
  "核心靈魂檔案.md",
  "作者思路.md",
  "人物架構.md",
  "每日寫作狀態.md",
  "伏筆事件台帳.md",
  "反思.md"
]);

function parseArgs(argv) {
  return {
    allowLocalOnly: argv.includes("--allow-local-only"),
    autoPublishIfAhead: argv.includes("--auto-publish-if-ahead"),
    json: argv.includes("--json")
  };
}

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function runGitNullDelimited(args) {
  return execFileSync("git", args, { encoding: "buffer" })
    .toString("utf8")
    .split("\u0000")
    .filter(Boolean);
}

function runGitWithStatus(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  return {
    status: result.status ?? 1,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
}

function print(result, asJson = false) {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`branch=${result.branch}`);
  console.log(`upstream=${result.upstream}`);
  console.log(`origin=${result.origin}`);
  console.log(`ahead=${result.ahead}`);
  console.log(`behind=${result.behind}`);
  console.log(`remoteReachable=${result.remoteReachable}`);
  if (result.remoteError) console.log(`remoteError=${result.remoteError}`);
  console.log(`dirtyActiveContent=${result.dirtyActivePaths.length}`);
  if (result.dirtyActivePaths.length > 0) {
    for (const path of result.dirtyActivePaths) {
      console.log(`dirtyActivePath=${path}`);
    }
  }
  console.log(`status=${result.status}`);
  if (result.message) console.log(`message=${result.message}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isActiveContentPath(path) {
  if (path === "src/resource/manifest.json") return true;

  for (const title of ACTIVE_TITLES) {
    const escapedTitle = escapeRegExp(title);
    const chapterRegex = new RegExp(`^src/resource/${escapedTitle}/文章/第\\d+章 .+\\.txt$`);
    if (chapterRegex.test(path)) return true;

    const noteRegex = new RegExp(`^src/resource/${escapedTitle}/素材/([^/]+)$`);
    const noteMatch = path.match(noteRegex);
    if (noteMatch && ACTIVE_NOTE_NAMES.has(noteMatch[1])) return true;
  }

  return false;
}

function getDirtyActivePaths() {
  const tracked = runGitNullDelimited(["diff", "--name-only", "-z", "HEAD", "--"]);
  const untracked = runGitNullDelimited(["ls-files", "--others", "--exclude-standard", "-z", "--"]);
  const unique = new Set([...tracked, ...untracked]);
  return [...unique].filter(isActiveContentPath).sort((left, right) => left.localeCompare(right, "zh-Hant"));
}

function getState() {
  const branch = runGit(["branch", "--show-current"]);
  const upstream = runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const origin = runGit(["remote", "get-url", "origin"]);
  const [behindText, aheadText] = runGit(["rev-list", "--left-right", "--count", `${upstream}...HEAD`]).split(/\s+/);
  const behind = Number.parseInt(behindText, 10) || 0;
  const ahead = Number.parseInt(aheadText, 10) || 0;
  const remoteCheck = runGitWithStatus(["ls-remote", "--exit-code", "origin", "HEAD"]);
  const remoteReachable = remoteCheck.status === 0;
  const remoteError = remoteReachable
    ? ""
    : [remoteCheck.stdout, remoteCheck.stderr].filter(Boolean).join("\n") || "unknown remote error";

  return {
    branch,
    upstream,
    origin,
    ahead,
    behind,
    dirtyActivePaths: getDirtyActivePaths(),
    remoteReachable,
    remoteError,
    status: "unknown",
    message: ""
  };
}

function exitWith(code, result, asJson = false) {
  print(result, asJson);
  process.exit(code);
}

function runPublishScript() {
  const result = spawnSync("node", [PUBLISH_SCRIPT.pathname], { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.status ?? 1;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const state = getState();

  if (state.behind > 0) {
    state.status = "behind-upstream";
    state.message = "Local branch is behind upstream; resolve divergence before generation or publish.";
    exitWith(4, state, options.json);
  }

  if (state.dirtyActivePaths.length > 0) {
    const batch = inspectBatch(state.dirtyActivePaths);
    state.batch = batch.exists
      ? {
          valid: batch.valid,
          complete: batch.complete,
          targetSlot: batch.state?.targetSlot,
          expectedDailyCount: batch.state?.expectedDailyCount,
          completedTitles: batch.completedTitles,
          missingTitles: batch.missingTitles,
          issues: batch.issues,
        }
      : null;

    if (batch.valid && !batch.complete && state.remoteReachable) {
      state.status = "resumable-batch";
      state.message = `Automation-owned partial batch may resume safely; missing titles: ${batch.missingTitles.join(", ")}.`;
      exitWith(0, state, options.json);
    }

    if (batch.valid && batch.complete && state.remoteReachable) {
      state.status = "completed-batch-awaiting-validation";
      state.message = "Automation-owned batch is complete but uncommitted; run post-generation validation, then publish if it passes.";
      exitWith(0, state, options.json);
    }

    if (state.remoteReachable) {
      state.status = "working-tree-publish-debt";
      state.message = batch.exists
        ? `Uncommitted active-title content does not match its batch state: ${batch.issues.join(" | ")}`
        : "Uncommitted active-title site content exists without an automation batch owner; commit/publish or clear it before new generation.";
      exitWith(6, state, options.json);
    }

    state.status = "working-tree-publish-debt-remote-blocked";
    state.message = "Uncommitted active-title site content exists and origin is unreachable. Resolve or explicitly archive the local-only state before new generation.";
    exitWith(6, state, options.json);
  }

  if (state.ahead > 0) {
    if (state.remoteReachable && options.autoPublishIfAhead) {
      console.log("INFO: deferred publish debt detected; auto-running publish-site-update before content work");
      const publishStatus = runPublishScript();
      if (publishStatus !== 0) {
        state.status = "autopublish-failed";
        state.message = "Deferred publish debt exists and auto-publish failed.";
        exitWith(publishStatus, state, options.json);
      }

      const refreshed = getState();
      refreshed.status = "clean-after-autopublish";
      refreshed.message = "Deferred publish debt was resolved before content work.";
      exitWith(0, refreshed, options.json);
    }

    if (state.remoteReachable) {
      state.status = "publish-debt";
      state.message = "Local unpublished commits exist; run `node scripts/publish-site-update.mjs` before new content generation.";
      exitWith(3, state, options.json);
    }

    state.status = "publish-debt-remote-blocked";
    state.message = "Local unpublished commits exist and origin is unreachable. Record deferred publish debt explicitly before any further local-only run.";
    exitWith(2, state, options.json);
  }

  if (!state.remoteReachable) {
    if (options.allowLocalOnly) {
      state.status = "remote-unreachable-local-only-allowed";
      state.message = "Origin is unreachable. Local-only work is allowed only because --allow-local-only was explicitly provided.";
      exitWith(2, state, options.json);
    }

    state.status = "remote-unreachable-blocking";
    state.message = "Origin is unreachable. Stop before generation; do not create local-only updates unless --allow-local-only is explicitly approved for this run.";
    exitWith(5, state, options.json);
  }

  state.status = "clean";
  state.message = "Branch is synchronized and origin is reachable.";
  exitWith(0, state, options.json);
}

main();
