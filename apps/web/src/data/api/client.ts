export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = RequestInit & {
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT = 10_000;

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return value.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${getApiBaseUrl()}${normalizedPath}`;

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...fetchOptions.headers,
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof body === "object" && body !== null && "message" in body
          ? Array.isArray((body as { message?: unknown }).message)
            ? (body as { message: string[] }).message.join(", ")
            : String((body as { message?: unknown }).message)
          : `API request failed: ${response.status}`;

      throw new ApiError(message, response.status, body);
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }

    throw new ApiError(
      "Unable to connect to the tourism service",
      0,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
  },
};
