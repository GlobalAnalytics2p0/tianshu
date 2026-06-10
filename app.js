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
const youtubeShareText = "來看天書小說：每日 00/06/12/18 原創連載、爆款小說、有聲短劇";
const activeRankingTitles = [
  "星骸王座",
  "灰塔觀測者",
  "雪刃照孤城",
  "凌晨三點的演算法",
  "大明墨工"
];
const chapterAutoRefreshFlag = "tianshu-auto-refreshed";
const installGuideStorageKey = "tianshu-ios-safari-install-guide-v1";
const manifestPollIntervalMs = 60000;

let allBooks = [];

let currentRankTab = "recommended";
let currentModalBook = null;
let currentChapterIndex = 0;
let toastTimer = null;
let currentManifestSignature = "";
let manifestPollTimer = null;
let manifestPollInFlight = false;
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
      contentState: "idle",
      audioState: chapter.audio?.path ? "idle" : "none",
      audioAvailable: false
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
  if (tab === "hot") return [...rankingBooks].sort((a, b) => parseHeat(b.heat) - parseHeat(a.heat));
  if (tab === "hook") return [...rankingBooks].sort((a, b) => b.tags.length - a.tags.length || parseHeat(b.heat) - parseHeat(a.heat));
  if (tab === "new") {
    return [...rankingBooks].sort((a, b) => {
      const latestA = a.chapters.at(-1)?.generatedAt || "";
      const latestB = b.chapters.at(-1)?.generatedAt || "";
      return latestB.localeCompare(latestA) || parseHeat(b.heat) - parseHeat(a.heat);
    });
  }
  if (tab === "longform") return [...rankingBooks].sort((a, b) => b.summary.length - a.summary.length || parseHeat(b.heat) - parseHeat(a.heat));
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
        <span class="book-card__score">${escapeHtml(book.score)}分</span>
        <span class="book-card__heat">
          <span class="icon" data-icon="flame"></span>
          ${escapeHtml(book.heat)}
        </span>
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
          <span>每日一章</span>
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

function openBook(bookId) {
  const book = allBooks.find((item) => item.id === bookId) || allBooks[0];
  if (!book) {
    showToast("天書小說資料尚未載入完成。");
    return;
  }

  currentModalBook = book;
  currentChapterIndex = 0;
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
      <span class="loading-spinner" aria-hidden="true"></span>
      <span>${escapeHtml(message)}</span>
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
  return renderLoadingBlock("正在載入章節內容");
}

function renderChapterAudio(chapter) {
  if (!chapter?.audio?.path || chapter.audioState === "missing") return "";
  if (chapter.audioState !== "available") {
    return `
      <div class="chapter-audio chapter-audio--checking" data-audio-panel>
        <span class="chapter-audio__icon"><span class="loading-spinner" aria-hidden="true"></span></span>
        <span>
          <strong>有聲書確認中</strong>
          <small>如果本章音檔已部署，播放器會自動出現。</small>
        </span>
      </div>
    `;
  }

  const audio = chapter.audio;
  return `
    <div class="chapter-audio" data-audio-panel>
      <div class="chapter-audio__header">
        <span class="chapter-audio__icon"><span class="icon" data-icon="play"></span></span>
        <span>
          <strong>播放有聲書</strong>
          <small>${escapeHtml(audio.narrator || "天書小說")} · ${escapeHtml(audio.format || "M4A")}</small>
        </span>
      </div>
      <audio controls preload="none" src="${escapeHtml(resourceUrl(audio.path, audio.generatedAt || chapter.generatedAt || currentManifestSignature))}"></audio>
    </div>
  `;
}

function updateReaderPane(book, index) {
  if (!currentModalBook || currentModalBook.id !== book.id || currentChapterIndex !== index) return;
  const chapter = book.chapters[index];
  const readerText = document.querySelector("[data-reader-text]");
  const audioSlot = document.querySelector("[data-audio-slot]");
  if (readerText) readerText.innerHTML = renderChapterText(chapter);
  if (audioSlot) {
    audioSlot.innerHTML = renderChapterAudio(chapter);
    hydrateIcons(audioSlot);
  }
}

