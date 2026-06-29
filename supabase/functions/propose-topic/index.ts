import { body, fail, ok, options } from "../_shared/http.ts";
import { moderateText } from "../_shared/openai.ts";
import { admin, enforceQuota, getIdempotent, requireFeature, requireUser, saveIdempotent } from "../_shared/supabase.ts";

const reviewPattern = /政治|選舉|戰爭|災害|地震|颱風|疾病|醫療|投資|股票|金融|詐騙|指控|犯罪/;

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user } = await requireUser(req);
    await requireFeature("posting_enabled");
    const key = req.headers.get("Idempotency-Key") || crypto.randomUUID();
    const cached = await getIdempotent("propose-topic", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    await enforceQuota("topics", "proposed_by", user.id, new Date(Date.now() - 24 * 60 * 60 * 1000), 3);
    const payload = await body<{ title: string; rationale?: string }>(req);
    const title = String(payload.title || "").trim();
    const rationale = String(payload.rationale || "").trim();
    if (title.length < 2 || title.length > 80 || rationale.length > 280) return fail("題材需為 2–80 字，說明最多 280 字。", 422, "invalid_topic", requestId);
    const moderation = await moderateText(`${title}\n${rationale}`);
    const riskLevel = moderation.flagged ? "blocked" : reviewPattern.test(`${title}${rationale}`) ? "review_required" : "normal";
    const { data, error } = await admin.from("topics").insert({ title, rationale, proposed_by: user.id, risk_level: riskLevel, source_label: "讀者提案" }).select("id,title,status,risk_level,created_at").single();
    if (error) throw error;
    await admin.from("topic_sources").insert({ topic_id: data.id, source_type: "reader", source_title: title, excerpt: rationale || null });
    await saveIdempotent("propose-topic", key, user.id, data);
    return ok(data, 201, requestId);
  } catch (error) {
    const code = String(error?.message || error);
    if (code === "unauthorized") return fail("請先登入。", 401, code, requestId);
    if (code === "feature_disabled") return fail("平台目前暫停題材提案。", 503, code, requestId);
    if (code === "rate_limited") return fail("每天最多提出 3 個題材。", 429, code, requestId);
    console.error(error); return fail("題材暫時無法送出。", 500, "proposal_failed", requestId);
  }
});
