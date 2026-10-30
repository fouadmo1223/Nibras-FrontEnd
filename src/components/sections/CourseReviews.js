'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, Pencil, Star, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api-errors';
import { deleteMyReview, getMyReview, listCourseReviews, reviewKeys, saveMyReview } from '@/services/reviews.service';
import { toast } from '@/stores/toast-store';

function Stars({ value, size = 'size-4', onHover, onPick, interactive = false }) {
  return (
    <div className={cn('flex items-center gap-0.5', interactive && 'cursor-pointer')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          tabIndex={interactive ? 0 : -1}
          aria-hidden={!interactive}
          disabled={!interactive}
          onMouseEnter={() => onHover?.(n)}
          onMouseLeave={() => onHover?.(0)}
          onClick={() => onPick?.(n)}
          className={interactive ? 'rounded' : 'pointer-events-none'}
        >
          <Star className={cn(size, n <= value ? 'fill-warning text-warning' : 'fill-transparent text-foreground-subtle')} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

// Keyed by `existing?.id ?? 'new'` from the parent, so this remounts (fresh initial state and
// back to read-only/edit mode) the moment the caller's own review finishes loading or changes,
// instead of syncing via an effect.
function ReviewForm({ courseId, existing, format }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  // No existing review yet: start straight in the editable form. Already have one: start
  // collapsed to the compact read-only view below, with an edit icon to reopen the form.
  const [editing, setEditing] = useState(!existing);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? '');

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: reviewKeys.course(courseId) });
    queryClient.invalidateQueries({ queryKey: reviewKeys.mine(courseId) });
  };

  const save = useMutation({
    mutationFn: () => saveMyReview(courseId, { rating, comment: comment.trim() || undefined }),
    onSuccess: (result) => {
      toast.success(result.message);
      setEditing(false);
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: () => deleteMyReview(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      setRating(0);
      setComment('');
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (existing && !editing) {
    return (
      <Card variant="default" className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{t('courses.reviews.editYours')}</p>
            <div className="mt-2">
              <Stars value={existing.rating} size="size-5" />
            </div>
            {existing.comment ? <p className="mt-2 text-sm text-foreground-muted">{existing.comment}</p> : null}
            {existing.createdAt ? <p className="mt-2 text-xs text-foreground-subtle">{format.date(existing.createdAt, { dateStyle: 'medium' })}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={t('courses.reviews.edit')}
              className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              aria-label={t('courses.reviews.remove')}
              className="rounded-md p-2 text-foreground-muted transition-colors hover:bg-error-soft hover:text-error disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" className="p-5">
      <p className="text-sm font-medium text-foreground">{existing ? t('courses.reviews.editYours') : t('courses.reviews.leaveOne')}</p>
      <div className="mt-2">
        <Stars value={hovered || rating} size="size-6" interactive onHover={setHovered} onPick={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('courses.reviews.commentPlaceholder')}
        rows={3}
        className="mt-3 w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" loading={save.isPending} disabled={rating === 0} onClick={() => save.mutate()}>
          {existing ? t('courses.reviews.update') : t('courses.reviews.submit')}
        </Button>
        {existing ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={save.isPending}
            onClick={() => {
              setRating(existing.rating);
              setComment(existing.comment ?? '');
              setEditing(false);
            }}
          >
            {t('courses.reviews.cancel')}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/** Public course reviews: average rating, list, and (signed-in) a form to leave/edit the caller's own. */
export default function CourseReviews({ courseId }) {
  const { t, format } = useI18n();
  const session = useSession();
  const signedIn = Boolean(session.data);

  const list = useQuery({ queryKey: reviewKeys.course(courseId), queryFn: () => listCourseReviews(courseId) });
  const mine = useQuery({ queryKey: reviewKeys.mine(courseId), queryFn: () => getMyReview(courseId), enabled: signedIn });

  const rows = list.data?.items ?? [];
  const average = list.data?.averageRating ?? 0;
  const count = list.data?.reviewCount ?? 0;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground">{t('courses.reviews.title')}</h2>
        {count > 0 ? (
          <div className="flex items-center gap-2">
            <Stars value={Math.round(average)} />
            <span className="text-sm text-foreground-muted">{t('courses.reviews.summary', { average: average.toFixed(1), count })}</span>
          </div>
        ) : null}
      </div>

      {signedIn ? (
        <div className="mt-4">
          <ReviewForm key={mine.data?.id ?? 'new'} courseId={courseId} existing={mine.data ?? null} format={format} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('courses.reviews.signInToReview')}
          </Link>
        </p>
      )}

      {rows.length > 0 ? (
        <ul className="mt-5 space-y-4">
          {rows.map((review) => (
            <li key={review.id} className="flex gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
              <Avatar user={review.user} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">{review.user.name}</span>
                  <Stars value={review.rating} size="size-3.5" />
                  <span className="text-xs text-foreground-subtle">{format.date(review.createdAt, { dateStyle: 'medium' })}</span>
                </div>
                {review.comment ? <p className="mt-1 text-sm text-foreground-muted">{review.comment}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : !list.isPending ? (
        <div className="mt-5 flex flex-col items-center py-8 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <MessageSquareText className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm text-foreground-muted">{t('courses.reviews.empty')}</p>
        </div>
      ) : null}
    </div>
  );
}
