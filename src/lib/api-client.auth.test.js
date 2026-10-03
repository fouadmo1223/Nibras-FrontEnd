import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, getCsrfToken, onSessionExpired, setCsrfToken } from './api-client';

const ok = (data) => ({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data }) });
const fail = (status, code) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ success: false, error: { code, message: code } }),
});

beforeEach(() => setCsrfToken(null));
afterEach(() => vi.unstubAllGlobals());

describe('apiRequest — CSRF', () => {
  it('sends the CSRF token on writes but not on reads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    vi.stubGlobal('fetch', fetchMock);
    setCsrfToken('csrf-123');

    await apiRequest('/users/me');
    await apiRequest('/users/me', { method: 'PATCH', body: { name: 'x' } });

    expect(fetchMock.mock.calls[0][1].headers['X-CSRF-Token']).toBeUndefined();
    expect(fetchMock.mock.calls[1][1].headers['X-CSRF-Token']).toBe('csrf-123');
  });
});

describe('apiRequest — coordinated refresh', () => {
  it('refreshes once for concurrent expired requests, then retries each', async () => {
    let refreshed = false;
    const fetchMock = vi.fn((url) => {
      if (url.endsWith('/auth/refresh')) {
        refreshed = true;
        return Promise.resolve(ok({ csrfToken: 'new-csrf' }));
      }
      return Promise.resolve(refreshed ? ok({ url }) : fail(401, 'TOKEN_EXPIRED'));
    });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([apiRequest('/a'), apiRequest('/b')]);

    expect(a.data.url).toMatch(/\/a$/);
    expect(b.data.url).toMatch(/\/b$/);
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
    expect(getCsrfToken()).toBe('new-csrf');
  });

  it('retries a refresh once when another tab won the rotation race', async () => {
    const responses = [fail(401, 'TOKEN_EXPIRED'), fail(401, 'REFRESH_RACE'), ok({ csrfToken: 'c2' }), ok({ done: true })];
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responses.shift())));
    await expect(apiRequest('/x')).resolves.toMatchObject({ data: { done: true } });
  });

  it('notifies listeners and clears CSRF when the session cannot be refreshed', async () => {
    setCsrfToken('old');
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => Promise.resolve(url.endsWith('/auth/refresh') ? fail(401, 'SESSION_REVOKED') : fail(401, 'TOKEN_EXPIRED'))),
    );
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(apiRequest('/x')).rejects.toMatchObject({ code: 'SESSION_REVOKED' });
    expect(listener).toHaveBeenCalledOnce();
    expect(getCsrfToken()).toBeNull();
    unsubscribe();
  });

  it('refreshes on UNAUTHORIZED when the session hint cookie says a session should exist', async () => {
    document.cookie = 'nb_session=1';
    let refreshed = false;
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url.endsWith('/auth/refresh')) {
          refreshed = true;
          return Promise.resolve(ok({ csrfToken: 'c3' }));
        }
        return Promise.resolve(refreshed ? ok({ back: true }) : fail(401, 'UNAUTHORIZED'));
      }),
    );
    await expect(apiRequest('/auth/session')).resolves.toMatchObject({ data: { back: true } });
    document.cookie = 'nb_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('never refreshes for credential endpoints or non-expiry 401s', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fail(401, 'INVALID_CREDENTIALS'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiRequest('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

    fetchMock.mockResolvedValue(fail(401, 'UNAUTHORIZED'));
    await expect(apiRequest('/users/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/auth/refresh'))).toBe(false);
  });
});
