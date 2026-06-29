import { createClient } from "@supabase/supabase-js";

function apiError(error, fallback = "服務暫時無法使用") {
  return {
    message: error?.message || fallback,
    code: error?.code || "platform_error"
  };
}

export function createPlatformApi() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
  const publishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
  const configured = Boolean(url && publishableKey);
  const client = configured
    ? createClient(url, publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        realtime: { params: { eventsPerSecond: 8 } }
      })
    : null;

  async function readView(name, limit = 20) {
    if (!client) return [];
    const { data, error } = await client.from(name).select("*").limit(limit);
    if (error) throw apiError(error);
    return data || [];
  }

  async function invoke(name, body, idempotencyKey = crypto.randomUUID()) {
    if (!client) throw apiError(null, "多人服務尚未連接");
    const { data, error } = await client.functions.invoke(name, {
      body,
      headers: { "Idempotency-Key": idempotencyKey }
    });
    if (error) throw apiError(error);
    if (data?.error) throw apiError(data.error);
    return data?.data ?? data;
  }

  return {
    configured,
    client,
    async getHomeData() {
      if (!client) return null;
      const [home, authors, topics, latestBooks, featureRows] = await Promise.all([
        readView("v_home_feed", 1),
        readView("v_author_leaderboard", 5),
        readView("v_hot_topics", 12),
        readView("v_latest_chapters", 5),
        readView("feature_flags", 10)
      ]);
      return {
        mode: "live", session: home[0] || null, authors, topics, latestBooks,
        flags: Object.fromEntries(featureRows.map((flag) => [flag.key, Boolean(flag.enabled)]))
      };
    },
    async getRoomMessages(roomId, cursor = null) {
      if (!client || !roomId) return [];
      let query = client
        .from("messages")
        .select("id,room_id,actor_kind,speaker_name,content,parent_id,created_at,turn_index,citations")
        .eq("room_id", roomId)
        .eq("status", "visible")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(50);
      if (cursor?.createdAt && cursor?.id) {
        query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);
      }
      const { data, error } = await query;
      if (error) throw apiError(error);
      return (data || []).reverse();
    },
    async getBookRoom(bookId) {
      if (!client) return null;
      const { data, error } = await client
        .from("rooms")
        .select("id,book_id,slug,title")
        .eq("kind", "book")
        .eq("book_id", bookId)
        .eq("is_public", true)
        .maybeSingle();
      if (error) throw apiError(error);
      return data;
    },
    sendMessage(payload) {
      return invoke("send-message", payload);
    },
    requestAuthorReply(payload) {
      return invoke("request-author-reply", payload);
    },
    proposeTopic(payload) {
      return invoke("propose-topic", payload);
    },
    voteTopic(payload) {
      return invoke("vote-topic", payload);
    },
    reportContent(payload) {
      return invoke("report-content", payload);
    },
    reactMessage(payload) {
      return invoke("react-message", payload);
    },
    trackEvent(payload) {
      return invoke("track-event", payload, `${payload.clientId}:${payload.metric}:${payload.bookId || payload.topicId}:${payload.scope || ""}`);
    },
    async getSession() {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data?.session || null;
    },
    async signInWithEmail(email) {
      if (!client) throw apiError(null, "多人服務尚未連接");
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw apiError(error);
    },
    async signInWithGoogle() {
      if (!client) throw apiError(null, "多人服務尚未連接");
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin }
      });
      if (error) throw apiError(error);
    },
    async signOut() {
      if (!client) return;
      const { error } = await client.auth.signOut();
      if (error) throw apiError(error);
    },
    onAuthChange(callback) {
      if (!client) return () => {};
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
      return () => data.subscription.unsubscribe();
    },
    subscribeToRoom(roomId, callback) {
      if (!client || !roomId) return () => {};
      const channel = client
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
          ({ new: message }) => {
            if (message.status === "visible") callback(message);
          }
        )
        .subscribe();
      return () => client.removeChannel(channel);
    },
    async subscribeToCouncil(callback) {
      if (!client) return () => {};
      const { data: room } = await client.from("rooms").select("id").eq("slug", "ai-council").maybeSingle();
      if (!room?.id) return () => {};
      const channel = client
        .channel(`council:${room.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `room_id=eq.${room.id}` }, callback)
        .on("postgres_changes", { event: "*", schema: "public", table: "ai_sessions", filter: `room_id=eq.${room.id}` }, callback)
        .subscribe();
      return () => client.removeChannel(channel);
    }
  };
}
