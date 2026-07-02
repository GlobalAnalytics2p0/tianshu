import { describe, expect, it } from "vitest";
import {
  DEFAULT_READER_SETTINGS,
  migrateLegacyReaderSettings,
  normalizeReaderSettings
} from "./reader-settings.js";

describe("reader settings", () => {
  it("defaults every new reader to the dark theme", () => {
    expect(normalizeReaderSettings({})).toEqual(DEFAULT_READER_SETTINGS);
  });

  it("preserves an explicit current-version light preference", () => {
    expect(normalizeReaderSettings({ theme: "light" }).theme).toBe("light");
  });

  it("migrates legacy preferences while resetting the old light default", () => {
    expect(migrateLegacyReaderSettings({
      theme: "light",
      font: "sans",
      size: "large",
      line: "compact",
      width: "narrow"
    })).toEqual({
      theme: "dark",
      font: "sans",
      size: "large",
      line: "compact",
      width: "narrow"
    });
  });
});
