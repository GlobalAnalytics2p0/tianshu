export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, idempotency-key, x-cron-secret, x-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
};

export function json(data: unknown, status = 200, requestId = crypto.randomUUID()) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "X-Request-Id": requestId }
  });
}

export function ok(data: unknown, status = 200, requestId?: string) {
  return json({ data, error: null, requestId: requestId || crypto.randomUUID() }, status, requestId);
}

export function fail(message: string, status = 400, code = "bad_request", requestId?: string) {
  return json({ data: null, error: { message, code }, requestId: requestId || crypto.randomUUID() }, status, requestId);
}

export function options(req: Request) {
  return req.method === "OPTIONS" ? new Response("ok", { headers: corsHeaders }) : null;
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  if (req.method !== "POST") throw new Error("method_not_allowed");
  return await req.json() as T;
}

export function serviceAuthorized(req: Request, secretName = "CRON_SECRET") {
  const expected = Deno.env.get(secretName) || "";
  const headerName = secretName === "SYNC_SECRET" ? "x-sync-secret" : "x-cron-secret";
  const actual = req.headers.get(headerName) || "";
  if (!expected || expected.length !== actual.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ actual.charCodeAt(index);
  }
  return difference === 0;
}
