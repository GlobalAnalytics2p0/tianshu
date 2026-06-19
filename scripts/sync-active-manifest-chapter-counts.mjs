#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工",
];

function countNonWhitespace(text) {
  return Array.from(text.replace(/\s/g, "")).length;
}

function formatTaipeiTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+08:00`;
}

function main() {
  const apply = process.argv.includes("--apply");
  const timestampArg = process.argv.find((arg) => arg.startsWith("--timestamp="));
  const generatedAt = timestampArg
    ? timestampArg.slice("--timestamp=".length)
    : formatTaipeiTimestamp();
  const manifestPath = "src/resource/manifest.json";
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const changes = [];
  const errors = [];

  for (const title of ACTIVE_TITLES) {
    const book = manifest.books.find((item) => item.title === title);
    if (!book) {
      errors.push(`Missing active title in manifest: ${title}`);
      continue;
    }
    for (const chapter of book.chapters ?? []) {
      if (!chapter.path?.startsWith(`src/resource/${title}/文章/`)) {
        errors.push(`${title} 第${chapter.number}章 path is not canonical: ${chapter.path}`);
        continue;
      }
      if (!existsSync(chapter.path)) {
        errors.push(`${title} 第${chapter.number}章 file missing: ${chapter.path}`);
        continue;
      }
      const chars = countNonWhitespace(readFileSync(chapter.path, "utf8"));
      if (chapter.charCount !== chars || chapter.generatedAt !== generatedAt) {
        changes.push({
          title,
          chapter: chapter.number,
          path: chapter.path,
          fromCharCount: chapter.charCount,
          toCharCount: chars,
          fromGeneratedAt: chapter.generatedAt,
          toGeneratedAt: generatedAt,
        });
        if (apply) {
          chapter.charCount = chars;
          chapter.generatedAt = generatedAt;
        }
      }
    }
  }

  if (apply && changes.length) {
    manifest.generatedAt = generatedAt;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(
    JSON.stringify(
      {
        apply,
        generatedAt,
        changedChapters: changes.length,
        errors,
        changes,
      },
      null,
      2,
    ),
  );

  if (errors.length) process.exit(1);
}

main();
