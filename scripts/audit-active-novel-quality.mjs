#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

const REQUIRED_NOTE_FILES = [
  "風格規則.md",
  "核心靈魂檔案.md",
  "作者思路.md",
  "人物架構.md",
  "每日寫作狀態.md",
  "伏筆事件台帳.md",
  "反思.md",
];

const REQUIRED_GLOBAL_FILES = [
  "agent.md",
  "src/resource/writing-rules.md",
  "src/resource/manifest.json",
  "src/resource/五本長篇共通管理規範.md",
  "src/resource/Share/Rule-of-Style.md",
];

const PROHIBITED_META =
  /這一章|讀者會|主角|章末|第一章的安排|第二章會|outline|automation|後續自動化|本章|下一章|爆款|爽點|小高潮|Prompt/g;

const ABSTRACT_ENDING =
  /更大的危險|真正的危險|真正會吃人|更深的黑暗|一切才剛開始|沒有人知道|答案還在後面/g;

function countNonWhitespace(text) {
  return Array.from(text.replace(/\s/g, "")).length;
}

function paragraphStats(text) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const lengths = paragraphs.map(countNonWhitespace).filter((n) => n > 0);
  const avg = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length);
  const variance =
    lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) /
    Math.max(1, lengths.length);
  const cv = Math.sqrt(variance) / Math.max(1, avg);
  let maxShortRun = 0;
  let currentShortRun = 0;
  for (const len of lengths) {
    if (len <= 35) {
      currentShortRun += 1;
      maxShortRun = Math.max(maxShortRun, currentShortRun);
    } else {
      currentShortRun = 0;
    }
  }
  return { paragraphCount: paragraphs.length, avg, cv, maxShortRun };
}

function duplicateParagraphs(text) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const seen = new Map();
  const dupes = [];
  for (const [index, paragraph] of paragraphs.entries()) {
    const key = paragraph.replace(/\s+/g, "");
    if (!key) continue;
    if (seen.has(key)) {
      dupes.push({ first: seen.get(key) + 1, second: index + 1 });
    } else {
      seen.set(key, index);
    }
  }
  return dupes;
}

function finalThreeLines(text) {
  return text
    .split(/\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-3)
    .join("\n");
}

function hasConcreteHook(text) {
  const tail = finalThreeLines(text);
  const hasConcreteSignal =
    /[0-9一二三四五六七八九十百千零〇甲乙丙丁A-Z]|「|」|：|桌|門|燈|紙|刀|血|車|井|牆|名|手|城|雪|星|藥|圖|尺|章|票|鐘|路|人|聲|夜|明早|今晚|午後|三點/.test(
      tail,
    );
  return hasConcreteSignal && !ABSTRACT_ENDING.test(tail);
}

function firstWindowHasVisibleTurn(text) {
  const window = Array.from(text.replace(/\s+/g, "")).slice(0, 1800).join("");
  return /「|」|！|？|忽然|立刻|突然|卻|但|不是|先|終於|一下|停|喊|笑|哭|血|燈|門|紙|刀|手|退|救|露|錯|改|問/.test(
    window,
  );
}

function listTxtFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".txt"))
    .sort();
}