async function ensureChapterAudioAvailability(book, index) {
  const chapter = book.chapters[index];
  if (!chapter?.audio?.path || chapter.audioState === "available" || chapter.audioState === "missing") return;
  chapter.audioState = "checking";
  updateReaderPane(book, index);
  const exists = await resourceExists(chapter.audio.path, chapter.audio.generatedAt || chapter.generatedAt || currentManifestSignature);
  chapter.audioAvailable = exists;
  chapter.audioState = exists ? "available" : "missing";
  updateReaderPane(book, index);
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
  [index + 1, index - 1].forEach((nextIndex) => {
    if (book.chapters[nextIndex]?.contentState === "idle") {
      void ensureChapterContent(book, nextIndex, { silent: true });
    }
  });
}

function renderModal() {
  if (!currentModalBook) return;
  const book = currentModalBook;
  const activeChapter = book.chapters[currentChapterIndex] || book.chapters[0];
  const displayedChapters = [...book.chapters].sort((a, b) => Number(b.number || 0) - Number(a.number || 0));
  const readerHook = book.readerHook || book.premise;
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div class="modal-layout">
      <section class="modal-hero">
        <span class="modal-cover ${book.coverImage ? "modal-cover--image" : ""}" style="${coverStyle(book)}">
          ${renderCoverContent(book)}
        </span>
        <div class="modal-meta">
          <h2 id="modalTitle">${escapeHtml(book.title)}</h2>
          <div class="modal-meta__line">
            <span>${escapeHtml(book.author)}</span>
            <span>${escapeHtml(book.category)}</span>
            <span>${escapeHtml(book.status)}</span>
            <span>${escapeHtml(book.score)}分</span>
            <span>人氣 ${escapeHtml(book.heat)}</span>
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
              開始閱讀
            </button>
            <button class="secondary-action" type="button" id="downloadBook">
              <span class="icon" data-icon="download"></span>
              下載整本小說
            </button>
          </div>
          <div class="status-note reader-hook">
            <span class="icon" data-icon="info"></span>
            <span>${escapeHtml(readerHook)}</span>
          </div>
        </div>
      </section>
      <section class="modal-sections">
        <div class="chapter-list">
          <h3>章節閱讀</h3>
          ${displayedChapters.map((chapter) => {
            const index = book.chapters.indexOf(chapter);
            return `
            <button class="${index === currentChapterIndex ? "is-active" : ""}" type="button" data-chapter-index="${index}">
              ${escapeHtml(chapter.displayTitle)}
            </button>
          `;
          }).join("")}
        </div>
        <div class="reader-pane">
          <h3>${escapeHtml(activeChapter.displayTitle)}</h3>
          <div data-audio-slot>${renderChapterAudio(activeChapter)}</div>
          ${renderChapterNav(book, "top")}
          <div class="reader-text" data-reader-text>${renderChapterText(activeChapter)}</div>
          ${renderChapterNav(book, "bottom")}
        </div>
      </section>
    </div>
  `;

  hydrateIcons(content);

  document.getElementById("readFirstChapter").addEventListener("click", () => {
    setModalChapterIndex(0);
  });

  document.getElementById("downloadBook").addEventListener("click", () => {
    void downloadBook(book);
  });

  content.querySelectorAll("[data-chapter-index]").forEach((button) => {
    button.addEventListener("click", () => {
      setModalChapterIndex(Number(button.dataset.chapterIndex));
    });
  });

  content.querySelectorAll("[data-chapter-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.chapterNav;
      if (direction === "previous") setModalChapterIndex(currentChapterIndex - 1);
      if (direction === "next") setModalChapterIndex(currentChapterIndex + 1);
    });
  });

  void ensureChapterAudioAvailability(book, currentChapterIndex);
  void ensureChapterContent(book, currentChapterIndex).then(() => {
    warmNearbyChapters(book, currentChapterIndex);
  });
}

function closeModal() {
  const modal = document.getElementById("bookModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  currentModalBook = null;
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

function setActiveNav(target) {
  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.navTarget === target);
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

  document.getElementById("loginButton").addEventListener("click", () => {
    showToast("登入介面目前為佔位，後續可接 OAuth、會員系統或自家 API。");
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
      const target = button.dataset.navTarget;
      setActiveNav(target);
      const moved = scrollToTarget(target);
      if (!moved) showToast("此功能頁後續接入，目前先保留入口佔位。");
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
  document.getElementById("heroHeat").textContent = `人氣 ${heroBook.heat}`;
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
  showToast(message);
}

async function init() {
  hydrateIcons();
  initEvents();
  try {
    await loadLibrary();
    initHero();
    renderRanking();
    renderCategories();
    renderAiNovels();
    maybeShowInstallGuide();
    consumeAutoRefreshFlag();
    initManifestPolling();
  } catch (error) {
    showLoadError(error);
  }
}

init();
