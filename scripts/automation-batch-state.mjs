#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";

export const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

export const BATCH_STATE_PATH = "tmp/automation-supervision/active-batch.json";
const MANDATORY_NOTES = ["每日寫作狀態.md", "伏筆事件台帳.md", "反思.md"];

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function taipeiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function taipeiDate(date = new Date()) {
  const parts = taipeiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function scheduledSlot(date = new Date()) {
  const parts = taipeiParts(date);
  const hour = Number(parts.hour);
  const slotHour = [18, 12, 6, 0].find((candidate) => hour >= candidate) ?? 0;
  return `${parts.year}-${parts.month}-${parts.day}T${String(slotHour).padStart(2, "0")}:00:00+08:00`;
}

function loadManifest() {
  return JSON.parse(readFileSync("src/resource/manifest.json", "utf8"));
}

function latestChapter(book) {
  return [...(book?.chapters ?? [])].sort((left, right) => right.number - left.number)[0] ?? null;
}

function chapterCountOnDate(book, targetDate) {
  return (book?.chapters ?? []).filter((chapter) => {
    if (!chapter.generatedAt) return false;
    return taipeiDate(new Date(chapter.generatedAt)) === targetDate;
  }).length;
}

export function readBatchState() {
  if (!existsSync(BATCH_STATE_PATH)) return null;
  return JSON.parse(readFileSync(BATCH_STATE_PATH, "utf8"));
}

function writeBatchState(state) {
  mkdirSync(dirname(BATCH_STATE_PATH), { recursive: true });
  writeFileSync(BATCH_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
  return state;
}

function fileDigest(path) {
  if (!existsSync(path)) return "";
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function buildState({ slot, adoptCurrent }) {
  const manifest = loadManifest();
  const targetDate = slot.slice(0, 10);
  const titles = {};
  const baselineDailyCounts = [];

  for (const title of ACTIVE_TITLES) {
    const book = manifest.books.find((item) => item.title === title);
    if (!book) throw new Error(`Manifest missing active title: ${title}`);
    const latest = latestChapter(book);
    if (!latest) throw new Error(`Manifest has no chapters for active title: ${title}`);
    const alreadyInSlot = adoptCurrent && latest.generatedAt === slot;
    const baselineNumber = latest.number - (alreadyInSlot ? 1 : 0);
    const dailyCount = chapterCountOnDate(book, targetDate) - (alreadyInSlot ? 1 : 0);
    baselineDailyCounts.push(dailyCount);
    titles[title] = {
      baselineNumber,
      expectedNumber: baselineNumber + 1,
    };
  }

  if (new Set(baselineDailyCounts).size !== 1) {
    throw new Error(`Cannot start a coherent batch: baseline daily counts differ (${baselineDailyCounts.join(", ")})`);
  }

  return {
    version: 1,
    owner: "automation:ai",
    status: "in-progress",
    createdAt: new Date().toISOString(),
    targetSlot: slot,
    targetDate,
    expectedDailyCount: baselineDailyCounts[0] + 1,
    baselineHead: runGit(["rev-parse", "HEAD"]),
    titles,
  };
}

export function beginBatch(slot = scheduledSlot()) {
  const existing = readBatchState();
  if (existing) return existing;
  return writeBatchState(buildState({ slot, adoptCurrent: false }));
}

export function adoptCurrentBatch(slot) {
  if (!slot) throw new Error("--slot is required when adopting a partial batch");
  const existing = readBatchState();
  if (existing) return existing;
  return writeBatchState(buildState({ slot, adoptCurrent: true }));
}

export function clearBatch() {
  if (existsSync(BATCH_STATE_PATH)) unlinkSync(BATCH_STATE_PATH);
}

function noteMentionsChapter(title, noteName, chapter) {
  const path = `src/resource/${title}/素材/${noteName}`;
  return existsSync(path) && readFileSync(path, "utf8").includes(`第${chapter.number}章`);
}

function expectedChapterPath(title, number) {
  return new RegExp(`^src/resource/${title}/文章/第${String(number).padStart(2, "0")}章 .+\\.txt$`);
}

function isBatchOwnedPath(path, state) {
  if (path === "src/resource/manifest.json") return true;
  for (const title of ACTIVE_TITLES) {
    const expected = state.titles?.[title];
    if (!expected) continue;
    if (expectedChapterPath(title, expected.expectedNumber).test(path)) return true;
    if (path.startsWith(`src/resource/${title}/素材/`)) return true;
  }
  return false;
}

export function classifyDirtyPath(path, state, digestForPath = fileDigest) {
  if (isBatchOwnedPath(path, state)) return { status: "batch-owned" };
  const registration = state.coexistingChanges?.[path];
  if (!registration?.sha256) return { status: "unexpected" };
  if (registration.sha256 !== digestForPath(path)) return { status: "coexisting-changed" };
  return { status: "coexisting-approved" };
}

export function registerCoexistingChanges(paths, reason = "") {
  const state = readBatchState();
  if (!state) throw new Error("Cannot register coexisting changes without an active batch.");
  if (!reason.trim()) throw new Error("A non-empty --reason is required when registering coexisting changes.");
  const uniquePaths = [...new Set(paths)].sort((left, right) => left.localeCompare(right, "zh-Hant"));
  if (uniquePaths.length === 0) throw new Error("At least one --path is required when registering coexisting changes.");

  const registrations = { ...(state.coexistingChanges ?? {}) };
  for (const path of uniquePaths) {
    if (isBatchOwnedPath(path, state)) {
      throw new Error(`Batch-owned path cannot be registered as coexisting: ${path}`);
    }
    const digest = fileDigest(path);
    if (!digest) throw new Error(`Cannot register missing path: ${path}`);
    registrations[path] = { sha256: digest, reason: reason.trim() };
  }

  return writeBatchState({
    ...state,
    version: 2,
    coexistingRegisteredAt: new Date().toISOString(),
    coexistingChanges: registrations,
  });
}

export function inspectBatch(dirtyActivePaths = []) {
  const state = readBatchState();
  if (!state) return { exists: false, valid: false, issues: ["No active batch state exists."] };

  const manifest = loadManifest();
  const issues = [];
  const completedTitles = [];
  const missingTitles = [];
  const titleProgress = [];
  const currentHead = runGit(["rev-parse", "HEAD"]);

  if (state.owner !== "automation:ai" || ![1, 2].includes(state.version)) issues.push("Batch state owner/version is not recognized.");
  if (state.baselineHead !== currentHead) {
    issues.push(`Batch baseline HEAD ${state.baselineHead} no longer matches current HEAD ${currentHead}.`);
  }

  for (const title of ACTIVE_TITLES) {
    const expected = state.titles?.[title];
    const book = manifest.books.find((item) => item.title === title);
    const latest = latestChapter(book);
    if (!expected || !book || !latest) {
      issues.push(`${title}: batch state or manifest entry is missing.`);
      continue;
    }

    const expectedEntry = book.chapters.find((chapter) => chapter.number === expected.expectedNumber);
    const expectedFile = expectedEntry?.path && existsSync(expectedEntry.path);
    const notesReady = expectedEntry
      ? MANDATORY_NOTES.every((noteName) => noteMentionsChapter(title, noteName, expectedEntry))
      : false;
    const complete = Boolean(
      latest.number === expected.expectedNumber &&
        expectedEntry?.generatedAt === state.targetSlot &&
        expectedFile &&
        notesReady,
    );

    if (latest.number !== expected.baselineNumber && latest.number !== expected.expectedNumber) {
      issues.push(
        `${title}: latest chapter ${latest.number} is outside resumable batch range ${expected.baselineNumber}-${expected.expectedNumber}.`,
      );
    }
    if (expectedEntry && expectedEntry.generatedAt !== state.targetSlot) {
      issues.push(`${title}: expected chapter ${expected.expectedNumber} has generatedAt ${expectedEntry.generatedAt}, not ${state.targetSlot}.`);
    }

    if (complete) completedTitles.push(title);
    else missingTitles.push(title);
    titleProgress.push({
      title,
      baselineNumber: expected.baselineNumber,
      expectedNumber: expected.expectedNumber,
      latestNumber: latest.number,
      manifestEntry: Boolean(expectedEntry),
      chapterFile: Boolean(expectedFile),
      mandatoryNotes: notesReady,
      complete,
    });
  }

  const coexistingDirtyPaths = [];
  for (const path of dirtyActivePaths) {
    const classification = classifyDirtyPath(path, state);
    if (classification.status === "batch-owned") continue;
    if (classification.status === "coexisting-approved") {
      coexistingDirtyPaths.push(path);
      continue;
    }
    if (classification.status === "coexisting-changed") issues.push(`Registered coexisting path changed after approval: ${path}`);
    else issues.push(`Unexpected dirty active path for this batch: ${path}`);
  }

  return {
    exists: true,
    valid: issues.length === 0,
    complete: completedTitles.length === ACTIVE_TITLES.length && issues.length === 0,
    state,
    completedTitles,
    missingTitles,
    coexistingDirtyPaths,
    titleProgress,
    issues,
  };
}

function parseCli(argv) {
  const options = { command: "status", slot: "", json: false, paths: [], reason: "" };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--begin") options.command = "begin";
    else if (arg === "--adopt-current") options.command = "adopt";
    else if (arg === "--clear") options.command = "clear";
    else if (arg === "--register-coexisting") options.command = "register-coexisting";
    else if (arg === "--status") options.command = "status";
    else if (arg === "--slot") options.slot = argv[++index];
    else if (arg.startsWith("--slot=")) options.slot = arg.slice("--slot=".length);
    else if (arg === "--path") options.paths.push(argv[++index]);
    else if (arg.startsWith("--path=")) options.paths.push(arg.slice("--path=".length));
    else if (arg === "--reason") options.reason = argv[++index];
    else if (arg.startsWith("--reason=")) options.reason = arg.slice("--reason=".length);
    else if (arg === "--json") options.json = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseCli(process.argv);
    let result;
    if (options.command === "begin") result = beginBatch(options.slot || scheduledSlot());
    else if (options.command === "adopt") result = adoptCurrentBatch(options.slot);
    else if (options.command === "register-coexisting") result = registerCoexistingChanges(options.paths, options.reason);
    else if (options.command === "clear") {
      clearBatch();
      result = { cleared: true, path: BATCH_STATE_PATH };
    } else result = inspectBatch();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
