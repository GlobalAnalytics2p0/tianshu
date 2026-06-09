#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const API_URL = "https://api.openai.com/v1/audio/speech";
const BASE = new URL("../", import.meta.url);
const inputPath = new URL("./narration.txt", import.meta.url);
const outputPath = new URL("./openai-narration.m4a", import.meta.url);

const instructions = [
  "請用自然、成熟、低壓、耐聽的台灣華語朗讀繁體中文短影音旁白。",
  "語氣像高質感小說預告片，不要像系統語音、客服播報、新聞主播或誇張廣告。",
  "《星骸王座》的聲音要冷、克制、有邊境寒意；前段壓低，提到死法與星核說謊時略微收緊。",
  "節奏要適合 90 秒豎屏短影音，清楚、有停頓、有畫面感，但不要拖慢。",
  "不要朗讀任何標題、檔名、括號說明或提示詞，只朗讀輸入文字本身。"
].join("\n");

function parseArgs(argv) {
  const args = {
    model: "gpt-4o-mini-tts",
    voice: "cedar",
    speed: 1.02,
    output: outputPath.pathname
  };

  for (let index = 2; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key === "--model" && value) {
      args.model = value;
      index += 1;
    } else if (key === "--voice" && value) {
      args.voice = value;
      index += 1;
    } else if (key === "--speed" && value) {
      args.speed = Number(value);
      index += 1;
    } else if (key === "--output" && value) {
      args.output = resolve(value);
      index += 1;
    }
  }

  return args;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Set it in the shell, then rerun `node voice/openai-tts.mjs` from this short-video folder.");
  }

  const args = parseArgs(process.argv);
  const input = readFileSync(inputPath, "utf8").trim();
  mkdirSync(dirname(args.output), { recursive: true });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: args.model,
      voice: args.voice,
      input,
      instructions,
      response_format: "aac",
      speed: args.speed
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI speech request failed (${response.status}): ${await response.text()}`);
  }

  writeFileSync(args.output, Buffer.from(await response.arrayBuffer()));
  console.log(`OpenAI narration written: ${args.output}`);
  console.log(`Folder: ${BASE.pathname}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
