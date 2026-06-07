#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const API_URL = "https://api.openai.com/v1/audio/speech";
const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "cedar";
const DEFAULT_CHARS_PER_CHUNK = 1800;

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const raw = argv[index];
    if (!raw.startsWith("--")) continue;
    const key = raw.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function required(args, key) {
  if (!args[key]) {
    throw new Error(`Missing required argument: --${key}`);
  }
  return args[key];
}

function normalizeChapterText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitText(text, maxChars) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let start = 0; start < paragraph.length; start += maxChars) {
        chunks.push(paragraph.slice(start, start + maxChars));
      }
      continue;
    }

    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function synthesizeChunk({ apiKey, model, voice, instructions, speed, text, outputPath }) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      instructions,
      response_format: "wav",
      speed,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI speech request failed (${response.status}): ${detail}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
}

function runFfmpegConcat({ chunkPaths, outputPath }) {
  const tempList = join(dirname(chunkPaths[0]), "concat-list.txt");
  writeFileSync(tempList, chunkPaths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n"));

  const result = spawnSync("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    tempList,
    "-ar",
    "44100",
    "-ac",
    "1",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ], { encoding: "utf8", stdio: "pipe" });

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed:\n${result.stderr || result.stdout}`);
  }
}

function buildInstructions({ novel, style }) {
  return [
    "請用自然、成熟、耐聽的台灣華語朗讀繁體中文長篇小說。",
    "語氣像正式有聲書，不要像系統語音、客服播報、新聞主播或誇張廣播劇。",
    "節奏沉穩但不能拖，遇到動作、追殺、危險細節時略微收緊；遇到伏筆與異常細節時停頓半拍。",
    "角色對白要有輕微差異，但不要刻意變聲過頭。",
    "專有名詞、角色名與章名要清楚，標點停頓要自然。",
    novel === "星骸王座"
      ? "《星骸王座》的整體聲音要冷、低壓、帶邊境寒意；沈曜克制疲憊，星核帶冷諷，阿棠乾淨果斷。"
      : "",
    style || "",
  ].filter(Boolean).join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  const chapterFile = resolve(required(args, "chapter-file"));
  const novel = args.novel || "未命名小說";
  const chapterTitle = args["chapter-title"] || basename(chapterFile, ".txt");
  const model = args.model || DEFAULT_MODEL;
  const voice = args.voice || DEFAULT_VOICE;
  const speed = Number(args.speed || 0.95);
  const maxChars = Number(args["max-chars"] || DEFAULT_CHARS_PER_CHUNK);
  const output = resolve(args.output || join(dirname(chapterFile), "有聲書", `${chapterTitle}-${voice}.m4a`));
  const dryRun = Boolean(args["dry-run"]);

  const chapterBody = normalizeChapterText(readFileSync(chapterFile, "utf8"));
  const narrationText = normalizeChapterText(`${novel}。\n${chapterTitle}。\n\n${chapterBody}`);
  const chunks = splitText(narrationText, maxChars);
  const instructions = buildInstructions({ novel, style: args.instructions || "" });

  console.log(`Novel: ${novel}`);
  console.log(`Chapter: ${chapterTitle}`);
  console.log(`Model: ${model}`);
  console.log(`Voice: ${voice}`);
  console.log(`Speed: ${speed}`);
  console.log(`Chunks: ${chunks.length}`);
  console.log(`Output: ${output}`);

  if (dryRun) {
    chunks.forEach((chunk, index) => {
      console.log(`Chunk ${index + 1}: ${chunk.length} chars`);
    });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Run with --dry-run to inspect chunking without generating audio.");
  }

  mkdirSync(dirname(output), { recursive: true });
  const tempDir = mkdtempSync(join(tmpdir(), "tianshu-openai-tts-"));
  const chunkPaths = [];

  try {
    for (const [index, chunk] of chunks.entries()) {
      const chunkPath = join(tempDir, `chunk-${String(index + 1).padStart(3, "0")}.wav`);
      console.log(`Synthesizing chunk ${index + 1}/${chunks.length}...`);
      await synthesizeChunk({
        apiKey,
        model,
        voice,
        instructions,
        speed,
        text: chunk,
        outputPath: chunkPath,
      });
      chunkPaths.push(chunkPath);
    }

    runFfmpegConcat({ chunkPaths, outputPath: output });
    console.log(`Done: ${output}`);
  } finally {
    if (!args["keep-temp"]) {
      rmSync(tempDir, { recursive: true, force: true });
    } else {
      console.log(`Temp kept: ${tempDir}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
