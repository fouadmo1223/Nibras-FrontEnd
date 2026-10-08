import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import GsapReveal from '@/components/motion/GsapReveal';
import Card, { CardGlow } from '@/components/ui/Card';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { getPublishedCourses } from '@/services/courses.service';

/** Published courses from the API, shown in the visitor's language. Empty array → empty state. */
export default async function CourseGrid({ emptyTitle, emptyBody, limit, category }) {
  const [{ locale, t, format }, courses] = await Promise.all([getI18n(), getPublishedCourses({ category })]);
  const rows = limit ? courses.slice(0, limit) : courses;

  if (rows.length === 0) {
    return (
      <Card variant="dashed" className="mt-8 p-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </Card>
    );
  }

  return (
    <GsapReveal as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((course) => {
        const title = locale === 'ar' ? course.titleAr : course.titleEn;
        const subtitle = locale === 'ar' ? course.subtitleAr : course.subtitleEn;
        const categoryName = locale === 'ar' ? course.category.nameAr : course.category.nameEn;
        return (
          <Card key={course.id} as="li" variant="glass" hover data-reveal className="flex flex-col p-3">
            <CardGlow />
            <Link href={`/courses/${course.slug}`} className="flex flex-1 flex-col">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60 shadow-elevation-1">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 360px, 90vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-surface-muted text-foreground-subtle">
                    <BookOpen className="size-8" aria-hidden="true" />
                  </div>
                )}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <span className="absolute start-2.5 top-2.5 rounded-md bg-surface/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                  {categoryName}
                </span>
              </div>
              <div className="relative flex flex-1 flex-col px-2 pb-2 pt-4">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {subtitle ? <p className="mt-1.5 flex-1 text-sm leading-6 text-foreground-muted">{subtitle}</p> : null}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar user={course.instructor.user} size="sm" />
                    <span className="truncate text-sm text-foreground-muted">{course.instructor.user.name}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-foreground">
                    {course.priceCents === 0 ? t('courses.card.free') : format.currency(course.priceCents / 100)}
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t('courses.card.view')}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Card>
        );
      })}
    </GsapReveal>
  );
}
