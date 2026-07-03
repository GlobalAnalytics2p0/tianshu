#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { beginBatch, clearBatch, inspectBatch, readBatchState } from "./automation-batch-state.mjs";

const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

const PHASES = new Set(["preflight", "post-generation", "post-publish", "full"]);
const REPORT_PATH = "tmp/automation-supervision/latest.json";
const LEDGER_PATH = "src/resource/automation-supervision-log.md";

function parseArgs(argv) {
  const options = {
    phase: "full",
    date: "",
    expectedPerTitle: null,
    writeLedger: false,
    json: false,
    autoCatchUp: true,
    preflightRetries: 3,
    retryDelayMs: 3000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--phase") options.phase = argv[++index];
    else if (arg.startsWith("--phase=")) options.phase = arg.slice("--phase=".length);
    else if (arg === "--date") options.date = argv[++index];
    else if (arg.startsWith("--date=")) options.date = arg.slice("--date=".length);
    else if (arg === "--expected-per-title") options.expectedPerTitle = Number(argv[++index]);
    else if (arg.startsWith("--expected-per-title=")) {
      options.expectedPerTitle = Number(arg.slice("--expected-per-title=".length));
    } else if (arg === "--write-ledger") options.writeLedger = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--no-auto-catch-up") options.autoCatchUp = false;
    else if (arg === "--preflight-retries") options.preflightRetries = Number(argv[++index]);
    else if (arg.startsWith("--preflight-retries=")) {
      options.preflightRetries = Number(arg.slice("--preflight-retries=".length));
    } else if (arg === "--retry-delay-ms") options.retryDelayMs = Number(argv[++index]);
    else if (arg.startsWith("--retry-delay-ms=")) options.retryDelayMs = Number(arg.slice("--retry-delay-ms=".length));
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!PHASES.has(options.phase)) throw new Error(`--phase must be one of: ${[...PHASES].join(", ")}`);
  if (options.date && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) throw new Error("--date must use YYYY-MM-DD");
  if (options.expectedPerTitle !== null && (!Number.isInteger(options.expectedPerTitle) || options.expectedPerTitle < 0)) {
    throw new Error("--expected-per-title must be a non-negative integer");
  }
  if (!Number.isInteger(options.preflightRetries) || options.preflightRetries < 1) {
    throw new Error("--preflight-retries must be a positive integer");
  }
  if (!Number.isInteger(options.retryDelayMs) || options.retryDelayMs < 0) {
    throw new Error("--retry-delay-ms must be a non-negative integer");
  }
  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/supervise-ai-flow.mjs [--phase preflight|post-generation|post-publish|full] [--write-ledger] [--json]
       [--preflight-retries N] [--retry-delay-ms N]

Closed-loop supervisor for the six-hour AI fiction automation.

Phases:
  preflight        Catch up publish debt if safe, then decide whether generation may start.
  post-generation Run local content/static validation and decide whether publish may start.
  post-publish    Verify branch and live site publication after push.
  full            Run preflight plus local quality checks; useful for manual diagnosis.
`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    ...options,
  });
  return {
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
  };
}

function runGit(args) {
  return run("git", args);
}

function commandCheck(command, args, okStatuses = [0]) {
  const result = run(command, args);
  return {
    name: [command, ...args].join(" "),
    status: result.status,
    ok: okStatuses.includes(result.status),
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isTransientRemoteFailure(parsed, check) {
  const text = [parsed?.remoteError, check.stderr, check.stdout].filter(Boolean).join("\n");
  return (
    parsed?.status?.includes("remote-unreachable") ||
    [
      "Operation timed out",
      "Connection timed out",
      "Could not resolve hostname",
      "Connection reset by peer",
      "Connection closed by remote host",
      "Temporary failure in name resolution",
      "kex_exchange_identification",
    ].some((needle) => text.includes(needle))
  );
}

function parseJsonMaybe(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function taipeiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function taipeiNowIso() {
  const parts = taipeiParts();
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00+08:00`;
}

