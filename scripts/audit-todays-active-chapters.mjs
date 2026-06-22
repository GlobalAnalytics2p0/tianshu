#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

const REQUIRED_NOTES = [
  "風格規則.md",
  "核心靈魂檔案.md",
  "作者思路.md",
  "人物架構.md",
  "每日寫作狀態.md",
  "伏筆事件台帳.md",
  "反思.md",
];

const MANDATORY_UPDATED_NOTES = [
  "每日寫作狀態.md",
  "伏筆事件台帳.md",
  "反思.md",
];

const FORBIDDEN_META =
  /這一章|讀者會|讀者和|讀者們|讀者應|讀者想|主角|章末|第一章的安排|第二章會|outline|automation|後續自動化|本章|下一章|Prompt/g;

const FORBIDDEN_WORKFLOW =
  /第一口小回報|第一口回報|第二口回報|第三口回報|局部回報|一口[^。！？\n]{0,8}回報|今日第[0-9一二三四五六七八九十百千零〇]+個回報|第一個轉折|第二層轉機|第三層轉機|早段第一個轉向|第[0-9一二三四五六七八九十百千零〇]+次重報|被放在眾人都能看見的位置|沒有立刻變成答案|真正有用的不是誰更聰明|先想照著直覺處理/g;

const FOREIGN_CHARACTER_TERMS = {
  星骸王座: ["周祈", "林岫", "林以晴", "沈墨", "顧清棠", "艾文", "伊芙", "沈照夜", "程聽雪"],
  灰塔觀測者: ["周祈", "林岫", "林以晴", "沈曜", "沈墨", "顧清棠", "沈照夜", "程聽雪", "艾維森"],
  雪刃照孤城: ["周祈", "林岫", "林以晴", "沈曜", "沈墨", "顧清棠", "艾文", "伊芙", "北腹"],
  凌晨三點的演算法: ["沈曜", "顧清棠", "沈墨", "艾文", "伊芙", "沈照夜", "程聽雪", "阿棠"],
  大明墨工: ["周祈", "林岫", "林以晴", "沈曜", "艾文", "伊芙", "沈照夜", "程聽雪", "阿棠"],
};

const TITLE_FORBIDDEN_PATTERNS = {
  凌晨三點的演算法: [
    /周祈這章走得很準。她/g,
    /妹妹，我在這裡跑好多年了/g,
    /周祈[^。！？\n]{0,80}她卻偏偏/g,
  ],
};

const ABSTRACT_ENDING =
  /更大的危險|真正的危險|真正會吃人|更深的黑暗|一切才剛開始|沒有人知道|答案還在後面/g;

