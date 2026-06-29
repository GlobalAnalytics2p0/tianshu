import { body, fail, ok, options } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  try {
    const payload = await body<{ bookId?: string; topicId?: string; metric: string; clientId: string; scope?: string }>(req);
    const metric = String(payload.metric || "");
    const clientId = String(payload.clientId || "");
    const scope = String(payload.scope || "").slice(0, 120);
    const bookMetric = ["engaged_reader", "chapter_complete"].includes(metric);
    const topicMetric = ["search", "topic_view"].includes(metric);
    if ((!bookMetric && !topicMetric) || (bookMetric && !payload.bookId) || (topicMetric && !payload.topicId) || clientId.length < 16 || clientId.length > 120) {
      return fail("分析事件格式不正確。", 422, "invalid_event", requestId);
    }
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const fingerprintHash = await sha256(clientId);
    const targetKey = bookMetric ? `book:${payload.bookId}` : `topic:${payload.topicId}`;
    const { error: eventError } = await admin.from("analytics_event_keys").insert({
      day, fingerprint_hash: fingerprintHash, target_key: targetKey, metric, scope
    });
    if (eventError?.code === "23505") return ok({ accepted: false, duplicate: true }, 200, requestId);
    if (eventError) throw eventError;
    const { error } = await admin.rpc("increment_analytics_metric", {
      p_metric: metric, p_book_id: payload.bookId || null, p_topic_id: payload.topicId || null
    });
    if (error) throw error;
    return ok({ accepted: true, duplicate: false }, 202, requestId);
  } catch (error) {
    console.error(error); return fail("匿名分析事件暫時無法記錄。", 500, "analytics_failed", requestId);
  }
});
