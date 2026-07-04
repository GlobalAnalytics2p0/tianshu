import { describe, expect, it, vi } from "vitest";
import { loadExpectedManifest, parseArgs } from "../../scripts/verify-site-publication.mjs";

describe("publication manifest source", () => {
  it("uses the working-tree manifest after a push by default", () => {
    const readLocal = vi.fn(() => ({ generatedAt: "working-tree" }));
    const readGitRef = vi.fn();

    expect(loadExpectedManifest("", { readLocal, readGitRef })).toEqual({ generatedAt: "working-tree" });
    expect(readLocal).toHaveBeenCalledOnce();
    expect(readGitRef).not.toHaveBeenCalled();
  });

  it("uses the committed manifest when preflight supplies HEAD", () => {
    const readLocal = vi.fn();
    const readGitRef = vi.fn(() => JSON.stringify({ generatedAt: "committed" }));

    expect(loadExpectedManifest("HEAD", { readLocal, readGitRef })).toEqual({ generatedAt: "committed" });
    expect(readGitRef).toHaveBeenCalledWith("HEAD");
    expect(readLocal).not.toHaveBeenCalled();
  });

  it("parses the preflight expected ref without changing publish defaults", () => {
    expect(parseArgs(["--expected-ref", "HEAD", "--timeout-ms", "1000"])).toMatchObject({
      expectedRef: "HEAD",
      timeoutMs: 1000,
    });
    expect(parseArgs([]).expectedRef).toBe("");
  });
});
