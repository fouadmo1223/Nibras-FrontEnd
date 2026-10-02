import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './api-client';

function mockFetch(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('apiRequest', () => {
  it('unwraps the success envelope and builds the versioned URL with query params', async () => {
    const fetchMock = mockFetch(200, { success: true, data: { status: 'ok' }, meta: { requestId: 'r1' } });

    const result = await apiRequest('/health', { query: { a: 1, empty: '', skip: undefined } });

    expect(result).toEqual({ data: { status: 'ok' }, meta: { requestId: 'r1' } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:5000/api/v1/health?a=1');
    expect(init.credentials).toBe('include');
    expect(init.headers['Content-Type']).toBeUndefined();
  });

  it('serialises JSON bodies', async () => {
    const fetchMock = mockFetch(200, { success: true, data: null });
    await apiRequest('/things', { method: 'POST', body: { name: 'x' } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe('{"name":"x"}');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('throws ApiError carrying the API error envelope', async () => {
    mockFetch(422, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: [{ field: 'email' }] },
      meta: { requestId: 'r2' },
    });

    await expect(apiRequest('/x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      requestId: 'r2',
    });
  });

  it('maps network failures to a NETWORK_ERROR ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const error = await apiRequest('/x').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
  });
});
