import { describe, expect, it } from "vitest";
import { duplicatedLongSpanIssue, findDuplicatedLongSpan } from "../../scripts/chapter-duplicate-guard.mjs";

describe("chapter duplicate guard", () => {
  it("flags a chapter body pasted twice despite different whitespace", () => {
    const body = "甲".repeat(350) + "乙".repeat(350) + "丙".repeat(350);
    const pastedTwice = `${body}\n\n${body.match(/.{1,73}/g).join("\n")}`;

    expect(findDuplicatedLongSpan(pastedTwice)?.length).toBeGreaterThanOrEqual(1000);
    expect(duplicatedLongSpanIssue(pastedTwice)).toMatch(/Duplicated contiguous prose block/);
  });

  it("does not flag ordinary repeated short wording", () => {
    expect(duplicatedLongSpanIssue("他抬頭。".repeat(80))).toBeNull();
  });
});
