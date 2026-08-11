import type { ApiResult } from "@/types";

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }

  const body = (await response.json().catch(() => null)) as ApiResult<T> | null;
  if (!body) {
    return { ok: false, error: `Request failed (${response.status})` };
  }
  return body;
}
