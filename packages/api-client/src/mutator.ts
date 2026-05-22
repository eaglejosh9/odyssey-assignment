/**
 * Custom fetch mutator consumed by Orval's generated hooks.
 *
 * Centralizes:
 *   - base URL resolution (set via setApiBaseUrl on app startup)
 *   - JSON serialization
 *   - typed error throwing
 *
 * Frontend code should never call this directly; use the generated hooks.
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

type Options = {
  url: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function buildUrl(url: string, params?: Record<string, unknown>): string {
  const u = new URL(url.startsWith("http") ? url : `${baseUrl}${url}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) u.searchParams.append(k, String(item));
      } else {
        u.searchParams.set(k, String(v));
      }
    }
  }
  return u.toString();
}

export async function apiFetch<T>(options: Options): Promise<T> {
  const url = buildUrl(options.url, options.params);
  const init: RequestInit = {
    method: options.method,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      ...options.headers,
    },
    signal: options.signal,
  };
  if (options.data !== undefined) init.body = JSON.stringify(options.data);

  const res = await fetch(url, init);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? safeParse(text) : undefined;
  if (!res.ok) {
    throw new ApiHttpError(res.status, parsed as ApiErrorBody | undefined, url);
  }
  return parsed as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Orval expects the mutator default export shape for the bodyType utility.
export type ErrorType<E> = ApiHttpError & { body?: E };
export type BodyType<B> = B;
