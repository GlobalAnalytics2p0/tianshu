import { body, fail, ok, options, serviceAuthorized } from "../_shared/http.ts";
import { budgetAvailable, createResponse, moderateText, recordUsage } from "../_shared/openai.ts";
import { admin } from "../_shared/supabase.ts";

const authorModel = Deno.env.get("OPENAI_AUTHOR_MODEL") || "gpt-5.4-mini";
const editorModel = Deno.env.get("OPENAI_EDITOR_MODEL") || "gpt-5.5";
const classifierModel = Deno.env.get("OPENAI_CLASSIFIER_MODEL") || "gpt-5.4-nano";

function claimedJob(data: any) {
  return Array.isArray(data) ? data[0] : data;
}

async function finishJob(job: any, status: "completed" | "failed", error: string | null = null) {
  if (status === "failed" && Number(job.attempts || 0) < 3) {
    const retryAt = new Date(Date.now() + (2 ** Number(job.attempts || 1)) * 60_000).toISOString();
    await admin.from("generation_jobs").update({
      status: "pending", available_at: retryAt, worker_id: null, started_at: null,
      completed_at: null, last_error: error
    }).eq("id", job.id);
    return;
  }
  await admin.from("generation_jobs").update({
    status,
    completed_at: new Date().toISOString(),
    last_error: error
  }).eq("id", job.id);
  if (status === "failed" && job.kind === "ai_session" && job.payload?.sessionId) {
    await admin.from("ai_sessions").update({ status: "failed", visibility: "internal", failure_reason: error }).eq("id", job.payload.sessionId);
  }
}

async function processAuthorReply(job: any) {
  const { roomId, messageId, bookId } = job.payload;
  const [{ data: readerMessage }, { data: book }, { data: persona }, { data: recent }] = await Promise.all([
    admin.from("messages").select("id,content,speaker_name").eq("id", messageId).single(),
    admin.from("books").select("id,title,author_name,category,premise,latest_chapter,latest_context,chapter_count").eq("id", bookId).single(),
    admin.from("personas").select("id,display_name,focus,system_prompt,prompt_version").eq("book_id", bookId).eq("is_active", true).single(),
    admin.from("messages").select("actor_kind,speaker_name,content,created_at").eq("room_id", roomId).eq("status", "visible").order("created_at", { ascending: false }).limit(10)
  ]);
  if (!readerMessage || !book || !persona) throw new Error("author_context_missing");
  const result = await createResponse({
    model: authorModel,
    instructions: `${persona.system_prompt}\n使用繁體中文，以 2–5 句具體回答。避免劇透、模板句、空話與跨書人格。`,
    input: JSON.stringify({ book, authorFocus: persona.focus, recentMessages: (recent || []).reverse(), readerMessage: readerMessage.content }),
    maxOutputTokens: 420
  });
  const moderation = await moderateText(result.text);
  const { error } = await admin.from("messages").insert({
    room_id: roomId,
    parent_id: messageId,
    persona_id: persona.id,
    actor_kind: "persona",
    speaker_name: persona.display_name,
    content: result.text.slice(0, 1600),
    status: moderation.flagged ? "quarantined" : "visible",
    moderation_labels: moderation.categories,
    citations: result.citations,
    openai_response_id: result.id
  });
  if (error) throw error;
  await recordUsage({ jobId: job.id, model: authorModel, operation: "author_reply", usage: result.usage, latencyMs: result.latencyMs });
}

