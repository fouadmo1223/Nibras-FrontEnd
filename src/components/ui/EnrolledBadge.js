'use client';

import { CheckCircle2 } from 'lucide-react';
import { useEnrolledCourseIds } from '@/hooks/use-enrolled-courses';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';

/**
 * Replaces its children (normally a `CartButton`) with an "Enrolled" pill once the signed-in
 * caller already owns this course — a course you have never offers "Add to cart" again. Shows a
 * skeleton while enrollment status is still loading, so "Add to cart" never flashes first for a
 * course you're actually enrolled in.
 */
export default function EnrolledBadge({ courseId, compact = false, className, children }) {
  const { t } = useI18n();
  const { ids, isLoading } = useEnrolledCourseIds();

  if (isLoading) {
    return (
      <span
        aria-hidden="true"
        className={cn(compact ? 'size-7 animate-pulse rounded-full bg-surface-muted' : 'h-11 animate-pulse rounded-md bg-surface-muted', className)}
      />
    );
  }

  if (!ids.has(courseId)) return children ?? null;

  return (
    <span
      title={t('courses.detail.alreadyEnrolled')}
      className={cn(
        'inline-flex items-center justify-center gap-1 rounded-full bg-success-soft px-2 py-1 text-xs font-medium text-success shadow-elevation-1 backdrop-blur-sm',
        className,
      )}
    >
      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
      {t('courses.card.enrolled')}
    </span>
  );
}
