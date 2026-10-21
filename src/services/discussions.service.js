import { apiRequest } from '@/lib/api-client';

export const discussionKeys = {
  all: ['discussions'],
  course: (courseId) => [...discussionKeys.all, 'course', courseId],
};

export const listCourseDiscussion = (courseId) => apiRequest(`/discussions/course/${courseId}`).then((r) => r.data);
export const postDiscussionMessage = (courseId, body) => apiRequest(`/discussions/course/${courseId}`, { method: 'POST', body: { body } });
export const removeDiscussionMessage = (id) => apiRequest(`/discussions/${id}`, { method: 'DELETE' });
