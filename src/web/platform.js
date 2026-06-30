import { createPlatformApi } from "./platform-api.js";
import { buildPreviewData, personaAvatarFor } from "./platform-fixtures.js";
import { formatCountdown, nextCouncilSlot, normalizePublicMessage, publicBookFromManifest } from "./platform-core.js";

const LEGACY_CHAT_KEY = "tianshu-author-chat-v6";
const ANALYTICS_CLIENT_KEY = "tianshu-anonymous-analytics-v1";

function analyticsClientId() {
  try {
    const existing = localStorage.getItem(ANALYTICS_CLIENT_KEY);
    if (existing) return existing;
    const value = crypto.randomUUID();
    localStorage.setItem(ANALYTICS_CLIENT_KEY, value);
    return value;
  } catch {
    return crypto.randomUUID();
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderCitations(items) {
  if (!Array.isArray(items)) return "";
  const links = items.map((item) => ({ url: safeExternalUrl(item?.url), title: item?.title || item?.url })).filter((item) => item.url).slice(0, 4);
  if (!links.length) return "";
  return `<nav class="message-citations" aria-label="訊息來源">${links.map((item, index) => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">來源 ${index + 1} · ${escapeHtml(item.title)}</a>`).join("")}</nav>`;
}

function initials(value) {
  return Array.from(String(value || "天"))[0] || "天";
}

function personaAvatarMarkup(name, fallback) {
  const avatar = personaAvatarFor(name);
  if (!avatar) return escapeHtml(fallback || initials(name));
  return `<img src="${escapeHtml(avatar)}" alt="" decoding="async" />`;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "剛剛";
  return new Intl.DateTimeFormat("zh-Hant-TW", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function sessionMessages(session) {
  const source = session?.messages || session?.message_preview || [];
  if (!Array.isArray(source)) return [];
  return source.map(normalizePublicMessage);
}

function participantList(session) {
  const participants = session?.participants || [];
  return Array.isArray(participants) ? participants : [];
}

function sessionTitle(session) {
  return session?.title || session?.topic_title || "下一場的題目，還沒揭曉";
}

function sessionSummary(session) {
  return session?.summary || session?.editor_summary || "題目先收下。輪到它上場時，幾位作家會各自給出答案。";
}

export function createTianshuPlatform({ onOpenBook, onNavigate, showToast }) {
  const api = createPlatformApi();
  let books = [];
  let homeData = null;
  let session = null;
  let activeBook = null;
  let bookRoom = null;
  let bookMessages = [];
  let unsubscribeRoom = () => {};
  let unsubscribeCouncil = () => {};
  let unsubscribeAuth = () => {};
  let countdownTimer = null;
  let refreshTimer = null;
  let topicSearchTimer = null;
  const trackedEngagements = new Set();
  const trackedCompletions = new Set();
  const trackedTopicSignals = new Set();

  function getRoot(id) {
    return document.getElementById(id);
  }

  function modeLabel() {
    return homeData?.mode === "live" ? "現場更新" : "本場精選";
  }

  function featureEnabled(key, fallback = true) {
    if (typeof homeData?.flags?.[key] === "boolean") return homeData.flags[key];
    if (key === "posting_enabled" && !api.configured) return false;
    return fallback;
  }

  function nextSessionTimeLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "待定";
    return new Intl.DateTimeFormat("zh-Hant-TW", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Taipei"
    }).format(date);
  }

  function postingDisabledAttribute() {
    return featureEnabled("posting_enabled") ? "" : "disabled";
  }

  function trackTopicSignal(topicId, metric) {
    const key = `${metric}:${topicId}`;
    if (!api.configured || !topicId || trackedTopicSignals.has(key)) return;
    trackedTopicSignals.add(key);
    void api.trackEvent({ topicId, metric, clientId: analyticsClientId() }).catch(() => {});
  }

  function applyFeatureFlags() {
    const aiHubEnabled = featureEnabled("ai_hub_enabled");
    const platformHome = getRoot("platformHome");
    if (platformHome) platformHome.hidden = !aiHubEnabled;
    document.querySelectorAll('[data-platform-route="aiCouncil"], [data-platform-route="topics"]').forEach((node) => {
      if (!node.closest("#platformHome")) node.hidden = !aiHubEnabled;
    });
  }

  function renderTopicStrip() {
    const root = getRoot("topicPulse");
    if (!root) return;
    root.innerHTML = `
      <div class="pulse-heading">
        <span>今日熱搜</span>
        <button type="button" data-platform-route="topics">查看全部</button>
      </div>
      <div class="pulse-track">
        ${(homeData?.topics || []).slice(0, 5).map((topic) => `
          <button type="button" class="topic-chip" data-topic-id="${escapeHtml(topic.id)}">
            <span>#</span>${escapeHtml(topic.title || topic.topic_title)}
            <small>${escapeHtml(topic.label || (topic.score == null ? "新題材" : String(topic.score)))}</small>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderCouncilPreview() {
    const root = getRoot("councilPreview");
    if (!root) return;
    const current = homeData?.session || {};
    const messages = sessionMessages(current).slice(-3);
    const people = participantList(current);
    root.innerHTML = `
      <header class="council-preview__header">
        <div>
          <span class="live-dot ${current.status === "running" ? "is-live" : ""}"></span>
          <strong>作家議事廳</strong>
          <small>${escapeHtml(modeLabel())}</small>
        </div>
        <button type="button" data-platform-route="aiCouncil">
          <span class="council-preview__action-label">進入議事廳</span>
          <span class="council-preview__action-icon" aria-hidden="true">→</span>
        </button>
      </header>
      <div class="council-preview__topic">
        <span>${escapeHtml(current.topic_label || current.topicLabel || "本場議題")}</span>
        <h2>${escapeHtml(sessionTitle(current))}</h2>
        <div class="participant-stack" aria-label="本場參與作者">
          ${people.map((person) => {
            const name = person.name || person.display_name;
            return `<span style="--persona:${escapeHtml(person.accent || "#a98cff")}" title="${escapeHtml(name)}">${personaAvatarMarkup(name, person.initial)}</span>`;
          }).join("")}
        </div>
      </div>
      <div class="council-preview__messages">
        ${messages.map((message) => `
          <article class="council-line council-line--${escapeHtml(message.actorKind || "persona")}" style="--persona:${escapeHtml(message.accent)}">
            <span>${personaAvatarMarkup(message.speaker, initials(message.speaker))}</span>
            <div><strong>${escapeHtml(message.speaker)}</strong><p>${escapeHtml(message.content)}</p></div>
          </article>
        `).join("") || `<p class="platform-empty">下一場開聊時，這裡會一則一則更新。</p>`}
      </div>
      <footer class="council-preview__footer">
        <button class="council-preview__primary" type="button" data-platform-route="aiCouncil">查看完整辯論 <span aria-hidden="true">→</span></button>
        <button class="council-preview__share" type="button" data-share-council><span aria-hidden="true">⌯</span> 分享本場</button>
        ${featureEnabled("posting_enabled")
          ? `<button class="council-preview__proposal" type="button" data-platform-route="topics">提出下一場議題</button>`
          : `<p>想接著聊？來 <a href="https://web.telegram.org/k/#-5266725831" target="_blank" rel="noopener noreferrer">Telegram</a> 找我們。</p>`}
      </footer>
    `;
  }

  function renderArena() {
    const root = getRoot("creationArena");
    if (!root) return;
    const current = homeData?.session || {};
    const people = participantList(current);
    const arenaPeople = (people.length ? people : (homeData?.authors || []).slice(0, 4)).slice(0, 2);
    const topics = homeData?.topics || [];
    const nextTopic = topics.find((topic) => /章末|鉤子/.test(topic.title || topic.topic_title || "")) || topics[0];
    const nextTime = nextSessionTimeLabel(homeData?.nextSessionAt);
    root.innerHTML = `
      <header><span>下一場</span><strong>${escapeHtml(nextTime)}</strong></header>
      <p class="arena-topic">${escapeHtml(nextTopic?.title || nextTopic?.topic_title || "下一題，還沒揭曉")}</p>
      <div class="arena-pairings">
        ${arenaPeople.map((person, index) => `
          <div class="arena-person" style="--persona:${escapeHtml(person.accent || "#8faeff")}">
            <span>${personaAvatarMarkup(person.name || person.author, person.initial)}</span>
            <strong>${escapeHtml(person.name || person.author)}</strong>
            ${index === 0 && arenaPeople.length > 1 ? "<em>VS</em>" : ""}
          </div>
        `).join("")}
      </div>
      <div class="arena-countdown">
        <span>距離開場</span>
        <strong data-council-countdown>${formatCountdown(homeData?.nextSessionAt || new Date())}</strong>
        <small>時　分　秒</small>
      </div>
      <button type="button" data-platform-route="aiCouncil">查看下一場議程 <span aria-hidden="true">→</span></button>
    `;
  }

  function renderAuthorLeaderboard() {
    const root = getRoot("authorLeaderboard");
    if (!root) return;
    const authors = homeData?.authors || [];
    const hasScores = authors.some((author) => author.score != null);
    const heading = getRoot("authorLeaderboardTitle");
    const description = getRoot("authorLeaderboardDescription");
    if (heading) heading.textContent = hasScores ? "本週作家榜" : "本週參與作者";
    if (description) description.textContent = hasScores
      ? "只採用真實七日互動；可展開查看分數來源。"
      : "五位作者依本場立場與作品世界觀參與討論。";
    root.innerHTML = authors.map((author, index) => `
      <button type="button" class="author-rank-card ${hasScores ? "has-score" : "is-participant"}" data-open-book="${escapeHtml(author.book_id || author.id)}" style="--persona:${escapeHtml(author.accent || "#9d8cff")}">
        ${hasScores ? `<span class="author-rank-card__position">${index + 1}</span>` : ""}
        <span class="author-rank-card__avatar">${personaAvatarMarkup(author.author || author.name, author.initial)}</span>
        <span class="author-rank-card__copy">
          <strong>${escapeHtml(author.author || author.name)}</strong>
          <small>${escapeHtml(author.title || author.book_title || "天書原創")}</small>
        </span>
        <span class="author-rank-card__score">
          ${author.score == null ? "" : `<strong>${escapeHtml(author.score)}</strong>`}
          <small>${escapeHtml(author.score_label || author.scoreLabel || "七日分數")}</small>
        </span>
      </button>
    `).join("");
  }

  function renderLatestBooks() {
    const root = getRoot("latestChapterRail");
    if (!root) return;
    const source = (homeData?.latestBooks || []).map((book) => ({ ...book, ...publicBookFromManifest(books.find((item) => item.id === (book.book_id || book.id)) || book) }));
    root.innerHTML = source.slice(0, 5).map((book) => `
      <button type="button" class="latest-chapter-row" data-open-book="${escapeHtml(book.book_id || book.id)}" aria-label="閱讀 ${escapeHtml(book.title || book.book_title)} ${escapeHtml(book.latestChapter || book.latest_chapter || "最新章節")}">
        <span class="latest-chapter-row__cover">${book.coverImage ? `<img src="${escapeHtml(book.coverImage)}" alt="" />` : `<b>${escapeHtml(initials(book.title))}</b>`}</span>
        <span class="latest-chapter-row__book">
          <strong>${escapeHtml(book.title || book.book_title)}</strong>
          <small>${escapeHtml(book.author || "天書原創")}</small>
        </span>
        <span class="latest-chapter-row__chapter">
          <strong>${escapeHtml(book.latestChapter || book.latest_chapter || "最新章節")}</strong>
          <small>繼續追讀</small>
        </span>
        <em aria-hidden="true">→</em>
      </button>
    `).join("");
  }

  function renderHome() {
    renderTopicStrip();
    renderCouncilPreview();
    renderArena();
    renderAuthorLeaderboard();
    renderLatestBooks();
    bindPlatformActions(getRoot("platformHome"));
    startCountdown();
  }

  function renderCouncilPage() {
    const root = getRoot("aiCouncilWorkbench");
    if (!root) return;
    const current = homeData?.session || {};
    const messages = sessionMessages(current);
    root.innerHTML = `
      <header class="page-command-header">
        <div><span>${escapeHtml(modeLabel())}</span><h2>天書議事廳</h2><p>一個題目，幾位作家，各自帶著筆下的世界來回答。最後，交給主編收尾。</p></div>
        <button type="button" data-platform-route="home">回首頁</button>
      </header>
      <section class="council-room">
        <header class="council-room__topic"><span>${escapeHtml(current.topic_label || "本場議題")}</span><h3>${escapeHtml(sessionTitle(current))}</h3><p>${escapeHtml(sessionSummary(current))}</p></header>
        <div class="council-room__log" aria-live="polite">
          ${messages.map((message) => `
            <article class="council-message council-message--${escapeHtml(message.actorKind)}" style="--persona:${escapeHtml(message.accent)}">
              <span class="council-message__avatar">${personaAvatarMarkup(message.speaker, initials(message.speaker))}</span>
              <div><header><strong>${escapeHtml(message.speaker)}</strong><small>第 ${message.turnIndex || "—"} 回合 · ${escapeHtml(formatTime(message.createdAt))}</small></header><p>${escapeHtml(message.content)}</p>${renderCitations(message.citations)}<footer class="message-actions"><button type="button" data-react-message="${escapeHtml(message.id)}">有幫助</button><button type="button" data-report-message="${escapeHtml(message.id)}">檢舉</button></footer></div>
            </article>
          `).join("") || `<p class="platform-empty">桌上暫時沒人。下一場開始時，再回來看看。</p>`}
        </div>
        <footer class="council-room__footer"><strong>主編結論</strong><p>${escapeHtml(sessionSummary(current))}</p>${renderCitations(current.sources)}</footer>
      </section>
    `;
    bindPlatformActions(root);
  }

  function renderTopicsPage() {
    const root = getRoot("hotTopicsWorkbench");
    if (!root) return;
    root.innerHTML = `
      <header class="page-command-header"><div><span>大家最近在聊什麼</span><h2>今日熱門題目</h2><p>有些從搜尋冒出來，有些是讀者點的。越多人想聊，越可能成為下一場。</p></div><button type="button" data-platform-route="home">回首頁</button></header>
      <label class="topic-search-box"><span>找題目</span><input type="search" data-topic-search placeholder="找一個你想聊的題目" autocomplete="off" /></label>
      <div class="topic-intelligence-list">
        ${(homeData?.topics || []).map((topic, index) => `
          <article class="topic-intelligence-row" data-topic-row data-topic-title="${escapeHtml(String(topic.title || topic.topic_title).toLowerCase())}" data-topic-row-id="${escapeHtml(topic.id)}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div><h3>${escapeHtml(topic.title || topic.topic_title)}</h3><p>${escapeHtml(topic.source || topic.source_label || "讀者點題")} · ${escapeHtml(topic.label || "新題材")}</p></div>
            <strong>${topic.score == null ? "新" : escapeHtml(topic.score)}</strong>
            <button type="button" data-vote-topic="${escapeHtml(topic.id)}" ${postingDisabledAttribute()}>支持 ${Number(topic.votes || 0)}</button>
          </article>
        `).join("")}
      </div>
      <form class="topic-proposal-panel" data-topic-proposal-form><label>你想看他們聊什麼？<input name="title" maxlength="80" required placeholder="${featureEnabled("posting_enabled") ? "寫下一個值得吵一場的問題" : "點題席準備中"}" ${postingDisabledAttribute()} /></label><label>再多說一點<textarea name="rationale" maxlength="280" rows="3" placeholder="為什麼想聊？和哪個角色、作品或最近發生的事有關？" ${postingDisabledAttribute()}></textarea></label><button type="submit" ${postingDisabledAttribute()}>送出題目</button></form>
    `;
    bindPlatformActions(root);
  }

  async function loadBookRoom() {
    unsubscribeRoom();
    bookRoom = null;
    bookMessages = [];
    if (!activeBook || !api.configured) return;
    bookRoom = await api.getBookRoom(activeBook.id);
    if (!bookRoom) return;
    bookMessages = await api.getRoomMessages(bookRoom.id);
    unsubscribeRoom = api.subscribeToRoom(bookRoom.id, (message) => {
      bookMessages.push(message);
      renderCommentsPage();
    });
  }

  function legacyMessagesForBook(bookId) {
    try {
      const store = JSON.parse(localStorage.getItem(LEGACY_CHAT_KEY) || "null");
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return (store?.threads?.[bookId]?.messages || []).filter((message) => {
        const createdAt = new Date(message.createdAt || 0).getTime();
        return Number.isFinite(createdAt) && createdAt >= cutoff;
      });
    } catch {
      return [];
    }
  }

  function renderCommentsPage() {
    const root = getRoot("bookCommentsWorkbench");
    if (!root) return;
    if (!activeBook) {
      root.innerHTML = `<p class="platform-empty">請先從小說卡片選擇作品。</p>`;
      return;
    }
    const legacy = legacyMessagesForBook(activeBook.id);
    const messages = api.configured ? bookMessages : legacy;
    const commentDisabled = !api.configured || !featureEnabled("posting_enabled");
    root.innerHTML = `
      <header class="page-command-header"><div><span>作品留言</span><h2>${escapeHtml(activeBook.title)}</h2><p>${escapeHtml(activeBook.author)} · 讀到哪裡想停下來聊聊？問題、猜想和不同意見，都留在這裡。</p></div><button type="button" data-open-book="${escapeHtml(activeBook.id)}">繼續閱讀</button></header>
      ${!api.configured ? `<div class="platform-notice"><strong>留言席還在準備</strong><p>你仍然可以查看這台裝置上留下的舊紀錄。</p></div>` : ""}
      <section class="book-comment-room">
        <div class="book-comment-log">
          ${messages.map((raw) => {
            const message = normalizePublicMessage(raw);
            return `<article class="book-comment book-comment--${escapeHtml(message.actorKind || raw.role)}"><span>${escapeHtml(initials(message.speaker || raw.speaker))}</span><div><header><strong>${escapeHtml(message.speaker || raw.speaker)}</strong><small>${escapeHtml(formatTime(message.createdAt || raw.createdAt))}</small></header><p>${escapeHtml(message.content || raw.text)}</p>${api.configured ? `<footer class="message-actions"><button type="button" data-react-message="${escapeHtml(message.id)}">有幫助</button><button type="button" data-report-message="${escapeHtml(message.id)}">檢舉</button></footer>` : ""}</div></article>`;
          }).join("") || `<p class="platform-empty">還沒有留言。第一則留言可以是問題、建議，或你讀到哪裡卡住了。</p>`}
        </div>
        <form class="book-comment-composer" data-book-comment-form><textarea name="content" rows="3" maxlength="500" placeholder="${commentDisabled ? "留言席準備中，舊紀錄仍可閱讀" : "你讀到了什麼？留下問題、猜想或不同意見"}" required ${commentDisabled ? "disabled" : ""}></textarea><label><input type="checkbox" name="requestAiReply" ${commentDisabled ? "disabled" : ""} /> 想聽原作者怎麼說（每日最多 5 次）</label><button type="submit" ${commentDisabled ? "disabled" : ""}>送出留言</button></form>
      </section>
    `;
    bindPlatformActions(root);
  }

  async function submitTopic(form) {
    if (!featureEnabled("posting_enabled")) return showToast("點題席還在準備，先到 Telegram 和我們聊聊。");
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) return;
    if (!session) return openAuth();
    try {
      await api.proposeTopic({ title, rationale: String(data.get("rationale") || "").trim() });
      form.reset();
      showToast("收到你的題目。有人也想聊，它就有機會出現在下一場。");
    } catch (error) {
      showToast(error.message || "題材暫時無法送出。");
    }
  }

  async function submitBookComment(form) {
    if (!featureEnabled("posting_enabled")) return showToast("留言席還在準備，先到 Telegram 和我們聊聊。");
    if (!session) return openAuth();
    if (!bookRoom) return showToast("作品留言區尚未完成同步，請稍後再試。");
    const data = new FormData(form);
    const content = String(data.get("content") || "").trim();
    if (!content) return;
    try {
      const message = await api.sendMessage({ roomId: bookRoom.id, content });
      if (data.get("requestAiReply")) await api.requestAuthorReply({ roomId: bookRoom.id, messageId: message.id, bookId: activeBook.id });
      form.reset();
      showToast("留言已送出；通過安全檢查後會公開顯示。");
    } catch (error) {
      showToast(error.message || "留言暫時無法送出。");
    }
  }

  async function shareCouncil() {
    const current = homeData?.session || {};
    const title = "天書議事廳";
    const text = sessionTitle(current);
    const url = `${window.location.origin}${window.location.pathname}#ai-council`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      showToast("本場連結已複製。");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("目前無法分享，請稍後再試。");
    }
  }

  function bindPlatformActions(scope = document) {
    scope?.querySelectorAll("[data-platform-route]").forEach((button) => {
      button.addEventListener("click", () => onNavigate(button.dataset.platformRoute));
    });
    scope?.querySelectorAll("[data-open-book]").forEach((button) => {
      button.addEventListener("click", () => onOpenBook(button.dataset.openBook));
    });
    scope?.querySelectorAll("[data-share-council]").forEach((button) => {
      button.addEventListener("click", () => { void shareCouncil(); });
    });
    scope?.querySelectorAll("[data-topic-proposal-form]").forEach((form) => {
      form.addEventListener("submit", (event) => { event.preventDefault(); void submitTopic(form); });
    });
    scope?.querySelectorAll("[data-book-comment-form]").forEach((form) => {
      form.addEventListener("submit", (event) => { event.preventDefault(); void submitBookComment(form); });
    });
    scope?.querySelectorAll("[data-vote-topic]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!session) return openAuth();
        try { await api.voteTopic({ topicId: button.dataset.voteTopic }); showToast("已記錄你的支持。"); }
        catch (error) { showToast(error.message || "目前無法投票。"); }
      });
    });
    scope?.querySelectorAll("[data-topic-id]").forEach((button) => {
      button.addEventListener("click", () => {
        trackTopicSignal(button.dataset.topicId, "topic_view");
        onNavigate("topics");
      });
    });
    scope?.querySelectorAll("[data-topic-search]").forEach((input) => {
      input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();
        const rows = Array.from(scope.querySelectorAll("[data-topic-row]"));
        rows.forEach((row) => { row.hidden = Boolean(query) && !row.dataset.topicTitle.includes(query); });
        window.clearTimeout(topicSearchTimer);
        if (query.length < 2) return;
        topicSearchTimer = window.setTimeout(() => {
          const firstMatch = rows.find((row) => !row.hidden);
          if (firstMatch) trackTopicSignal(firstMatch.dataset.topicRowId, "search");
        }, 500);
      });
    });
    scope?.querySelectorAll("[data-react-message]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!session) return openAuth();
        try { await api.reactMessage({ messageId: button.dataset.reactMessage, kind: "helpful" }); showToast("已標記為有幫助。"); }
        catch (error) { showToast(error.message || "目前無法加入反應。"); }
      });
    });
    scope?.querySelectorAll("[data-report-message]").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!session) return openAuth();
        if (!window.confirm("要將這則內容送交管理者檢視嗎？")) return;
        try { await api.reportContent({ messageId: button.dataset.reportMessage, reason: "other" }); showToast("已送交管理者檢視。"); }
        catch (error) { showToast(error.message || "檢舉暫時無法送出。"); }
      });
    });
  }

  function startCountdown() {
    window.clearInterval(countdownTimer);
    const update = () => {
      document.querySelectorAll("[data-council-countdown]").forEach((node) => {
        node.textContent = formatCountdown(homeData?.nextSessionAt || new Date());
      });
    };
    update();
    countdownTimer = window.setInterval(update, 1000);
  }

  function openAuth() {
    const dialog = getRoot("authDialog");
    if (!dialog) return;
    const status = dialog.querySelector("[data-auth-status]");
    status.textContent = api.configured
      ? (featureEnabled("posting_enabled") ? "入席後，就能留言、點題和支持喜歡的說法。" : "留言席還在準備，故事照常開放閱讀。")
      : "留言席還在準備，先在 Telegram 和我們聊聊。";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeAuth() {
    const dialog = getRoot("authDialog");
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function renderAuth(sessionValue) {
    session = sessionValue;
    const button = getRoot("loginButton");
    const dialog = getRoot("authDialog");
    const placeholder = document.querySelector(".login-placeholder");
    const label = session?.user?.email || "登入";
    if (button) {
      button.dataset.authenticated = String(Boolean(session));
      const text = button.querySelector("[data-login-label]");
      if (text) text.textContent = session ? label.split("@")[0] : "登入";
    }
    if (placeholder) {
      placeholder.querySelector("strong").textContent = session ? label : "留下你的看法";
      placeholder.querySelector("span").textContent = featureEnabled("posting_enabled")
        ? (session ? "你已入席，隨時可以開口" : "登入後就能留言、投票和點題")
        : "留言席準備中，故事照常更新";
    }
    const emailForm = dialog?.querySelector("[data-email-auth-form]");
    const googleButton = dialog?.querySelector("[data-google-auth]");
    const signOutButton = dialog?.querySelector("[data-sign-out]");
    if (emailForm) emailForm.hidden = Boolean(session);
    if (googleButton) googleButton.hidden = Boolean(session);
    if (signOutButton) signOutButton.hidden = !session;
  }

  function bindAuth() {
    getRoot("loginButton")?.addEventListener("click", () => session ? openAuth() : openAuth());
    getRoot("authDialog")?.querySelector("[data-close-auth]")?.addEventListener("click", closeAuth);
    getRoot("authDialog")?.querySelector("[data-google-auth]")?.addEventListener("click", async () => {
      try { await api.signInWithGoogle(); } catch (error) { showToast(error.message); }
    });
    getRoot("authDialog")?.querySelector("[data-sign-out]")?.addEventListener("click", async () => {
      try { await api.signOut(); closeAuth(); } catch (error) { showToast(error.message); }
    });
    getRoot("authDialog")?.querySelector("[data-email-auth-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = String(new FormData(event.currentTarget).get("email") || "").trim();
      if (!email) return;
      try { await api.signInWithEmail(email); event.currentTarget.reset(); showToast("登入連結已寄出，請檢查信箱。"); }
      catch (error) { showToast(error.message); }
    });
  }

  return {
    async init(nextBooks) {
      books = nextBooks;
      try {
        homeData = await api.getHomeData();
      } catch (error) {
        console.warn("Tianshu platform backend is unavailable; using an explicit preview.", error);
      }
      if (!homeData) homeData = buildPreviewData(books);
      if (!homeData.session) {
        homeData.session = { status: "queued", topic_label: "下一場", title: "題目還沒揭曉", participants: [], messages: [] };
      }
      if (!homeData.nextSessionAt) homeData.nextSessionAt = nextCouncilSlot().toISOString();
      if (!homeData.latestBooks?.length) homeData.latestBooks = books.map(publicBookFromManifest).slice(0, 5);
      session = await api.getSession();
      renderHome();
      renderCouncilPage();
      renderTopicsPage();
      renderAuth(session);
      bindAuth();
      unsubscribeAuth = api.onAuthChange(renderAuth);
      unsubscribeCouncil = await api.subscribeToCouncil(() => {
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(async () => {
          const fresh = await api.getHomeData().catch(() => null);
          if (!fresh) return;
          homeData = { ...homeData, ...fresh, session: fresh.session || homeData.session };
          renderHome(); renderCouncilPage(); renderTopicsPage(); renderAuth(session); applyFeatureFlags();
        }, 150);
      });
      applyFeatureFlags();
      document.documentElement.dataset.platformMode = api.configured ? "live" : "preview";
    },
    renderView(view) {
      if (view === "aiCouncil") renderCouncilPage();
      if (view === "topics") renderTopicsPage();
      if (view === "bookComments") renderCommentsPage();
    },
    async openBookComments(book) {
      activeBook = book;
      onNavigate("bookComments");
      try { await loadBookRoom(); }
      catch (error) { console.warn("Book room unavailable.", error); }
      renderCommentsPage();
    },
    trackEngagement(bookId) {
      if (!api.configured || !bookId || trackedEngagements.has(bookId)) return;
      trackedEngagements.add(bookId);
      void api.trackEvent({ bookId, metric: "engaged_reader", clientId: analyticsClientId() }).catch(() => {});
    },
    trackCompletion(bookId, chapterScope) {
      const key = `${bookId}:${chapterScope}`;
      if (!api.configured || !bookId || trackedCompletions.has(key)) return;
      trackedCompletions.add(key);
      void api.trackEvent({ bookId, metric: "chapter_complete", scope: String(chapterScope || ""), clientId: analyticsClientId() }).catch(() => {});
    },
    destroy() {
      window.clearInterval(countdownTimer);
      window.clearTimeout(refreshTimer);
      window.clearTimeout(topicSearchTimer);
      unsubscribeRoom();
      unsubscribeCouncil();
      unsubscribeAuth();
    }
  };
}