async function processCouncil(job: any) {
  const sessionId = job.payload.sessionId;
  const { data: session } = await admin.from("ai_sessions").select("*,topics(*),rooms(*)").eq("id", sessionId).single();
  if (!session) throw new Error("session_not_found");
  const { data: participantRows } = await admin
    .from("ai_session_participants")
    .select("turn_order,personas(id,display_name,focus,system_prompt,prompt_version,accent,books(title,premise,latest_chapter))")
    .eq("session_id", sessionId)
    .order("turn_order");
  const participants = (participantRows || []).map((row: any) => row.personas).filter(Boolean);
  const { data: topicSources } = await admin.from("topic_sources")
    .select("source_title,source_url,excerpt,published_at")
    .eq("topic_id", session.topic_id)
    .order("created_at")
    .limit(8);
  if (participants.length < 2 || participants.length > 4) throw new Error("participant_count_invalid");
  const needsReview = session.topics.risk_level !== "normal";
  await admin.from("ai_sessions").update({
    status: "running",
    visibility: "internal",
    started_at: session.started_at || new Date().toISOString()
  }).eq("id", sessionId);

  const { data: existingRows } = await admin.from("messages")
    .select("speaker_name,content,turn_index,moderation_labels")
    .eq("session_id", sessionId)
    .not("turn_index", "is", null)
    .order("turn_index");
  const transcript: Array<{ speaker: string; content: string }> = (existingRows || []).map((row: any) => ({ speaker: row.speaker_name, content: row.content }));
  let flagged = false;
  const sessionCitations: Array<{ url: string; title: string }> = [];
  for (const row of existingRows || []) {
    flagged ||= Object.values(row.moderation_labels || {}).some(Boolean);
  }
  const turns = Math.min(Number(session.max_turns || 6), 6);
  const completedTurn = Math.max(0, ...(existingRows || []).map((row: any) => Number(row.turn_index || 0)));
  for (let turn = completedTurn + 1; turn <= turns; turn += 1) {
    const persona = participants[(turn - 1) % participants.length];
    const result = await createResponse({
      model: authorModel,
      instructions: `${persona.system_prompt}\n你正在參加天書 AI 議事廳。用繁體中文提出一個明確立場，回應前文但不要重複。最多 180 字，不可自行開新場次。`,
      input: JSON.stringify({ topic: session.topics.title, rationale: session.topics.rationale, approvedSources: topicSources || [], work: persona.books, focus: persona.focus, transcript: transcript.slice(-10) }),
      maxOutputTokens: 350,
      tools: needsReview ? [] : [{ type: "web_search" }]
    });
    const moderation = await moderateText(result.text);
    flagged ||= moderation.flagged;
    transcript.push({ speaker: persona.display_name, content: result.text });
    sessionCitations.push(...result.citations);
    const { error } = await admin.from("messages").insert({
      room_id: session.room_id,
      session_id: sessionId,
      persona_id: persona.id,
      actor_kind: "persona",
      speaker_name: persona.display_name,
      content: result.text.slice(0, 1600),
      status: "quarantined",
      turn_index: turn,
      moderation_labels: moderation.categories,
      citations: result.citations,
      openai_response_id: result.id
    });
    if (error) throw error;
    await admin.from("ai_sessions").update({ current_turn: turn }).eq("id", sessionId);
    await recordUsage({ jobId: job.id, sessionId, model: authorModel, operation: "council_turn", usage: result.usage, latencyMs: result.latencyMs });
  }

  const { data: editor } = await admin.from("personas").select("id,display_name,system_prompt").eq("role", "editor").eq("is_active", true).limit(1).single();
  if (!editor) throw new Error("editor_persona_missing");
  const summaryResult = await createResponse({
    model: editorModel,
    instructions: `${editor.system_prompt}\n使用繁體中文，將討論收斂成「共識、分歧、下一步」三段，總長 280 字內；不得增加對話中沒有的事實。`,
    input: JSON.stringify({ topic: session.topics.title, transcript }),
    maxOutputTokens: 520
  });
  const summaryModeration = await moderateText(summaryResult.text);
  flagged ||= summaryModeration.flagged;
  await admin.from("ai_sessions").update({
    status: "reviewing",
    visibility: "internal",
    editor_summary: summaryResult.text.slice(0, 1600),
    citations: Array.from(new Map(sessionCitations.map((citation) => [citation.url, citation])).values()).slice(0, 20),
    completed_at: new Date().toISOString()
  }).eq("id", sessionId);
  await recordUsage({ jobId: job.id, sessionId, model: editorModel, operation: "council_summary", usage: summaryResult.usage, latencyMs: summaryResult.latencyMs });
}

async function processFeedbackExtract(job: any) {
  const { data: message } = await admin
    .from("messages")
    .select("id,content,room_id,rooms(book_id)")
    .eq("id", job.payload.messageId)
    .single();
  if (!message || !message.rooms?.book_id) return;
  const result = await createResponse({
    model: classifierModel,
    instructions: "將繁體中文讀者留言分類。只輸出 JSON：{\"kind\":\"question|complaint|suggestion|topic_proposal|readability|none\",\"summary\":\"去識別化摘要\",\"confidence\":0到1}。不要輸出其他文字。",
    input: message.content,
    maxOutputTokens: 220,
    textFormat: {
      type: "json_schema",
      name: "feedback_classification",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          kind: { type: "string", enum: ["question", "complaint", "suggestion", "topic_proposal", "readability", "none"] },
          summary: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        },
        required: ["kind", "summary", "confidence"]
      }
    }
  });
  const jsonText = result.text.match(/\{[\s\S]*\}/)?.[0] || "{}";
  const parsed = JSON.parse(jsonText);
  const allowed = ["question", "complaint", "suggestion", "topic_proposal", "readability"];
  if (allowed.includes(parsed.kind)) {
    await admin.from("feedback_items").insert({
      message_id: message.id,
      book_id: message.rooms.book_id,
      kind: parsed.kind,
      excerpt: String(message.content).slice(0, 500),
      summary: String(parsed.summary || "").slice(0, 1200),
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0))
    });
  }
  await recordUsage({ jobId: job.id, model: classifierModel, operation: "feedback_extract", usage: result.usage, latencyMs: result.latencyMs });
}

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  if (!serviceAuthorized(req)) return fail("未授權的工作執行。", 401, "unauthorized", requestId);
  try {
    if (!(await budgetAvailable())) return fail("今日 AI 軟預算已達上限。", 429, "daily_budget_reached", requestId);
    const payload = await body<{ kind?: "author_reply" | "ai_session" }>(req).catch(() => ({}));
    const workerId = `edge-${crypto.randomUUID()}`;
    const { data, error } = await admin.rpc("claim_generation_job", { p_worker_id: workerId, p_kind: payload.kind || null });
    if (error) throw error;
    const job = claimedJob(data);
    if (!job?.id) return ok({ processed: false, reason: "queue_empty" }, 200, requestId);
    try {
      if (job.kind === "author_reply") await processAuthorReply(job);
      else if (job.kind === "ai_session") await processCouncil(job);
      else if (job.kind === "feedback_extract") await processFeedbackExtract(job);
      else throw new Error("unsupported_job_kind");
      await finishJob(job, "completed");
      return ok({ processed: true, jobId: job.id, kind: job.kind }, 200, requestId);
    } catch (error) {
      const errorCode = String(error?.message || error).slice(0, 1000);
      const failureModel = job.kind === "feedback_extract" ? classifierModel : authorModel;
      await recordUsage({ jobId: job.id, sessionId: job.payload?.sessionId, model: failureModel, operation: `${job.kind}_failed`, usage: {}, success: false, errorCode });
      await finishJob(job, "failed", errorCode);
      throw error;
    }
  } catch (error) {
    console.error(error); return fail("AI 工作執行失敗。", 500, "worker_failed", requestId);
  }
});
