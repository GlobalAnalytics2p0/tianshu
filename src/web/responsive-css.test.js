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
    expect(styles).toContain("--reader-measure-narrow: min(68%, 44rem)");
    expect(styles).toContain("--reader-measure-standard: min(78%, 54rem)");
    expect(styles).toContain("--reader-measure-wide: min(90%, 66rem)");

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

  it("uses content-first desktop reading chrome", () => {
    const currentReaderChrome = styles.slice(styles.indexOf("/* Tianshu 2.6"));
    const desktopStart = currentReaderChrome.indexOf("/* Desktop reading follows the same content-first model as mobile. */");
    const desktopEnd = currentReaderChrome.indexOf("@media (max-width: 780px)", desktopStart);
    const desktopReaderChrome = currentReaderChrome.slice(desktopStart, desktopEnd);
    expect(currentReaderChrome).toContain("/* Desktop reading follows the same content-first model as mobile. */");
    expect(desktopReaderChrome).toContain("top: auto");
    expect(desktopReaderChrome).toContain("animation: reader-desktop-panel-up 180ms ease-out both");
    expect(desktopReaderChrome).toContain("width: min(30rem, calc(100% - 8rem))");
  });

  it("keeps the mobile council preview compact and the reader dock actionable", () => {
    const mobileUx = styles.slice(styles.indexOf("/* Tianshu 2.7"));
    expect(mobileUx).toContain("grid-template-columns: minmax(0, 1fr) auto");
    expect(mobileUx).toContain("min-height: 0");
    expect(mobileUx).toContain(".modal-layout:not(.modal-layout--reading) .mobile-reader-dock");
    expect(mobileUx).toContain("pointer-events: auto");
  });

  it("separates book details from reading and strengthens mobile navigation", () => {
    const readerEntry = styles.slice(styles.indexOf("/* Tianshu 2.8"));
    expect(readerEntry).toContain(".modal-layout:not(.modal-layout--reading) .modal-sections");
    expect(readerEntry).toContain("--reader-mobile-dock-height: 3.75rem");
    expect(readerEntry).toContain(".reader-focus-bar__info");
    expect(readerEntry).toContain("grid-template-rows: 1.125rem auto");
  });
});
