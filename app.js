import { createTianshuPlatform } from "./src/web/platform.js";

const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h5v-5h3v5h5v-9.5"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4v2a4 4 0 0 0 4 4"/><path d="M16 6h4v2a4 4 0 0 1-4 4"/><path d="M12 12v5"/><path d="M8 20h8"/><path d="M9 17h6"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="13.5" r="1"/><circle cx="15" cy="13.5" r="1"/><path d="M9.5 17h5"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><rect x="14" y="14" width="6" height="6" rx="1.4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z"/><path d="M5 5.5A2.5 2.5 0 0 0 2.5 3H4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M12 9v11"/><path d="M4 13h16"/><path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9Z"/><path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19 12a7.7 7.7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.3 3a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.3 3h5l.3-3a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M9.7 9.3a2.5 2.5 0 1 1 4.2 2c-.9.6-1.5 1.1-1.5 2.2"/><path d="M12 17h.01"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>',
  "chevron-down": '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 21c3.8 0 6.5-2.6 6.5-6.2 0-2.4-1.4-4.5-3.3-5.7.2 1.8-.7 3-2.1 3.7.3-2.9-1.2-5.4-4-7.8.1 3.2-1.8 4.9-3 6.7A6 6 0 0 0 12 21Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M13 3 9.8 9.8 3 13l6.8 3.2L13 23l3.2-6.8L23 13l-6.8-3.2L13 3Z"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8a3 3 0 1 1 6 0"/></svg>',
  wave: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 13c2.4 0 2.4-6 4.8-6s2.4 10 4.8 10S15 7 17.4 7 19.8 17 22 17"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>',
  subscribe: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
  thumb: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
  line: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4c4.97 0 9 3.37 9 7.53 0 3.73-3.23 6.83-7.57 7.43L8 22l1.48-3.2C5.8 18.13 3 15.14 3 11.53 3 7.37 7.03 4 12 4Z"/><path d="M8.4 10.2v3.7"/><path d="M10.95 10.2v3.7h2.4"/><path d="M15.15 13.9v-3.7l2.45 3.7v-3.7"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8h2.5V4.8c-.44-.06-1.38-.18-2.48-.18-2.46 0-4.14 1.5-4.14 4.27V11H7v3.58h2.88V21h3.55v-6.42H16.2L16.65 11h-3.22V9.26c0-.98.28-1.66 1.57-1.66Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.91 5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13.09 19"/></svg>',
  sync: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M17 2v5h-5"/><path d="M19 9A7 7 0 0 0 6.4 5.8"/><path d="M7 22v-5h5"/><path d="M5 15a7 7 0 0 0 12.6 3.2"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M5 5h14v10H8l-4 4V6a1 1 0 0 1 1-1Z"/><path d="M8 9h8"/><path d="M8 12h5"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m21 3-6.5 18-4-8.5L2 8.5 21 3Z"/><path d="m10.5 12.5 4-4"/></svg>',
  devices: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="5" width="13" height="10" rx="1.5"/><rect x="17" y="8" width="4" height="11" rx="1.2"/><path d="M7 19h5"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="m15 9-2 5-5 2 2-5 5-2Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 3v11"/><path d="m8 10 4 4 4-4"/><path d="M5 19h14"/></svg>',
  reader: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14H7a3 3 0 0 0-3 3V6.5Z"/><path d="M8 8h8"/><path d="M8 12h6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l5.5-3.5L10 8.5Z"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 10v6"/><path d="M12 7h.01"/></svg>'
};

let categories = [
  { id: "玄幻", name: "玄幻", count: 8, rgb: "98, 124, 255", icon: "wave" },
  { id: "奇幻", name: "奇幻", count: 8, rgb: "153, 109, 255", icon: "spark" },
  { id: "武俠", name: "武俠", count: 8, rgb: "126, 192, 126", icon: "compass" },
  { id: "都市", name: "都市", count: 8, rgb: "167, 106, 255", icon: "devices" },
  { id: "歷史", name: "歷史", count: 8, rgb: "218, 147, 83", icon: "book" }
];

const coverPalettes = [
  ["#102140", "#315d9f"],
  ["#24183d", "#6a74c8"],
  ["#0e3157", "#1f7cc9"],
  ["#1d143d", "#6842bd"],
  ["#263445", "#8fa6c9"],
  ["#271d19", "#a86539"],
  ["#102a26", "#3e9c90"],
  ["#331628", "#b74d8d"],
  ["#1e2a19", "#739052"],
  ["#16223c", "#7c8dcc"]
];

const resourceManifestPath = "src/resource/manifest.json";
const youtubeChannelUrl = "https://www.youtube.com/@tianshunovel";
const youtubeShareText = "來看天書小說：每日 18 點更新原創連載、爆款小說與 YouTube 說書影片";
const activeRankingTitles = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];
const chapterAutoRefreshFlag = "tianshu-auto-refreshed";
const installGuideStorageKey = "tianshu-ios-safari-install-guide-v1";
const readingProgressStorageKey = "tianshu-reading-progress-v1";
const readerSettingsStorageKey = "tianshu-reader-settings-v2";
const authorChatStorageKey = "tianshu-author-chat-v6";
const authorAgentEndpoint = typeof window !== "undefined" ? window.TIANSHU_AUTHOR_AGENT_ENDPOINT || "" : "";
const authorAgentRequestTimeoutMs = 12000;
const maxAuthorChatMessages = 500;
const manifestPollIntervalMs = 60000;
const defaultReaderSettings = {
  font: "serif",
  size: "medium",
  line: "relaxed",
  width: "standard"
};

const authorVoiceProfiles = {
  "星骸王座": {
    author: "顧夜燼",
    initial: "顧",
    accent: "#7ea5ff",
    texture: "邊境求生",
    focus: "主角處境、北街生活、章節節奏",
    seed: "你好，我是《星骸王座》的作者。這裡可以問劇情、角色、更新或閱讀順序，我會盡量直接回答，也會避免提前爆雷。",
    readerReplies: {
      complaint: "收到，謝謝你直接說。這類問題我會優先回頭看節奏和可讀性，避免只推設定而忽略人物感受。",
      suggestion: "這個建議我會先記下來。能不能放進正文，要看它會不會讓角色選擇更清楚，而不是只多一個設定。",
      question: "可以問。這題我會盡量回答到你能理解目前劇情，但不提前把後面的關鍵轉折說破。",
      general: "我看到了，謝謝留言。我會把這個意見放回後續章節的節奏和角色反應裡檢查。"
    }
  },
  "灰塔觀測者": {
    author: "霧原",
    initial: "霧",
    accent: "#9d8cff",
    texture: "懸疑觀測",
    focus: "線索清楚度、懸疑節奏、讀者是否跟得上",
    seed: "你好，我是《灰塔觀測者》的作者。這裡可以問線索、角色動機或目前看不懂的地方，我會盡量用不爆雷的方式說明。",
    readerReplies: {
      complaint: "收到。如果讀起來只是悶，而不是有懸念，那我需要調整線索密度和場景推進。",
      suggestion: "這個方向可以評估。我會看它是否能讓線索更好讀，而不是讓讀者更困惑。",
      question: "這個問題可以問。我會先回答目前已經能公開的部分，後面還沒揭露的內容就先不爆雷。",
      general: "我看到了。這類回饋會幫我確認懸疑感和可理解度有沒有平衡好。"
    }
  },
  "雪刃照孤城": {
    author: "謝聽寒",
    initial: "謝",
    accent: "#8cca73",
    texture: "武俠舊案",
    focus: "人物情緒、武打節奏、舊案線索",
    seed: "你好，我是《雪刃照孤城》的作者。可以問角色關係、舊案線索或哪一段武打看不清楚，我會直接說明。",
    readerReplies: {
      complaint: "收到。如果武打或人物反應讀起來不順，我會先檢查動作順序和情緒鋪陳。",
      suggestion: "這個建議可以先放進待評估清單。只要它能讓角色更清楚，而不是硬加橋段，就有機會用。",
      question: "可以，這題我會盡量說清楚目前線索。涉及後面反轉的部分，我會先保留。",
      general: "謝謝留言。我會用這個回饋檢查後續章節的節奏和人物選擇。"
    }
  },
  "凌晨三點的演算法": {
    author: "陳停雲",
    initial: "陳",
    accent: "#35e4dc",
    texture: "都市科技",
    focus: "黑箱流程、人物選擇、現實感",
    seed: "你好，我是《凌晨三點的演算法》的作者。你可以問設定、科技流程或角色動機，我會盡量用白話回答。",
    readerReplies: {
      complaint: "收到。科技線如果看起來像在講術語，就需要改得更像人在現場遇到的問題。",
      suggestion: "這個建議可以考慮。我的原則是先讓流程變好懂，再決定要不要加進情節。",
      question: "可以，我會先用目前公開的資訊回答。後面涉及案件真相的部分，我會避免提前劇透。",
      general: "我看到了。這類留言會幫我檢查科技設定是否夠清楚、夠貼近角色處境。"
    }
  },
  "大明墨工": {
    author: "蕭墨臣",
    initial: "蕭",
    accent: "#da9353",
    texture: "歷史工匠",
    focus: "工法細節、案件推理、歷史背景",
    seed: "你好，我是《大明墨工》的作者。這裡可以問歷史背景、工法細節或劇情疑問，我會盡量講清楚。",
    readerReplies: {
      complaint: "收到。如果工法或帳冊線讀起來太硬，我會回頭把人物處境和證據關係寫得更清楚。",
      suggestion: "這個建議可以評估。只要它能讓案件或工法更好理解，而不是硬塞資料，就適合考慮。",
      question: "可以問。這題我會先用目前章節能看到的線索回答，不會直接把後面謎底講完。",
      general: "謝謝留言。我會用它檢查後續章節的證據、工法和角色選擇是否夠清楚。"
    }
  }
};

