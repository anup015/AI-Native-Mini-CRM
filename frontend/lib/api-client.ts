import { AppError } from "@/lib/errors";

type RequestConfig = RequestInit & {
  timeoutMs?: number;
};

export async function apiClient<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 8000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(config.headers ?? {})
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new AppError(payload?.message ?? "Request failed", response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
