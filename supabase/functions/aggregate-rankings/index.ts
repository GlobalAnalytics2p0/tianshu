import { fail, ok, options, serviceAuthorized } from "../_shared/http.ts";
import { admin } from "../_shared/supabase.ts";

function clamp(value: number) { return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)); }

function normalize(values: number[], value: number) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (!Number.isFinite(minimum) || maximum === minimum) return maximum > 0 ? 50 : 0;
  return clamp(((value - minimum) / (maximum - minimum)) * 100);
}

Deno.serve(async (req) => {
  const preflight = options(req); if (preflight) return preflight;
  const requestId = crypto.randomUUID();
  if (!serviceAuthorized(req)) return fail("未授權。", 401, "unauthorized", requestId);
  try {
    const today = new Date();
    const recentStart = new Date(today.getTime() - 7 * 86400000);
    const previousStart = new Date(today.getTime() - 14 * 86400000);
    const [{ data: personas, error }, { data: topics, error: topicsError }, { data: topicSessions, error: sessionsError }, { data: topicMetrics, error: topicMetricsError }] = await Promise.all([
      admin.from("personas").select("id,book_id").eq("role", "persona").eq("is_active", true),
      admin.from("topics").select("id,created_at").in("status", ["approved", "scheduled", "discussed"]),
      admin.from("ai_sessions").select("topic_id,messages(reactions(user_id,created_at))").gte("created_at", recentStart.toISOString()),
      admin.from("analytics_daily").select("day,topic_id,metric,value").eq("metric", "search").gte("day", previousStart.toISOString().slice(0, 10))
    ]);
    if (error || topicsError || sessionsError || topicMetricsError) throw error || topicsError || sessionsError || topicMetricsError;
    const participantCounts = new Map<string, Set<string>>();
    for (const topicSession of topicSessions || []) {
      if (!participantCounts.has(topicSession.topic_id)) participantCounts.set(topicSession.topic_id, new Set());
      for (const message of topicSession.messages || []) {
        for (const reaction of message.reactions || []) participantCounts.get(topicSession.topic_id)?.add(reaction.user_id);
      }
    }
    const countValues = (topics || []).map((topic) => participantCounts.get(topic.id)?.size || 0);
    const recentDay = recentStart.toISOString().slice(0, 10);
    const searchGrowthValues = (topics || []).map((topic) => {
      const rows = (topicMetrics || []).filter((metric) => metric.topic_id === topic.id);
      const recentSearches = rows.filter((metric) => metric.day >= recentDay).reduce((sum, metric) => sum + Number(metric.value || 0), 0);
      const previousSearches = rows.filter((metric) => metric.day < recentDay).reduce((sum, metric) => sum + Number(metric.value || 0), 0);
      return previousSearches === 0 ? (recentSearches > 0 ? 100 : 0) : ((recentSearches - previousSearches) / previousSearches) * 100;
    });
    const topicUpdates = await Promise.all((topics || []).map((topic, index) => admin.from("topics").update({
      search_growth: normalize(searchGrowthValues, searchGrowthValues[index] || 0),
      participant_score: normalize(countValues, participantCounts.get(topic.id)?.size || 0),
      recency_score: clamp(100 - Math.floor((today.getTime() - new Date(topic.created_at).getTime()) / 86400000) * 10)
    }).eq("id", topic.id)));
    const topicUpdateError = topicUpdates.find((result) => result.error)?.error;
    if (topicUpdateError) throw topicUpdateError;
    const rawRows: any[] = [];
    for (const persona of personas || []) {
      const [{ data: metrics }, { data: messages }] = await Promise.all([
        admin.from("analytics_daily").select("day,metric,value").eq("persona_id", persona.id).gte("day", previousStart.toISOString().slice(0, 10)),
        admin.from("messages").select("id,reactions(kind,user_id,created_at)").eq("persona_id", persona.id).eq("status", "visible").gte("created_at", previousStart.toISOString())
      ]);
      const recent = (metrics || []).filter((item) => item.day >= recentStart.toISOString().slice(0, 10));
      const sum = (items: any[], metric: string) => items.filter((item) => item.metric === metric).reduce((total, item) => total + Number(item.value || 0), 0);
      const readerStarts = sum(recent, "engaged_reader");
      const completionRaw = sum(recent, "chapter_complete");
      const reactions = (messages || []).flatMap((message: any) => message.reactions || []);
      const recentReactions = reactions.filter((reaction: any) => new Date(reaction.created_at).getTime() >= recentStart.getTime());
      const previousReactions = reactions.filter((reaction: any) => {
        const createdAt = new Date(reaction.created_at).getTime();
        return createdAt >= previousStart.getTime() && createdAt < recentStart.getTime();
      });
      const engagedRaw = new Set(recentReactions.map((reaction: any) => reaction.user_id)).size;
      const previousEngaged = new Set(previousReactions.map((reaction: any) => reaction.user_id)).size;
      const helpful = recentReactions.filter((reaction: any) => reaction.kind === "helpful").length;
      const reactionCount = recentReactions.length;
      if (engagedRaw + completionRaw + previousEngaged + reactionCount + readerStarts === 0) continue;
      rawRows.push({
        persona_id: persona.id,
        engaged_readers: engagedRaw,
        helpful_ratio: (helpful / Math.max(1, reactionCount)) * 100,
        completion_rate: (completionRaw / Math.max(1, readerStarts)) * 100,
        growth_rate: previousEngaged === 0 ? (engagedRaw > 0 ? 100 : 0) : ((engagedRaw - previousEngaged) / previousEngaged) * 100
      });
    }
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
    const dimensions = ["engaged_readers", "helpful_ratio", "completion_rate", "growth_rate"];
    const rows = rawRows.map((raw) => ({
      day,
      persona_id: raw.persona_id,
      ...Object.fromEntries(dimensions.map((dimension) => [dimension, normalize(rawRows.map((item) => Number(item[dimension])), Number(raw[dimension]))]))
    }));
    if (rows.length) {
      const { error: upsertError } = await admin.from("author_scores_daily").upsert(rows, { onConflict: "day,persona_id" });
      if (upsertError) throw upsertError;
    }
    return ok({ updated: rows.length, day }, 200, requestId);
  } catch (error) {
    console.error(error); return fail("排行聚合失敗。", 500, "aggregation_failed", requestId);
  }
});