const editorProfile = {
  author: "主編",
  initial: "編",
  accent: "#ffd37b"
};

let allBooks = [];

let currentRankTab = "recommended";
let currentModalBook = null;
let currentChapterIndex = 0;
let currentReaderFocused = false;
let pendingReaderRestore = null;
let readerProgressSaveTimer = null;
let toastTimer = null;
let currentManifestSignature = "";
let manifestPollTimer = null;
let manifestPollInFlight = false;
let readerSettings = loadReaderSettings();
let authorChatStore = { version: 1, threads: {}, feedback: [] };
let activeAuthorChatBookId = "";
let authorChatPendingReplies = new Map();
let authorChatReplyTimers = new Map();
let platformApp = null;
const resourceAvailabilityCache = new Map();

function buildShareUrls() {
  const combinedText = `${youtubeShareText} ${youtubeChannelUrl}`;
  return {
    line: `https://line.me/R/msg/text/?${encodeURIComponent(combinedText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(youtubeChannelUrl)}&quote=${encodeURIComponent(youtubeShareText)}`
  };
}

function buildSummary(book) {
  return `天書原創${book.category}連載，以「${book.tags.join("、")}」為核心。${book.premise}`;
}

function resourceUrl(path, cacheToken = "") {
  const url = new URL(encodeURI(path), window.location.href);
  if (cacheToken) url.searchParams.set("v", String(cacheToken));
  return url.href;
}

function chapterDisplayTitle(chapter) {
  const chapterNumber = Number(chapter.number);
  if (!Number.isFinite(chapterNumber)) return chapter.title;
  return `第${String(chapterNumber).padStart(2, "0")}章 ${chapter.title}`;
}

function latestChapterLabel(book) {
  const latestChapter = book.chapters?.at(-1);
  if (!latestChapter) return "最新章節待同步";
  return `更新至 第${String(latestChapter.number).padStart(2, "0")}章`;
}

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Private browsing or strict storage settings can reject writes.
  }
}

function loadReaderSettings() {
  return {
    ...defaultReaderSettings,
    ...safeReadJson(readerSettingsStorageKey, {})
  };
}

function saveReaderSettings() {
  safeWriteJson(readerSettingsStorageKey, readerSettings);
}

function getReadingProgressMap() {
  return safeReadJson(readingProgressStorageKey, {});
}

function getReadingProgress(bookId) {
  return getReadingProgressMap()[bookId] || null;
}

function saveReadingProgress(bookId, progress) {
  const map = getReadingProgressMap();
  map[bookId] = {
    ...map[bookId],
    ...progress,
    updatedAt: new Date().toISOString()
  };
  safeWriteJson(readingProgressStorageKey, map);
}

function chapterNavButton(direction, chapter, disabled) {
  const label = direction === "previous" ? "上一章" : "下一章";
  const iconPath = direction === "previous" ? "←" : "→";
  const target = chapter ? chapter.displayTitle : "沒有更多章節";
  return `
    <button class="chapter-nav__button" type="button" data-chapter-nav="${direction}" ${disabled ? "disabled" : ""}>
      <span>${direction === "previous" ? iconPath : label}</span>
      <strong>${direction === "previous" ? label : iconPath}</strong>
      <small>${escapeHtml(target)}</small>
    </button>
  `;
}

function renderChapterNav(book, position) {
  const previousChapter = book.chapters[currentChapterIndex - 1];
  const nextChapter = book.chapters[currentChapterIndex + 1];
  return `
    <nav class="chapter-nav chapter-nav--${position}" aria-label="章節切換">
      ${chapterNavButton("previous", previousChapter, !previousChapter)}
      <span class="chapter-nav__count">第 ${currentChapterIndex + 1} / ${book.chapters.length} 章</span>
      ${chapterNavButton("next", nextChapter, !nextChapter)}
    </nav>
  `;
}

function buildManifestSignature(manifest) {
  return (manifest.books || []).map((book) => {
    const latestChapter = (book.chapters || []).at(-1) || {};
    return [
      book.id || book.title || "",
      (book.chapters || []).length,
      latestChapter.number || "",
      latestChapter.generatedAt || "",
      latestChapter.path || ""
    ].join(":");
  }).join("|");
}

