#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { inspectBatch } from "./automation-batch-state.mjs";

function countNonWhitespace(text) {
  return Array.from(text.replace(/\s/g, "")).length;
}

function latestReceiptSection(text, chapterNumber) {
  const heading = new RegExp(`^## [^\\n]*第${chapterNumber}章三層審稿[^\\n]*$`, "gm");
  const matches = [...text.matchAll(heading)];
  const last = matches.at(-1);
  if (!last) return "";
  const start = last.index;
  const rest = text.slice(start + last[0].length);
  const nextHeading = rest.search(/^## /m);
  return nextHeading === -1 ? text.slice(start) : text.slice(start, start + last[0].length + nextHeading);
}

function evidenceValue(line) {
  const marker = line.indexOf("證據=");
  return marker === -1 ? "" : line.slice(marker + 3).trim();
}

function evidenceTerms(evidence) {
  return evidence
    .split(/[、，；。／/「」〈〉：:（）()\s]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && term.length <= 14 && !/^(通過|符合|沒有|已經|本章|前章)$/.test(term));
}

function concreteEvidenceAppears(evidence, texts) {
  const terms = evidenceTerms(evidence);
  return terms.some((term) => texts.some((text) => text.includes(term)));
}

function lineFor(section, label) {
  return section
    .split(/\n/g)
    .map((line) => line.trim())
    .find((line) => line.startsWith(`- ${label}：`)) ?? "";
}

function main() {
  const batch = inspectBatch();
  const report = {
    checkedAt: new Date().toISOString(),
    targetSlot: batch.state?.targetSlot ?? "",
    checkedTitles: [],
    hardIssues: [],
    warnings: [],
  };

  if (!batch.exists || !batch.valid) {
    report.hardIssues.push(...(batch.issues ?? ["No valid automation batch exists."]));
  } else {
    const manifest = JSON.parse(readFileSync("src/resource/manifest.json", "utf8"));
    for (const title of batch.completedTitles) {
      const expected = batch.state.titles[title];
      const book = manifest.books.find((item) => item.title === title);
      const chapter = book.chapters.find((item) => item.number === expected.expectedNumber);
      const previous = book.chapters.find((item) => item.number === expected.baselineNumber);
      const reflectionPath = `src/resource/${title}/素材/反思.md`;
      const reflection = existsSync(reflectionPath) ? readFileSync(reflectionPath, "utf8") : "";
      const section = latestReceiptSection(reflection, chapter.number);
      const currentText = existsSync(chapter.path) ? readFileSync(chapter.path, "utf8") : "";
      const previousText = previous && existsSync(previous.path) ? readFileSync(previous.path, "utf8") : "";
      const styleText = readFileSync(`src/resource/${title}/素材/風格規則.md`, "utf8");
      const ledgerText = readFileSync(`src/resource/${title}/素材/伏筆事件台帳.md`, "utf8");
      const issues = [];

      if (!section) {
        issues.push("缺少三層審稿區塊");
      } else {
        if (countNonWhitespace(section) < 240) issues.push("三層審稿證據少於 240 個非空白字");
        if (!section.includes(`〈${chapter.title}〉`)) issues.push("審稿區塊未寫出本章標題");
        if (!section.includes(`第${previous.number}章`)) issues.push("前後邏輯未明確引用上一章");

        const aiLine = lineFor(section, "AI 感");
        const theoryLine = lineFor(section, "理論一致性");
        const logicLine = lineFor(section, "前後邏輯");
        const counterLine = lineFor(section, "反證");
        const decisionLine = lineFor(section, "判定");

        if (!aiLine || !aiLine.includes("證據=")) issues.push("AI 感檢查缺少具體證據");
        else {
          if (!/急停|冷卻|長段|短句|節奏|身體|日常|工作|羞|疲勞/.test(aiLine)) {
            issues.push("AI 感檢查未說明人類節奏、身體或日常摩擦");
          }
          if (!concreteEvidenceAppears(evidenceValue(aiLine), [currentText])) {
            issues.push("AI 感證據無法在本章正文中定位");
          }
        }

        if (!theoryLine || !theoryLine.includes("證據=")) issues.push("理論一致性檢查缺少具體證據");
        else {
          if (!/風格規則|核心靈魂|作者思路|伏筆事件台帳/.test(theoryLine)) {
            issues.push("理論一致性未指向權威來源檔");
          }
          const theoryEvidence = evidenceValue(theoryLine);
          if (!concreteEvidenceAppears(theoryEvidence, [currentText])) {
            issues.push("理論一致性證據無法在本章正文中定位");
          }
          if (!concreteEvidenceAppears(theoryEvidence, [styleText, ledgerText])) {
            issues.push("理論一致性證據無法在權威來源中定位");
          }
        }

        if (!logicLine || !logicLine.includes("證據=")) issues.push("前後邏輯檢查缺少具體證據");
        else {
          const logicEvidence = evidenceValue(logicLine);
          if (!concreteEvidenceAppears(logicEvidence, [currentText])) {
            issues.push("前後邏輯證據無法在本章正文中定位");
          }
          if (!concreteEvidenceAppears(logicEvidence, [previousText, ledgerText])) {
            issues.push("前後邏輯證據無法在上一章或伏筆台帳中定位");
          }
        }

        if (!counterLine || !counterLine.includes("若") || !counterLine.includes("退回")) {
          issues.push("反證欄必須寫出可觸發退回的條件");
        }
        if (!decisionLine.includes("通過")) issues.push("審稿判定不是通過");
        if (/待確認|未檢查|略過|之後再看/.test(section)) issues.push("審稿區塊仍含未完成語句");
      }

      report.checkedTitles.push({
        title,
        chapter: chapter.number,
        receiptChars: countNonWhitespace(section),
        issues,
      });
      report.hardIssues.push(...issues.map((issue) => `${title} 第${chapter.number}章: ${issue}`));
    }
  }

  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes("--strict") && report.hardIssues.length > 0) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
}
