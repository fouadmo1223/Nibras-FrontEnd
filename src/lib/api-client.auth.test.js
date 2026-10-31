import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, onSessionExpired } from './api-client';
import { tokenStorage } from './token-storage';

const ok = (data) => ({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data }) });
const fail = (status, code) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ success: false, error: { code, message: code } }),
});

beforeEach(() => tokenStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  tokenStorage.clear();
});

describe('apiRequest — token transport', () => {
  it('sends the access token as a Bearer header once stored, and the transport headers on every request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    vi.stubGlobal('fetch', fetchMock);
    tokenStorage.setAccessToken('access-123');

    await apiRequest('/users/me');

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer access-123');
    expect(headers['X-Auth-Transport']).toBe('token');
    expect(headers['X-Client-Type']).toBe('web');
  });

  it('omits Authorization when no access token is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/courses');

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});

describe('apiRequest — coordinated refresh', () => {
  it('refreshes once for concurrent expired requests, then retries each, storing the new tokens', async () => {
    tokenStorage.setAccessToken('stale');
    tokenStorage.setRefreshToken('refresh-1');
    let refreshed = false;
    const fetchMock = vi.fn((url) => {
      if (url.endsWith('/auth/refresh')) {
        refreshed = true;
        return Promise.resolve(ok({ accessToken: 'fresh', refreshToken: 'refresh-2' }));
      }
      return Promise.resolve(refreshed ? ok({ url }) : fail(401, 'TOKEN_EXPIRED'));
    });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([apiRequest('/a'), apiRequest('/b')]);

    expect(a.data.url).toMatch(/\/a$/);
    expect(b.data.url).toMatch(/\/b$/);
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
    expect(tokenStorage.getAccessToken()).toBe('fresh');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-2');
    // The refresh call itself carries the stored refresh token in its body, not a cookie.
    const refreshCall = fetchMock.mock.calls.find(([url]) => url.endsWith('/auth/refresh'));
    expect(JSON.parse(refreshCall[1].body)).toEqual({ refreshToken: 'refresh-1' });
  });

  it('retries a refresh once when another tab won the rotation race', async () => {
    tokenStorage.setRefreshToken('refresh-1');
    const responses = [fail(401, 'TOKEN_EXPIRED'), fail(401, 'REFRESH_RACE'), ok({ accessToken: 'a2', refreshToken: 'r2' }), ok({ done: true })];
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(responses.shift())));
    await expect(apiRequest('/x')).resolves.toMatchObject({ data: { done: true } });
  });

  it('notifies listeners and clears stored tokens when the session cannot be refreshed', async () => {
    tokenStorage.setAccessToken('stale');
    tokenStorage.setRefreshToken('refresh-1');
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => Promise.resolve(url.endsWith('/auth/refresh') ? fail(401, 'SESSION_REVOKED') : fail(401, 'TOKEN_EXPIRED'))),
    );
    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    await expect(apiRequest('/x')).rejects.toMatchObject({ code: 'SESSION_REVOKED' });
    expect(listener).toHaveBeenCalledOnce();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    unsubscribe();
  });

  it('refreshes on UNAUTHORIZED when a refresh token is in storage (e.g. a fresh tab)', async () => {
    tokenStorage.setRefreshToken('refresh-1');
    let refreshed = false;
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url.endsWith('/auth/refresh')) {
          refreshed = true;
          return Promise.resolve(ok({ accessToken: 'a2', refreshToken: 'r2' }));
        }
        return Promise.resolve(refreshed ? ok({ back: true }) : fail(401, 'UNAUTHORIZED'));
      }),
    );
    await expect(apiRequest('/auth/session')).resolves.toMatchObject({ data: { back: true } });
  });

  it('never refreshes for credential endpoints, non-expiry 401s, or when no refresh token is stored', async () => {
    const fetchMock = vi.fn().mockResolvedValue(fail(401, 'INVALID_CREDENTIALS'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiRequest('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });

    fetchMock.mockResolvedValue(fail(401, 'UNAUTHORIZED'));
    await expect(apiRequest('/users/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/auth/refresh'))).toBe(false);
  });
});
