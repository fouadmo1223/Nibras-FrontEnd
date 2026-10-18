import { apiRequest } from '@/lib/api-client';
import { env } from '@/lib/env';

export const certificateKeys = {
  all: ['certificates'],
  mine: () => [...certificateKeys.all, 'mine'],
  course: (courseId) => [...certificateKeys.all, 'course', courseId],
};

export const listMyCertificates = () => apiRequest('/certificates/mine').then((r) => r.data);

/** The current user's certificate for one course, or null if not yet earned. */
export const getCertificateForCourse = (courseId) => apiRequest(`/certificates/course/${courseId}`).then((r) => r.data);

/** A plain authenticated GET URL — the browser sends the session cookie on normal navigation, same as an <img> tag. */
export const certificateDownloadUrl = (id) => `${env.apiUrl}/certificates/${id}/download`;

/** Public verification by code — server-side only. Returns null (not an error) if the code is unknown. */
export async function verifyCertificate(code) {
  try {
    const { data } = await apiRequest(`/certificates/verify/${code}`, { cache: 'no-store' });
    return data;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
