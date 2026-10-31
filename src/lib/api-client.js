import { env } from './env';
import { tokenStorage } from './token-storage';

/**
 * The page language (<html lang>, set from the route) — sent as Accept-Language so the
 * API answers with messages in the language the user is reading.
 */
const pageLocale = () => (typeof document !== 'undefined' && document.documentElement.lang) || 'en';

/**
 * 401s worth one refresh attempt: an expired access token, or a missing/invalid one while
 * a refresh token is still in storage (e.g. a fresh tab, before the in-memory access token
 * has been restored).
 */
const shouldRefresh = (error) =>
  error.code === 'TOKEN_EXPIRED' ||
  (Boolean(tokenStorage.getRefreshToken()) && ['UNAUTHORIZED', 'SESSION_EXPIRED'].includes(error.code));
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
  const accessToken = tokenStorage.getAccessToken();
  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: 'application/json',
        'Accept-Language': pageLocale(),
        // Tokens, never cookies: the site, dashboard and API are three separate origins
        // with no shared parent domain, so SameSite cookie auth can't work here at all.
        'X-Auth-Transport': 'token',
        'X-Client-Type': 'web',
        // FormData (file uploads) sets its own multipart boundary header.
        ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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

/** Persists a token-transport auth response (login/register/refresh). */
export function storeSession(data) {
  tokenStorage.setAccessToken(data.accessToken);
  tokenStorage.setRefreshToken(data.refreshToken);
  return data;
}

// ─── Coordinated refresh ─────────────────────────────────────────────────
// One refresh at a time: concurrent 401s (incl. across tabs, since the refresh token lives
// in localStorage, shared per-origin) await the same promise, so a rotated refresh token is
// never presented twice (which the API treats as theft — REFRESH_RACE below is that timing
// collision, not actual reuse: another tab's refresh already won and rotated the token).
let refreshInFlight = null;

export function refreshSession() {
  refreshInFlight ??= (async () => {
    const attempt = async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError(401, { error: { code: 'REFRESH_TOKEN_INVALID', message: 'Not signed in.' } });
      }
      const { data } = await send('/auth/refresh', { method: 'POST', body: { refreshToken } });
      return storeSession(data);
    };
    try {
      return await attempt();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'REFRESH_RACE') return attempt();
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
      tokenStorage.clear();
      expiredListeners.forEach((listener) => listener(refreshError));
      throw refreshError;
    }
    return run();
  }
}

/** XHR transport for uploads: fetch can't report upload progress. Same envelope and errors. */
function sendWithProgress(path, { method, body, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, buildUrl(path));
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Accept-Language', pageLocale());
    xhr.setRequestHeader('X-Auth-Transport', 'token');
    xhr.setRequestHeader('X-Client-Type', 'web');
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
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
