#!/usr/bin/env node

import { readFileSync } from "node:fs";

const SOURCES = [
  "agent.md",
  "src/resource/writing-rules.md",
  "src/resource/五本長篇共通管理規範.md",
  "src/resource/Share/Rule-of-Style.md",
  "docs/roles/content-creator/README.md",
  "docs/roles/full-stack-engineer/README.md",
];

function main() {
  const report = {
    checkedAt: new Date().toISOString(),
    canonicalPolicy: {
      cadence: "Asia/Taipei 00:00/06:00/12:00/18:00",
      activeTitles: 5,
      archivedTitles: 35,
      newChapterChars: "6000-6500 non-whitespace",
      batchRule: "one chapter per active title per scheduled batch",
    },
    hardIssues: [],
    warnings: [],
  };

  const texts = new Map(SOURCES.map((path) => [path, readFileSync(path, "utf8")]));
  const combined = [...texts.values()].join("\n");
  for (const token of ["00/06/12/18", "6,000-6,500", "五本", "三十五本"]) {
    if (!combined.includes(token)) report.hardIssues.push(`Canonical writing policy token is missing: ${token}`);
  }

  for (const [path, text] of texts) {
    for (const [index, line] of text.split(/\n/g).entries()) {
      if (/每小時(?:整點)?更新|hourly update/i.test(line) && !/不再|不要|不使用|不是|非|not|stale|舊/i.test(line)) {
        report.hardIssues.push(`${path}:${index + 1} still asserts hourly publication cadence`);
      }
      if (/(?:4,000|4000)[-–—~到至](?:5,000|5000)/.test(line) && !/舊|older|superseded|擴|重修|已發布/.test(line)) {
        report.hardIssues.push(`${path}:${index + 1} asserts a superseded chapter-length range`);
      }
      if (/routine|例行|排程|scheduled/i.test(line) && /40 本|40本|全部四十/.test(line)) {
        report.hardIssues.push(`${path}:${index + 1} appears to include archived titles in routine generation`);
      }
    }
  }

  const manifest = JSON.parse(readFileSync("src/resource/manifest.json", "utf8"));
  const active = manifest.books.filter((book) => book.status?.includes("00/06/12/18"));
  const archived = manifest.books.filter((book) => book.status?.includes("backup"));
  if (active.length !== 5) report.hardIssues.push(`Manifest has ${active.length} scheduled active titles; expected 5.`);
  if (archived.length !== 35) report.hardIssues.push(`Manifest has ${archived.length} archived titles; expected 35.`);

  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes("--strict") && report.hardIssues.length > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
