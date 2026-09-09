/**
 * Safe fetch helper to prevent "Unexpected token 'T', 'The page c'... is not valid JSON"
 * and edge proxy 404/502/504 errors when server or reverse proxy returns HTML/text.
 */

export interface SafeFetchResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
}

function cleanErrorMessage(rawText: string, status: number): string {
  // Detect known edge reverse-proxy errors (Vercel, Cloud Run, Cloudflare, Nginx)
  if (
    rawText.includes("cdg1::") ||
    rawText.includes("NOT_FOUND") ||
    rawText.includes("The page could not be found") ||
    rawText.includes("Bad Gateway") ||
    rawText.includes("Gateway Timeout")
  ) {
    return `Server is temporarily reconnecting or busy (${status || "proxy"}). Please try again in a moment.`;
  }

  const clean = rawText.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  if (clean.length > 0 && clean.length < 200) {
    return clean;
  }
  return `Service temporarily unavailable (${status}). Please try again.`;
}

export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 30000,
  retries: number = 4
): Promise<SafeFetchResult<T>> {
  let attempt = 0;

  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        credentials: "include",
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timer);
      const contentType = res.headers.get("content-type") || "";

      // If response is not OK
      if (!res.ok) {
        // If it's a transient proxy/container restart error (404/502/503/504) and we have retries left, wait and retry
        if (
          (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) &&
          attempt <= retries
        ) {
          const delay = Math.min(attempt * 1000, 3000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (contentType.includes("application/json")) {
          const errorJson = await res.json().catch(() => null);
          const errMsg = errorJson?.message || errorJson?.error || `Server returned error (${res.status})`;
          return {
            ok: false,
            data: errorJson,
            error: typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg),
            status: res.status,
          };
        } else {
          const text = await res.text().catch(() => "");
          return {
            ok: false,
            data: null,
            error: cleanErrorMessage(text, res.status),
            status: res.status,
          };
        }
      }

      // Response is OK (200-299)
      if (contentType.includes("application/json")) {
        const data = await res.json().catch((parseErr) => {
          throw new Error(`Invalid JSON format: ${parseErr.message}`);
        });
        return { ok: true, data, error: null, status: res.status };
      } else {
        const text = await res.text().catch(() => "");
        // If endpoint returned non-JSON text unexpectedly
        return {
          ok: false,
          data: null,
          error: cleanErrorMessage(text, res.status),
          status: res.status,
        };
      }
    } catch (err: any) {
      clearTimeout(timer);

      // If aborted by timeout or network failure and retries left, wait and retry
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        continue;
      }

      if (err.name === "AbortError") {
        return {
          ok: false,
          data: null,
          error: "Request timed out. If installing large packages or running heavy computation, please allow a moment and try again.",
          status: 408,
        };
      }
      return {
        ok: false,
        data: null,
        error: err.message || "Network request failed. Please check connection.",
        status: 0,
      };
    }
  }

  return {
    ok: false,
    data: null,
    error: "Connection failed after multiple attempts. Please try again.",
    status: 500,
  };
}

