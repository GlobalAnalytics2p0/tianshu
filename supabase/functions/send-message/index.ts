import { body, fail, ok, options } from "../_shared/http.ts";
import { moderateText } from "../_shared/openai.ts";
import { admin, enforceQuota, getIdempotent, requireFeature, requireUser, saveIdempotent } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user, profile } = await requireUser(req);
    await requireFeature("posting_enabled");
    const key = req.headers.get("Idempotency-Key") || crypto.randomUUID();
    const cached = await getIdempotent("send-message", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    const payload = await body<{ roomId: string; content: string; parentId?: string }>(req);
    const content = String(payload.content || "").trim();
    if (!payload.roomId || content.length < 1 || content.length > 500) return fail("留言需為 1–500 字。", 422, "invalid_content", requestId);
    const { data: room } = await admin.from("rooms").select("id,kind,is_public").eq("id", payload.roomId).maybeSingle();
    if (!room?.is_public || !["platform", "book"].includes(room.kind)) return fail("這個討論區目前不能發言。", 403, "room_not_postable", requestId);
    if (payload.parentId) {
      const { data: parent } = await admin.from("messages").select("id").eq("id", payload.parentId).eq("room_id", payload.roomId).eq("status", "visible").maybeSingle();
      if (!parent) return fail("找不到要回覆的公開留言。", 422, "invalid_parent", requestId);
    }
    await enforceQuota("messages", "user_id", user.id, new Date(Date.now() - 10 * 60 * 1000), 10);
    await enforceQuota("messages", "user_id", user.id, new Date(Date.now() - 24 * 60 * 60 * 1000), 100);
    const moderation = await moderateText(content);
    const status = moderation.flagged ? "quarantined" : "visible";
    const { data, error } = await admin.from("messages").insert({
      room_id: payload.roomId,
      parent_id: payload.parentId || null,
      user_id: user.id,
      actor_kind: "reader",
      speaker_name: profile.display_name,
      content,
      status,
      moderation_labels: moderation.categories
    }).select("id,room_id,status,created_at").single();
    if (error) throw error;
    if (status === "visible") {
      await admin.from("generation_jobs").insert({
        kind: "feedback_extract",
        idempotency_key: `feedback:${data.id}`,
        payload: { messageId: data.id }
      });
    }
    await saveIdempotent("send-message", key, user.id, data);
    return ok(data, 201, requestId);
  } catch (error) {
    const code = String(error?.message || error);
    if (code === "unauthorized") return fail("請先登入。", 401, code, requestId);
    if (code === "suspended") return fail("此帳號目前無法發言。", 403, code, requestId);
    if (code === "feature_disabled") return fail("平台目前暫停發言。", 503, code, requestId);
    if (code === "rate_limited") return fail("發言速度過快，請稍後再試。", 429, code, requestId);
    console.error(error); return fail("留言暫時無法送出。", 500, "send_failed", requestId);
  }
});
