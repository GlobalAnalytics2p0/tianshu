import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const styles = readFileSync(resolve("styles.css"), "utf8");

describe("fluid responsive CSS contract", () => {
  it("keeps the primary shell and content rails fluid", () => {
    expect(styles).toContain("--layout-max: 120rem");
    expect(styles).toContain("--page-gutter: clamp(1rem, 2.8vw, 3rem)");
    expect(styles).toContain("width: min(100%, var(--content-max))");
  });

  it("uses percentage-led reader measures instead of fixed pixel columns", () => {
    expect(styles).toContain("--reader-measure-narrow: min(72%, 48rem)");
    expect(styles).toContain("--reader-measure-standard: min(84%, 60rem)");
    expect(styles).toContain("--reader-measure-wide: min(94%, 72rem)");

    const currentReaderTheme = styles.slice(styles.indexOf("/* Tianshu 2.5"));
    expect(currentReaderTheme).not.toMatch(/max-(?:inline-)?size:\s*(?:620|720|860)px/);
  });

  it("uses fluid mobile reading gutters and safe-area-aware chrome", () => {
    expect(styles).toContain("--reader-mobile-gutter: clamp(0.9375rem, 4.5vw, 1.25rem)");
    expect(styles).toContain("env(safe-area-inset-top)");
    expect(styles).toContain("env(safe-area-inset-bottom)");
  });

  it("keeps the four mobile reading controls in a two-by-two grid", () => {
    const mobileReaderChrome = styles.slice(styles.indexOf("/* Tianshu 2.6"));
    expect(mobileReaderChrome).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(mobileReaderChrome).not.toContain("repeat(auto-fit, minmax(min(100%, 10rem), 1fr))");
  });
});
