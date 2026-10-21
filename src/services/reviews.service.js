import { apiRequest } from '@/lib/api-client';

export const reviewKeys = {
  all: ['reviews'],
  featured: () => [...reviewKeys.all, 'featured'],
  course: (courseId) => [...reviewKeys.all, 'course', courseId],
  mine: (courseId) => [...reviewKeys.all, 'mine', courseId],
};

export const listFeaturedReviews = () => apiRequest('/reviews/featured').then((r) => r.data);
export const listCourseReviews = (courseId) => apiRequest(`/reviews/course/${courseId}`).then((r) => r.data);
export const getMyReview = (courseId) => apiRequest(`/reviews/mine/${courseId}`).then((r) => r.data);
export const saveMyReview = (courseId, body) => apiRequest(`/reviews/mine/${courseId}`, { method: 'PUT', body });
export const deleteMyReview = (courseId) => apiRequest(`/reviews/mine/${courseId}`, { method: 'DELETE' });
