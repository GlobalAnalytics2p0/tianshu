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
  /這一章|讀者會|讀者和|讀者們|讀者應|讀者想|主角|章末|第一章的安排|第二章會|outline|automation|後續自動化|本章|下一章|爆款|爽點|小高潮|Prompt/g;

const PROHIBITED_WORKFLOW =
  /第[0-9一二三四五六七八九十百千零〇]+個小?回報|第一口小回報|第一口回報|第二口回報|第三口回報|局部回報|小回報|小勝|小兌現|一口[^。！？\n]{0,8}回報|今日第[0-9一二三四五六七八九十百千零〇]+個回報|第一個轉折|第二層轉機|第三層轉機|早段第一個轉向|第[0-9一二三四五六七八九十百千零〇]+次重報|這個分工必須寫清|分工必須寫清|第二把主刃|被放在眾人都能看見的位置|沒有立刻變成答案|真正有用的不是誰更聰明|先想照著直覺處理/g;

const FOREIGN_CHARACTER_TERMS = {
  星骸王座: ["周祈", "林岫", "林以晴", "沈墨", "顧清棠", "艾文", "伊芙", "沈照夜", "程聽雪"],
  灰塔觀測者: ["周祈", "林岫", "林以晴", "沈曜", "沈墨", "顧清棠", "沈照夜", "程聽雪", "艾維森"],
  雪刃照孤城: ["周祈", "林岫", "林以晴", "沈曜", "沈墨", "顧清棠", "艾文", "伊芙", "北腹"],
  凌晨三點的演算法: ["沈曜", "顧清棠", "沈墨", "艾文", "伊芙", "沈照夜", "程聽雪", "阿棠"],
  大明墨工: ["周祈", "林岫", "林以晴", "沈曜", "艾文", "伊芙", "沈照夜", "程聽雪", "阿棠"],
};

const FOREIGN_SETTING_TERMS = {
  大明墨工: ["灰塔", "市檔", "館配"],
};

const TITLE_FORBIDDEN_PATTERNS = {
  灰塔觀測者: [/改回沈衡/g, /更正為沈衡線/g, /卡背姓名更正/g],
  雪刃照孤城: [/查戶口/g],
  凌晨三點的演算法: [
    /周祈這章走得很準。她/g,
    /妹妹，我在這裡跑好多年了/g,
    /周祈[^。！？\n]{0,80}她卻偏偏/g,
  ],
};

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

function repeatedSentences(text) {
  const sentences = text
    .split(/[。！？!?]/g)
    .map((sentence) => sentence.replace(/\s+/g, ""))
    .filter((sentence) => sentence.length >= 18);
  const counts = new Map();
  for (const sentence of sentences) counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .map(([sentence, count]) => ({ sentence: sentence.slice(0, 60), count }));
}

