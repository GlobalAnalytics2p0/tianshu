import { body, fail, ok, options, serviceAuthorized } from "../_shared/http.ts";
import { moderateText } from "../_shared/openai.ts";

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  if (!serviceAuthorized(req)) return fail("未授權。", 401, "unauthorized", requestId);
  try {
    const { text } = await body<{ text: string }>(req);
    const value = String(text || "").trim();
    if (!value || value.length > 4000) return fail("內容長度不正確。", 422, "invalid_content", requestId);
    return ok(await moderateText(value), 200, requestId);
  } catch (error) {
    console.error(error); return fail("內容審核失敗。", 500, "moderation_failed", requestId);
  }
});
