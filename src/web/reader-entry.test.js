import { describe, expect, it } from "vitest";
import {
  MOBILE_READER_MAX_WIDTH,
  hasMeaningfulReadingProgress,
  shouldAutoEnterReader
} from "./reader-entry.js";

describe("mobile reader entry", () => {
  it("opens compact viewports directly in reading mode", () => {
    expect(shouldAutoEnterReader(390)).toBe(true);
    expect(shouldAutoEnterReader(MOBILE_READER_MAX_WIDTH)).toBe(true);
    expect(shouldAutoEnterReader(MOBILE_READER_MAX_WIDTH + 1)).toBe(false);
  });

  it("rejects missing or invalid viewport widths", () => {
    expect(shouldAutoEnterReader()).toBe(false);
    expect(shouldAutoEnterReader(0)).toBe(false);
    expect(shouldAutoEnterReader("wide")).toBe(false);
  });

  it("recognizes chapter and in-chapter reading progress", () => {
    expect(hasMeaningfulReadingProgress({ chapterIndex: 1, readerRatio: 0 })).toBe(true);
    expect(hasMeaningfulReadingProgress({ chapterIndex: 0, readerRatio: 0.42 })).toBe(true);
    expect(hasMeaningfulReadingProgress({ chapterIndex: 0, readerRatio: 0 })).toBe(false);
  });
});
