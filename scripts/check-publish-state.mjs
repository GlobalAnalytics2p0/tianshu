#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";

const PUBLISH_SCRIPT = new URL("./publish-site-update.mjs", import.meta.url);

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
  console.log(`status=${result.status}`);
  if (result.message) console.log(`message=${result.message}`);
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
