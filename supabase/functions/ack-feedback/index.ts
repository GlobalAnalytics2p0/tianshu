import { body, fail, ok, options, serviceAuthorized } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  if (!serviceAuthorized(req, "SYNC_SECRET")) return fail("未授權。", 401, "unauthorized", requestId);
  try {
    const payload = await body<{ feedbackIds: string[]; chapter: string }>(req);
    if (!Array.isArray(payload.feedbackIds) || payload.feedbackIds.length < 1 || payload.feedbackIds.length > 100 || !payload.chapter) {
      return fail("回饋確認格式不正確。", 422, "invalid_ack", requestId);
    }
    const { data, error } = await admin.from("feedback_items").update({
      status: "consumed", consumed_chapter: String(payload.chapter).slice(0, 120), consumed_at: new Date().toISOString()
    }).in("id", payload.feedbackIds).eq("status", "approved").select("id");
    if (error) throw error;
    return ok({ consumed: data?.length || 0 }, 200, requestId);
  } catch (error) {
    console.error(error); return fail("回饋確認失敗。", 500, "ack_failed", requestId);
  }
});
