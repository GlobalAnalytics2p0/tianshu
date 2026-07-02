export const DEFAULT_READER_SETTINGS = Object.freeze({
  theme: "dark",
  font: "serif",
  size: "medium",
  line: "relaxed",
  width: "standard"
});

const ALLOWED_READER_SETTINGS = Object.freeze({
  theme: ["dark", "light"],
  font: ["serif", "sans"],
  size: ["small", "medium", "large"],
  line: ["compact", "relaxed", "wide"],
  width: ["narrow", "standard", "wide"]
});

export function normalizeReaderSettings(value = {}) {
  const stored = value && typeof value === "object" ? value : {};

  return Object.fromEntries(Object.entries(DEFAULT_READER_SETTINGS).map(([key, fallback]) => [
    key,
    ALLOWED_READER_SETTINGS[key].includes(stored[key]) ? stored[key] : fallback
  ]));
}

export function migrateLegacyReaderSettings(value = {}) {
  const stored = value && typeof value === "object" ? value : {};
  return normalizeReaderSettings({ ...stored, theme: "dark" });
}
