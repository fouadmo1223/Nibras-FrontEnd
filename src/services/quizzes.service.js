import { apiRequest, apiUpload } from '@/lib/api-client';

export const quizKeys = {
  all: ['quiz'],
  attempt: (lessonId) => [...quizKeys.all, 'attempt', lessonId],
  submission: (lessonId) => [...quizKeys.all, 'submission', lessonId],
};

/** `{ submitted, scorePercent } | null` — never the questions. Lets the UI show a past score without re-fetching the quiz. */
export const getMyQuizAttemptStatus = (lessonId) => apiRequest(`/quiz/lessons/${lessonId}/attempt`).then((r) => r.data);

/** Starts (or resumes) the current user's MCQ attempt: the random draw is made once and persisted. */
export const startQuizAttempt = (lessonId) => apiRequest(`/quiz/lessons/${lessonId}/start`, { method: 'POST' }).then((r) => r.data);

export const submitQuizAttempt = (lessonId, answers) => apiRequest(`/quiz/lessons/${lessonId}/submit`, { method: 'POST', body: { answers } });

/** Returns null (not an error) when the current user hasn't submitted a file yet. */
export async function getMyQuizSubmission(lessonId) {
  const { data } = await apiRequest(`/quiz/lessons/${lessonId}/submission`);
  return data;
}

export function uploadQuizSubmission(lessonId, file, onProgress) {
  const body = new FormData();
  body.append('file', file);
  return apiUpload(`/quiz/lessons/${lessonId}/upload`, body, { method: 'POST', onProgress });
}
