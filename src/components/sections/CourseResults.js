import { X } from 'lucide-react';
import Card from '@/components/ui/Card';
import CourseCard from '@/components/ui/CourseCard';
import Pagination from '@/components/ui/Pagination';
import GsapReveal from '@/components/motion/GsapReveal';
import CourseFilterBar from '@/components/sections/CourseFilterBar';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { getPublishedCategories } from '@/services/categories.service';
import { getPublishedInstructors } from '@/services/instructors.service';
import { getPublishedCourses } from '@/services/courses.service';

const PRICE_VALUES = new Set(['free', 'paid']);
const LEVEL_VALUES = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);

/** Reads filter/page search params (URL data, so it must stay behind Suspense), fetches and renders results. */
export default async function CourseResults({ searchParams, emptyTitle, emptyBody }) {
  const sp = await searchParams;
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const instructorId = typeof sp.instructor === 'string' ? sp.instructor : undefined;
  const price = PRICE_VALUES.has(sp.price) ? sp.price : undefined;
  const level = LEVEL_VALUES.has(sp.level) ? sp.level : undefined;
  const page = Math.max(1, Number.parseInt(sp.page, 10) || 1);

  const [{ t, locale, format }, categories, instructors, { items, pagination }] = await Promise.all([
    getI18n(),
    getPublishedCategories(),
    getPublishedInstructors(),
    getPublishedCourses({ category, instructorId, price, level, page }),
  ]);

  const activeCategory = category ? categories.find((c) => c.slug === category) : null;
  const activeCategoryName = activeCategory ? (locale === 'ar' ? activeCategory.nameAr : activeCategory.nameEn) : null;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <>
      <CourseFilterBar categories={categories} instructors={instructors} />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {activeCategoryName ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary">
            {activeCategoryName}
            <Link href="/courses" aria-label={t('courses.directory.allCategories')} className="rounded-full hover:text-primary-hover">
              <X className="size-3.5" aria-hidden="true" />
            </Link>
          </span>
        ) : null}
        <span className="text-sm text-foreground-subtle">{t('courses.directory.resultCount', { count: pagination.total })}</span>
      </div>

      {items.length === 0 ? (
        <Card variant="dashed" className="mt-8 p-10 text-center">
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
        </Card>
      ) : (
        <GsapReveal as="ul" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((course) => (
            <CourseCard key={course.id} course={course} locale={locale} t={t} format={format} reveal />
          ))}
        </GsapReveal>
      )}

      <Pagination page={pagination.page} totalPages={totalPages} searchParams={sp} t={t} />
    </>
  );
}
