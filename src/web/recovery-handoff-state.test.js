import { describe, expect, it } from "vitest";
import {
  DELETED_DIGEST,
  expectedRecoveryPaths,
  isRecoveryContentPath,
  validateRecoveryHandoff,
} from "../../scripts/recovery-handoff-state.mjs";

const renamedFrom = "src/resource/星骸王座/文章/第104章 舊名.txt";
const renamedTo = "src/resource/星骸王座/文章/第104章 新名.txt";
const notePath = "src/resource/星骸王座/素材/反思.md";

function readyHandoff(overrides = {}) {
  return {
    ownerAutomationId: "automation",
    sourceHead: "abc123",
    state: "ready-for-coordinator",
    changedPaths: [renamedTo, notePath],
    renamedPaths: [{ from: renamedFrom, to: renamedTo }],
    pathDigests: {
      [renamedFrom]: DELETED_DIGEST,
      [renamedTo]: "new-file-digest",
      [notePath]: "note-digest",
    },
    ...overrides,
  };
}

const digestForPath = (path) => readyHandoff().pathDigests[path];

describe("continuity-repair handoff ownership", () => {
  it("accepts only the manifest and five active title folders", () => {
    expect(isRecoveryContentPath("src/resource/manifest.json")).toBe(true);
    expect(isRecoveryContentPath(notePath)).toBe(true);
    expect(isRecoveryContentPath("src/resource/backup/舊書/文章/第01章.txt")).toBe(false);
    expect(isRecoveryContentPath("app.js")).toBe(false);
  });

  it("includes both sides of a rename in the expected dirty set", () => {
    expect(expectedRecoveryPaths(readyHandoff())).toEqual([renamedFrom, renamedTo, notePath].sort((a, b) => a.localeCompare(b, "zh-Hant")));
  });

  it("accepts an exact ready handoff with matching digests", () => {
    const result = validateRecoveryHandoff({
      handoff: readyHandoff(),
      currentHead: "abc123",
      dirtyPaths: [renamedFrom, renamedTo, notePath],
      digestForPath,
    });
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects blocked handoffs, extra paths, stale HEADs, and digest drift", () => {
    const result = validateRecoveryHandoff({
      handoff: readyHandoff({ state: "blocked", sourceHead: "old-head" }),
      currentHead: "abc123",
      dirtyPaths: [renamedFrom, renamedTo, notePath, "src/resource/灰塔觀測者/素材/反思.md"],
      digestForPath: (path) => path === notePath ? "mutated" : digestForPath(path),
    });
    expect(result.valid).toBe(false);
    expect(result.issues.join("\n")).toMatch(/not ready-for-coordinator/);
    expect(result.issues.join("\n")).toMatch(/does not match current HEAD/);
    expect(result.issues.join("\n")).toMatch(/absent from the handoff/);
    expect(result.issues.join("\n")).toMatch(/digest changed/);
  });
});
