/**
 * Fetch mutator consumed by Orval's generated client (`httpClient: "fetch"`).
 *
 * Orval emits code that calls:
 *
 *     apiFetch<TResponse>(url, requestInit)
 *
 * and expects `Promise<{ data, status, headers }>` back. We resolve the
 * base URL and convert non-2xx responses into a typed `ApiHttpError`.
 *
 * Frontend code never imports this directly — generated hooks (and the
 * small wrapper layer that gives them friendlier names) call it.
 */

let baseUrl = "http://localhost:8787";

export function setApiBaseUrl(url: string) {
  baseUrl = url.replace(/\/$/, "");
}

export function getApiBaseUrl() {
  return baseUrl;
}

export type ApiErrorBody = { error: string; code: string; details?: unknown };

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | undefined,
    public readonly url: string
  ) {
    super(body?.error ?? `HTTP ${status} at ${url}`);
  }
  get code() {
    return this.body?.code ?? "UNKNOWN";
  }
}

/**
 * The shape Orval's generated code expects every response to take.
 * Mirrors how Orval would wrap an axios/fetch response in `httpClient: "fetch"` mode.
 */
export type OrvalResponse<T> = { data: T; status: number; headers: Headers };

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const res = await fetch(fullUrl, {
    ...init,
    headers: {
      accept: "application/json",
      ...init?.headers,
    },
  });

  // 204 No Content
  if (res.status === 204) {
    return { data: undefined, status: 204, headers: res.headers } as T;
  }

  const text = await res.text();
  const parsed = text ? safeParse(text) : undefined;

  if (!res.ok) {
    throw new ApiHttpError(res.status, parsed as ApiErrorBody | undefined, fullUrl);
  }

  return { data: parsed, status: res.status, headers: res.headers } as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Orval references these via the mutator path.
export type ErrorType<E> = ApiHttpError & { body?: E };
export type BodyType<B> = B;