import { apiRequest } from '@/lib/api-client';

/**
 * Published courses, filterable by category, instructor, price ('free'|'paid') and level, paged.
 * Server-side only; public data. Returns `{ items, pagination }`.
 */
export async function getPublishedCourses({ category, instructorId, price, level, page, limit } = {}) {
  const { data, meta } = await apiRequest('/courses', {
    cache: 'no-store',
    query: { category, instructorId, price, level, page, limit },
  });
  return { items: data, pagination: meta.pagination };
}

/** A single published course by slug, or null if it doesn't exist or isn't published. */
export async function getCourseBySlug(slug) {
  try {
    const { data } = await apiRequest(`/courses/${slug}`, { cache: 'no-store' });
    return data;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
