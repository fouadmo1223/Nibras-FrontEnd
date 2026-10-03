'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { errorMessage } from '@/lib/api-errors';
import { authKeys, verifyEmail } from '@/services/auth.service';

export default function VerifyEmail() {
  const token = useSearchParams().get('token');
  const queryClient = useQueryClient();
  const verify = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.session() }),
  });
  // Tokens are single-use: make sure the request fires exactly once (StrictMode re-runs effects).
  const started = useRef(false);

  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      verify.mutate(token);
    }
  }, [token, verify]);

  const state = !token ? 'error' : verify.isSuccess ? 'success' : verify.isError ? 'error' : 'pending';

  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center" aria-live="polite">
      {state === 'pending' && (
        <>
          <Loader2 className="mx-auto size-10 animate-spin text-primary" aria-hidden="true" />
          <p className="mt-4 text-foreground-muted">Confirming your email…</p>
        </>
      )}
      {state === 'success' && (
        <>
          <CircleCheck className="mx-auto size-12 text-success" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-medium text-foreground">Email confirmed</h2>
          <p className="mt-1 text-foreground-muted">{verify.data.message}</p>
          <Link href="/account" className="mt-6 inline-block font-medium text-primary hover:underline">
            Go to your account
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <CircleX className="mx-auto size-12 text-error" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-medium text-foreground">We couldn’t confirm your email</h2>
          <p className="mt-1 text-foreground-muted">
            {token ? errorMessage(verify.error) : 'This link is incomplete.'} You can send a new link from your account.
          </p>
          <Link href="/account" className="mt-6 inline-block font-medium text-primary hover:underline">
            Go to your account
          </Link>
        </>
      )}
    </div>
  );
}
