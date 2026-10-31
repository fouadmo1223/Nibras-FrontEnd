'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys, getSession, isSessionQuery, login, logout, register } from '@/services/auth.service';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { toast } from '@/stores/toast-store';

/**
 * Current session ({ user, session }) or null. Personal data: never shared-cached.
 *
 * Forces a `pending` result until after the first client render. The server can never know the
 * session (it's client-only: no cookies, by design — see token-storage.js), so SSR always
 * renders the pending/loading state; without this, a query that resolves before React finishes
 * hydrating (as it does for `getSession()`'s synchronous-ish no-refresh-token early return) can
 * paint a *different* state on the client's very first render than the server sent, which React
 * flags as a hydration mismatch and recovers from by discarding and regenerating the subtree —
 * losing in-flight state (e.g. a just-completed login's navigation) in the process.
 */
export function useSession() {
  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const [hasMounted, setHasMounted] = useState(false);
  // The standard SSR-hydration-safe "mounted" gate: this must run once, after hydration,
  // specifically to diverge from the server-rendered output on purpose (see the doc comment
  // above) — not the generic derived-state anti-pattern this lint rule otherwise guards against.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHasMounted(true), []);
  return hasMounted ? query : { ...query, isPending: true, isSuccess: false, data: undefined };
}

function useSessionMutation(fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      queryClient.setQueryData(authKeys.session(), result.data);
      if (typeof window !== 'undefined') {
        window.__loginSuccess = { data: result.data, cachedAfter: queryClient.getQueryData(authKeys.session()), t: performance.now() };
      }
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
  const { t } = useI18n();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(errorMessage(error, t)),
    // Sign the UI out even if the network call fails; the server session expires on its own.
    // Update the session in place (observers stay attached), then drop all other, private, data.
    onSettled: () => {
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.removeQueries({ predicate: (q) => !isSessionQuery(q) });
    },
  });
}
