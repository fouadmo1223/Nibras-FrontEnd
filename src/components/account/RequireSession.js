'use client';

import { useEffect } from 'react';
import Alert from '@/components/ui/Alert';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { useLocaleRouter } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';

/**
 * Gate for a page that only makes sense signed in (wishlist, cart, my courses — anything that
 * would otherwise just show the API's own 401). Redirects to `/login?next=<next>` once we know
 * for certain there's no session; the API independently rejects unauthenticated requests too, so
 * this is a UX nicety, not the real enforcement. `children` is a render-prop, called with `user`.
 */
export default function RequireSession({ next, loadingLabel, children }) {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isSuccess && !session.data) router.replace(`/login?next=${next}`);
  }, [session.isSuccess, session.data, router, next]);

  if (session.isPending || (session.isSuccess && !session.data)) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label={loadingLabel}>
        <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    );
  }

  if (session.isError) return <Alert tone="error" title={errorMessage(session.error, t)} />;

  return children(session.data.user);
}
