import { admin } from "./supabase.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY") || "";
const apiBase = "https://api.openai.com/v1";

function headers() {
  if (!apiKey) throw new Error("openai_not_configured");
  return { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

export async function moderateText(input: string) {
  const response = await fetch(`${apiBase}/moderations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: "omni-moderation-latest", input })
  });
  if (!response.ok) throw new Error(`moderation_${response.status}`);
  const data = await response.json();
  const result = data.results?.[0] || {};
  return { flagged: Boolean(result.flagged), categories: result.categories || {}, scores: result.category_scores || {} };
}

export async function createResponse({
  model,
  instructions,
  input,
  maxOutputTokens = 500,
  tools = [],
  textFormat
}: {
  model: string;
  instructions: string;
  input: string;
  maxOutputTokens?: number;
  tools?: Array<Record<string, unknown>>;
  textFormat?: Record<string, unknown>;
}) {
  const startedAt = Date.now();
  const response = await fetch(`${apiBase}/responses`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model, instructions, input, max_output_tokens: maxOutputTokens, tools, store: false,
      ...(textFormat ? { text: { format: textFormat } } : {})
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.code || `responses_${response.status}`);
  const content = data.output?.flatMap((item: any) => item.content || []) || [];
  const text = String(data.output_text || content.find((item: any) => item.type === "output_text")?.text || "").trim();
  if (!text) throw new Error("empty_model_output");
  const citations = content.flatMap((item: any) => item.annotations || [])
    .filter((annotation: any) => annotation.type === "url_citation" && annotation.url)
    .map((annotation: any) => ({ url: String(annotation.url).slice(0, 1000), title: String(annotation.title || annotation.url).slice(0, 200) }));
  return { id: data.id as string, text, citations, usage: data.usage || {}, latencyMs: Date.now() - startedAt };
}

const defaultModelRates: Record<string, { input: number; output: number }> = {
  "gpt-5.5": { input: 5, output: 30 },
  "gpt-5.4-mini": { input: 0.75, output: 4.5 },
  "gpt-5.4-nano": { input: 0.2, output: 1.25 }
};

function estimatedCost(model: string, usage: Record<string, number> = {}) {
  const rate = defaultModelRates[model] || defaultModelRates["gpt-5.4-mini"];
  const inputTokens = Number(usage.input_tokens || 0);
  const outputTokens = Number(usage.output_tokens || 0);
  return Number((((inputTokens * rate.input) + (outputTokens * rate.output)) / 1_000_000).toFixed(6));
}

export async function recordUsage({ jobId, sessionId, model, operation, usage, latencyMs, success = true, errorCode = null }: any) {
  await admin.from("ai_run_usage").insert({
    job_id: jobId || null,
    session_id: sessionId || null,
    model,
    operation,
    input_tokens: usage?.input_tokens || 0,
    output_tokens: usage?.output_tokens || 0,
    latency_ms: latencyMs || null,
    estimated_cost_usd: estimatedCost(model, usage),
    success,
    error_code: errorCode
  });
}

export async function budgetAvailable() {
  const taipeiOffsetMs = 8 * 60 * 60 * 1000;
  const taipeiNow = new Date(Date.now() + taipeiOffsetMs);
  taipeiNow.setUTCHours(0, 0, 0, 0);
  const start = new Date(taipeiNow.getTime() - taipeiOffsetMs);
  const { data } = await admin.from("ai_run_usage").select("estimated_cost_usd").gte("created_at", start.toISOString());
  const total = (data || []).reduce((sum, row) => sum + Number(row.estimated_cost_usd || 0), 0);
  return total < Number(Deno.env.get("AI_DAILY_SOFT_BUDGET_USD") || 5);
}
