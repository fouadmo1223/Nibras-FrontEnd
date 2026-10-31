import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Card, { CardGlow } from '@/components/ui/Card';
import CartButton from '@/components/ui/CartButton';
import CoursePrice, { discountPercent } from '@/components/ui/CoursePrice';
import EnrolledBadge from '@/components/ui/EnrolledBadge';
import WishlistButton from '@/components/ui/WishlistButton';
import { Link } from '@/i18n/navigation';

/** One course card: cover, category/sale badges, title, instructor and price. Shared by every course grid. */
export default function CourseCard({ course, locale, t, format, reveal = false }) {
  const title = locale === 'ar' ? course.titleAr : course.titleEn;
  const subtitle = locale === 'ar' ? course.subtitleAr : course.subtitleEn;
  const categoryName = locale === 'ar' ? course.category.nameAr : course.category.nameEn;
  const percent = discountPercent(course.priceCents, course.compareAtPriceCents);

  return (
    <Card as="li" variant="glass" hover {...(reveal ? { 'data-reveal': true } : {})} className="flex flex-col p-3">
      <CardGlow />
      <Link href={`/courses/${course.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60 shadow-elevation-1">
          {course.imageUrl ? (
            // unoptimized: already a pre-sized Unsplash URL or a processed WebP from the API's
            // media pipeline — Next's optimizer would otherwise reject an unallowlisted host.
            <Image
              src={course.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, 90vw"
              unoptimized
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
          {percent ? (
            <span className="absolute end-2.5 top-2.5 rounded-md bg-error px-2 py-0.5 text-xs font-semibold text-white shadow-elevation-1">
              {t('courses.card.off', { percent })}
            </span>
          ) : null}
          <WishlistButton courseId={course.id} compact className="absolute end-2.5 bottom-2.5" />
          <EnrolledBadge courseId={course.id} compact className="absolute start-2.5 bottom-2.5">
            {course.priceCents > 0 ? (
              <CartButton courseId={course.id} priceCents={course.priceCents} compact className="absolute start-2.5 bottom-2.5" />
            ) : null}
          </EnrolledBadge>
        </div>
        <div className="relative flex flex-1 flex-col px-2 pb-2 pt-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-1.5 flex-1 text-sm leading-6 text-foreground-muted">{subtitle}</p> : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            {course.instructor ? (
              <div className="flex min-w-0 items-center gap-2">
                <Avatar user={course.instructor.user} size="sm" />
                <span className="truncate text-sm text-foreground-muted">{course.instructor.user.name}</span>
              </div>
            ) : (
              <span />
            )}
            <CoursePrice priceCents={course.priceCents} compareAtPriceCents={course.compareAtPriceCents} format={format} t={t} className="shrink-0 justify-end" />
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {t('courses.card.view')}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </Card>
  );
}
