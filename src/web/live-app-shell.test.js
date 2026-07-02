import { describe, expect, it } from "vitest";
import { extractModuleScriptSources, findViteBundleUrl } from "../../scripts/live-app-shell.mjs";

describe("live app shell verification", () => {
  it("finds the Vite hashed module bundle", () => {
    const html = '<script type="module" crossorigin src="/assets/main-AbC_123-.js"></script>';

    expect(extractModuleScriptSources(html)).toEqual(["/assets/main-AbC_123-.js"]);
    expect(findViteBundleUrl(html, "https://example.com/").href)
      .toBe("https://example.com/assets/main-AbC_123-.js");
  });

  it("rejects the unbundled source entry", () => {
    const html = '<script type="module" src="/app.js"></script>';

    expect(() => findViteBundleUrl(html, "https://example.com/"))
      .toThrow("references unbundled entry /app.js");
  });

  it("rejects a page without a Vite module bundle", () => {
    expect(() => findViteBundleUrl("<main>Loading</main>", "https://example.com/"))
      .toThrow("does not reference a Vite hashed JavaScript bundle");
  });
});
