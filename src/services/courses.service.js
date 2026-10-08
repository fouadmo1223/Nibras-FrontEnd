import { apiRequest } from '@/lib/api-client';

/** Published courses, optionally narrowed to one category. Server-side only; public data. */
export async function getPublishedCourses({ category } = {}) {
  const { data } = await apiRequest('/courses', { cache: 'no-store', query: category ? { category } : undefined });
  return data;
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
