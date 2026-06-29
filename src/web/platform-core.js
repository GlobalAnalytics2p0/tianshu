export const ACTIVE_TITLES = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];

export const SESSION_STATUSES = Object.freeze([
  "queued",
  "running",
  "reviewing",
  "published",
  "failed",
  "cancelled"
]);

export const MESSAGE_STATUSES = Object.freeze([
  "pending",
  "visible",
  "quarantined",
  "rejected"
]);

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

export function authorScore({ engagedReaders = 0, helpfulRatio = 0, completionRate = 0, growthRate = 0 }) {
  return Math.round(
    clamp(engagedReaders) * 0.35
    + clamp(helpfulRatio) * 0.25
    + clamp(completionRate) * 0.2
    + clamp(growthRate) * 0.2
  );
}

export function topicScore({ searchGrowth = 0, votes = 0, participants = 0, recency = 0 }) {
  return Math.round(
    clamp(searchGrowth) * 0.4
    + clamp(votes) * 0.3
    + clamp(participants) * 0.2
    + clamp(recency) * 0.1
  );
}

export function formatCountdown(target, now = Date.now()) {
  const remaining = Math.max(0, new Date(target).getTime() - Number(now));
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function nextCouncilSlot(now = new Date()) {
  const date = new Date(now);
  const slots = [0, 6, 12, 18];
  for (const hour of slots) {
    const candidate = new Date(date);
    candidate.setHours(hour, 15, 0, 0);
    if (candidate > date) return candidate;
  }
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 15, 0, 0);
  return next;
}

export function normalizePublicMessage(message) {
  return {
    id: String(message?.id || ""),
    actorKind: String(message?.actor_kind || message?.actorKind || "system"),
    speaker: String(message?.speaker_name || message?.speaker || "天書主編"),
    content: String(message?.content || "").trim().slice(0, 1600),
    createdAt: message?.created_at || message?.createdAt || new Date().toISOString(),
    turnIndex: Number(message?.turn_index ?? message?.turnIndex ?? 0),
    accent: String(message?.accent || "#a98cff"),
    citations: Array.isArray(message?.citations) ? message.citations : []
  };
}

export function publicBookFromManifest(book) {
  const latest = Array.isArray(book?.chapters) ? book.chapters.at(-1) : null;
  return {
    id: String(book?.id || ""),
    title: String(book?.title || "未命名作品"),
    author: String(book?.author || "天書作者"),
    category: String(book?.category || "原創"),
    coverImage: String(book?.coverImage || ""),
    updatedAt: latest?.publishedAt || book?.updatedAt || "",
    latestChapter: latest?.displayTitle || latest?.title || "最新章節待同步",
    chapterCount: Array.isArray(book?.chapters) ? book.chapters.length : 0
  };
}
