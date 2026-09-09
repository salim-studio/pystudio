/**
 * Safe fetch helper to prevent "Unexpected token 'T', 'The page c'... is not valid JSON"
 * errors when server or reverse proxy returns HTML/text error pages (e.g. 502/504 Bad Gateway).
 */

export interface SafeFetchResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
}

export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 30000
): Promise<SafeFetchResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      if (contentType.includes("application/json")) {
        const errorJson = await res.json().catch(() => null);
        const errMsg = errorJson?.message || errorJson?.error || `Server returned error (${res.status})`;
        return { ok: false, data: null, error: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg), status: res.status };
      } else {
        const text = await res.text().catch(() => "");
        const cleanMsg = text.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
        return {
          ok: false,
          data: null,
          error: cleanMsg.length > 0 && cleanMsg.length < 150
            ? cleanMsg
            : `Service temporarily unavailable (${res.status}). Please retry in a moment.`,
          status: res.status,
        };
      }
    }

    if (contentType.includes("application/json")) {
      const data = await res.json().catch((parseErr) => {
        throw new Error(`Invalid JSON format: ${parseErr.message}`);
      });
      return { ok: true, data, error: null, status: res.status };
    } else {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        data: null,
        error: `Unexpected response format from server (${contentType || "text"}).`,
        status: res.status,
      };
    }
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return {
        ok: false,
        data: null,
        error: "Request timed out. If running heavy tasks or installing large packages, please allow a moment and retry.",
        status: 408,
      };
    }
    return {
      ok: false,
      data: null,
      error: err.message || "Network request failed. Please check server connection.",
      status: 0,
    };
  }
}
