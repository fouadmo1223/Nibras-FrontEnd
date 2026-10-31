import { apiRequest, apiUpload, storeSession } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

export const authKeys = {
  all: ['auth'],
  session: () => [...authKeys.all, 'session'],
  sessions: () => [...authKeys.all, 'sessions'],
};

/** True only for the session query — everything else is private data dropped on sign-out. */
export const isSessionQuery = (query) => query.queryHash === JSON.stringify(authKeys.session());

const withSession = (result) => {
  storeSession(result.data);
  return result;
};

// Mutations resolve to `{ data, message }` — `message` is the API's confirmation text, shown as-is.
export const login = (body) => apiRequest('/auth/login', { method: 'POST', body }).then(withSession);
export const register = (body) => apiRequest('/auth/register', { method: 'POST', body }).then(withSession);

export async function logout() {
  const refreshToken = tokenStorage.getRefreshToken();
  try {
    return refreshToken ? await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } }) : { data: null, message: undefined };
  } finally {
    tokenStorage.clear();
  }
}

/** Current session ({ user, session }), or null when signed out. */
export async function getSession() {
  if (!tokenStorage.getRefreshToken()) return null;
  try {
    return (await apiRequest('/auth/session')).data;
  } catch (error) {
    if (error.status === 401) {
      tokenStorage.clear();
      return null;
    }
    throw error;
  }
}

export const forgotPassword = (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
export const resetPassword = (body) => apiRequest('/auth/reset-password', { method: 'POST', body });
export const verifyEmail = (token) => apiRequest('/auth/verify-email', { method: 'POST', body: { token } });
export const resendVerification = () => apiRequest('/auth/verify-email/resend', { method: 'POST' });
export const changePassword = (body) => apiRequest('/auth/change-password', { method: 'POST', body });
export const listSessions = () => apiRequest('/auth/sessions').then((r) => r.data);
export const revokeSession = (id) => apiRequest(`/auth/sessions/${id}`, { method: 'DELETE' });
export const revokeOtherSessions = () => apiRequest('/auth/sessions/revoke-others', { method: 'POST' });

/** Uploads a profile photo (processed server-side into a 512×512 WebP); reports upload progress 0–100. */
export function uploadAvatar(file, onProgress) {
  const form = new FormData();
  form.append('avatar', file);
  return apiUpload('/users/me/avatar', form, { onProgress });
}
export const removeAvatar = () => apiRequest('/users/me/avatar', { method: 'DELETE' });

/** Saves profile fields (name, locale). The saved locale is the language of the user's emails. */
export const updateProfile = (body) => apiRequest('/users/me', { method: 'PATCH', body });