function sentenceKeys(text) {
  return new Set(
    text
      .split(/[。！？!?]/g)
      .map((sentence) => sentence.replace(/\s+/g, ""))
      .filter((sentence) => sentence.length >= 28),
  );
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
  const latestChapterSentenceSets = [];

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

    const maxChapterNumber = Math.max(...book.chapters.map((chapter) => chapter.number));
    const latestChapter = book.chapters.find((chapter) => chapter.number === maxChapterNumber);
    if (!book.status.includes("00/06/12/18")) {
      report.hardIssues.push(`${title}: status cadence is stale or not six-hour Taipei cadence: ${book.status}`);
    }
    if (!book.updateNote?.includes(`第${maxChapterNumber}章`)) {
      report.hardIssues.push(
        `${title}: updateNote ${JSON.stringify(book.updateNote)} does not match latest chapter ${maxChapterNumber}`,
      );
    }
    if (latestChapter?.title && !book.updateNote?.includes(latestChapter.title)) {
      report.hardIssues.push(
        `${title}: updateNote ${JSON.stringify(book.updateNote)} does not include latest chapter title ${latestChapter.title}`,
      );
    }
    if (latestChapter?.generatedAt && book.updatedAt) {
      const bookUpdatedAt = Date.parse(book.updatedAt);
      const latestGeneratedAt = Date.parse(latestChapter.generatedAt);
      if (!Number.isNaN(bookUpdatedAt) && !Number.isNaN(latestGeneratedAt) && bookUpdatedAt < latestGeneratedAt) {
        report.hardIssues.push(
          `${title}: updatedAt ${book.updatedAt} is older than latest chapter generatedAt ${latestChapter.generatedAt}`,
        );
      }
    }
    for (const noteFile of ["每日寫作狀態.md", "伏筆事件台帳.md", "反思.md"]) {
      const notePath = join(materialDir, noteFile);
      if (existsSync(notePath)) {
        const noteText = readFileSync(notePath, "utf8");
        if (!noteText.includes(`第${maxChapterNumber}章`)) {
          report.hardIssues.push(`${title}: ${noteFile} does not mention latest chapter 第${maxChapterNumber}章`);
        }
      }
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
        if (chapter.number === maxChapterNumber) {
          titleReport.chapterIssues.push({
            chapter: chapter.number,
            issue: `Latest chapter length ${chars} outside required 6000-6500`,
          });
        }
        titleReport.chapterWarnings.push({
          chapter: chapter.number,
          issue: `Chapter length ${chars} outside 6000-6500; acceptable only if intentionally locked/published.`,
        });
      }
      if (chapter.number === maxChapterNumber) {
        latestChapterSentenceSets.push({ title, chapter: chapter.number, sentences: sentenceKeys(text) });
      }
      const metaHits = [...text.matchAll(PROHIBITED_META)].map((m) => m[0]);
      if (metaHits.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Prohibited meta/scaffolding terms: ${[...new Set(metaHits)].join(", ")}`,
        });
      }
      const workflowHits = [...text.matchAll(PROHIBITED_WORKFLOW)].map((m) => m[0]);
      if (workflowHits.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Prohibited workflow/template terms: ${[...new Set(workflowHits)].join(", ")}`,
        });
      }
      const foreignTerms = FOREIGN_CHARACTER_TERMS[title] ?? [];
      const foundForeignTerms = foreignTerms.filter((term) => text.includes(term));
      if (foundForeignTerms.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Foreign-title character contamination: ${foundForeignTerms.join(", ")}`,
        });
      }
      const foundForeignSettingTerms = (FOREIGN_SETTING_TERMS[title] ?? []).filter((term) => text.includes(term));
      if (foundForeignSettingTerms.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Foreign-title setting/workflow contamination: ${foundForeignSettingTerms.join(", ")}`,
        });
      }
      const titlePatternHits = (TITLE_FORBIDDEN_PATTERNS[title] ?? []).flatMap((pattern) =>
        [...text.matchAll(pattern)].map((match) => match[0]),
      );
      if (titlePatternHits.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Title-specific continuity/personal-pronoun risk: ${[...new Set(titlePatternHits)].join(", ")}`,
        });
      }
      const dupes = duplicateParagraphs(text);
      if (dupes.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Duplicate paragraphs: ${JSON.stringify(dupes.slice(0, 5))}`,
        });
      }
      const repeated = repeatedSentences(text);
      if (repeated.length) {
        titleReport.chapterIssues.push({
          chapter: chapter.number,
          issue: `Repeated sentence skeletons: ${JSON.stringify(repeated.slice(0, 5))}`,
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

  const latestSentenceOwners = new Map();
  for (const item of latestChapterSentenceSets) {
    for (const sentence of item.sentences) {
      if (!latestSentenceOwners.has(sentence)) latestSentenceOwners.set(sentence, []);
      latestSentenceOwners.get(sentence).push(`${item.title} 第${item.chapter}章`);
    }
  }
  for (const [sentence, owners] of latestSentenceOwners) {
    if (owners.length >= 2) {
      report.hardIssues.push(
        `Latest chapters share an exact long sentence skeleton across titles (${owners.join(", ")}): ${sentence.slice(0, 80)}`,
      );
    }
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
