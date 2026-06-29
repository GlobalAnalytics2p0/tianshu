import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

export const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function requireUser(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("unauthorized");
  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) throw new Error("unauthorized");
  const { data: profile } = await admin.from("profiles").select("id,display_name,role,is_suspended").eq("id", data.user.id).single();
  if (!profile || profile.is_suspended) throw new Error("suspended");
  return { user: data.user, profile, client: userClient };
}

export async function requireFeature(key: string) {
  const { data, error } = await admin.from("feature_flags").select("enabled").eq("key", key).single();
  if (error || !data?.enabled) throw new Error("feature_disabled");
}

export async function getIdempotent(operation: string, key: string, userId: string) {
  const { data } = await admin
    .from("idempotency_keys")
    .select("response")
    .eq("key", key)
    .eq("operation", operation)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data?.response ?? null;
}

export async function saveIdempotent(operation: string, key: string, userId: string, response: unknown) {
  const { error } = await admin.from("idempotency_keys").upsert({ key, operation, user_id: userId, response });
  if (error) throw error;
}

export async function enforceQuota(table: string, userColumn: string, userId: string, since: Date, maximum: number, filters: Record<string, unknown> = {}) {
  let query = admin.from(table).select("id", { count: "exact", head: true }).eq(userColumn, userId).gte("created_at", since.toISOString());
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count, error } = await query;
  if (error) throw error;
  if ((count || 0) >= maximum) throw new Error("rate_limited");
}