function taipeiDate(date = new Date()) {
  const parts = taipeiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function expectedSlotsForNow() {
  const hour = Number(taipeiParts().hour);
  if (hour >= 18) return 4;
  if (hour >= 12) return 3;
  if (hour >= 6) return 2;
  return 1;
}

function nonEmptyLines(text) {
  return text.split(/\n/g).map((line) => line.trim()).filter(Boolean);
}

function gitSnapshot() {
  const branch = runGit(["branch", "--show-current"]);
  const upstream = runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const originUrl = runGit(["remote", "get-url", "origin"]);
  const remoteVerbose = runGit(["remote", "-v"]);
  const statusShort = runGit(["status", "--short"]);
  const head = runGit(["rev-parse", "--short", "HEAD"]);
  const remoteHead = runGit(["ls-remote", "--exit-code", "origin", "HEAD"]);
  const upstreamName = upstream.status === 0 ? upstream.stdout : "";
  const counts = upstreamName ? runGit(["rev-list", "--left-right", "--count", `HEAD...${upstreamName}`]) : { status: 1, stdout: "" };
  const [aheadText, behindText] = counts.stdout.split(/\s+/);

  return {
    branch: branch.stdout,
    upstream: upstreamName,
    origin: originUrl.stdout,
    remoteVerbose: remoteVerbose.stdout,
    head: head.stdout,
    ahead: Number.parseInt(aheadText, 10) || 0,
    behind: Number.parseInt(behindText, 10) || 0,
    remoteReachable: remoteHead.status === 0,
    remoteHead: remoteHead.stdout,
    remoteError: remoteHead.status === 0 ? "" : [remoteHead.stdout, remoteHead.stderr].filter(Boolean).join("\n"),
    statusShort: nonEmptyLines(statusShort.stdout),
  };
}

function readManifestSummary(report) {
  if (!existsSync("src/resource/manifest.json")) {
    report.hardIssues.push("Missing src/resource/manifest.json");
    return;
  }
  const manifest = JSON.parse(readFileSync("src/resource/manifest.json", "utf8"));
  report.manifest = {
    generatedAt: manifest.generatedAt,
    activeTitles: [],
  };

  for (const title of ACTIVE_TITLES) {
    const book = manifest.books?.find((item) => item.title === title);
    if (!book) {
      report.hardIssues.push(`Manifest missing active title: ${title}`);
      continue;
    }
    const latest = [...book.chapters].sort((left, right) => right.number - left.number)[0];
    report.manifest.activeTitles.push({
      title,
      chapterCount: book.chapters.length,
      latestChapter: latest
        ? {
            number: latest.number,
            title: latest.title,
            charCount: latest.charCount,
            generatedAt: latest.generatedAt,
            path: latest.path,
          }
        : null,
      updatedAt: book.updatedAt,
      updateNote: book.updateNote,
    });
  }
}

function qualityWarningLessons(warnings, currentChapterRefs = new Set()) {
  const currentWarnings = warnings.filter((warning) => {
    if (currentChapterRefs.size === 0) return false;
    return [...currentChapterRefs].some((ref) => warning.startsWith(ref));
  });
  const lessons = [];
  const aiEven = currentWarnings.filter((warning) => warning.includes("AI-even pacing"));
  if (aiEven.length > 0) {
    lessons.push(
      "本輪新章呈現 AI 均速段落風險；必須在本批次修稿，而不是把舊章警告誤當成本輪結論或留到下一輪。",
    );
  }
  const hook = currentWarnings.filter((warning) => warning.includes("Final three lines") || warning.includes("final three"));
  if (hook.length > 0) {
    lessons.push("章尾鉤子仍需用具體人、物、地、時間或一句話收束；抽象危險感不可作為最後三行。");
  }
  const firstWindow = currentWarnings.filter((warning) => warning.includes("First 1,800"));
  if (firstWindow.length > 0) {
    lessons.push("前 1200-1800 字必須有可見壓力轉向或情緒切口，不能只做資訊鋪排。");
  }
  return lessons;
}

function runPreflight(report, options) {
  const deployment = commandCheck("node", ["scripts/ensure-pages-deployment.mjs", "--retry"], [0]);
  report.checks.push(deployment);
  if (!deployment.ok) {
    report.hardIssues.push("Previous Pages workflow is not successfully deployed.");
    report.nextActions.push("Restore the Pages deployment before generating another fiction batch.");
    return;
  }

  const live = commandCheck("node", ["scripts/verify-site-publication.mjs"], [0]);
  report.checks.push(live);
  if (!live.ok) {
    report.hardIssues.push("Previous publication is not proven live.");
    report.nextActions.push("Wait for or repair Pages/CDN publication before generating another fiction batch.");
    return;
  }

  const feedbackSync = commandCheck("node", ["scripts/sync-reader-feedback.mjs"], [0]);
  report.checks.push(feedbackSync);
  if (!feedbackSync.ok) {
    report.warnings.push("Reader feedback sync failed; generation may continue without new reader context, but the failure must be investigated.");
  }

  let check = null;
  let parsed = null;
  for (let attempt = 1; attempt <= options.preflightRetries; attempt += 1) {
    check = commandCheck("node", ["scripts/check-publish-state.mjs", "--json"], [0, 2, 3, 4, 5, 6]);
    parsed = parseJsonMaybe(check.stdout);
    report.checks.push({ ...check, parsed, attempt });

    if (!isTransientRemoteFailure(parsed, check) || attempt === options.preflightRetries) break;
    report.recoveryActions.push({
      action: "retry-preflight-remote-check",
      ok: true,
      detail: `Transient remote check failure on attempt ${attempt}/${options.preflightRetries}; retrying after ${options.retryDelayMs}ms.`,
    });
    sleepSync(options.retryDelayMs);
  }

  if (!parsed) {
    report.hardIssues.push("Preflight publish-state check did not return parseable JSON.");
    return;
  }

  report.preflightState = parsed;
  if (parsed.status === "publish-debt" && parsed.remoteReachable && options.autoCatchUp) {
    const publish = commandCheck("node", ["scripts/publish-site-update.mjs"], [0]);
    report.recoveryActions.push({
      action: "auto-publish-debt",
      ok: publish.ok,
      detail: publish.ok ? "Published local ahead commit before new generation." : publish.stderr || publish.stdout,
    });
    report.checks.push(publish);
    if (publish.ok) clearBatch();

    const refreshed = commandCheck("node", ["scripts/check-publish-state.mjs", "--json"], [0, 2, 3, 4, 5, 6]);
    report.checks.push({ ...refreshed, parsed: parseJsonMaybe(refreshed.stdout) });
    report.preflightState = parseJsonMaybe(refreshed.stdout) ?? parsed;
  }

  const state = report.preflightState;
  if (state.status === "clean" || state.status === "clean-after-autopublish") {
    report.batch = inspectBatch();
    if (report.batch.exists && !report.batch.valid) {
      if (report.batch.missingTitles.length === 0) {
        clearBatch();
        report.recoveryActions.push({
          action: "clear-verified-stale-batch",
          ok: true,
          detail: "Cleared a fully completed batch only after Pages workflow and live-site verification passed.",
        });
        report.batch = inspectBatch();
      } else {
        report.hardIssues.push(`Batch state is not safely resumable: ${report.batch.issues.join(" | ")}`);
        return;
      }
    }
    if (!report.batch.exists) {
      beginBatch();
      report.batch = inspectBatch();
    }
  } else if (state.status === "resumable-batch" || state.status === "completed-batch-awaiting-validation") {
    report.batch = inspectBatch(state.dirtyActivePaths ?? []);
    if (!report.batch.valid) {
      report.hardIssues.push(`Batch state is not safely resumable: ${report.batch.issues.join(" | ")}`);
    } else if (state.status === "resumable-batch") {
      report.nextActions.push(`Resume only the missing titles: ${report.batch.missingTitles.join(", ")}.`);
    } else {
      report.nextActions.push("Run post-generation validation; do not generate a second chapter for this slot.");
    }
  } else {
    report.hardIssues.push(`Preflight blocks generation: ${state.status}. ${state.message}`);
    if (state.dirtyActivePaths?.length) {
      report.nextActions.push("Resolve or intentionally publish the listed dirty active content before generating new chapters.");
    }
    if (state.status?.includes("remote-unreachable")) {
      report.nextActions.push("Do not create another silent local-only batch; record remote/auth blocker and retry publish when network returns.");
    }
  }
}

function runLocalValidation(report, options) {
  const batchState = readBatchState();
  report.batch = inspectBatch();
  const expectedPerTitle = options.expectedPerTitle ?? batchState?.expectedDailyCount ?? expectedSlotsForNow();
  const targetDate = options.date || batchState?.targetDate || taipeiDate();

  const checks = [
    commandCheck("node", ["--check", "app.js"], [0]),
    commandCheck("node", ["--check", "scripts/check-publish-state.mjs"], [0]),
    commandCheck("node", ["--check", "scripts/audit-active-novel-quality.mjs"], [0]),
    commandCheck("node", ["--check", "scripts/audit-todays-active-chapters.mjs"], [0]),
    commandCheck("node", ["--check", "scripts/audit-active-review-receipts.mjs"], [0]),
    commandCheck("node", ["--check", "scripts/audit-writing-rule-consistency.mjs"], [0]),
    commandCheck("git", ["diff", "--check"], [0]),
  ];

  const quality = commandCheck("node", ["scripts/audit-active-novel-quality.mjs", "--strict", "--json"], [0, 1]);
  const qualityJson = parseJsonMaybe(quality.stdout);
  checks.push({ ...quality, parsed: qualityJson });
  if (quality.status !== 0) {
    report.hardIssues.push("Active novel quality audit failed.");
    report.nextActions.push("Revise chapters or note state until `node scripts/audit-active-novel-quality.mjs --strict` exits cleanly.");
  }
  if (qualityJson?.report?.hardIssues?.length) report.hardIssues.push(...qualityJson.report.hardIssues);
  if (qualityJson?.report?.warnings?.length) report.warnings.push(...qualityJson.report.warnings);

  const todayArgs = [
    "scripts/audit-todays-active-chapters.mjs",
    "--strict",
    "--today",
    "--expected-per-title",
    String(expectedPerTitle),
  ];
  if (options.date) todayArgs.splice(2, 1, "--date", targetDate);
  const today = commandCheck("node", todayArgs, [0, 1]);
  const todayJson = parseJsonMaybe(today.stdout);
  checks.push({ ...today, parsed: todayJson });
  if (today.status !== 0) {
    report.hardIssues.push(`Today cadence/content audit failed for ${targetDate}.`);
    report.nextActions.push("Fix same-day chapter count, note charCount drift, repeated sentences, or missing mandatory note updates before publishing.");
    if (report.batch?.valid && report.batch.missingTitles?.length) {
      report.nextActions.push(`Continue the owned batch with only: ${report.batch.missingTitles.join(", ")}.`);
    }
  }
  if (todayJson?.hardIssues?.length) report.hardIssues.push(...todayJson.hardIssues);
  if (todayJson?.warnings?.length) report.warnings.push(...todayJson.warnings);

  const receipts = commandCheck("node", ["scripts/audit-active-review-receipts.mjs", "--strict"], [0, 1]);
  const receiptsJson = parseJsonMaybe(receipts.stdout);
  checks.push({ ...receipts, parsed: receiptsJson });
  if (receipts.status !== 0) {
    report.hardIssues.push("Three-layer semantic review receipts failed.");
    report.nextActions.push("Repair AI-feel, theory-consistency, or continuity evidence in each completed title's 反思.md before publishing.");
  }
  if (receiptsJson?.hardIssues?.length) report.hardIssues.push(...receiptsJson.hardIssues);

  const ruleConsistency = commandCheck("node", ["scripts/audit-writing-rule-consistency.mjs", "--strict"], [0, 1]);
  const ruleJson = parseJsonMaybe(ruleConsistency.stdout);
  checks.push({ ...ruleConsistency, parsed: ruleJson });
  if (ruleConsistency.status !== 0) report.hardIssues.push("Writing-rule source files contain contradictory active policy.");
  if (ruleJson?.hardIssues?.length) report.hardIssues.push(...ruleJson.hardIssues);

  for (const check of checks) {
    report.checks.push(check);
    if (!check.ok) report.hardIssues.push(`Command failed: ${check.name}`);
  }

  report.expectedPerTitle = expectedPerTitle;
  report.targetDate = targetDate;
  const currentChapterRefs = new Set(
    (todayJson?.titles ?? []).flatMap((title) =>
      (title.checkedChapters ?? []).map((chapter) => `${title.title} 第${chapter.number}章`),
    ),
  );
  report.lessons.push(...qualityWarningLessons(report.warnings, currentChapterRefs));
}

function runPublishValidation(report) {
  const state = commandCheck("node", ["scripts/check-publish-state.mjs", "--json"], [0, 2, 3, 4, 5, 6]);
  report.checks.push({ ...state, parsed: parseJsonMaybe(state.stdout) });
  const parsedState = parseJsonMaybe(state.stdout);
  if (parsedState?.status !== "clean") {
    report.hardIssues.push(`Post-publish state is not clean: ${parsedState?.status ?? "unknown"}`);
    report.nextActions.push("Push or resolve publish debt, then rerun site publication verification.");
  }

  const deployment = commandCheck("node", ["scripts/ensure-pages-deployment.mjs", "--retry"], [0]);
  report.checks.push(deployment);
  if (!deployment.ok) {
    report.hardIssues.push("Pages workflow did not complete successfully.");
    report.nextActions.push("Retry or repair the Pages workflow before claiming publication is live.");
  }

  const verify = commandCheck("node", ["scripts/verify-site-publication.mjs"], [0]);
  report.checks.push(verify);
  if (!verify.ok) {
    report.hardIssues.push("Live site publication verification failed.");
    report.nextActions.push("Distinguish raw GitHub update from Pages/CDN propagation before claiming the site is live.");
  }

  const catalogSync = commandCheck("node", ["scripts/sync-platform-catalog.mjs"], [0]);
  report.checks.push(catalogSync);
  if (!catalogSync.ok) {
    report.warnings.push("Live publication passed, but the Supabase catalog sync failed; community book rooms may show stale chapter metadata.");
    report.nextActions.push("Repair platform catalog sync before claiming community metadata is current.");
  }
}

function decide(report, options) {
  if (report.hardIssues.length > 0) {
    report.decision = "blocked";
    if (options.phase === "preflight") report.summary = "Generation must not start until preflight blockers are cleared.";
    else if (options.phase === "post-publish") report.summary = "Publication is not proven live; keep reporting the blocker explicitly.";
    else report.summary = "Do not commit or publish until validation blockers are fixed.";
    return;
  }

  if (options.phase === "preflight") {
    if (report.preflightState?.status === "resumable-batch") {
      report.decision = "resume-generation";
      report.summary = `Resume the owned partial batch; generate only: ${report.batch?.missingTitles?.join(", ")}.`;
    } else if (report.preflightState?.status === "completed-batch-awaiting-validation") {
      report.decision = "resume-validation";
      report.summary = "The owned batch is complete; run post-generation validation without generating another chapter.";
    } else {
      report.decision = "ready-for-generation";
      report.summary = "Preflight is clean; generation may start.";
    }
  } else if (options.phase === "post-generation") {
    report.decision = "ready-to-publish";
    report.summary = "Local generation validation passed; commit and publish may proceed.";
  } else if (options.phase === "post-publish") {
    report.decision = "published-and-verified";
    report.summary = "GitHub and live site publication are verified.";
  } else {
    report.decision = "healthy";
    report.summary = "Closed-loop supervision passed for the selected checks.";
  }

  if (report.warnings.length > 0 && report.nextActions.length === 0) {
    report.nextActions.push("Carry warnings into the next writing pass; warnings are not blockers but should become concrete revision targets.");
  }
}

function writeReport(report, options) {
  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  if (!options.writeLedger) return;
  if (!existsSync(LEDGER_PATH)) {
    writeFileSync(
      LEDGER_PATH,
      "# Automation Supervision Log\n\nThis ledger records six-hour AI fiction flow supervision, blockers, recovery actions, quality warnings, and durable lessons.\n\n",
    );
  }

  const issueLines = report.hardIssues.slice(0, 12).map((issue) => `  - ${issue}`).join("\n") || "  - none";
  const warningLines = report.warnings.slice(0, 12).map((warning) => `  - ${warning}`).join("\n") || "  - none";
  const actionLines = report.nextActions.slice(0, 8).map((action) => `  - ${action}`).join("\n") || "  - none";
  const lessonLines = report.lessons.slice(0, 8).map((lesson) => `  - ${lesson}`).join("\n") || "  - none";
  appendFileSync(
    LEDGER_PATH,
    `## ${report.startedAt} ${report.phase}\n\n- Decision: ${report.decision}\n- Summary: ${report.summary}\n- Hard issues:\n${issueLines}\n- Warnings:\n${warningLines}\n- Recovery actions:\n${report.recoveryActions.map((item) => `  - ${item.action}: ${item.ok ? "ok" : "failed"}${item.detail ? ` - ${item.detail}` : ""}`).join("\n") || "  - none"}\n- Next actions:\n${actionLines}\n- Durable lessons:\n${lessonLines}\n\n`,
  );
}

function compactForConsole(report) {
  return {
    phase: report.phase,
    decision: report.decision,
    summary: report.summary,
    hardIssueCount: report.hardIssues.length,
    warningCount: report.warnings.length,
    nextActions: report.nextActions,
    lessons: report.lessons,
    reportPath: REPORT_PATH,
    ledgerPath: report.ledgerWritten ? LEDGER_PATH : "",
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const report = {
    startedAt: taipeiNowIso(),
    phase: options.phase,
    targetDate: options.date || taipeiDate(),
    expectedPerTitle: options.expectedPerTitle ?? expectedSlotsForNow(),
    decision: "unknown",
    summary: "",
    git: gitSnapshot(),
    manifest: null,
    preflightState: null,
    batch: null,
    checks: [],
    recoveryActions: [],
    hardIssues: [],
    warnings: [],
    lessons: [],
    nextActions: [],
    ledgerWritten: options.writeLedger,
  };

  readManifestSummary(report);

  if (options.phase === "preflight" || options.phase === "full") runPreflight(report, options);
  if (options.phase === "post-generation" || options.phase === "full") runLocalValidation(report, options);
  if (options.phase === "post-publish") runPublishValidation(report);

  decide(report, options);
  if (report.decision === "published-and-verified") clearBatch();
  writeReport(report, options);

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else console.log(JSON.stringify(compactForConsole(report), null, 2));

  if (report.hardIssues.length > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