async function fetchManifest(cacheToken = "") {
  const response = await fetch(resourceUrl(resourceManifestPath, cacheToken), { cache: "no-store" });
  if (!response.ok) {
    const error = new Error("Unable to load resource manifest");
    error.resourcePath = resourceManifestPath;
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function fetchTextFile(path, cacheToken = "") {
  const response = await fetch(resourceUrl(path, cacheToken), { cache: "no-store" });
  if (!response.ok) {
    const error = new Error(`Unable to load ${path}`);
    error.resourcePath = path;
    error.status = response.status;
    throw error;
  }
  return response.text();
}

async function resourceExists(path, cacheToken = "") {
  if (!path) return false;
  const cacheKey = `${path}|${cacheToken}`;
  if (resourceAvailabilityCache.has(cacheKey)) return resourceAvailabilityCache.get(cacheKey);

  try {
    const response = await fetch(resourceUrl(path, cacheToken), { method: "HEAD", cache: "no-store" });
    const exists = response.ok;
    resourceAvailabilityCache.set(cacheKey, exists);
    return exists;
  } catch (error) {
    resourceAvailabilityCache.set(cacheKey, false);
    return false;
  }
}

function syncCategoryCounts() {
  const counts = allBooks.reduce((result, book) => {
    result[book.category] = (result[book.category] || 0) + 1;
    return result;
  }, {});

  categories = categories.map((category) => ({
    ...category,
    count: counts[category.id] || category.count
  }));
}

async function loadLibrary() {
  const manifest = await fetchManifest(`library-${Date.now()}`);
  currentManifestSignature = buildManifestSignature(manifest);
  allBooks = (manifest.books || []).map((book, index) => {
    const chapters = (book.chapters || []).map((chapter) => ({
      ...chapter,
      displayTitle: chapterDisplayTitle(chapter),
      content: "",
      contentState: "idle"
    }));

    return {
      ...book,
      cover: coverPalettes[index % coverPalettes.length],
      summary: buildSummary(book),
      chapters,
      contentStatus: "天書原創連載"
    };
  });

  syncCategoryCounts();
}

function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    const name = node.dataset.icon;
    if (icons[name]) node.innerHTML = icons[name];
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCount(value) {
  return Number(value).toLocaleString("zh-Hant-TW");
}

function parseHeat(heat) {
  return Number(String(heat).replace(/[^\d]/g, "")) || 0;
}

function getActiveRankingBooks() {
  const rankingMap = new Map(allBooks.map((book) => [book.title, book]));
  return activeRankingTitles.map((title) => rankingMap.get(title)).filter(Boolean);
}

function coverStyle(book) {
  return `--cover-a:${book.cover[0]};--cover-b:${book.cover[1]}`;
}

function coverTitle(title) {
  const compactTitle = String(title).replace(/[：:，,、\s]/g, "");
  return compactTitle.length > 5 ? compactTitle.slice(0, 5) : compactTitle;
}

function renderCoverContent(book) {
  if (book.coverImage) {
    return `<img src="${escapeHtml(resourceUrl(book.coverImage))}" alt="${escapeHtml(book.title)} 主角圖片" loading="lazy" />`;
  }

  return `<span class="book-card__title-art">${escapeHtml(coverTitle(book.title))}</span>`;
}

function renderBookCover(book, rank = "") {
  return `
    <span class="book-card__cover ${book.coverImage ? "book-card__cover--image" : ""}" style="${coverStyle(book)}">
      ${rank ? `<span class="book-card__rank">${rank}</span>` : ""}
      ${renderCoverContent(book)}
    </span>
  `;
}

function getRankedBooks(tab) {
  const rankingBooks = getActiveRankingBooks();
  if (tab === "hot") {
    return [...rankingBooks].sort((a, b) => String(b.chapters.at(-1)?.generatedAt || "").localeCompare(String(a.chapters.at(-1)?.generatedAt || "")));
  }
  if (tab === "hook") return [...rankingBooks].sort((a, b) => b.tags.length - a.tags.length);
  if (tab === "new") {
    return [...rankingBooks].sort((a, b) => {
      const latestA = a.chapters.at(-1)?.generatedAt || "";
      const latestB = b.chapters.at(-1)?.generatedAt || "";
      return latestB.localeCompare(latestA);
    });
  }
  if (tab === "longform") return [...rankingBooks].sort((a, b) => b.chapters.length - a.chapters.length);
  return rankingBooks;
}

function renderRanking() {
  const list = document.getElementById("rankingList");
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  let books = getRankedBooks(currentRankTab);

  if (query) {
    books = getActiveRankingBooks().filter((book) => {
      const haystack = `${book.title} ${book.author} ${book.category} ${book.tags.join(" ")} ${book.premise}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  list.innerHTML = books.slice(0, 5).map((book, index) => `
    <button class="book-card" type="button" data-book-id="${book.id}">
      ${renderBookCover(book, index + 1)}
      <span class="book-card__body">
        <h3>${escapeHtml(book.title)}</h3>
        <span class="book-card__author">${escapeHtml(book.author)}</span>
        <span class="book-card__category">${escapeHtml(book.category)}</span>
        <span class="book-card__latest">${escapeHtml(latestChapterLabel(book))}</span>
        <span class="book-card__score">七日資料累積中</span>
        <span class="book-card__heat"><span class="icon" data-icon="activity"></span>互動統計啟用後顯示</span>
      </span>
    </button>
  `).join("");

  hydrateIcons(list);
  list.querySelectorAll("[data-book-id]").forEach((button) => {
    button.addEventListener("click", () => openBook(button.dataset.bookId));
  });
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  list.innerHTML = categories.map((category) => `
    <button class="category-chip" type="button" style="--chip-rgb:${category.rgb}" data-category="${category.id}">
      <span class="category-chip__icon"><span class="icon" data-icon="${category.icon}"></span></span>
      <span>
        <strong>${escapeHtml(category.name)}</strong>
        <span>${formatCount(category.count)} 本天書原創</span>
      </span>
    </button>
  `).join("");

  hydrateIcons(list);
  list.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      document.getElementById("searchInput").value = category;
      renderRanking();
      renderAiNovels(category);
      scrollToTarget("ranking");
      showToast(`已篩選「${category}」天書原創，共 8 本。`);
    });
  });
}

function renderAiNovels(category = "") {
  const list = document.getElementById("aiNovelList");
  const books = (category ? allBooks.filter((book) => book.category === category) : getActiveRankingBooks()).slice(0, 8);
  list.innerHTML = books.map((book) => `
    <button class="ai-card" type="button" data-book-id="${book.id}">
      ${renderBookCover(book)}
      <span>
        <span class="ai-card__tag">天書原創</span>
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.summary)}</p>
        <span class="ai-card__actions">
          <span>${escapeHtml(latestChapterLabel(book))}</span>
          <span>每日 18 點更新</span>
          <span>深度連載</span>
          <span>強鉤子</span>
        </span>
      </span>
    </button>
  `).join("");

  hydrateIcons(list);
  list.querySelectorAll("[data-book-id]").forEach((button) => {
    button.addEventListener("click", () => openBook(button.dataset.bookId));
  });
}

function makeChatId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function profileForBook(book) {
  return authorVoiceProfiles[book?.title] || {
    author: book?.author || "天書作者",
    initial: (book?.author || "書").slice(0, 1),
    accent: "#ffd37b",
    texture: "原創長篇",
    focus: "人物、場景與下一個疑問",
    seed: "先守住人物，再談下一步。",
    readerReplies: {
      complaint: "這個問題我會收下，下一步先讓場景和人物壓力變得更清楚。",
      suggestion: "這個建議可以先放進下一個場景，不急著把答案講滿。",
      question: "這個疑問值得留下，也值得在後面用場景回答。",
      general: "我看到了，會把它先放回作品自己的節奏裡。"
    }
  };
}

function profileByAuthor(author) {
  return Object.values(authorVoiceProfiles).find((profile) => profile.author === author)
    || (author === editorProfile.author ? editorProfile : null);
}

function loadAuthorChatStore() {
  const stored = safeReadJson(authorChatStorageKey, null);
  if (!stored || typeof stored !== "object") {
    return { version: 1, threads: {}, feedback: [] };
  }

  return {
    version: 1,
    threads: stored.threads && typeof stored.threads === "object" ? stored.threads : {},
    feedback: Array.isArray(stored.feedback) ? stored.feedback : []
  };
}

function saveAuthorChatStore() {
  safeWriteJson(authorChatStorageKey, authorChatStore);
}

function createChatMessage({ role = "author", speaker, text, bookId = "", bookTitle = "" }) {
  return {
    id: makeChatId(role),
    role,
    speaker,
    text,
    bookId,
    bookTitle,
    createdAt: new Date().toISOString()
  };
}

function buildSeedMessages(book) {
  const profile = profileForBook(book);
  return [
    {
      id: `${book.id}-primary-seed`,
      role: "author",
      speaker: profile.author,
      text: profile.seed,
      bookId: book.id,
      bookTitle: book.title,
      createdAt: new Date().toISOString()
    }
  ];
}

function ensureAuthorThread(book) {
  if (!book) return null;
  if (!authorChatStore.threads[book.id]) {
    authorChatStore.threads[book.id] = {
      id: book.id,
      title: book.title,
      author: book.author,
      messages: buildSeedMessages(book),
      updatedAt: new Date().toISOString()
    };
  }

  const thread = authorChatStore.threads[book.id];
  if (!Array.isArray(thread.messages)) thread.messages = buildSeedMessages(book);
  pruneAuthorThread(book);
  return thread;
}

function ensureAuthorChatThreads() {
  const books = getActiveRankingBooks();
  books.forEach((book) => ensureAuthorThread(book));
  if (!activeAuthorChatBookId && books[0]) activeAuthorChatBookId = books[0].id;
  saveAuthorChatStore();
}

function classifyFeedback(text) {
  const value = String(text || "");
  if (!value.trim()) return null;

  if (/太慢|拖|無聊|看不下|混亂|重複|很平|偏平|弱|失望|尷尬|不自然|AI味|看不懂|不懂/.test(value)) {
    return { type: "complaint", label: "抱怨" };
  }
  if (/希望|建議|想看|可不可以|可以讓|多一點|少一點|加強|改|不要|應該|最好/.test(value)) {
    return { type: "suggestion", label: "建議" };
  }
  if (/為什麼|怎麼|誰是|是不是|哪裡|何時|什麼|[？?]/.test(value)) {
    return { type: "question", label: "疑問" };
  }

  return null;
}

function feedbackActionForType(type, book) {
  const profile = profileForBook(book);
  if (type === "complaint") return `回到《${book.title}》的下一次場景檢查：${profile.focus}是否夠清楚。`;
  if (type === "suggestion") return `先放入《${book.title}》的待評估方向，不直接改 canon。`;
  return `用場景或物證補清楚，不用作者口吻硬解釋。`;
}

function captureFeedbackFromMessage(book, message, source = "active") {
  if (!book || message.role !== "reader") return;
  const classification = classifyFeedback(message.text);
  if (!classification) return;

  const excerpt = String(message.text).trim().slice(0, 140);
  const duplicate = authorChatStore.feedback.some((item) => {
    return item.bookId === book.id && item.excerpt === excerpt && item.type === classification.type;
  });
  if (duplicate) return;

  authorChatStore.feedback.push({
    id: makeChatId("feedback"),
    bookId: book.id,
    bookTitle: book.title,
    author: book.author,
    type: classification.type,
    label: classification.label,
    status: source === "trimmed" ? "已萃取" : "待消化",
    source,
    sourceMessageId: message.id,
    excerpt,
    action: feedbackActionForType(classification.type, book),
    createdAt: new Date().toISOString()
  });
}

function pruneAuthorThread(book) {
  const thread = authorChatStore.threads[book.id];
  if (!thread || !Array.isArray(thread.messages)) return;
  const overflow = thread.messages.length - maxAuthorChatMessages;
  if (overflow <= 0) return;

  const removed = thread.messages.splice(0, overflow);
  removed.forEach((message) => captureFeedbackFromMessage(book, message, "trimmed"));
}

function appendAuthorChatMessages(book, messages) {
  const thread = ensureAuthorThread(book);
  if (!thread) return;

  messages.forEach((message) => {
    thread.messages.push(message);
    captureFeedbackFromMessage(book, message, "active");
  });
  pruneAuthorThread(book);
  thread.updatedAt = new Date().toISOString();
  saveAuthorChatStore();
}

function getFeedbackForBook(book) {
  return authorChatStore.feedback
    .filter((item) => item.bookId === book.id)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function normalizedReaderText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[，。！？、,.!?；;：:\s「」『』《》〈〉（）()]/g, "");
}

function readerTextSimilarity(left, right) {
  const a = Array.from(new Set(normalizedReaderText(left)));
  const b = Array.from(new Set(normalizedReaderText(right)));
  if (!a.length || !b.length) return 0;
  const bSet = new Set(b);
  const overlap = a.filter((char) => bSet.has(char)).length;
  return overlap / Math.max(a.length, b.length);
}

function findSimilarRecentReaderQuestion(thread, readerText, currentMessageId = "") {
  if (!thread || !Array.isArray(thread.messages)) return null;
  const recentReaders = thread.messages
    .filter((message) => message.role === "reader" && message.id !== currentMessageId)
    .slice(-5)
    .reverse();

  return recentReaders.find((message) => readerTextSimilarity(message.text, readerText) >= 0.58) || null;
}

function bookContextForAgent(book) {
  const latestChapter = book.chapters?.at(-1);
  return {
    id: book.id,
    title: book.title,
    author: profileForBook(book).author,
    category: book.category,
    tags: book.tags || [],
    premise: book.premise,
    summary: buildSummary(book),
    latestChapter: latestChapter ? {
      number: latestChapter.number,
      title: latestChapter.title || latestChapter.displayTitle,
      displayTitle: latestChapter.displayTitle
    } : null
  };
}

function recentMessagesForAgent(thread) {
  return (thread?.messages || []).slice(-10).map((message) => ({
    role: message.role,
    speaker: message.speaker,
    text: message.text,
    createdAt: message.createdAt
  }));
}

function sanitizeAgentReply(text) {
  return String(text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 900);
}

async function requestAuthorAgentReply(book, readerText, thread) {
  if (!authorAgentEndpoint) return "";

  const profile = profileForBook(book);
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), authorAgentRequestTimeoutMs);

  try {
    const response = await fetch(authorAgentEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.5",
        agentId: `author-${book.id}`,
        routePolicy: "primary_author_only",
        readerMessage: readerText,
        book: bookContextForAgent(book),
        authorProfile: {
          name: profile.author,
          texture: profile.texture,
          focus: profile.focus
        },
        recentMessages: recentMessagesForAgent(thread),
        instructions: [
          "使用繁體中文回覆。",
          "以該書原作者口吻回答，不要讓其他書的作者代答。",
          "回答讀者問的具體問題，避免模板句、空話、過度中二或劇透。",
          "若問題和前一題接近，補充新角度，不要重複同一句。",
          "回覆長度控制在 2 到 5 句。"
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`Author agent endpoint returned ${response.status}`);
    const data = await response.json();
    return sanitizeAgentReply(data.reply || data.text || data.message?.content || data.choices?.[0]?.message?.content || "");
  } catch (error) {
    console.warn("Author agent endpoint unavailable; using local fallback.", error);
    return "";
  } finally {
    window.clearTimeout(timer);
  }
}

function buildLowStatusReply(book, readerText, previousSimilar) {
  const text = String(readerText || "");
  const profile = profileForBook(book);
  const firstChapterScope = /第一章|開頭|一開始|剛開始/.test(text);

  if (book.title === "星骸王座") {
    if (previousSimilar) {
      return "你這題和上一個問題很接近，我補充另一個角度：沈曜不是被設計成一直卑微，而是第一段先讓你看到他沒有資源、沒有靠山時會怎麼活。這種低姿態是生存策略，不是性格終點；後面好看的地方，會是他怎麼一步步把這個位置翻回來。";
    }
    if (firstChapterScope) {
      return "第一章讓沈曜看起來微弱，是為了先把他的起點壓清楚：他在北街沒有話語權，也沒有能直接保護自己的籌碼。這樣後面他每做一個小選擇，讀者才會知道那不是裝酷，而是在很差的位置裡慢慢找回主動權。";
    }
    return "他現在看起來卑微，主要是因為故事前段要先呈現他的處境，而不是一開始就讓他開無雙。這本書的主軸不是永遠忍讓，而是看他怎麼從被壓低的位置裡，逐步建立自己的判斷、代價和反擊方式。";
  }

  if (previousSimilar) {
    return `這題和前一題接近，我補充說明：我不希望角色的低姿態變成單純受氣，而是要讓讀者看見他在「${profile.focus}」裡暫時沒有好選項。後續如果沒有給出變化，那就會是需要調整的地方。`;
  }

  return `這種低姿態不是要把角色寫得沒用，而是先交代他在「${profile.focus}」裡受限的位置。只要後續能看到選擇、反擊或代價，它就不是單純憋屈；如果一直停在同一種狀態，我會把它視為節奏問題。`;
}

function buildOpenQuestionReply(book, readerText, previousSimilar) {
  const profile = profileForBook(book);
  const quoted = String(readerText || "").trim().slice(0, 34);
  if (previousSimilar) {
    return `你這題和前面那個問題相近，我換個角度補充：目前《${book.title}》會先保留一些答案，但不應該讓讀者覺得作者在敷衍。針對「${quoted}」，我會用後續場景把原因講清楚，而不是一直用同一句話帶過。`;
  }
  return `針對「${quoted}」，我可以先用不爆雷的方式說：這個安排和${profile.focus}有關。它不是隨便放的，但後面的關鍵轉折我不會直接說破；如果你指出具體章節或角色動作，我可以再回答得更細。`;
}

function buildPrimaryAuthorReply(book, readerText, thread = null, currentMessageId = "") {
  const profile = profileForBook(book);
  const text = String(readerText || "");
  const previousSimilar = findSimilarRecentReaderQuestion(thread, text, currentMessageId);

  if (/卑微|窩囊|憋屈|弱|太弱|被壓|受氣|沒用/.test(text)) {
    return buildLowStatusReply(book, text, previousSimilar);
  }

  if (/介紹|內容|講什麼|大概|看點|推薦|適合|這本/.test(text)) {
    const prefix = previousSimilar ? "這題和前面有點接近，我補充得更具體一點。" : "可以。";
    return `${prefix}《${book.title}》是${buildSummary(book)} 如果你想先試讀，我會建議從第一章開始，看主角遇到的第一個麻煩、世界規則和角色壓力是不是合你的口味。`;
  }

  if (/更新|幾點|多久|什麼時候|何時|連載/.test(text)) {
    const latest = book.chapters?.at(-1)?.displayTitle || "最新章節";
    return `目前這批作品以每日 18 點更新為主。《${book.title}》目前最新進度是「${latest}」。如果臨時有調整，首頁會優先同步。`;
  }

  if (/為什麼|怎麼|誰是|是不是|哪裡|何時|什麼|[？?]/.test(text)) {
    return buildOpenQuestionReply(book, text, previousSimilar);
  }

  const classification = classifyFeedback(readerText);
  const type = classification?.type || "general";
  return profile.readerReplies[type] || profile.readerReplies.general;
}

function generateReaderTriggeredMessages(book, readerText) {
  return [
    createChatMessage({
      role: "reader",
      speaker: "讀者",
      text: readerText,
      bookId: book.id,
      bookTitle: book.title
    })
  ];
}

function authorReplyDelayMs(readerText) {
  const length = Array.from(String(readerText || "")).length;
  return Math.min(5200, Math.max(1800, 1400 + length * 45));
}

function clearAuthorReplyTimer(bookId) {
  const timer = authorChatReplyTimers.get(bookId);
  if (timer) window.clearTimeout(timer);
  authorChatReplyTimers.delete(bookId);
}

async function finishAuthorReply(bookId, readerText, readerMessageId) {
  const book = allBooks.find((item) => item.id === bookId);
  if (!book) return;

  const thread = ensureAuthorThread(book);
  const profile = profileForBook(book);
  let replyText = await requestAuthorAgentReply(book, readerText, thread);
  if (!replyText) replyText = buildPrimaryAuthorReply(book, readerText, thread, readerMessageId);

  appendAuthorChatMessages(book, [
    createChatMessage({
      role: "author",
      speaker: profile.author,
      text: replyText,
      bookId: book.id,
      bookTitle: book.title
    })
  ]);

  authorChatPendingReplies.delete(bookId);
  authorChatReplyTimers.delete(bookId);
  if (activeAuthorChatBookId === bookId) renderAuthorChat({ scrollEnd: true });
}

function scheduleAuthorReply(book, readerText, readerMessageId) {
  const profile = profileForBook(book);
  clearAuthorReplyTimer(book.id);
  authorChatPendingReplies.set(book.id, {
    speaker: profile.author,
    startedAt: new Date().toISOString()
  });

  const timer = window.setTimeout(() => {
    finishAuthorReply(book.id, readerText, readerMessageId);
  }, authorReplyDelayMs(readerText));
  authorChatReplyTimers.set(book.id, timer);
}

function formatAuthorMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function renderAuthorThreadButton(book) {
  const profile = profileForBook(book);
  const thread = ensureAuthorThread(book);
  const isActive = book.id === activeAuthorChatBookId;

  return `
    <button class="author-thread-card ${isActive ? "is-active" : ""}" type="button" data-author-thread="${book.id}" style="--thread-accent:${profile.accent};${coverStyle(book)}">
      <span class="author-thread-card__cover ${book.coverImage ? "book-card__cover--image" : ""}">
        ${renderCoverContent(book)}
      </span>
      <span class="author-thread-card__body">
        <strong>${escapeHtml(book.title)}</strong>
        <small>${escapeHtml(profile.author)} · ${thread.messages.length} 則訊息</small>
        <em>${escapeHtml(profile.texture)}</em>
      </span>
    </button>
  `;
}

function renderAuthorMessage(message) {
  const profile = message.role === "reader"
    ? { author: "讀者", initial: "讀", accent: "#f0aa3a" }
    : profileByAuthor(message.speaker) || { author: message.speaker, initial: String(message.speaker).slice(0, 1), accent: "#ffd37b" };

  return `
    <article class="author-message author-message--${escapeHtml(message.role)}" style="--message-accent:${profile.accent}">
      <span class="author-message__avatar" aria-hidden="true">${escapeHtml(profile.initial)}</span>
      <div class="author-message__bubble">
        <header>
          <strong>${escapeHtml(message.speaker)}</strong>
          <span>${escapeHtml(formatAuthorMessageTime(message.createdAt))}</span>
        </header>
        <p>${escapeHtml(message.text)}</p>
      </div>
    </article>
  `;
}

function renderAuthorTyping(book) {
  const pending = authorChatPendingReplies.get(book.id);
  if (!pending) return "";

  const profile = profileForBook(book);
  return `
    <article class="author-message author-message--typing" style="--message-accent:${profile.accent}" aria-live="polite">
      <span class="author-message__avatar" aria-hidden="true">${escapeHtml(profile.initial)}</span>
      <div class="author-message__bubble">
        <header>
          <strong>${escapeHtml(profile.author)}</strong>
          <span>正在回覆</span>
        </header>
        <p>
          <span class="author-typing-line">
            正在讀取你的問題與作品脈絡
            <span class="author-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          </span>
        </p>
      </div>
    </article>
  `;
}

function scrollAuthorChatToEnd() {
  window.requestAnimationFrame(() => {
    const log = document.querySelector("[data-author-chat-log]");
    if (log) log.scrollTop = log.scrollHeight;
  });
}

function renderAuthorChat({ scrollEnd = false } = {}) {
  const root = document.getElementById("authorChatWorkbench");
  if (!root) return;

  const books = getActiveRankingBooks();
  if (!books.length) {
    root.innerHTML = `<p class="load-error">作者聊天室正在等待作品資料。</p>`;
    return;
  }

  if (!books.some((book) => book.id === activeAuthorChatBookId)) {
    activeAuthorChatBookId = books[0].id;
  }

  const activeBook = books.find((book) => book.id === activeAuthorChatBookId) || books[0];
  const activeProfile = profileForBook(activeBook);
  const thread = ensureAuthorThread(activeBook);
  const isResponding = authorChatPendingReplies.has(activeBook.id);

  root.innerHTML = `
    <div class="author-chat-layout">
      <aside class="author-thread-list" aria-label="小說聊天串">
        ${books.map((book) => renderAuthorThreadButton(book)).join("")}
      </aside>

      <section class="author-chat-board" aria-label="${escapeHtml(activeBook.title)} 作者聊天室">
        <header class="author-chat-board__header" style="--thread-accent:${activeProfile.accent}">
          <div>
            <span>${escapeHtml(activeProfile.texture)}</span>
            <h3>${escapeHtml(activeBook.title)}</h3>
            <p>${escapeHtml(activeProfile.author)} · ${escapeHtml(activeProfile.focus)}</p>
          </div>
        </header>

        <div class="author-chat-log" data-author-chat-log>
          ${thread.messages.map((message) => renderAuthorMessage(message)).join("")}
          ${renderAuthorTyping(activeBook)}
        </div>

        <form class="author-chat-composer" data-author-chat-form>
          <textarea name="message" rows="2" maxlength="280" placeholder="給 ${escapeHtml(activeProfile.author)} 留言，或提出節奏、角色、劇情疑問" ${isResponding ? "disabled" : ""}></textarea>
          <button type="submit" ${isResponding ? "disabled" : ""}>
            <span class="icon" data-icon="send"></span>
            ${isResponding ? "思考中" : "送出"}
          </button>
        </form>
      </section>

    </div>
  `;

  hydrateIcons(root);

  root.querySelectorAll("[data-author-thread]").forEach((button) => {
    button.addEventListener("click", () => {
      activeAuthorChatBookId = button.dataset.authorThread;
      renderAuthorChat({ scrollEnd: true });
    });
  });

  root.querySelector("[data-author-chat-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (authorChatPendingReplies.has(activeBook.id)) {
      showToast(`${activeProfile.author}正在回覆中，稍等一下。`);
      return;
    }

    const textarea = event.currentTarget.elements.message;
    const message = textarea.value.trim();
    if (!message) {
      showToast("請先輸入留言。");
      return;
    }

    const readerMessages = generateReaderTriggeredMessages(activeBook, message);
    appendAuthorChatMessages(activeBook, readerMessages);
    textarea.value = "";
    scheduleAuthorReply(activeBook, message, readerMessages[0]?.id || "");
    renderAuthorChat({ scrollEnd: true });
  });

  if (scrollEnd) scrollAuthorChatToEnd();
}

function openBook(bookId) {
  const book = allBooks.find((item) => item.id === bookId) || allBooks[0];
  if (!book) {
    showToast("天書小說資料尚未載入完成。");
    return;
  }

  currentModalBook = book;
  platformApp?.trackEngagement(book.id);
  const saved = getReadingProgress(book.id);
  const lastIndex = Math.max(book.chapters.length - 1, 0);
  currentChapterIndex = Number.isInteger(saved?.chapterIndex) ? Math.min(Math.max(saved.chapterIndex, 0), lastIndex) : 0;
  pendingReaderRestore = saved?.chapterIndex === currentChapterIndex ? saved.readerRatio || 0 : null;
  currentReaderFocused = false;
  renderModal();

  const modal = document.getElementById("bookModal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function setModalChapterIndex(index, shouldScroll = true) {
  if (!currentModalBook) return;
  const lastIndex = Math.max(currentModalBook.chapters.length - 1, 0);
  currentChapterIndex = Math.min(Math.max(index, 0), lastIndex);
  pendingReaderRestore = null;
  currentReaderFocused = true;
  saveReadingProgress(currentModalBook.id, {
    chapterIndex: currentChapterIndex,
    readerRatio: 0
  });
  renderModal();

  if (shouldScroll) {
    window.requestAnimationFrame(() => {
      document.querySelector(".reader-pane")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function renderLoadingBlock(message = "章節文字載入中") {
  return `
    <div class="reader-loading" role="status" aria-live="polite">
      <span class="reader-loading__topline">
        <span class="loading-spinner" aria-hidden="true"></span>
        <span>${escapeHtml(message)}</span>
      </span>
      <span class="reader-loading__hint">章節標題與導覽已可操作，正文載入完成後會直接接上。</span>
      <span class="reader-skeleton" aria-hidden="true">
        <i></i><i></i><i></i><i></i>
      </span>
    </div>
  `;
}

function renderChapterText(chapter) {
  if (!chapter) return renderLoadingBlock("章節資料準備中");
  if (chapter.contentState === "loaded") return escapeHtml(chapter.content);
  if (chapter.contentState === "error") {
    return `
      <div class="reader-error">
        <strong>章節暫時讀取失敗</strong>
        <span>請稍後重試，或切換到其他章節。</span>
      </div>
    `;
  }
  return renderLoadingBlock(`正在載入 ${chapter.displayTitle}`);
}

function updateReaderPane(book, index) {
  if (!currentModalBook || currentModalBook.id !== book.id || currentChapterIndex !== index) return;
  const chapter = book.chapters[index];
  const readerText = document.querySelector("[data-reader-text]");
  if (readerText) readerText.innerHTML = renderChapterText(chapter);
  updateReaderProgress();
}

async function ensureChapterContent(book, index, { silent = false } = {}) {
  const chapter = book.chapters[index];
  if (!chapter || chapter.contentState === "loaded") return chapter?.content || "";
  if (chapter.contentPromise) return chapter.contentPromise;

  chapter.contentState = "loading";
  if (!silent) updateReaderPane(book, index);
  chapter.contentPromise = fetchTextFile(chapter.path, chapter.generatedAt || `${chapter.number || "0"}-${currentManifestSignature}`)
    .then((content) => {
      chapter.content = content.trim();
      chapter.contentState = "loaded";
      return chapter.content;
    })
    .catch((error) => {
      console.warn("Chapter load failed.", error);
      chapter.contentState = "error";
      return "";
    })
    .finally(() => {
      chapter.contentPromise = null;
      if (!silent) updateReaderPane(book, index);
    });

  return chapter.contentPromise;
}

function warmNearbyChapters(book, index) {
  [index + 1, index + 2, index - 1].forEach((nextIndex) => {
    if (book.chapters[nextIndex]?.contentState === "idle") {
      void ensureChapterContent(book, nextIndex, { silent: true });
    }
  });
}

function renderReaderSettings() {
  const options = {
    font: [
      ["serif", "明體"],
      ["kai", "楷書"],
      ["sans", "黑體"]
    ],
    size: [
      ["small", "小字"],
      ["medium", "中字"],
      ["large", "大字"]
    ],
    line: [
      ["compact", "緊湊"],
      ["relaxed", "舒適"],
      ["wide", "寬行"]
    ],
    width: [
      ["standard", "標準"],
      ["narrow", "窄版"],
      ["wide", "寬版"]
    ]
  };

  const control = (key, label) => `
    <label>
      <span>${label}</span>
      <select data-reader-setting="${key}">
        ${options[key].map(([value, text]) => `
          <option value="${value}" ${readerSettings[key] === value ? "selected" : ""}>${text}</option>
        `).join("")}
      </select>
    </label>
  `;

  return `
    <div class="reader-toolbar">
      <div class="reader-settings" aria-label="閱讀設定">
        ${control("font", "字體")}
        ${control("size", "字級")}
        ${control("line", "行距")}
        ${control("width", "版寬")}
      </div>
    </div>
  `;
}

function renderReaderProgress() {
  return `
    <div class="reader-progress" aria-label="本章閱讀進度" title="本章進度 0%">
      <span>進度</span>
      <strong data-reader-progress-label>0%</strong>
      <i><b data-reader-progress-bar></b></i>
    </div>
  `;
}

function readerPaneClass() {
  return [
    "reader-pane",
    `reader-pane--font-${readerSettings.font}`,
    `reader-pane--size-${readerSettings.size}`,
    `reader-pane--line-${readerSettings.line}`,
    `reader-pane--width-${readerSettings.width}`
  ].join(" ");
}

function calculateReaderRatio() {
  const layout = document.querySelector(".modal-layout");
  const reader = document.querySelector("[data-reader-text]");
  if (!layout || !reader) return 0;

  const readerTop = reader.getBoundingClientRect().top - layout.getBoundingClientRect().top + layout.scrollTop;
  const start = Math.max(readerTop - 72, 0);
  const end = Math.max(readerTop + reader.scrollHeight - layout.clientHeight + 96, start + 1);
  return Math.min(Math.max((layout.scrollTop - start) / (end - start), 0), 1);
}

function updateReaderProgress() {
  const ratio = calculateReaderRatio();
  const percent = Math.round(ratio * 100);
  const bars = document.querySelectorAll("[data-reader-progress-bar]");
  const label = document.querySelector("[data-reader-progress-label]");
  bars.forEach((bar) => {
    bar.style.width = `${percent}%`;
    bar.style.height = `${percent}%`;
  });
  if (label) label.textContent = `${percent}%`;
  document.querySelectorAll(".reader-progress").forEach((progress) => {
    progress.setAttribute("title", `本章進度 ${percent}%`);
  });
  if (percent >= 90 && currentModalBook) {
    const chapter = currentModalBook.chapters[currentChapterIndex];
    platformApp?.trackCompletion(currentModalBook.id, chapter?.number || currentChapterIndex + 1);
  }
}

function queueReadingProgressSave() {
  window.clearTimeout(readerProgressSaveTimer);
  readerProgressSaveTimer = window.setTimeout(() => {
    if (!currentModalBook) return;
    saveReadingProgress(currentModalBook.id, {
      chapterIndex: currentChapterIndex,
      readerRatio: calculateReaderRatio()
    });
    renderRanking();
  }, 180);
}

function restoreReaderPositionIfNeeded() {
  if (pendingReaderRestore === null) {
    updateReaderProgress();
    return;
  }

  const ratio = Number(pendingReaderRestore) || 0;
  pendingReaderRestore = null;
  window.requestAnimationFrame(() => {
    const layout = document.querySelector(".modal-layout");
    const reader = document.querySelector("[data-reader-text]");
    if (!layout || !reader || ratio <= 0) {
      updateReaderProgress();
      return;
    }

    const readerTop = reader.getBoundingClientRect().top - layout.getBoundingClientRect().top + layout.scrollTop;
    const start = Math.max(readerTop - 72, 0);
    const end = Math.max(readerTop + reader.scrollHeight - layout.clientHeight + 96, start);
    layout.scrollTop = start + (end - start) * Math.min(Math.max(ratio, 0), 1);
    updateReaderProgress();
  });
}

function renderModal() {
  if (!currentModalBook) return;
  const book = currentModalBook;
  const activeChapter = book.chapters[currentChapterIndex] || book.chapters[0];
  const displayedChapters = [...book.chapters].sort((a, b) => Number(b.number || 0) - Number(a.number || 0));
  const content = document.getElementById("modalContent");
  const saved = getReadingProgress(book.id);
  const primaryReadLabel = saved?.chapterIndex > 0 ? `繼續 ${book.chapters[saved.chapterIndex]?.displayTitle || "閱讀"}` : "開始閱讀";

  content.innerHTML = `
    <div class="modal-layout ${currentReaderFocused ? "modal-layout--reading" : ""}">
      <section class="modal-hero">
        <div class="modal-aside">
          <span class="modal-cover ${book.coverImage ? "modal-cover--image" : ""}" style="${coverStyle(book)}">
            ${renderCoverContent(book)}
          </span>
        </div>
        <div class="modal-meta">
          <h2 id="modalTitle">${escapeHtml(book.title)}</h2>
          <div class="modal-meta__line">
            <span>${escapeHtml(book.author)}</span>
            <span>${escapeHtml(book.category)}</span>
            <span>${escapeHtml(book.status)}</span>
            <span>${escapeHtml(latestChapterLabel(book))}</span>
          </div>
          <div class="modal-tags">
            ${book.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
          <p class="modal-summary">${escapeHtml(book.summary)}</p>
          <section class="modal-author" aria-label="作者">
            <span class="modal-author__label">作者</span>
            <strong>${escapeHtml(book.author)}</strong>
            <p>${escapeHtml(book.authorIntro || "他把故事交給場景、人物和下一個不肯消失的疑問；每一次更新，都像替這個世界再點亮一盞燈。")}</p>
          </section>
          <div class="modal-actions">
            <button class="primary-action" type="button" id="readFirstChapter">
              <span class="icon" data-icon="reader"></span>
              ${escapeHtml(primaryReadLabel)}
            </button>
            <button class="secondary-action" type="button" id="downloadBook">
              <span class="icon" data-icon="download"></span>
              下載整本小說
            </button>
            <button class="secondary-action" type="button" id="openBookComments">
              <span class="icon" data-icon="message"></span>
              作品留言區
            </button>
          </div>
        </div>
      </section>
      <section class="modal-sections">
        <aside class="chapter-drawer" aria-label="章節列表">
          <button class="chapter-drawer__rail" type="button" data-toggle-chapter-list aria-expanded="false">
            <span class="chapter-drawer__arrow">›</span>
            <span class="chapter-drawer__rail-text">章節</span>
            <small>${escapeHtml(activeChapter.displayTitle)}</small>
          </button>
          <div class="chapter-drawer__panel">
            <div class="chapter-drawer__header">
              <div>
                <span>章節列表</span>
                <strong>${escapeHtml(activeChapter.displayTitle)}</strong>
              </div>
              <button type="button" data-toggle-chapter-list aria-label="收起章節列表">‹</button>
            </div>
            <div class="chapter-drawer__scroll">
              ${displayedChapters.map((chapter) => {
                const index = book.chapters.indexOf(chapter);
                return `
                <button class="${index === currentChapterIndex ? "is-active" : ""}" type="button" data-chapter-index="${index}">
                  ${escapeHtml(chapter.displayTitle)}
                </button>
              `;
              }).join("")}
            </div>
          </div>
        </aside>
        <div class="${readerPaneClass()}">
          <div class="reader-focus-bar">
            <div>
              <span>${escapeHtml(book.title)}</span>
              <strong>${escapeHtml(activeChapter.displayTitle)}</strong>
            </div>
            <button class="reader-focus-bar__info" type="button" data-reader-info>作品資訊</button>
          </div>
          ${renderReaderProgress()}
          ${renderReaderSettings()}
          <h3>${escapeHtml(activeChapter.displayTitle)}</h3>
          <div class="reader-text" data-reader-text>${renderChapterText(activeChapter)}</div>
          ${renderChapterNav(book, "bottom")}
          <nav class="mobile-reader-dock" aria-label="手機閱讀工具列">
            <button type="button" data-toggle-chapter-list>目錄</button>
            <button type="button" data-chapter-nav="previous" ${currentChapterIndex === 0 ? "disabled" : ""}>上一章</button>
            <button type="button" data-chapter-nav="next" ${currentChapterIndex >= book.chapters.length - 1 ? "disabled" : ""}>下一章</button>
            <button type="button" data-reader-settings-jump>設定</button>
          </nav>
        </div>
      </section>
    </div>
  `;

  hydrateIcons(content);

  document.getElementById("readFirstChapter").addEventListener("click", () => {
    setModalChapterIndex(currentChapterIndex);
  });

  document.getElementById("downloadBook").addEventListener("click", () => {
    void downloadBook(book);
  });

  document.getElementById("openBookComments").addEventListener("click", () => {
    closeModal();
    void platformApp?.openBookComments(book);
  });

  content.querySelector("[data-reader-info]")?.addEventListener("click", () => {
    currentReaderFocused = false;
    renderModal();
  });

  content.querySelectorAll("[data-chapter-index]").forEach((button) => {
    button.addEventListener("click", () => {
      setModalChapterIndex(Number(button.dataset.chapterIndex));
    });
  });

  const drawer = content.querySelector(".chapter-drawer");
  const modalSections = content.querySelector(".modal-sections");
  const setChapterDrawerOpen = (isOpen) => {
    modalSections.classList.toggle("is-chapter-open", isOpen);
    drawer.classList.toggle("is-open", isOpen);
    content.querySelectorAll("[data-toggle-chapter-list]").forEach((button) => {
      button.setAttribute("aria-expanded", String(isOpen));
    });
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      drawer.querySelector("[data-chapter-index].is-active")?.scrollIntoView({
        block: "center",
        inline: "nearest"
      });
    });
  };

  content.querySelectorAll("[data-toggle-chapter-list]").forEach((button) => {
    button.addEventListener("click", () => {
      setChapterDrawerOpen(!drawer.classList.contains("is-open"));
    });
  });

  content.querySelectorAll("[data-reader-setting]").forEach((control) => {
    control.addEventListener("change", () => {
      readerSettings = {
        ...readerSettings,
        [control.dataset.readerSetting]: control.value
      };
      saveReaderSettings();
      document.querySelector(".reader-pane").className = readerPaneClass();
      updateReaderProgress();
    });
  });

  content.querySelectorAll("[data-chapter-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.chapterNav;
      if (direction === "previous") setModalChapterIndex(currentChapterIndex - 1);
      if (direction === "next") setModalChapterIndex(currentChapterIndex + 1);
    });
  });

  content.querySelector("[data-reader-settings-jump]")?.addEventListener("click", () => {
    const toolbar = content.querySelector(".reader-toolbar");
    toolbar?.classList.toggle("is-mobile-open");
    toolbar?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  content.querySelector(".modal-layout").addEventListener("scroll", () => {
    updateReaderProgress();
    queueReadingProgressSave();
  }, { passive: true });

  void ensureChapterContent(book, currentChapterIndex).then(() => {
    restoreReaderPositionIfNeeded();
    warmNearbyChapters(book, currentChapterIndex);
  });
  window.requestAnimationFrame(() => {
    updateReaderProgress();
  });
}

function closeModal() {
  if (currentModalBook) {
    saveReadingProgress(currentModalBook.id, {
      chapterIndex: currentChapterIndex,
      readerRatio: calculateReaderRatio()
    });
    renderRanking();
  }
  const modal = document.getElementById("bookModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  currentModalBook = null;
  currentReaderFocused = false;
}

async function downloadBook(book) {
  showToast(`正在整理《${book.title}》章節文字。`);
  await Promise.all(book.chapters.map((chapter, index) => ensureChapterContent(book, index, { silent: true })));
  const chapterText = book.chapters.map((chapter) => {
    const content = chapter.contentState === "loaded" ? chapter.content : "（此章節暫時讀取失敗）";
    return `\n\n${chapter.displayTitle}\n${"=".repeat(24)}\n${content}`;
  }).join("");
  const text = `天書小說原創文本\n書名：${book.title}\n作者：${book.author}\n作者介紹：${book.authorIntro || ""}\n分類：${book.category}\n更新：${book.status}\n內容狀態：${book.contentStatus}\n\n${book.summary}${chapterText}\n`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${book.title}-天書原創章節.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast(`已下載《${book.title}》天書原創章節。`);
}

function scrollToTarget(target) {
  if (target === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }

  const el = document.getElementById(target);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  return false;
}

function pageViewForTarget(target) {
  if (["aiCouncil", "topics", "bookComments"].includes(target)) return target;
  if (target === "legacy") return "legacy";
  if (["home", "ranking", "ai", "youtube", "categories"].includes(target)) return "home";
  return "";
}

function setPageView(view) {
  if (!view) return;
  document.querySelectorAll("[data-page-view]").forEach((section) => {
    section.hidden = section.dataset.pageView !== view;
  });
  platformApp?.renderView(view);
}

function activeNavTarget(target) {
  if (["youtube", "categories"].includes(target)) return "home";
  return target;
}

function navigateTo(target) {
  const view = pageViewForTarget(target);
  if (view) setPageView(view);
  setActiveNav(target);
  const moved = scrollToTarget(target);
  if (!moved && view && view !== "home") window.scrollTo({ top: 0, behavior: "smooth" });
  if (!moved && !view) showToast("此功能仍在規劃中。");
}

function setActiveNav(target) {
  const activeTarget = activeNavTarget(target);
  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.navTarget === activeTarget);
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function consumeAutoRefreshFlag() {
  const message = sessionStorage.getItem(chapterAutoRefreshFlag);
  if (!message) return;
  sessionStorage.removeItem(chapterAutoRefreshFlag);
  showToast(message);
}

function isOverlayOpen() {
  return Boolean(
    document.getElementById("bookModal").classList.contains("is-open") ||
    document.getElementById("shareSheet").classList.contains("is-open") ||
    document.getElementById("installGuide").classList.contains("is-open")
  );
}

function releaseOverlayScroll() {
  if (!isOverlayOpen()) {
    document.body.style.overflow = "";
  }
}

function openShareSheet() {
  const sheet = document.getElementById("shareSheet");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeShareSheet() {
  const sheet = document.getElementById("shareSheet");
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  releaseOverlayScroll();
}

function isIOSInstallPromptBrowser() {
  const userAgent = navigator.userAgent || "";
  const vendor = navigator.vendor || "";
  const isSmallTouchScreen = window.matchMedia("(max-width: 780px)").matches && navigator.maxTouchPoints > 0;
  const isClassicIOS = /iP(hone|od|ad)/i.test(userAgent);
  const isIPadOSDesktopUA = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1 && /Mobile/i.test(userAgent);
  const isIOS = isClassicIOS || isIPadOSDesktopUA;
  const isSafari = /Safari/i.test(userAgent) && /Apple Computer/i.test(vendor) && !/CriOS/i.test(userAgent);
  const isChrome = /CriOS/i.test(userAgent);
  const isUnsupportedBrowser = /FxiOS|EdgiOS|OPiOS|DuckDuckGo|Android/i.test(userAgent);
  const isStandalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  return isSmallTouchScreen && isIOS && (isSafari || isChrome) && !isUnsupportedBrowser && !isStandalone;
}

function hasDismissedInstallGuide() {
  try {
    return localStorage.getItem(installGuideStorageKey) === "dismissed";
  } catch (error) {
    return false;
  }
}

function markInstallGuideDismissed() {
  try {
    localStorage.setItem(installGuideStorageKey, "dismissed");
  } catch (error) {
    // Private browsing can block localStorage; the guide still closes for this session.
  }
}

function openInstallGuide() {
  const guide = document.getElementById("installGuide");
  if (!guide || guide.classList.contains("is-open")) return;
  guide.classList.add("is-open");
  guide.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeInstallGuide() {
  const guide = document.getElementById("installGuide");
  if (!guide) return;
  guide.classList.remove("is-open");
  guide.setAttribute("aria-hidden", "true");
  markInstallGuideDismissed();
  releaseOverlayScroll();
}

function maybeShowInstallGuide() {
  if (!isIOSInstallPromptBrowser() || hasDismissedInstallGuide()) return;
  window.setTimeout(() => {
    if (isIOSInstallPromptBrowser() && !isOverlayOpen()) {
      openInstallGuide();
    }
  }, 1200);
}

function initEvents() {
  document.getElementById("searchInput").addEventListener("input", () => {
    renderRanking();
    renderAiNovels();
  });

  document.getElementById("subscribeButton").addEventListener("click", () => {
    showToast("正在前往天書小說 YouTube 頻道。");
  });

  document.getElementById("likeButton").addEventListener("click", () => {
    showToast("正在前往天書小說 YouTube 頻道。");
  });

  document.getElementById("shareButton").addEventListener("click", openShareSheet);

  document.querySelectorAll("[data-close-share]").forEach((node) => {
    node.addEventListener("click", closeShareSheet);
  });

  document.querySelectorAll("[data-close-install-guide]").forEach((node) => {
    node.addEventListener("click", closeInstallGuide);
  });

  document.getElementById("installGuideNever").addEventListener("click", closeInstallGuide);

  document.querySelectorAll("[data-share-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.dataset.shareTarget;
      const shareUrls = buildShareUrls();

      if (target === "line" || target === "facebook") {
        window.open(shareUrls[target], "_blank", "noopener,noreferrer");
        closeShareSheet();
        showToast(`已開啟${target === "line" ? " LINE " : " Facebook "}分享。`);
        return;
      }

      try {
        await navigator.clipboard.writeText(youtubeChannelUrl);
        closeShareSheet();
        showToast("已複製天書小說 YouTube 頻道連結。");
      } catch (error) {
        showToast(`請手動複製：${youtubeChannelUrl}`);
      }
    });
  });

  document.getElementById("heroOpenButton").addEventListener("click", () => {
    if (allBooks[0]) openBook(allBooks[0].id);
    else showToast("天書小說資料尚未載入完成。");
  });

  document.querySelector(".hero").addEventListener("click", (event) => {
    if (event.target.closest("#heroOpenButton")) return;
    if (allBooks[0]) openBook(allBooks[0].id);
    else showToast("天書小說資料尚未載入完成。");
  });

  document.querySelectorAll("[data-rank-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      currentRankTab = button.dataset.rankTab;
      document.querySelectorAll("[data-rank-tab]").forEach((tab) => {
        tab.classList.toggle("is-active", tab === button);
      });
      renderRanking();
    });
  });

  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(button.dataset.navTarget);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((node) => {
    node.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.getElementById("bookModal").classList.contains("is-open")) {
      closeModal();
    }
    if (event.key === "Escape" && document.getElementById("shareSheet").classList.contains("is-open")) {
      closeShareSheet();
    }
    if (event.key === "Escape" && document.getElementById("installGuide").classList.contains("is-open")) {
      closeInstallGuide();
    }
  });

}

async function checkForLibraryUpdates() {
  if (manifestPollInFlight) return;

  manifestPollInFlight = true;
  try {
    const manifest = await fetchManifest(`poll-${Date.now()}`);
    const nextSignature = buildManifestSignature(manifest);
    if (currentManifestSignature && nextSignature && nextSignature !== currentManifestSignature) {
      sessionStorage.setItem(chapterAutoRefreshFlag, "已同步最新章節。");
      window.location.reload();
    }
  } catch (error) {
    console.warn("Manifest refresh check failed.", error);
  } finally {
    manifestPollInFlight = false;
  }
}

function initManifestPolling() {
  if (manifestPollTimer) window.clearInterval(manifestPollTimer);
  manifestPollTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void checkForLibraryUpdates();
    }
  }, manifestPollIntervalMs);

  window.addEventListener("focus", () => {
    void checkForLibraryUpdates();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void checkForLibraryUpdates();
    }
  });
}

function initHero() {
  const heroBook = getActiveRankingBooks()[0];
  if (!heroBook) return;
  const hero = document.querySelector(".hero");
  document.getElementById("heroTitle").textContent = heroBook.title;
  document.getElementById("heroDescription").textContent = heroBook.premise;
  document.getElementById("heroHeat").textContent = latestChapterLabel(heroBook);
  document.getElementById("heroTags").innerHTML = heroBook.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  if (hero) {
    const heroImage = heroBook.heroImage || heroBook.coverImage || "public/assets/hero-art.png";
    hero.style.setProperty("--hero-art", `url("${resourceUrl(heroImage)}")`);
  }
}

function showLoadError(error) {
  console.error(error);
  const detail = window.location.protocol === "file:"
    ? "目前是直接用 file:// 開啟，瀏覽器會擋掉本機 JSON/TXT fetch。"
    : `讀取失敗：${error.resourcePath || resourceManifestPath}${error.status ? `（HTTP ${error.status}）` : ""}`;
  const message = `無法讀取天書小說資料。${detail}請從專案根目錄啟動本機伺服器，並開啟 http://127.0.0.1:4173/。`;
  document.getElementById("heroDescription").textContent = message;
  document.getElementById("rankingList").innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
  document.getElementById("aiNovelList").innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
  const authorChatRoot = document.getElementById("authorChatWorkbench");
  if (authorChatRoot) authorChatRoot.innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
  showToast(message);
}

async function init() {
  hydrateIcons();
  setPageView("home");
  initEvents();
  try {
    await loadLibrary();
    authorChatStore = loadAuthorChatStore();
    ensureAuthorChatThreads();
    initHero();
    renderRanking();
    renderCategories();
    renderAiNovels();
    renderAuthorChat({ scrollEnd: true });
    document.getElementById("ai")?.after(document.getElementById("youtube"));
    platformApp = createTianshuPlatform({
      onOpenBook: openBook,
      onNavigate: navigateTo,
      showToast
    });
    await platformApp.init(allBooks);
    maybeShowInstallGuide();
    consumeAutoRefreshFlag();
    initManifestPolling();
  } catch (error) {
    showLoadError(error);
  }
}

init();
