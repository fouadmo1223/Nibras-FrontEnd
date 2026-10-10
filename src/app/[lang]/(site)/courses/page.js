import { Suspense } from 'react';
import { X } from 'lucide-react';
import CourseGrid from '@/components/sections/CourseGrid';
import OrbitAccent from '@/components/sections/OrbitAccent';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { languageAlternates } from '@/i18n/seo';
import { getPublishedCategories } from '@/services/categories.service';

export async function generateMetadata() {
  const { t, locale } = await getI18n();
  return { title: t('courses.directory.title'), alternates: languageAlternates(locale, '/courses') };
}

/** Reads `?category=` (URL data, so it must stay behind Suspense) and resolves it to a name. */
async function CourseListSection({ searchParams, emptyTitle, emptyBody }) {
  const { category } = await searchParams;
  const [{ locale, t }, categories] = await Promise.all([getI18n(), getPublishedCategories()]);
  const activeCategory = category ? categories.find((c) => c.slug === category) : null;
  const activeCategoryName = activeCategory ? (locale === 'ar' ? activeCategory.nameAr : activeCategory.nameEn) : null;

  return (
    <>
      {activeCategoryName ? (
        <div className="mt-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary">
            {activeCategoryName}
            <Link href="/courses" aria-label={t('courses.directory.allCategories')} className="rounded-full hover:text-primary-hover">
              <X className="size-3.5" aria-hidden="true" />
            </Link>
          </span>
        </div>
      ) : null}
      <CourseGrid emptyTitle={emptyTitle} emptyBody={emptyBody} category={activeCategory ? category : undefined} />
    </>
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
        <Suspense fallback={<div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />}>
          <CourseListSection
            searchParams={searchParams}
            emptyTitle={t('home.sections.courses.emptyTitle')}
            emptyBody={t('home.sections.courses.emptyBody')}
          />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
