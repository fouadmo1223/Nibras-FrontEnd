import { apiRequest } from '@/lib/api-client';

/** Published course categories. Server-side only; public data, no personal information. */
export async function getPublishedCategories() {
  const { data } = await apiRequest('/categories', { cache: 'no-store' });
  return data;
}
