import { createClient } from "@supabase/supabase-js";

const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
const client = url && key ? createClient(url, key) : null;
const status = document.getElementById("adminStatus");
const login = document.getElementById("adminLogin");
const dashboard = document.getElementById("adminDashboard");
const signOut = document.getElementById("adminSignOut");

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function setStatus(message, type = "") {
  status.textContent = message;
  status.dataset.type = type;
}

async function requireAdmin() {
  if (!client) throw new Error("尚未設定 Supabase 環境變數。");
  const { data: sessionData } = await client.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;
  const { data: profile, error } = await client.from("profiles").select("id,display_name,role,is_suspended").eq("id", user.id).single();
  if (error || !profile || profile.is_suspended || !["moderator", "admin"].includes(profile.role)) throw new Error("此帳號沒有管理權限。");
  return profile;
}

async function loadDashboard() {
  const profile = await requireAdmin();
  if (!profile) {
    login.hidden = false;
    dashboard.hidden = true;
    signOut.hidden = true;
    return;
  }
  login.hidden = true;
  dashboard.hidden = false;
  signOut.hidden = false;
  const [{ data: flags }, { data: topics }, { data: personas }, { data: feedback }, { data: moderation }, { data: sessions }] = await Promise.all([
    client.from("feature_flags").select("key,enabled,description,updated_at").order("key"),
    client.from("topics").select("id,title,rationale,status,risk_level,source_label,trend_score,created_at").in("status", ["proposed", "approved", "scheduled"]).order("created_at", { ascending: false }).limit(40),
    client.from("personas").select("id,display_name,book_id,books(title)").eq("role", "persona").eq("is_active", true).order("display_name"),
    client.from("feedback_items").select("id,kind,status,summary,excerpt,book_id,books(title),created_at").in("status", ["pending", "approved"]).order("created_at", { ascending: false }).limit(50),
    client.from("messages").select("id,speaker_name,content,status,created_at,rooms(title)").eq("status", "quarantined").order("created_at", { ascending: false }).limit(50),
    client.from("ai_sessions").select("id,status,visibility,scheduled_for,editor_summary,failure_reason,topics(title)").order("scheduled_for", { ascending: false }).limit(20)
  ]);
  document.getElementById("adminSummary").innerHTML = `
    <article><strong>${(topics || []).filter((item) => item.status === "proposed").length}</strong><span>待審題材</span></article>
    <article><strong>${(feedback || []).filter((item) => item.status === "pending").length}</strong><span>待審回饋</span></article>
    <article><strong>${(moderation || []).length}</strong><span>隔離內容</span></article>
    <article><strong>${(sessions || []).filter((item) => item.status === "queued").length}</strong><span>已排程場次</span></article>
  `;
  renderFeatureFlags(flags || []);
  renderSessions(sessions || []);
  renderTopics(topics || [], personas || []);
  renderFeedback(feedback || []);
  renderModeration(moderation || []);
  bindActions();
  setStatus(`已登入：${profile.display_name}（${profile.role}）`, "ok");
}

function renderFeatureFlags(flags) {
  document.getElementById("adminFeatureFlags").innerHTML = `<div class="admin-flag-grid">${flags.map((flag) => `
    <article class="admin-flag ${flag.enabled ? "is-enabled" : ""}">
      <div><strong>${escapeHtml(flag.key)}</strong><p>${escapeHtml(flag.description)}</p></div>
      <button type="button" data-feature-flag="${escapeHtml(flag.key)}" data-feature-next="${String(!flag.enabled)}" aria-pressed="${String(flag.enabled)}">${flag.enabled ? "已開啟" : "已關閉"}</button>
    </article>`).join("")}</div>`;
}

function renderSessions(sessions) {
  document.getElementById("adminSessions").innerHTML = sessions.map((session) => `
    <article class="admin-row">
      <div><span>${escapeHtml(session.status)} · ${escapeHtml(new Date(session.scheduled_for).toLocaleString("zh-Hant-TW"))}</span><h3>${escapeHtml(session.topics?.title || "未命名場次")}</h3><p>${escapeHtml(session.editor_summary || session.failure_reason || "等待工作佇列執行")}</p></div>
      <div class="admin-row__actions">${session.status === "reviewing" ? `<button type="button" data-session-decision="publish" data-session-id="${session.id}">審核通過並發布</button><button type="button" data-session-decision="reject" data-session-id="${session.id}">退回</button>` : ""}</div>
    </article>
  `).join("") || `<p class="admin-empty">目前沒有 AI 場次。</p>`;
}

