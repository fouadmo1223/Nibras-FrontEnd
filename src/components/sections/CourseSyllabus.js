'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clapperboard, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api-errors';
import { completeLesson, enroll, enrollmentKeys, getCourseProgress, uncompleteLesson } from '@/services/enrollments.service';
import { toast } from '@/stores/toast-store';

const formatMinutes = (seconds) => `${Math.max(1, Math.round(seconds / 60))} min`;

/**
 * The course syllabus. Guests and non-enrolled visitors see the static, server-fetched
 * `initialSections` (titles/type/duration only, no video URL). A signed-in, enrolled
 * learner instead sees live progress: a completion bar and a checkbox per lesson.
 */
export default function CourseSyllabus({ courseId, priceCents, initialSections, locale }) {
  const { t } = useI18n();
  const session = useSession();
  const queryClient = useQueryClient();
  const signedIn = Boolean(session.data);

  const progress = useQuery({
    queryKey: enrollmentKeys.course(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: signedIn,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enroll(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.mine() });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const toggleLesson = useMutation({
    mutationFn: ({ lessonId, completed }) => (completed ? uncompleteLesson(lessonId) : completeLesson(lessonId)),
    onSuccess: (result) => queryClient.setQueryData(enrollmentKeys.course(courseId), result.data),
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const enrolled = Boolean(progress.data);
  const sections = enrolled ? progress.data.sections : initialSections;
  const percent = enrolled ? progress.data.progress.percent : null;
  const lessonCount = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold text-foreground">{t('courses.detail.curriculum')}</h2>
        <span className="text-sm text-foreground-subtle">{t('courses.detail.lessonCount', { count: lessonCount })}</span>
      </div>

      {signedIn && !progress.isPending ? (
        enrolled ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{t('courses.detail.yourProgress')}</span>
              <span className="text-foreground-subtle">{percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : priceCents === 0 ? (
          <Button type="button" className="mt-3" loading={enrollMutation.isPending} onClick={() => enrollMutation.mutate()}>
            {t('courses.detail.enroll')}
          </Button>
        ) : (
          <p className="mt-3 text-sm text-foreground-subtle">{t('courses.detail.paymentComingSoon')}</p>
        )
      ) : null}

      <div className="mt-3 space-y-3">
        {sections.map((section) => {
          const sectionTitle = locale === 'ar' ? section.titleAr : section.titleEn;
          return (
            <Card key={section.id} variant="default" className="p-0">
              <h3 className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">{sectionTitle}</h3>
              <ul className="divide-y divide-border">
                {section.lessons.map((lesson) => {
                  const lessonTitle = locale === 'ar' ? lesson.titleAr : lesson.titleEn;
                  const Icon = lesson.type === 'QUIZ' ? HelpCircle : Clapperboard;
                  return (
                    <li key={lesson.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                      {enrolled ? (
                        <button
                          type="button"
                          onClick={() => toggleLesson.mutate({ lessonId: lesson.id, completed: lesson.completed })}
                          aria-pressed={lesson.completed}
                          aria-label={lesson.completed ? t('courses.detail.markIncomplete') : t('courses.detail.markComplete')}
                          className="shrink-0 text-foreground-subtle transition-colors hover:text-primary"
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                          ) : (
                            <Circle className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <Icon className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
                      )}
                      <span className={cn('flex-1', enrolled && lesson.completed ? 'text-foreground-subtle line-through' : 'text-foreground-muted')}>
                        {lessonTitle}
                      </span>
                      {lesson.type === 'QUIZ' ? (
                        <span className="shrink-0 text-xs font-medium text-foreground-subtle">{t('courses.detail.quiz')}</span>
                      ) : lesson.durationSeconds ? (
                        <span className="shrink-0 text-xs text-foreground-subtle">{formatMinutes(lesson.durationSeconds)}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
