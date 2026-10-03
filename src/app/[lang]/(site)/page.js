import { Suspense } from 'react';
import ApiStatus, { ApiStatusSkeleton } from '@/components/sections/ApiStatus';
import { getI18n } from '@/i18n/dictionaries';
import { languageAlternates } from '@/i18n/seo';

const SWATCHES = [
  { key: 'primary', className: 'bg-primary' },
  { key: 'secondary', className: 'bg-secondary' },
  { key: 'success', className: 'bg-success' },
  { key: 'warning', className: 'bg-warning' },
  { key: 'error', className: 'bg-error' },
  { key: 'surface', className: 'bg-surface-muted' },
];

export async function generateMetadata() {
  const { locale } = await getI18n();
  return { alternates: languageAlternates(locale, '/') };
}

/**
 * Foundation page inside the site layout: verifies tokens, theme, language and the
 * API connection. Replaced by the real homepage in Phase 4.
 */
export default async function HomePage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-20 sm:px-6 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground-subtle">{t('home.eyebrow')}</p>
      <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-foreground sm:text-6xl">
        {t('home.titleStart')} <em className="text-primary">{t('home.titleEmphasis')}</em> {t('home.titleEnd')}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-foreground-muted">{t('home.body')}</p>

      <div className="mt-14 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="status-heading" className="rounded-xl border border-border bg-surface p-6 shadow-elevation-1">
          <h2 id="status-heading" className="text-sm font-medium text-foreground">
            {t('home.apiHeading')}
          </h2>
          <div className="mt-5">
            <Suspense fallback={<ApiStatusSkeleton label={t('apiStatus.checking')} />}>
              <ApiStatus />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="tokens-heading" className="rounded-xl border border-border bg-surface p-6 shadow-elevation-1">
          <h2 id="tokens-heading" className="text-sm font-medium text-foreground">
            {t('home.tokensHeading')}
          </h2>
          <ul className="mt-5 grid grid-cols-3 gap-3">
            {SWATCHES.map((s) => (
              <li key={s.key}>
                <span className={`block h-12 rounded-md border border-border ${s.className}`} />
                <span className="mt-1.5 block text-xs text-foreground-muted">{t(`home.swatches.${s.key}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
