import { body, fail, ok, options, serviceAuthorized } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

const personaDefaults: Record<string, { slug: string; initial: string; accent: string; focus: string }> = {
  "星骸王座": { slug: "gu-ye-jin", initial: "顧", accent: "#8faeff", focus: "角色代價、北街生活、章節節奏" },
  "灰塔觀測者": { slug: "wu-yuan", initial: "霧", accent: "#a78bfa", focus: "線索清楚度、懸疑節奏、讀者是否跟得上" },
  "雪刃照孤城": { slug: "xie-ting-han", initial: "謝", accent: "#84cc8a", focus: "人物情緒、武打節奏、舊案線索" },
  "凌晨三點的演算法": { slug: "chen-ting-yun", initial: "陳", accent: "#5eead4", focus: "黑箱流程、人物選擇、現實感" },
  "大明墨工": { slug: "xiao-mo-chen", initial: "蕭", accent: "#e7a66a", focus: "工法細節、案件推理、歷史背景" }
};

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  if (!serviceAuthorized(req, "SYNC_SECRET")) return fail("未授權。", 401, "unauthorized", requestId);
  try {
    const { books } = await body<{ books: any[] }>(req);
    if (!Array.isArray(books) || books.length > 100) return fail("Catalog 格式不正確。", 422, "invalid_catalog", requestId);
    const activeTitles = new Set(Object.keys(personaDefaults));
    const rows = books.map((book) => ({
      id: String(book.id), title: String(book.title), author_name: String(book.author), category: String(book.category),
      premise: String(book.premise || book.readerHook || "").slice(0, 2000),
      cover_image: book.coverImage || null, latest_chapter: book.chapters?.at(-1)?.displayTitle || null,
      latest_context: String(book.latestContext || "").slice(-6000),
      chapter_count: book.chapters?.length || 0, manifest_updated_at: book.updatedAt || book.chapters?.at(-1)?.generatedAt || null,
      is_active: activeTitles.has(book.title)
    }));
    const { error } = await admin.from("books").upsert(rows, { onConflict: "id" });
    if (error) throw error;
    for (const book of rows.filter((item) => item.is_active)) {
      await admin.from("rooms").upsert({ slug: `book-${book.id}`, kind: "book", title: `${book.title} 作品留言區`, book_id: book.id, is_public: true }, { onConflict: "slug" });
      const defaults = personaDefaults[book.title];
      await admin.from("personas").upsert({
        slug: defaults.slug, display_name: book.author_name, initial: defaults.initial, accent: defaults.accent,
        book_id: book.id, role: "persona", focus: defaults.focus,
        system_prompt: `你是《${book.title}》作者 ${book.author_name}。只依該書資料回答，保持作者聲線，避免跨書人格與提前劇透。`, is_active: true
      }, { onConflict: "slug" });
    }
    await admin.from("personas").upsert({
      slug: "tianshu-editor", display_name: "天書主編", initial: "編", accent: "#ffd37b", role: "editor",
      focus: "收斂分歧、標記來源、提出下一步", system_prompt: "你是天書主編。你負責收斂作者討論，忠實保留分歧，不增加不存在的事實。", is_active: true
    }, { onConflict: "slug" });
    return ok({ books: rows.length, active: rows.filter((item) => item.is_active).length }, 200, requestId);
  } catch (error) {
    console.error(error); return fail("Catalog 同步失敗。", 500, "catalog_sync_failed", requestId);
  }
});
