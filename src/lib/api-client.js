import { env } from './env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
/**
 * The page language (<html lang>, set from the route) — sent as Accept-Language so the
 * API answers with messages in the language the user is reading.
 */
const pageLocale = () => (typeof document !== 'undefined' && document.documentElement.lang) || 'en';
/** The API sets a readable `nb_session=1` cookie while a refresh token exists. */
const hasSessionHint = () => typeof document !== 'undefined' && /(?:^|;\s*)nb_session=1/.test(document.cookie);

/**
 * 401s worth one refresh attempt: an expired access token, or a missing/invalid one while
 * the session hint says a refresh token should still exist.
 */
const shouldRefresh = (error) =>
  error.code === 'TOKEN_EXPIRED' || (hasSessionHint() && ['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code));
const AUTH_PATHS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

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

// ─── CSRF ────────────────────────────────────────────────────────────────
// The API returns a session-bound CSRF token with login/register/refresh/session.
// It lives in memory only and is echoed on every state-changing request.
let csrfToken = null;
export const setCsrfToken = (token) => {
  csrfToken = token || null;
};
export const getCsrfToken = () => csrfToken;

// ─── Session-expired notification ────────────────────────────────────────
const expiredListeners = new Set();
/** Subscribe to "the session is gone" (refresh failed). Returns an unsubscribe function. */
export function onSessionExpired(listener) {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
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

async function send(path, { method = 'GET', body, query, headers, ...init }) {
  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Accept-Language': pageLocale(),
        // FormData (file uploads) sets its own multipart boundary header.
        ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(!SAFE_METHODS.has(method) && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        ...headers,
      },
      body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
      ...init,
    });
  } catch (cause) {
    throw new ApiError(0, { error: { code: 'NETWORK_ERROR', message: 'Unable to reach the server.' } }, { cause });
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) throw new ApiError(response.status, payload);
  // `message` is the API's user-facing confirmation text; clients show it as-is.
  return payload
    ? { data: payload.data, message: payload.message, meta: payload.meta }
    : { data: null, message: undefined, meta: undefined };
}

// ─── Coordinated refresh ─────────────────────────────────────────────────
// Concurrent 401s share one refresh request; a REFRESH_RACE (another tab
// rotated first — its new cookie is already in the jar) is retried once.
let refreshInFlight = null;

export function refreshSession() {
  refreshInFlight ??= (async () => {
    try {
      const { data } = await send('/auth/refresh', { method: 'POST' });
      setCsrfToken(data.csrfToken);
      return data;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'REFRESH_RACE') {
        const { data } = await send('/auth/refresh', { method: 'POST' });
        setCsrfToken(data.csrfToken);
        return data;
      }
      throw error;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * Single entry point for calls to the NestJS API. Unwraps the standard
 * `{ success, data, meta }` envelope and normalises failures into ApiError.
 * In the browser, an expired access token triggers one refresh and a retry.
 *
 * Extra `init` options (e.g. `next: { tags }`, `cache`) pass straight to fetch.
 */
export function apiRequest(path, options = {}) {
  return withRefresh(path, () => send(path, options));
}

/** Runs a request; on an expired session, refreshes once (shared across callers) and retries. */
async function withRefresh(path, run) {
  try {
    return await run();
  } catch (error) {
    const canRefresh =
      typeof window !== 'undefined' &&
      error instanceof ApiError &&
      error.status === 401 &&
      shouldRefresh(error) &&
      !AUTH_PATHS_WITHOUT_REFRESH.some((p) => path.startsWith(p));
    if (!canRefresh) throw error;

    try {
      await refreshSession();
    } catch (refreshError) {
      setCsrfToken(null);
      expiredListeners.forEach((listener) => listener(refreshError));
      throw refreshError;
    }
    return run();
  }
}

/** XHR transport for uploads: fetch can't report upload progress. Same envelope, CSRF and errors. */
function sendWithProgress(path, { method, body, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, buildUrl(path));
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Accept-Language', pageLocale());
    if (csrfToken) xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let payload = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = null;
      }
      if (xhr.status < 200 || xhr.status >= 300 || payload?.success === false) {
        reject(new ApiError(xhr.status, payload));
      } else {
        resolve({ data: payload?.data ?? null, message: payload?.message, meta: payload?.meta });
      }
    };
    xhr.onerror = () =>
      reject(new ApiError(0, { error: { code: 'NETWORK_ERROR', message: 'Unable to reach the server.' } }));
    xhr.send(body);
  });
}

/**
 * Multipart upload with progress: `onProgress(percent)` fires as bytes leave the
 * browser (0–100). Server-side processing happens after it reaches 100.
 */
export function apiUpload(path, formData, { method = 'PUT', onProgress } = {}) {
  return withRefresh(path, () => {
    onProgress?.(0);
    return sendWithProgress(path, { method, body: formData, onProgress });
  });
}
