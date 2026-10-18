'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import Button from '@/components/ui/Button';
import QuizModal from '@/components/sections/QuizModal';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { cn } from '@/lib/cn';
import { enrollmentKeys } from '@/services/enrollments.service';
import {
  getMyQuizAttemptStatus,
  getMyQuizSubmission,
  quizKeys,
  startQuizAttempt,
  submitQuizAttempt,
  uploadQuizSubmission,
} from '@/services/quizzes.service';
import { toast } from '@/stores/toast-store';

/** MCQ: a popup, one question per step, forward/back before submitting. One attempt — once submitted, only the past score shows. */
function McqPanel({ courseId, lessonId, lessonTitle, locale }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [modalQuestions, setModalQuestions] = useState(null);

  const status = useQuery({ queryKey: quizKeys.attempt(lessonId), queryFn: () => getMyQuizAttemptStatus(lessonId) });

  const start = useMutation({
    mutationFn: () => startQuizAttempt(lessonId),
    onSuccess: (data) => setModalQuestions(data.questions),
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const submit = useMutation({
    mutationFn: (answers) => submitQuizAttempt(lessonId, answers),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: quizKeys.attempt(lessonId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.course(courseId) });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (status.isPending) {
    return <Loader2 className="size-5 animate-spin text-foreground-subtle" aria-hidden="true" />;
  }

  if (status.data?.submitted) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
        <span className="font-medium text-foreground">{t('courses.quizPanel.scoreResult', { score: status.data.scorePercent })}</span>
      </div>
    );
  }

  return (
    <>
      <Button size="sm" loading={start.isPending} onClick={() => start.mutate()}>
        {t('courses.quizPanel.start')}
      </Button>
      <QuizModal
        open={Boolean(modalQuestions)}
        lessonTitle={lessonTitle}
        questions={modalQuestions ?? []}
        locale={locale}
        submitting={submit.isPending}
        onSubmit={async (answers) => {
          try {
            const result = await submit.mutateAsync(answers);
            return result.data;
          } catch {
            return null;
          }
        }}
        onClose={() => setModalQuestions(null)}
      />
    </>
  );
}

/** Upload: one zip, graded by hand. Once submitted, shows status/grade instead of the upload form. */
function UploadPanel({ courseId, lessonId }) {
  const { t, format } = useI18n();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const submission = useQuery({ queryKey: quizKeys.submission(lessonId), queryFn: () => getMyQuizSubmission(lessonId) });

  const upload = useMutation({
    mutationFn: (file) => uploadQuizSubmission(lessonId, file, setProgress),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: quizKeys.submission(lessonId) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.course(courseId) });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (submission.isPending) {
    return <Loader2 className="size-5 animate-spin text-foreground-subtle" aria-hidden="true" />;
  }

  if (submission.data) {
    const { submittedAt, gradePercent, feedback } = submission.data;
    return (
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
          <span className="text-foreground-muted">{t('courses.quizPanel.uploadedAt', { date: format.date(submittedAt, { dateStyle: 'medium' }) })}</span>
        </div>
        {gradePercent === null ? (
          <p className="text-foreground-subtle">{t('courses.quizPanel.awaitingGrade')}</p>
        ) : (
          <>
            <p className="font-medium text-foreground">{t('courses.quizPanel.grade', { grade: gradePercent })}</p>
            {feedback ? (
              <p className="text-foreground-muted">
                <span className="font-medium text-foreground">{t('courses.quizPanel.feedback')}: </span>
                {feedback}
              </p>
            ) : null}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-6 py-8 text-center transition-colors hover:bg-surface-muted">
        <UploadCloud className="size-6 text-foreground-subtle" aria-hidden="true" />
        <span className="text-sm text-foreground-muted">{t('courses.quizPanel.uploadLabel')}</span>
        <input
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) upload.mutate(file);
          }}
        />
      </label>
      {upload.isPending ? (
        <p className="mt-2 text-xs text-foreground-subtle">{t('courses.quizPanel.uploading', { percent: progress })}</p>
      ) : null}
    </div>
  );
}

/** Renders the right flow for a quiz lesson's configured mode, inline under its row in the syllabus. */
export default function QuizPanel({ courseId, lessonId, mode, locale }) {
  const { t } = useI18n();
  if (mode === 'MCQ') return <McqPanel courseId={courseId} lessonId={lessonId} locale={locale} />;
  if (mode === 'UPLOAD') return <UploadPanel courseId={courseId} lessonId={lessonId} />;
  return <p className="text-sm text-foreground-subtle">{t('courses.quizPanel.notConfigured')}</p>;
}