function renderTopics(topics, personas) {
  document.getElementById("adminTopics").innerHTML = topics.map((topic) => `
    <article class="admin-row admin-row--topic">
      <div><span>${escapeHtml(topic.source_label)} · ${escapeHtml(topic.risk_level)}</span><h3>${escapeHtml(topic.title)}</h3><p>${escapeHtml(topic.rationale || "沒有補充說明")}</p></div>
      <fieldset data-persona-picker="${topic.id}"><legend>選擇作者</legend>${personas.map((persona) => `<label><input type="checkbox" value="${persona.id}" />${escapeHtml(persona.display_name)}</label>`).join("")}</fieldset>
      <div class="admin-row__actions">
        ${topic.status === "proposed" ? `<button type="button" data-topic-status="approved" data-topic-id="${topic.id}">核准</button>` : ""}
        ${topic.status === "approved" ? `<button type="button" data-create-session="${topic.id}">建立場次</button>` : ""}
        <button type="button" data-topic-status="archived" data-topic-id="${topic.id}">封存</button>
      </div>
    </article>
  `).join("") || `<p class="admin-empty">目前沒有候選題材。</p>`;
}

function renderFeedback(items) {
  document.getElementById("adminFeedback").innerHTML = items.map((item) => `
    <article class="admin-row"><div><span>${escapeHtml(item.books?.title || "平台")} · ${escapeHtml(item.kind)}</span><h3>${escapeHtml(item.summary || item.excerpt)}</h3><p>${escapeHtml(item.excerpt)}</p></div><div class="admin-row__actions"><button type="button" data-feedback-status="approved" data-feedback-id="${item.id}">核准</button><button type="button" data-feedback-status="dismissed" data-feedback-id="${item.id}">忽略</button></div></article>
  `).join("") || `<p class="admin-empty">目前沒有待審回饋。</p>`;
}

function renderModeration(items) {
  document.getElementById("adminModeration").innerHTML = items.map((item) => `
    <article class="admin-row"><div><span>${escapeHtml(item.rooms?.title || "聊天室")} · ${escapeHtml(item.speaker_name)}</span><h3>${escapeHtml(item.content)}</h3></div><div class="admin-row__actions"><button type="button" data-message-status="visible" data-message-id="${item.id}">公開</button><button type="button" data-message-status="rejected" data-message-id="${item.id}">拒絕</button></div></article>
  `).join("") || `<p class="admin-empty">目前沒有隔離內容。</p>`;
}

function bindActions() {
  document.querySelectorAll("[data-feature-flag]").forEach((button) => button.addEventListener("click", async () => {
    const { error } = await client.from("feature_flags").update({ enabled: button.dataset.featureNext === "true" }).eq("key", button.dataset.featureFlag);
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
  document.querySelectorAll("[data-session-decision]").forEach((button) => button.addEventListener("click", async () => {
    const { error } = await client.rpc("admin_review_session", { p_session_id: button.dataset.sessionId, p_decision: button.dataset.sessionDecision });
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
  document.querySelectorAll("[data-topic-status]").forEach((button) => button.addEventListener("click", async () => {
    const { error } = await client.from("topics").update({ status: button.dataset.topicStatus }).eq("id", button.dataset.topicId);
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
  document.querySelectorAll("[data-create-session]").forEach((button) => button.addEventListener("click", async () => {
    const picker = document.querySelector(`[data-persona-picker="${button.dataset.createSession}"]`);
    const personaIds = Array.from(picker.querySelectorAll("input:checked")).map((input) => input.value);
    if (personaIds.length < 2 || personaIds.length > 4) return setStatus("請選擇 2–4 位作者。", "error");
    const { error } = await client.rpc("admin_create_session", { p_topic_id: button.dataset.createSession, p_persona_ids: personaIds, p_scheduled_for: new Date().toISOString(), p_visibility: "internal" });
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
  document.querySelectorAll("[data-feedback-status]").forEach((button) => button.addEventListener("click", async () => {
    const { error } = await client.from("feedback_items").update({ status: button.dataset.feedbackStatus }).eq("id", button.dataset.feedbackId);
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
  document.querySelectorAll("[data-message-status]").forEach((button) => button.addEventListener("click", async () => {
    const { error } = await client.from("messages").update({ status: button.dataset.messageStatus }).eq("id", button.dataset.messageId);
    if (error) return setStatus(error.message, "error");
    await loadDashboard();
  }));
}

document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!client) return setStatus("尚未設定 Supabase 環境變數。", "error");
  const email = String(new FormData(event.currentTarget).get("email") || "").trim();
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  if (error) return setStatus(error.message, "error");
  event.currentTarget.reset(); setStatus("登入連結已寄出。", "ok");
});
document.getElementById("adminSignOut").addEventListener("click", async () => { if (client) await client.auth.signOut(); window.location.reload(); });
document.addEventListener("click", (event) => { if (event.target.closest("[data-admin-refresh]")) void loadDashboard(); });

loadDashboard().catch((error) => setStatus(error.message, "error"));
