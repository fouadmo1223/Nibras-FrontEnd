'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronLeft, ChevronRight, ThumbsUp, Trophy, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Confetti from '@/components/ui/Confetti';
import { cn } from '@/lib/cn';
import { useI18n } from '@/i18n/I18nProvider';

const slideVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
};

function resultTier(scorePercent) {
  if (scorePercent >= 80) return 'high';
  if (scorePercent >= 60) return 'mid';
  return 'low';
}

const TIER_META = {
  high: { icon: Trophy, badge: 'bg-success-soft text-success', ring: 'ring-success/20' },
  mid: { icon: ThumbsUp, badge: 'bg-primary-soft text-primary', ring: 'ring-primary/20' },
  low: { icon: BookOpen, badge: 'bg-warning-soft text-warning', ring: 'ring-warning/20' },
};

/**
 * One question per step, answerable forward and back before submitting. A native <dialog>
 * (focus trap, Esc, inert background) like the rest of the site's modals. Submitting replaces
 * the stepper with a tiered result screen — a confetti burst at 80%+, a quieter nudge below 60%.
 */
export default function QuizModal({ open, lessonTitle, questions, onClose, onSubmit, submitting }) {
  const { t, locale } = useI18n();
  const dialogRef = useRef(null);
  const titleId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setStepIndex(0);
      setDirection(1);
      setAnswers({});
      setResult(null);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!questions?.length) return null;

  const question = questions[stepIndex];
  const total = questions.length;
  const isLast = stepIndex === total - 1;
  const answered = Boolean(answers[question.id]);

  const goTo = (index, dir) => {
    setDirection(dir);
    setStepIndex(index);
  };

  const handleSubmit = async () => {
    const payload = questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] }));
    const res = await onSubmit(payload);
    if (res) setResult(res);
  };

  const tier = result ? resultTier(result.scorePercent) : null;
  const TierIcon = tier ? TIER_META[tier].icon : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised p-0 text-foreground shadow-elevation-3 backdrop:bg-black/55 backdrop:backdrop-blur-sm open:animate-dialog-in"
    >
      <div className="relative p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('courses.quizPanel.close')}
          className="absolute end-5 top-5 grid size-8 place-items-center rounded-full text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <h2 id={titleId} className="pe-10 text-lg font-semibold tracking-tight text-foreground">
          {lessonTitle}
        </h2>

        {!result ? (
          <>
            <div className="mt-4 flex items-center gap-2">
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors duration-300',
                    i === stepIndex ? 'bg-primary' : answers[q.id] ? 'bg-primary/40' : 'bg-surface-muted',
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              {t('courses.quizPanel.stepOf', { current: stepIndex + 1, total })}
            </p>

            <div className="relative mt-4 min-h-56 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={question.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                >
                  <p className="text-base font-medium text-foreground">{locale === 'ar' ? question.textAr : question.textEn}</p>
                  <div className="mt-4 space-y-2">
                    {question.options.map((o) => {
                      const selected = answers[question.id] === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: o.id }))}
                          aria-pressed={selected}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-start text-sm transition-colors',
                            selected
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-border bg-surface text-foreground-muted hover:bg-surface-muted',
                          )}
                        >
                          <span className={cn('grid size-4 shrink-0 place-items-center rounded-full border-2', selected ? 'border-primary' : 'border-border-strong')}>
                            {selected ? <span className="size-2 rounded-full bg-primary" /> : null}
                          </span>
                          {locale === 'ar' ? o.textAr : o.textEn}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="secondary" size="sm" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1, -1)}>
                <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                {t('courses.quizPanel.back')}
              </Button>
              {isLast ? (
                <Button size="sm" disabled={!answered} loading={submitting} onClick={handleSubmit}>
                  {t('courses.quizPanel.submitStep')}
                </Button>
              ) : (
                <Button size="sm" disabled={!answered} onClick={() => goTo(stepIndex + 1, 1)}>
                  {t('courses.quizPanel.next')}
                  <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="relative mt-6 flex flex-col items-center text-center"
          >
            {tier === 'high' ? <Confetti /> : null}
            <span className={cn('grid size-16 place-items-center rounded-full ring-8', TIER_META[tier].badge, TIER_META[tier].ring)}>
              <TierIcon className="size-7" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-3xl tracking-tight text-foreground">{t('courses.quizPanel.scoreResult', { score: result.scorePercent })}</p>
            <h3 className="mt-3 text-lg font-semibold text-foreground">{t(`courses.quizPanel.result${tier === 'high' ? 'High' : tier === 'mid' ? 'Mid' : 'Low'}.title`)}</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-foreground-muted">
              {t(`courses.quizPanel.result${tier === 'high' ? 'High' : tier === 'mid' ? 'Mid' : 'Low'}.body`)}
            </p>
            <p className="mt-3 text-xs text-foreground-subtle">{t('courses.quizPanel.correctCount', { correct: result.correctCount, total: result.totalCount })}</p>
            <Button size="sm" className="mt-6" onClick={onClose}>
              {t('courses.quizPanel.close')}
            </Button>
          </motion.div>
        )}
      </div>
    </dialog>
  );
}
