'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Card, { CardGlow } from '@/components/ui/Card';
import CoursePrice from '@/components/ui/CoursePrice';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { enrollmentKeys, listMyEnrollments } from '@/services/enrollments.service';

const RING = 2 * Math.PI * 16; // circumference for r=16 in a 40×40 viewBox

/**
 * Small circular progress ring with the percentage in the center — overlays the course cover.
 * Sweeps from 0 to `percent` on mount: it starts at offset 0 (empty ring) and only moves to the
 * real value on the next frame, so the CSS transition actually has something to animate instead
 * of just appearing already-filled.
 */
function ProgressPie({ percent }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="absolute end-2.5 bottom-2.5 grid size-10 place-items-center rounded-full bg-surface/90 shadow-elevation-1 backdrop-blur-sm">
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={RING}
          strokeDashoffset={filled ? RING * (1 - percent / 100) : RING}
        />
      </svg>
      <span className="text-[10px] font-semibold text-foreground">{percent}%</span>
    </div>
  );
}

/** One enrolled course: cover with a progress pie, title, price and a progress bar. */
function MyCourseItemCard({ enrollment, locale, format, t }) {
  const title = locale === 'ar' ? enrollment.course.titleAr : enrollment.course.titleEn;
  const percent = enrollment.progress.percent;

  return (
    <Card variant="glass" hover className="flex flex-col p-3">
      <CardGlow />
      <Link href={`/courses/${enrollment.course.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
          {enrollment.course.imageUrl ? (
            <Image
              src={enrollment.course.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, 90vw"
              unoptimized
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center bg-surface-muted text-foreground-subtle">
              <BookOpen className="size-8" aria-hidden="true" />
            </div>
          )}
          <ProgressPie percent={percent} />
        </div>
        <h3 className="relative mt-3 line-clamp-2 font-semibold text-foreground group-hover:text-primary">{title}</h3>
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${percent}%` }} />
        </div>
        <div className="relative mt-2">
          <CoursePrice priceCents={enrollment.course.priceCents} compareAtPriceCents={enrollment.course.compareAtPriceCents} format={format} t={t} />
        </div>
      </Link>
    </Card>
  );
}

/** Every enrolled course as a card (image + progress pie, title, price, progress bar). Shown on the standalone `/my-courses` page. */
export default function MyCoursesGrid() {
  const { t, locale, format } = useI18n();
  const enrollments = useQuery({ queryKey: enrollmentKeys.mine(), queryFn: listMyEnrollments });
  const rows = enrollments.data ?? [];

  if (enrollments.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={t('account.myCourses.loading')}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (enrollments.isError) return <Alert tone="error" title={errorMessage(enrollments.error, t)} />;

  if (rows.length === 0) {
    return (
      <Card variant="dashed" className="flex flex-col items-center px-6 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
          <BookOpen className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 font-display text-xl tracking-tight text-foreground">{t('account.myCourses.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.myCourses.browse')}
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm font-medium text-foreground-muted">{t('account.myCourses.itemCount', { count: rows.length })}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((enrollment) => (
          <MyCourseItemCard key={enrollment.id} enrollment={enrollment} locale={locale} format={format} t={t} />
        ))}
      </div>
    </div>
  );
}
