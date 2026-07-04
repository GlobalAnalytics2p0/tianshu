import { describe, expect, it } from "vitest";
import { classifyDirtyPath } from "../../scripts/automation-batch-state.mjs";

const state = {
  titles: {
    星骸王座: { expectedNumber: 101 },
  },
  coexistingChanges: {
    "src/resource/星骸王座/文章/第55章 舊章.txt": {
      sha256: "approved-digest",
      reason: "validated quality repair",
    },
  },
};

describe("automation batch dirty-path ownership", () => {
  it("accepts the expected new chapter and active-title notes as batch-owned", () => {
    expect(classifyDirtyPath("src/resource/星骸王座/文章/第101章 新章.txt", state)).toEqual({ status: "batch-owned" });
    expect(classifyDirtyPath("src/resource/星骸王座/素材/反思.md", state)).toEqual({ status: "batch-owned" });
  });

  it("accepts an explicitly registered coexisting change only while its digest matches", () => {
    const path = "src/resource/星骸王座/文章/第55章 舊章.txt";
    expect(classifyDirtyPath(path, state, () => "approved-digest")).toEqual({ status: "coexisting-approved" });
    expect(classifyDirtyPath(path, state, () => "changed-digest")).toEqual({ status: "coexisting-changed" });
  });

  it("keeps unknown active chapter changes blocked", () => {
    expect(classifyDirtyPath("src/resource/星骸王座/文章/第77章 未登記.txt", state, () => "x"))
      .toEqual({ status: "unexpected" });
  });
});
