'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys, getSession, isSessionQuery, login, logout, register } from '@/services/auth.service';
import { errorMessage } from '@/lib/api-errors';
import { toast } from '@/stores/toast-store';

/** Current session ({ user, session, csrfToken }) or null. Personal data: never shared-cached. */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

function useSessionMutation(fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      queryClient.setQueryData(authKeys.session(), result.data);
      toast.success(result.message);
    },
  });
}

export const useLogin = () => useSessionMutation(login);
export const useRegister = () => useSessionMutation(register);

/** Replaces the cached user after a profile change (e.g. a new avatar). */
export function useUpdateSessionUser() {
  const queryClient = useQueryClient();
  return (user) => queryClient.setQueryData(authKeys.session(), (current) => (current ? { ...current, user } : current));
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(errorMessage(error)),
    // Sign the UI out even if the network call fails; the server session expires on its own.
    // Update the session in place (observers stay attached), then drop all other, private, data.
    onSettled: () => {
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.removeQueries({ predicate: (q) => !isSessionQuery(q) });
    },
  });
}
