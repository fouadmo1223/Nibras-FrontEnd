'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { enrollmentKeys, listMyEnrollments } from '@/services/enrollments.service';

/** The signed-in user's enrolled courses with a progress bar each. Shown on the account page. */
export default function MyCoursesCard() {
  const { t, locale } = useI18n();
  const enrollments = useQuery({ queryKey: enrollmentKeys.mine(), queryFn: listMyEnrollments });
  const rows = enrollments.data ?? [];

  if (enrollments.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('account.myCourses.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (enrollments.isError) return <Alert tone="error" title={errorMessage(enrollments.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-foreground-muted">{t('account.myCourses.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.myCourses.browse')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {rows.map((enrollment) => {
        const title = locale === 'ar' ? enrollment.course.titleAr : enrollment.course.titleEn;
        return (
          <li key={enrollment.id}>
            <Link href={`/courses/${enrollment.course.slug}`} className="group block">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground group-hover:text-primary">{title}</span>
                <span className="shrink-0 text-sm text-foreground-subtle">{enrollment.progress.percent}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${enrollment.progress.percent}%` }} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
