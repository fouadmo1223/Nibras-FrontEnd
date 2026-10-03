'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError, onSessionExpired } from '@/lib/api-client';
import { authKeys, isSessionQuery } from '@/services/auth.service';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        // Client errors (4xx) are deterministic — retrying them only adds latency.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

export default function Providers({ children }) {
  const [queryClient] = useState(makeQueryClient);

  // When a refresh fails (session revoked/expired), drop private data and mark the user signed out.
  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.removeQueries({ predicate: (q) => !isSessionQuery(q) });
        queryClient.setQueryData(authKeys.session(), null);
      }),
    [queryClient],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
