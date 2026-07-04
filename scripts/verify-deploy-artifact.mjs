#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve("dist");
const RESOURCE_ROOT = "src/resource/";
const MAX_BYTES = 60 * 1024 * 1024;
const FORBIDDEN_SEGMENTS = ["/有聲書/", "/影片/", "/短影音/"];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function sizeOf(files) {
  return files.reduce((total, file) => total + statSync(file).size, 0);
}

function fail(messages) {
  console.error("FAIL: deploy artifact verification failed");
  for (const message of messages) console.error(`- ${message}`);
  process.exit(1);
}

if (!existsSync(DIST)) fail(["dist does not exist; run npm run build first."]);

const manifest = JSON.parse(readFileSync(resolve(DIST, "src/resource/manifest.json"), "utf8"));
const requiredPaths = new Set([`${RESOURCE_ROOT}manifest.json`]);
for (const book of manifest.books || []) {
  for (const chapter of book.chapters || []) if (chapter?.path) requiredPaths.add(chapter.path);
  for (const imagePath of [book.coverImage, book.heroImage]) if (imagePath) requiredPaths.add(imagePath);
}

const errors = [];
for (const path of requiredPaths) {
  if (!path.startsWith(RESOURCE_ROOT)) errors.push(`manifest path escapes resource root: ${path}`);
  else if (!existsSync(resolve(DIST, path))) errors.push(`required reader resource is missing: ${path}`);
}

const files = walk(DIST);
const forbidden = files
  .map((file) => file.slice(DIST.length))
  .filter((path) => FORBIDDEN_SEGMENTS.some((segment) => path.includes(segment)));
if (forbidden.length) errors.push(`non-reader media or author material leaked into dist: ${forbidden.slice(0, 5).join(", ")}`);

const unexpectedResources = files
  .map((file) => file.slice(DIST.length + 1))
  .filter((path) => path.startsWith(RESOURCE_ROOT) && !requiredPaths.has(path));
if (unexpectedResources.length) errors.push(`unreferenced resource leaked into dist: ${unexpectedResources.slice(0, 5).join(", ")}`);

const bytes = sizeOf(files);
if (bytes > MAX_BYTES) errors.push(`dist is ${(bytes / 1024 / 1024).toFixed(1)} MiB, over the ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MiB Pages reliability budget`);

if (errors.length) fail(errors);
console.log(JSON.stringify({
  status: "pass",
  fileCount: files.length,
  bytes,
  mib: Number((bytes / 1024 / 1024).toFixed(2)),
  requiredReaderResources: requiredPaths.size
}, null, 2));
