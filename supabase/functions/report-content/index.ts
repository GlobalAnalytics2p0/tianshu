import { body, fail, ok, options } from "../_shared/http.ts";
import { admin, getIdempotent, requireUser, saveIdempotent } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const { user } = await requireUser(req);
    const key = req.headers.get("Idempotency-Key") || crypto.randomUUID();
    const cached = await getIdempotent("report-content", key, user.id);
    if (cached) return ok(cached, 200, requestId);
    const payload = await body<{ messageId: string; reason: string; detail?: string }>(req);
    const allowed = ["spam", "harassment", "unsafe", "misinformation", "other"];
    if (!payload.messageId || !allowed.includes(payload.reason)) return fail("檢舉理由不正確。", 422, "invalid_report", requestId);
    const { data, error } = await admin.from("reports").upsert({
      message_id: payload.messageId,
      reporter_id: user.id,
      reason: payload.reason,
      detail: String(payload.detail || "").slice(0, 500)
    }, { onConflict: "message_id,reporter_id" }).select("id,status").single();
    if (error) throw error;
    const { count } = await admin.from("reports").select("id", { count: "exact", head: true }).eq("message_id", payload.messageId).eq("status", "open");
    if ((count || 0) >= 3) await admin.from("messages").update({ status: "quarantined" }).eq("id", payload.messageId).eq("status", "visible");
    await saveIdempotent("report-content", key, user.id, data);
    return ok(data, 201, requestId);
  } catch (error) {
    if (String(error?.message) === "unauthorized") return fail("請先登入。", 401, "unauthorized", requestId);
    console.error(error); return fail("檢舉暫時無法送出。", 500, "report_failed", requestId);
  }
});
