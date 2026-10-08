'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import SiteHeader from '@/components/layout/SiteHeader';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';

/**
 * Segment-wide error boundary (Next.js `error.js`): catches render/fetch failures below
 * `app/[lang]/layout.js` — a transient 503 from the API is the common case — and shows a
 * recoverable state instead of crashing the page. No `SiteFooter` here: it's a Server
 * Component (reads cookies via `getI18n`), which a Client Component can't call directly.
 */
export default function ErrorBoundary({ error, retry }) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-error-soft text-error">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-4xl tracking-tight text-foreground">{t('errorPage.title')}</h1>
        <p className="mt-3 text-foreground-muted">{t('errorPage.body')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary-hover"
          >
            {t('errorPage.retry')}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-lg border border-border px-5 font-medium text-foreground hover:bg-surface-muted"
          >
            {t('errorPage.home')}
          </Link>
        </div>
      </main>
    </>
  );
}
