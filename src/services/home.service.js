import { apiRequest } from '@/lib/api-client';

/** Public homepage counters. Server-side only; no personal data. */
export async function getHomeStats() {
  const { data } = await apiRequest('/home/stats', { cache: 'no-store' });
  return data;
}
