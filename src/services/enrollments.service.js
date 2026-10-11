import { apiRequest } from '@/lib/api-client';

export const enrollmentKeys = {
  all: ['enrollments'],
  mine: () => [...enrollmentKeys.all, 'mine'],
  course: (courseId) => [...enrollmentKeys.all, 'mine', courseId],
};

export const listMyEnrollments = () => apiRequest('/enrollments/mine').then((r) => r.data);
export const enroll = (courseId) => apiRequest('/enrollments', { method: 'POST', body: { courseId } });

/** Returns null (not an error) when the current user isn't enrolled in this course. */
export async function getCourseProgress(courseId) {
  try {
    const { data } = await apiRequest(`/enrollments/mine/${courseId}`);
    return data;
  } catch (error) {
    if (error.status === 404 && error.code === 'NOT_ENROLLED') return null;
    throw error;
  }
}

export const completeLesson = (lessonId) => apiRequest(`/enrollments/lessons/${lessonId}/complete`, { method: 'POST' });
export const uncompleteLesson = (lessonId) => apiRequest(`/enrollments/lessons/${lessonId}/complete`, { method: 'DELETE' });
