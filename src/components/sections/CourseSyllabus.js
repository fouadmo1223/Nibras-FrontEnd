'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle2, ChevronDown, Clapperboard, Download, HelpCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import QuizPanel from '@/components/sections/QuizPanel';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api-errors';
import { certificateDownloadUrl, certificateKeys, getCertificateForCourse } from '@/services/certificates.service';
import { completeLesson, enroll, enrollmentKeys, getCourseProgress } from '@/services/enrollments.service';
import { toast } from '@/stores/toast-store';

const formatMinutes = (seconds) => `${Math.max(1, Math.round(seconds / 60))} min`;

// Saved every few seconds while a lesson's video plays, so reopening it (even in a later visit on
// this device) resumes where the learner left off instead of restarting from zero.
const resumeKey = (lessonId) => `nibras:lesson-video-position:${lessonId}`;

function readResumePosition(lessonId) {
  try {
    const raw = window.localStorage.getItem(resumeKey(lessonId));
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeResumePosition(lessonId, seconds) {
  try {
    window.localStorage.setItem(resumeKey(lessonId), String(Math.floor(seconds)));
  } catch {
    // Private browsing / storage disabled — resuming just won't work this time.
  }
}

function clearResumePosition(lessonId) {
  try {
    window.localStorage.removeItem(resumeKey(lessonId));
  } catch {
    // Nothing to clean up if storage was never writable.
  }
}

/**
 * A VIDEO lesson's player. Resumes from the last saved position on open, and — this is the only
 * way a video lesson can be marked complete — calls `onEnded` once the video actually finishes.
 * There's no manual "mark complete" for a video; completion is earned by watching it.
 */
function LessonVideoPlayer({ lesson, onEnded }) {
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const resumeAt = readResumePosition(lesson.id);
    const applyResume = () => {
      if (resumeAt > 0 && resumeAt < video.duration - 1) video.currentTime = resumeAt;
    };
    if (video.readyState >= 1) applyResume();
    else video.addEventListener('loadedmetadata', applyResume, { once: true });
    return () => video.removeEventListener('loadedmetadata', applyResume);
  }, [lesson.id]);

  const handleTimeUpdate = (event) => {
    const current = event.currentTarget.currentTime;
    // Writing on every timeupdate (several times a second) is wasteful — every ~3s is plenty.
    if (current - lastSavedRef.current >= 3) {
      lastSavedRef.current = current;
      writeResumePosition(lesson.id, current);
    }
  };

  const handleEnded = () => {
    clearResumePosition(lesson.id);
    if (!lesson.completed) onEnded();
  };

  return (
    <video
      ref={videoRef}
      key={lesson.videoUrl}
      src={lesson.videoUrl}
      controls
      preload="metadata"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      className="aspect-video w-full rounded-lg bg-black"
    />
  );
}

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
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [expandedVideoId, setExpandedVideoId] = useState(null);

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

  // Optimistic: flips the lesson to completed (and recomputes the progress bar) the instant its
  // video ends, then reconciles with the server's response — rolled back with a toast if the
  // request fails. One-way only: a video lesson is completed by watching it, never by a manual
  // click, and there's no "mark as not complete" either.
  const autoCompleteLesson = useMutation({
    mutationFn: (lessonId) => completeLesson(lessonId),
    onMutate: async (lessonId) => {
      await queryClient.cancelQueries({ queryKey: enrollmentKeys.course(courseId) });
      const previous = queryClient.getQueryData(enrollmentKeys.course(courseId));
      if (previous) {
        const sections = previous.sections.map((s) => ({
          ...s,
          lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, completed: true } : l)),
        }));
        const completedLessons = sections.flatMap((s) => s.lessons).filter((l) => l.completed).length;
        const { totalLessons } = previous.progress;
        const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        queryClient.setQueryData(enrollmentKeys.course(courseId), {
          ...previous,
          sections,
          progress: { ...previous.progress, completedLessons, percent },
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(enrollmentKeys.course(courseId), context.previous);
      toast.error(errorMessage(error, t));
    },
    onSuccess: (result) => queryClient.setQueryData(enrollmentKeys.course(courseId), result.data),
  });

  const enrolled = Boolean(progress.data);
  const sections = enrolled ? progress.data.sections : initialSections;
  const percent = enrolled ? progress.data.progress.percent : null;
  const lessonCount = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  const certificate = useQuery({
    queryKey: certificateKeys.course(courseId),
    queryFn: () => getCertificateForCourse(courseId),
    enabled: enrolled && percent === 100,
  });

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
            {certificate.data ? (
              <a
                href={certificateDownloadUrl(certificate.data.id)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-3 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm transition-colors hover:bg-primary-soft/80"
              >
                <Award className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex-1 font-medium text-foreground">{t('courses.detail.certificateEarned')}</span>
                <Download className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </a>
            ) : null}
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
                  const isQuiz = lesson.type === 'QUIZ';
                  const isVideo = lesson.type === 'VIDEO';
                  const expanded = expandedQuizId === lesson.id;
                  const videoExpanded = expandedVideoId === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <div className="flex items-center gap-3 px-5 py-3 text-sm">
                        {enrolled && isVideo && autoCompleteLesson.isPending && autoCompleteLesson.variables === lesson.id ? (
                          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
                        ) : enrolled && lesson.completed ? (
                          <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                        ) : (
                          <Icon className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
                        )}
                        <span className={cn('flex-1', enrolled && lesson.completed ? 'text-foreground-subtle line-through' : 'text-foreground-muted')}>
                          {lessonTitle}
                        </span>
                        {isQuiz ? (
                          enrolled ? (
                            <button
                              type="button"
                              onClick={() => setExpandedQuizId(expanded ? null : lesson.id)}
                              aria-expanded={expanded}
                              className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary"
                            >
                              {t('courses.detail.quiz')}
                              <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
                            </button>
                          ) : (
                            <span className="shrink-0 text-xs font-medium text-foreground-subtle">{t('courses.detail.quiz')}</span>
                          )
                        ) : isVideo && enrolled ? (
                          <button
                            type="button"
                            onClick={() => setExpandedVideoId(videoExpanded ? null : lesson.id)}
                            aria-expanded={videoExpanded}
                            className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary"
                          >
                            {lesson.durationSeconds ? <span className="text-foreground-subtle">{formatMinutes(lesson.durationSeconds)}</span> : null}
                            {t('courses.detail.watch')}
                            <ChevronDown className={cn('size-3.5 transition-transform', videoExpanded && 'rotate-180')} aria-hidden="true" />
                          </button>
                        ) : lesson.durationSeconds ? (
                          <span className="shrink-0 text-xs text-foreground-subtle">{formatMinutes(lesson.durationSeconds)}</span>
                        ) : null}
                      </div>
                      {isQuiz && enrolled && expanded ? (
                        <div className="border-t border-border bg-surface-muted/40 px-5 py-4">
                          <QuizPanel courseId={courseId} lessonId={lesson.id} mode={lesson.quizMode} locale={locale} />
                        </div>
                      ) : null}
                      {isVideo && enrolled && videoExpanded ? (
                        <div className="border-t border-border bg-surface-muted/40 p-3">
                          {lesson.videoUrl ? (
                            <LessonVideoPlayer lesson={lesson} onEnded={() => autoCompleteLesson.mutate(lesson.id)} />
                          ) : (
                            <p className="px-2 py-3 text-sm text-foreground-subtle">{t('courses.detail.videoUnavailable')}</p>
                          )}
                        </div>
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