function parseArgs(argv) {
  const args = {
    strict: false,
    date: null,
    expectedPerTitle: 4,
    today: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") args.strict = true;
    else if (arg === "--today") args.today = true;
    else if (arg === "--date") args.date = argv[++index];
    else if (arg.startsWith("--date=")) args.date = arg.slice("--date=".length);
    else if (arg === "--expected-per-title") args.expectedPerTitle = Number(argv[++index]);
    else if (arg.startsWith("--expected-per-title=")) {
      args.expectedPerTitle = Number(arg.slice("--expected-per-title=".length));
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isInteger(args.expectedPerTitle) || args.expectedPerTitle < 0) {
    throw new Error("--expected-per-title must be a non-negative integer");
  }
  if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error("--date must use YYYY-MM-DD");
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/audit-todays-active-chapters.mjs [--strict] [--date YYYY-MM-DD] [--today] [--expected-per-title N]

Default target date is the latest completed Asia/Taipei production day.
At 11:00 Asia/Taipei this means yesterday, because today's 12:00 and 18:00 runs have not happened yet.`);
}

function taipeiParts(date) {
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

function taipeiDate(date) {
  const parts = taipeiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function taipeiHour(date) {
  return Number(taipeiParts(date).hour);
}

function addTaipeiDays(dateString, delta) {
  const date = new Date(`${dateString}T12:00:00+08:00`);
  date.setUTCDate(date.getUTCDate() + delta);
  return taipeiDate(date);
}

function defaultCompletedProductionDate(now = new Date()) {
  const currentDate = taipeiDate(now);
  return taipeiHour(now) >= 19 ? currentDate : addTaipeiDays(currentDate, -1);
}

function countNonWhitespace(text) {
  return Array.from(text.replace(/\s/g, "")).length;
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

function duplicateParagraphs(text) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const seen = new Map();
  const dupes = [];
  for (const [index, paragraph] of paragraphs.entries()) {
    const key = paragraph.replace(/\s+/g, "");
    if (!key) continue;
    if (seen.has(key)) dupes.push({ first: seen.get(key) + 1, second: index + 1 });
    else seen.set(key, index);
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

function longSentenceKeys(text) {
  return new Set(
    text
      .split(/[。！？!?]/g)
      .map((sentence) => sentence.replace(/\s+/g, ""))
      .filter((sentence) => sentence.length >= 32),
  );
}

function readText(path, hardIssues) {
  if (!existsSync(path)) {
    hardIssues.push(`Missing file: ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function allChapterTextIssues(title, chapter, text) {
  const issues = [];
  const metaHits = [...text.matchAll(FORBIDDEN_META)].map((match) => match[0]);
  if (metaHits.length) {
    issues.push(`prohibited meta/scaffolding terms: ${[...new Set(metaHits)].join(", ")}`);
  }
  const workflowHits = [...text.matchAll(FORBIDDEN_WORKFLOW)].map((match) => match[0]);
  if (workflowHits.length) {
    issues.push(`prohibited workflow/template terms: ${[...new Set(workflowHits)].join(", ")}`);
  }
  const foundForeignTerms = (FOREIGN_CHARACTER_TERMS[title] ?? []).filter((term) => text.includes(term));
  if (foundForeignTerms.length) {
    issues.push(`foreign-title character contamination: ${foundForeignTerms.join(", ")}`);
  }
  const titlePatternHits = (TITLE_FORBIDDEN_PATTERNS[title] ?? []).flatMap((pattern) =>
    [...text.matchAll(pattern)].map((match) => match[0]),
  );
  if (titlePatternHits.length) {
    issues.push(`title-specific continuity/personal-pronoun risk: ${[...new Set(titlePatternHits)].join(", ")}`);
  }
  return issues.map((issue) => `${title} 第${chapter.number}章: ${issue}`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const targetDate = args.date ?? (args.today ? taipeiDate(new Date()) : defaultCompletedProductionDate());
  const manifestPath = "src/resource/manifest.json";
  const report = {
    checkedAt: new Date().toISOString(),
    targetDate,
    targetMode: args.date ? "explicit-date" : args.today ? "today" : "latest-completed-production-day",
    expectedPerTitle: args.expectedPerTitle,
    titles: [],
    hardIssues: [],
    warnings: [],
    semanticSubAgentBriefs: [],
  };

  const manifest = JSON.parse(readText(manifestPath, report.hardIssues));
  const crossTitleSentences = [];

  for (const title of ACTIVE_TITLES) {
    const book = manifest.books?.find((item) => item.title === title);
    const titleReport = {
      title,
      checkedChapters: [],
      generatedAtHours: [],
      hardIssues: [],
      warnings: [],
    };

    if (!book) {
      titleReport.hardIssues.push(`Missing active title in manifest: ${title}`);
      report.titles.push(titleReport);
      continue;
    }

    for (const note of REQUIRED_NOTES) {
      const notePath = `src/resource/${title}/素材/${note}`;
      if (!existsSync(notePath)) titleReport.hardIssues.push(`Missing required note file: ${notePath}`);
    }

    const todayChapters = book.chapters
      .filter((chapter) => chapter.generatedAt && taipeiDate(new Date(chapter.generatedAt)) === targetDate)
      .sort((left, right) => left.number - right.number);

    for (const chapter of book.chapters) {
      if (!existsSync(chapter.path)) continue;
      const text = readFileSync(chapter.path, "utf8");
      titleReport.hardIssues.push(...allChapterTextIssues(title, chapter, text));
    }

    if (todayChapters.length !== args.expectedPerTitle) {
      titleReport.hardIssues.push(
        `${title}: expected ${args.expectedPerTitle} chapters for ${targetDate}, found ${todayChapters.length}`,
      );
    }

    const hours = todayChapters.map((chapter) => taipeiParts(new Date(chapter.generatedAt)).hour);
    titleReport.generatedAtHours = hours;
    const uniqueHours = new Set(hours);
    if (todayChapters.length > 0 && uniqueHours.size !== hours.length) {
      titleReport.warnings.push(`${title}: duplicate generatedAt hour(s) on ${targetDate}: ${hours.join(",")}`);
    }

    const latestToday = todayChapters.at(-1);
    for (const note of MANDATORY_UPDATED_NOTES) {
      const notePath = `src/resource/${title}/素材/${note}`;
      const noteText = existsSync(notePath) ? readFileSync(notePath, "utf8") : "";
      if (latestToday && !noteText.includes(`第${latestToday.number}章`)) {
        titleReport.hardIssues.push(`${title}: ${note} does not mention latest audited chapter 第${latestToday.number}章`);
      }
      for (const chapter of todayChapters) {
        if (!noteText.includes(`第${chapter.number}章`) && !noteText.includes(chapter.title)) {
          titleReport.warnings.push(`${title}: ${note} does not explicitly mention 第${chapter.number}章/${chapter.title}`);
        }
      }
    }

    for (const chapter of todayChapters) {
      const chapterReport = {
        number: chapter.number,
        title: chapter.title,
        path: chapter.path,
        charCount: chapter.charCount,
        generatedAt: chapter.generatedAt,
      };
      titleReport.checkedChapters.push(chapterReport);

      const canonicalPrefix = `src/resource/${title}/文章/`;
      if (!chapter.path?.startsWith(canonicalPrefix)) {
        titleReport.hardIssues.push(`${title} 第${chapter.number}章: non-canonical path ${chapter.path}`);
        continue;
      }
      if (!existsSync(chapter.path)) {
        titleReport.hardIssues.push(`${title} 第${chapter.number}章: missing chapter file ${chapter.path}`);
        continue;
      }

      const text = readFileSync(chapter.path, "utf8");
      const actualChars = countNonWhitespace(text);
      if (actualChars !== chapter.charCount) {
        titleReport.hardIssues.push(
          `${title} 第${chapter.number}章: manifest charCount ${chapter.charCount} != actual ${actualChars}`,
        );
      }
      if (actualChars < 6000 || actualChars > 6500) {
        titleReport.hardIssues.push(`${title} 第${chapter.number}章: length ${actualChars} outside 6000-6500`);
      }
      if (FORBIDDEN_META.test(text) || FORBIDDEN_WORKFLOW.test(text)) {
        titleReport.hardIssues.push(`${title} 第${chapter.number}章: prohibited meta/workflow phrase found`);
      }
      const dupes = duplicateParagraphs(text);
      if (dupes.length > 0) {
        titleReport.hardIssues.push(
          `${title} 第${chapter.number}章: duplicate paragraph(s) ${dupes
            .map((dupe) => `${dupe.first}/${dupe.second}`)
            .join(", ")}`,
        );
      }
      const repeats = repeatedSentences(text);
      if (repeats.length > 0) {
        titleReport.hardIssues.push(
          `${title} 第${chapter.number}章: repeated sentence(s) ${repeats
            .map((repeat) => `${repeat.count}x ${repeat.sentence}`)
            .join(" | ")}`,
        );
      }
      if (!hasConcreteHook(text)) {
        titleReport.warnings.push(`${title} 第${chapter.number}章: final three lines may lack a concrete next hook`);
      }
      crossTitleSentences.push({ title, chapter: chapter.number, keys: longSentenceKeys(text) });
    }

    report.semanticSubAgentBriefs.push({
      title,
      instruction:
        "Read this title's required source-of-truth files and all chapter files through the audited range; compare the audited chapters against prior canon for author voice, timeline, unresolved clues, relationship state, durable injuries/debts/secrets, rule compliance, small reward, first-window turn, and final hook.",
      auditedChapters: todayChapters.map((chapter) => `第${chapter.number}章 ${chapter.title}`),
    });

    report.titles.push(titleReport);
  }

  for (let left = 0; left < crossTitleSentences.length; left += 1) {
    for (let right = left + 1; right < crossTitleSentences.length; right += 1) {
      const a = crossTitleSentences[left];
      const b = crossTitleSentences[right];
      if (a.title === b.title) continue;
      const overlaps = [...a.keys].filter((key) => b.keys.has(key)).slice(0, 3);
      if (overlaps.length > 0) {
        report.hardIssues.push(
          `Cross-title exact long-sentence overlap: ${a.title} 第${a.chapter}章 vs ${b.title} 第${b.chapter}章`,
        );
      }
    }
  }

  for (const titleReport of report.titles) {
    report.hardIssues.push(...titleReport.hardIssues);
    report.warnings.push(...titleReport.warnings);
  }

  console.log(JSON.stringify(report, null, 2));
  if (args.strict && report.hardIssues.length > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
