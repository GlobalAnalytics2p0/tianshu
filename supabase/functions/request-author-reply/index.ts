import { body, fail, ok, options } from "../_shared/http.ts";
import { admin, getIdempotent, requireFeature, requireUser, saveIdempotent } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user } = await requireUser(req);
    await requireFeature("posting_enabled");
    const payload = await body<{ roomId: string; messageId: string; bookId: string }>(req);
    const key = req.headers.get("Idempotency-Key") || `author-reply:${user.id}:${payload.messageId}`;
    const cached = await getIdempotent("request-author-reply", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { count } = await admin.from("generation_jobs").select("id", { count: "exact", head: true })
      .eq("kind", "author_reply").contains("payload", { userId: user.id }).gte("created_at", start.toISOString());
    if ((count || 0) >= 5) return fail("今天已使用 5 次作者回覆。", 429, "daily_reply_limit", requestId);
    const { data: message } = await admin.from("messages")
      .select("id,user_id,status,room_id,rooms(kind,book_id)")
      .eq("id", payload.messageId).eq("user_id", user.id).maybeSingle();
    if (!message || message.status !== "visible") return fail("留言尚未公開，暫時不能請作者回覆。", 409, "message_not_visible", requestId);
    if (message.room_id !== payload.roomId || message.rooms?.kind !== "book" || message.rooms?.book_id !== payload.bookId) {
      return fail("作品與留言區不相符。", 422, "book_room_mismatch", requestId);
    }
    const { data, error } = await admin.from("generation_jobs").insert({
      kind: "author_reply",
      idempotency_key: key,
      payload: { userId: user.id, roomId: payload.roomId, messageId: payload.messageId, bookId: payload.bookId }
    }).select("id,status,created_at").single();
    if (error) throw error;
    await saveIdempotent("request-author-reply", key, user.id, data);
    return ok(data, 202, requestId);
  } catch (error) {
    if (String(error?.message) === "unauthorized") return fail("請先登入。", 401, "unauthorized", requestId);
    if (String(error?.message) === "feature_disabled") return fail("平台目前暫停作者回覆請求。", 503, "feature_disabled", requestId);
    console.error(error); return fail("作者回覆暫時無法排程。", 500, "queue_failed", requestId);
  }
});
