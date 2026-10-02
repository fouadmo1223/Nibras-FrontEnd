import { env } from './env';

/** Error raised for any non-2xx API response, carrying the API error envelope. */
export class ApiError extends Error {
  constructor(status, body, options) {
    super(body?.error?.message || `Request failed with status ${status}`, options);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code || 'UNKNOWN_ERROR';
    this.details = body?.error?.details;
    this.requestId = body?.meta?.requestId;
  }
}

function buildUrl(path, query) {
  const url = new URL(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Single entry point for calls to the NestJS API. Unwraps the standard
 * `{ success, data, meta }` envelope and normalises failures into ApiError.
 *
 * Extra `init` options (e.g. `next: { tags }`, `cache`) pass straight to fetch.
 */
export async function apiRequest(path, { method = 'GET', body, query, headers, ...init } = {}) {
  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    });
  } catch (cause) {
    throw new ApiError(0, { error: { code: 'NETWORK_ERROR', message: 'Unable to reach the server.' } }, { cause });
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) throw new ApiError(response.status, payload);
  return payload ? { data: payload.data, meta: payload.meta } : { data: null, meta: undefined };
}
