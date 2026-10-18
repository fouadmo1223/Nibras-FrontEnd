import { Suspense } from 'react';
import CourseResults from '@/components/sections/CourseResults';
import OrbitAccent from '@/components/sections/OrbitAccent';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import { getI18n } from '@/i18n/dictionaries';
import { languageAlternates } from '@/i18n/seo';

export async function generateMetadata() {
  const { t, locale } = await getI18n();
  return { title: t('courses.directory.title'), alternates: languageAlternates(locale, '/courses') };
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
      <div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  );
}

export default async function CoursesDirectoryPage({ searchParams }) {
  const { t } = await getI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-start">
        <OrbitAccent centerIcon="book" size={176} />
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">{t('courses.directory.title')}</h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{t('courses.directory.subtitle')}</p>
        </div>
      </div>
      <SectionErrorBoundary>
        <Suspense fallback={<ResultsSkeleton />}>
          <CourseResults
            searchParams={searchParams}
            emptyTitle={t('home.sections.courses.emptyTitle')}
            emptyBody={t('home.sections.courses.emptyBody')}
          />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
