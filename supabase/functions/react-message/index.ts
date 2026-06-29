import { body, fail, ok, options } from "../_shared/http.ts";
import { admin, getIdempotent, requireFeature, requireUser, saveIdempotent } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user } = await requireUser(req);
    await requireFeature("posting_enabled");
    const key = req.headers.get("Idempotency-Key") || crypto.randomUUID();
    const cached = await getIdempotent("react-message", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    const payload = await body<{ messageId: string; kind: string }>(req);
    if (!payload.messageId || !["helpful", "insightful"].includes(payload.kind)) {
      return fail("反應類型不正確。", 422, "invalid_reaction", requestId);
    }
    const { data: message } = await admin.from("messages").select("id,status").eq("id", payload.messageId).eq("status", "visible").maybeSingle();
    if (!message) return fail("找不到可互動的訊息。", 404, "message_not_found", requestId);
    const { data, error } = await admin.from("reactions").upsert({
      message_id: payload.messageId, user_id: user.id, kind: payload.kind
    }, { onConflict: "message_id,user_id,kind" }).select("message_id,kind").single();
    if (error) throw error;
    await saveIdempotent("react-message", key, user.id, data);
    return ok(data, 201, requestId);
  } catch (error) {
    const code = String(error?.message || error);
    if (code === "unauthorized") return fail("請先登入。", 401, code, requestId);
    if (code === "feature_disabled") return fail("平台目前暫停互動。", 503, code, requestId);
    console.error(error); return fail("目前無法加入反應。", 500, "reaction_failed", requestId);
  }
});
