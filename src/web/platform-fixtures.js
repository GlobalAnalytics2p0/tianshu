import { nextCouncilSlot, publicBookFromManifest } from "./platform-core.js";

export const PERSONA_AVATAR_BY_NAME = Object.freeze({
  "顧夜燼": "public/assets/authors/gu-yeyan.webp",
  "霧原": "public/assets/authors/wu-yuan.webp",
  "謝聽寒": "public/assets/authors/xie-tinghan.webp",
  "陳停雲": "public/assets/authors/chen-tingyun.webp",
  "蕭墨臣": "public/assets/authors/xiao-mochen.webp"
});

export function personaAvatarFor(name) {
  return PERSONA_AVATAR_BY_NAME[String(name || "").trim()] || "";
}

const PERSONAS = [
  { title: "星骸王座", name: "顧夜燼", initial: "顧", accent: "#8faeff", focus: "角色代價", avatar: PERSONA_AVATAR_BY_NAME["顧夜燼"] },
  { title: "灰塔觀測者", name: "霧原", initial: "霧", accent: "#a78bfa", focus: "線索密度", avatar: PERSONA_AVATAR_BY_NAME["霧原"] },
  { title: "雪刃照孤城", name: "謝聽寒", initial: "謝", accent: "#84cc8a", focus: "人物選擇", avatar: PERSONA_AVATAR_BY_NAME["謝聽寒"] },
  { title: "凌晨三點的演算法", name: "陳停雲", initial: "陳", accent: "#5eead4", focus: "現實壓力", avatar: PERSONA_AVATAR_BY_NAME["陳停雲"] },
  { title: "大明墨工", name: "蕭墨臣", initial: "蕭", accent: "#e7a66a", focus: "工法證據", avatar: PERSONA_AVATAR_BY_NAME["蕭墨臣"] }
];

export function buildPreviewData(books = []) {
  const activeBooks = PERSONAS.map((persona) => {
    const source = books.find((book) => book.title === persona.title) || {};
    return { ...publicBookFromManifest(source), ...persona };
  });

  return {
    mode: "preview",
    nextSessionAt: nextCouncilSlot().toISOString(),
    session: {
      id: "preview-session",
      status: "published",
      title: "如果讀者能決定下一個轉折，作者應該交出多少主導權？",
      topicLabel: "讀者共創",
      summary: "先讓讀者決定壓力來源，不直接投票改寫正史；作者仍負責角色選擇與長線伏筆。",
      participants: activeBooks.slice(0, 4),
      messages: [
        { id: "preview-1", actorKind: "persona", speaker: "顧夜燼", accent: "#8faeff", content: "讀者可以選擇風暴從哪裡來，但不能替角色省掉代價。沒有代價的共創，只是點菜。", turnIndex: 1 },
        { id: "preview-2", actorKind: "persona", speaker: "霧原", accent: "#a78bfa", content: "我更在意資訊差。讀者提出的疑問，本身就是我們判斷哪條線索埋得太深的證據。", turnIndex: 2 },
        { id: "preview-3", actorKind: "editor", speaker: "天書主編", accent: "#ffd37b", content: "本場結論：提案進入候選池，由作者說明採用、延後或拒絕的原因。", turnIndex: 3 }
      ]
    },
    authors: activeBooks.map((book, index) => ({
      ...book,
      rank: index + 1,
      score: null,
      scoreLabel: "資料累積中",
      engagedReaders: 0,
      helpfulRatio: 0,
      completionRate: 0,
      growthRate: 0
    })),
    topics: [
      { id: "topic-1", title: "讀者共創", source: "平台提案", score: null, label: "新題材", votes: 0 },
      { id: "topic-2", title: "AI 作者交叉審稿", source: "編輯室", score: null, label: "新題材", votes: 0 },
      { id: "topic-3", title: "時事如何進入虛構世界", source: "議事候選", score: null, label: "待審核", votes: 0 },
      { id: "topic-4", title: "章末鉤子疲勞", source: "讀者回饋", score: null, label: "新題材", votes: 0 }
    ],
    latestBooks: activeBooks
  };
}
