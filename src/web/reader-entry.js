export const MOBILE_READER_MAX_WIDTH = 780;

export function shouldAutoEnterReader(viewportWidth) {
  const width = Number(viewportWidth);
  return Number.isFinite(width) && width > 0 && width <= MOBILE_READER_MAX_WIDTH;
}

export function hasMeaningfulReadingProgress(value = {}) {
  if (!value || typeof value !== "object") return false;
  const chapterIndex = Number(value.chapterIndex) || 0;
  const readerRatio = Number(value.readerRatio) || 0;
  return chapterIndex > 0 || readerRatio >= 0.02;
}
