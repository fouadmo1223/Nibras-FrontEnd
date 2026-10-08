import { Suspense } from 'react';
import InstructorGrid from '@/components/sections/InstructorGrid';
import OrbitAccent from '@/components/sections/OrbitAccent';
import { getI18n } from '@/i18n/dictionaries';
import { languageAlternates } from '@/i18n/seo';

export async function generateMetadata() {
  const { t, locale } = await getI18n();
  return { title: t('instructors.directory.title'), alternates: languageAlternates(locale, '/instructors') };
}

export default async function InstructorsDirectoryPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-start">
        <OrbitAccent centerIcon="book" size={176} />
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">{t('instructors.directory.title')}</h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{t('instructors.directory.subtitle')}</p>
        </div>
      </div>
      <Suspense fallback={<div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />}>
        <InstructorGrid emptyTitle={t('home.sections.instructors.emptyTitle')} emptyBody={t('home.sections.instructors.emptyBody')} />
      </Suspense>
    </div>
  );
}
