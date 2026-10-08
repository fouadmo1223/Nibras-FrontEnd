import { apiRequest } from '@/lib/api-client';

/** Published instructor profiles. Server-side only; public data. */
export async function getPublishedInstructors() {
  const { data } = await apiRequest('/instructors', { cache: 'no-store' });
  return data;
}

/** A single published instructor profile, or null if it doesn't exist or isn't published. */
export async function getInstructorProfile(id) {
  try {
    const { data } = await apiRequest(`/instructors/${id}`, { cache: 'no-store' });
    return data;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
