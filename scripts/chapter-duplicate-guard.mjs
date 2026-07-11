const DEFAULT_WINDOW_SIZE = 600;
const DEFAULT_STEP_SIZE = 1;

function normalizedText(text) {
  return String(text ?? "").replace(/\s+/g, "");
}

function extendMatch(text, firstStart, secondStart, windowSize) {
  let length = windowSize;
  const maximum = Math.min(text.length - firstStart, text.length - secondStart);
  while (length < maximum && text[firstStart + length] === text[secondStart + length]) length += 1;
  return length;
}

/**
 * Finds copied prose blocks even when a writer has changed paragraph breaks.
 * A 600-character exact overlap is intentionally far above normal repeated
 * phrasing, while still catching a 6,000-character chapter pasted twice.
 */
export function findDuplicatedLongSpan(text, { windowSize = DEFAULT_WINDOW_SIZE, stepSize = DEFAULT_STEP_SIZE } = {}) {
  const source = normalizedText(text);
  if (source.length < windowSize * 2) return null;

  const seen = new Map();
  let best = null;
  for (let index = 0; index + windowSize <= source.length; index += stepSize) {
    const window = source.slice(index, index + windowSize);
    const firstStart = seen.get(window);
    if (firstStart === undefined) {
      seen.set(window, index);
      continue;
    }
    if (index - firstStart < windowSize) continue;
    const length = extendMatch(source, firstStart, index, windowSize);
    if (!best || length > best.length) best = { firstStart, secondStart: index, length };
  }
  return best;
}

export function duplicatedLongSpanIssue(text) {
  const match = findDuplicatedLongSpan(text);
  if (!match) return null;
  return `Duplicated contiguous prose block: ${match.length} non-whitespace characters at offsets ${match.firstStart + 1} and ${match.secondStart + 1}`;
}
