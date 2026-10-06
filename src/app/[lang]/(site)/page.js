import { Suspense } from 'react';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
import HomeStats, { HomeStatsSkeleton } from '@/components/sections/HomeStats';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { languageAlternates } from '@/i18n/seo';

export async function generateMetadata() {
  const { locale } = await getI18n();
  return { alternates: languageAlternates(locale, '/') };
}

/**
 * Homepage (Phase 4, first slice): hero, live statistics and honest empty states for the
 * sections that need courses and categories. Those sections fill in as their modules ship.
 */
export default async function HomePage() {
  const { t } = await getI18n();
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_20%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%),radial-gradient(50%_50%_at_90%_10%,color-mix(in_oklab,var(--secondary)_14%,transparent),transparent_70%)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-10 lg:pt-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-muted">
              <Sparkles className="size-3.5 text-secondary" aria-hidden="true" />
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              {t('home.hero.titleStart')} <em className="text-primary">{t('home.hero.titleEmphasis')}</em> {t('home.hero.titleEnd')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground-muted">{t('home.hero.body')}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-elevation-2 transition-colors hover:bg-primary-hover"
              >
                {t('home.hero.primaryCta')}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-full border border-border-strong px-6 font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {t('home.hero.secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up rounded-3xl border border-border bg-surface p-7 shadow-elevation-3 sm:p-9">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-foreground">{t('home.hero.panelTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{t('home.hero.panelBody')}</p>
            <div className="mt-8 border-t border-border pt-8">
              <Suspense fallback={<HomeStatsSkeleton />}>
                <HomeStats />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
        <h2 id="categories-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.categories.title')}
        </h2>
        <EmptyState title={t('home.sections.categories.emptyTitle')} body={t('home.sections.categories.emptyBody')} />
      </section>

      <section aria-labelledby="courses-heading" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-10">
        <h2 id="courses-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.courses.title')}
        </h2>
        <EmptyState title={t('home.sections.courses.emptyTitle')} body={t('home.sections.courses.emptyBody')} />
      </section>
    </div>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{body}</p>
    </div>
  );
}
