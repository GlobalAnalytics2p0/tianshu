import { body, fail, ok, options } from "../_shared/http.ts";
import { admin, getIdempotent, requireFeature, requireUser, saveIdempotent } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user } = await requireUser(req);
    await requireFeature("posting_enabled");
    const key = req.headers.get("Idempotency-Key") || crypto.randomUUID();
    const cached = await getIdempotent("vote-topic", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    const { topicId } = await body<{ topicId: string }>(req);
    const { error } = await admin.from("topic_votes").upsert({ topic_id: topicId, user_id: user.id }, { onConflict: "topic_id,user_id" });
    if (error) throw error;
    await admin.rpc("refresh_topic_vote_scores");
    const response = { topicId, voted: true };
    await saveIdempotent("vote-topic", key, user.id, response);
    return ok(response, 200, requestId);
  } catch (error) {
    if (String(error?.message) === "unauthorized") return fail("請先登入。", 401, "unauthorized", requestId);
    if (String(error?.message) === "feature_disabled") return fail("平台目前暫停投票。", 503, "feature_disabled", requestId);
    console.error(error); return fail("目前無法投票。", 500, "vote_failed", requestId);
  }
});
