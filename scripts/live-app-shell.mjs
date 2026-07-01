import { setTimeout as delay } from "node:timers/promises";

function cacheBustedUrl(url) {
  const target = new URL(url);
  target.searchParams.set("shell_verify", `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return target;
}

export function extractModuleScriptSources(html) {
  const tags = String(html).match(/<script\b[^>]*>/gi) || [];
  const sources = [];

  for (const tag of tags) {
    const type = tag.match(/\btype\s*=\s*(["'])module\1/i);
    const source = tag.match(/\bsrc\s*=\s*(["'])([^"']+)\1/i);
    if (type && source) sources.push(source[2]);
  }

  return sources;
}

export function findViteBundleUrl(html, siteUrl) {
  const moduleSources = extractModuleScriptSources(html);
  const resolvedSources = moduleSources.map((source) => new URL(source, siteUrl));
  const rawEntry = resolvedSources.find((url) => /\/app\.js$/i.test(url.pathname));

  if (rawEntry) {
    throw new Error(`live app shell references unbundled entry ${rawEntry.pathname}`);
  }

  const bundle = resolvedSources.find((url) => /\/assets\/[^/]+-[A-Za-z0-9_-]+\.js$/i.test(url.pathname));
  if (!bundle) {
    const found = moduleSources.length > 0 ? moduleSources.join(", ") : "none";
    throw new Error(`live app shell does not reference a Vite hashed JavaScript bundle (module scripts: ${found})`);
  }

  return bundle;
}

export async function inspectLiveAppShell(siteUrl, fetchImpl = fetch) {
  const pageUrl = cacheBustedUrl(siteUrl);
  const pageResponse = await fetchImpl(pageUrl, {
    cache: "no-store",
    headers: {
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache"
    }
  });

  if (!pageResponse.ok) {
    throw new Error(`${pageUrl} returned HTTP ${pageResponse.status}`);
  }

  const html = await pageResponse.text();
  const bundleUrl = findViteBundleUrl(html, pageUrl);
  const bundleResponse = await fetchImpl(cacheBustedUrl(bundleUrl), {
    cache: "no-store",
    headers: {
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache"
    }
  });

  if (!bundleResponse.ok) {
    throw new Error(`${bundleUrl} returned HTTP ${bundleResponse.status}`);
  }

  const contentType = bundleResponse.headers.get("content-type") || "";
  if (!/(?:java|ecma)script/i.test(contentType)) {
    throw new Error(`${bundleUrl} returned unexpected content-type ${contentType || "unknown"}`);
  }

  return {
    pageUrl: pageUrl.href,
    bundleUrl: bundleUrl.href
  };
}

export async function verifyLiveAppShell({ siteUrl, timeoutMs, pollMs, onRetry = () => {} }) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";

  while (Date.now() <= deadline) {
    try {
      return await inspectLiveAppShell(siteUrl);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      onRetry(lastError);
    }

    await delay(pollMs);
  }

  throw new Error(lastError || "live app shell could not be verified before timeout");
}
