'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { authKeys, verifyEmail } from '@/services/auth.service';

export default function VerifyEmail() {
  const { t } = useI18n();
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
          <p className="mt-4 text-foreground-muted">{t('auth.verify.pending')}</p>
        </>
      )}
      {state === 'success' && (
        <>
          <CircleCheck className="mx-auto size-12 text-success" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-medium text-foreground">{t('auth.verify.successTitle')}</h2>
          <p className="mt-1 text-foreground-muted">{verify.data.message}</p>
          <Link href="/account" className="mt-6 inline-block font-medium text-primary hover:underline">
            {t('auth.verify.goToAccount')}
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <CircleX className="mx-auto size-12 text-error" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-medium text-foreground">{t('auth.verify.errorTitle')}</h2>
          <p className="mt-1 text-foreground-muted">
            {token ? errorMessage(verify.error, t) : t('auth.verify.incomplete')} {t('auth.verify.resendHint')}
          </p>
          <Link href="/account" className="mt-6 inline-block font-medium text-primary hover:underline">
            {t('auth.verify.goToAccount')}
          </Link>
        </>
      )}
    </div>
  );
}