function main() {
  const manifestPath = "src/resource/manifest.json";
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const report = {
    checkedAt: new Date().toISOString(),
    globalFiles: [],
    titles: [],
    hardIssues: [],
    warnings: [],
    manualReview: [],
  };

  for (const file of REQUIRED_GLOBAL_FILES) {
    const exists = existsSync(file);
    report.globalFiles.push({ file, exists });
    if (!exists) report.hardIssues.push(`Missing global source file: ${file}`);
  }

  for (const title of ACTIVE_TITLES) {
    const book = manifest.books.find((item) => item.title === title);
    const titleReport = {
      title,
      manifestChapters: book?.chapters?.length ?? 0,
      folderChapterFiles: 0,
      notes: [],
      chapterIssues: [],
      chapterWarnings: [],
    };

    if (!book) {
      report.hardIssues.push(`Missing active title in manifest: ${title}`);
      report.titles.push(titleReport);
      continue;
    }

    const materialDir = join("src/resource", title, "素材");
    for (const file of REQUIRED_NOTE_FILES) {
      const notePath = join(materialDir, file);
      const exists = existsSync(notePath);
      titleReport.notes.push({ file: notePath, exists });
      if (!exists) report.hardIssues.push(`Missing note file: ${notePath}`);
    }

    const chapterDir = join("src/resource", title, "文章");
    titleReport.folderChapterFiles = listTxtFiles(chapterDir).length;
    if (book.chapters.length < 50) {
      report.warnings.push(
        `${title}: manifest has ${book.chapters.length} chapters; expected 50 for the requested full audit scope.`,
      );
    }
    if (titleReport.folderChapterFiles !== book.chapters.length) {
      report.warnings.push(
        `${title}: folder has ${titleReport.folderChapterFiles} .txt files but manifest has ${book.chapters.length} chapters.`,
      );
    }

    for (const chapter of book.chapters) {
      const expectedPrefix = `src/resource/${title}/文章/`;
      if (!chapter.path.startsWith(expectedPrefix)) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Non-canonical path: ${chapter.path}`,
        });
        continue;
      }
      if (!existsSync(chapter.path)) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Missing chapter file: ${chapter.path}`,
        });
        continue;
      }

      const text = readFileSync(chapter.path, "utf8");
      const chars = countNonWhitespace(text);
      if (chars !== chapter.charCount) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Manifest charCount ${chapter.charCount} != actual ${chars}`,
        });
      }
      if (chars < 6000 || chars > 6500) {
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: `Chapter length ${chars} outside 6000-6500; acceptable only if intentionally locked/published.`,
        });
      }
      const metaHits = [...text.matchAll(PROHIBITED_META)].map((m) => m[0]);
      if (metaHits.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Prohibited meta/scaffolding terms: ${[...new Set(metaHits)].join(", ")}`,
        });
      }
      const dupes = duplicateParagraphs(text);
      if (dupes.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Duplicate paragraphs: ${JSON.stringify(dupes.slice(0, 5))}`,
        });
      }
      const stats = paragraphStats(text);
      if (stats.paragraphCount >= 20 && stats.cv < 0.38) {
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: `Possible AI-even pacing: paragraph length CV ${stats.cv.toFixed(2)}`,
        });
      }
      if (stats.maxShortRun >= 9) {
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: `Possible over-fragmented short paragraph run: ${stats.maxShortRun}`,
        });
      }
      if (!firstWindowHasVisibleTurn(text)) {
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: "First 1,800 characters may lack a visible turn/reward signal; manual review required.",
        });
      }
      if (!hasConcreteHook(text)) {
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: `Final three lines may lack a concrete next-chapter hook: ${JSON.stringify(finalThreeLines(text))}`,
        });
      }
    }

    report.titles.push(titleReport);
  }

  report.manualReview.push(
    "Small reward, 3-5 chapter medium payoff, immersion, addiction pull, and author-specific Rule-of-Style fit are semantic checks. This script flags structural risk; a novelist/senior-reader pass must still read and revise the prose.",
  );

  for (const titleReport of report.titles) {
    for (const issue of titleReport.chapterIssues) {
      report.hardIssues.push(`${titleReport.title} 第${issue.chapter}章: ${issue.issue}`);
    }
    for (const warning of titleReport.chapterWarnings) {
      report.warnings.push(`${titleReport.title} 第${warning.chapter}章: ${warning.issue}`);
    }
  }

  const summary = {
    activeTitles: report.titles.length,
    manifestChapters: report.titles.reduce((sum, item) => sum + item.manifestChapters, 0),
    hardIssueCount: report.hardIssues.length,
    warningCount: report.warnings.length,
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ summary, report }, null, 2));
  } else {
    console.log(JSON.stringify(summary, null, 2));
    if (report.hardIssues.length) {
      console.log("\nHard issues:");
      for (const issue of report.hardIssues.slice(0, 80)) console.log(`- ${issue}`);
      if (report.hardIssues.length > 80) console.log(`- ... ${report.hardIssues.length - 80} more`);
    }
    if (report.warnings.length) {
      console.log("\nWarnings:");
      for (const warning of report.warnings.slice(0, 80)) console.log(`- ${warning}`);
      if (report.warnings.length > 80) console.log(`- ... ${report.warnings.length - 80} more`);
    }
    console.log("\nManual review:");
    for (const item of report.manualReview) console.log(`- ${item}`);
  }

  if (process.argv.includes("--strict") && report.hardIssues.length) process.exit(1);
}

main();
