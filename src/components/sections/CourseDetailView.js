import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BarChart3, BookOpen, Tag } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import CoursePrice from '@/components/ui/CoursePrice';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { getCourseBySlug } from '@/services/courses.service';

/** Fetches and renders one course's public page; 404s if it doesn't exist or isn't published. */
export default async function CourseDetailView({ params }) {
  const { slug } = await params;
  const [{ t, locale, format }, course] = await Promise.all([getI18n(), getCourseBySlug(slug)]);
  if (!course) notFound();

  const title = locale === 'ar' ? course.titleAr : course.titleEn;
  const subtitle = locale === 'ar' ? course.subtitleAr : course.subtitleEn;
  const description = locale === 'ar' ? course.descriptionAr : course.descriptionEn;
  const categoryName = locale === 'ar' ? course.category.nameAr : course.category.nameEn;
  const instructorHeadline = locale === 'ar' ? course.instructor.headlineAr : course.instructor.headlineEn;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <Link href={`/courses?category=${course.category.slug}`} className="text-sm font-medium text-primary hover:underline">
            {categoryName}
          </Link>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground sm:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-lg text-foreground-muted">{subtitle}</p> : null}

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-elevation-2">
            {course.imageUrl ? (
              // unoptimized: see CourseGrid.js — already pre-sized or processed, and avoids needing
              // every self-hosted media host allowlisted in next.config.js.
              <Image src={course.imageUrl} alt="" fill sizes="(min-width: 1024px) 640px, 90vw" unoptimized priority className="object-cover" />
            ) : (
              <div className="grid size-full place-items-center bg-surface-muted text-foreground-subtle">
                <BookOpen className="size-12" aria-hidden="true" />
              </div>
            )}
          </div>

          {description ? (
            <Card variant="default" className="mt-8">
              <h2 className="font-semibold text-foreground">{t('courses.detail.about')}</h2>
              <p className="mt-3 whitespace-pre-line leading-8 text-foreground-muted">{description}</p>
            </Card>
          ) : null}

          {course.images?.length > 0 ? (
            <div className="mt-8">
              <h2 className="font-semibold text-foreground">{t('courses.detail.gallery')}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {course.images.map((image) => (
                  <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-elevation-1">
                    <Image src={image.imageUrl} alt="" fill sizes="(min-width: 1024px) 200px, 45vw" unoptimized className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <Card variant="glass" className="p-6">
            <CoursePrice priceCents={course.priceCents} compareAtPriceCents={course.compareAtPriceCents} format={format} t={t} size="lg" />
            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-foreground-muted">
                  <BarChart3 className="size-4" aria-hidden="true" />
                  {t('courses.detail.level')}
                </dt>
                <dd className="font-medium text-foreground">{t(`courses.level.${course.level}`)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-foreground-muted">
                  <Tag className="size-4" aria-hidden="true" />
                  {t('courses.detail.category')}
                </dt>
                <dd className="font-medium text-foreground">{categoryName}</dd>
              </div>
            </dl>
          </Card>

          <Card variant="default" className="p-6">
            <h2 className="text-sm font-medium text-foreground-subtle">{t('courses.detail.instructor')}</h2>
            <Link href={`/instructors/${course.instructor.id}`} className="group mt-3 flex items-center gap-3">
              <Avatar user={course.instructor.user} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground group-hover:text-primary">{course.instructor.user.name}</p>
                {instructorHeadline ? <p className="truncate text-sm text-foreground-muted">{instructorHeadline}</p> : null}
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
