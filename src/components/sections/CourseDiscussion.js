'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, MessagesSquare, Send, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { ApiError } from '@/lib/api-client';
import { discussionKeys, listCourseDiscussion, postDiscussionMessage, removeDiscussionMessage } from '@/services/discussions.service';
import { toast } from '@/stores/toast-store';

/** A course's classroom Q&A board — visible once signed in and enrolled (or teaching it). */
export default function CourseDiscussion({ courseId }) {
  const { t, format } = useI18n();
  const session = useSession();
  const signedIn = Boolean(session.data);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const list = useQuery({
    queryKey: discussionKeys.course(courseId),
    queryFn: () => listCourseDiscussion(courseId),
    enabled: signedIn,
    retry: (count, error) => !(error instanceof ApiError && error.status === 403) && count < 2,
  });

  const post = useMutation({
    mutationFn: () => postDiscussionMessage(courseId, message.trim()),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: discussionKeys.course(courseId) });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (id) => removeDiscussionMessage(id),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: discussionKeys.course(courseId) });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (!signedIn) {
    return (
      <div className="mt-8">
        <h2 className="font-semibold text-foreground">{t('courses.discussion.title')}</h2>
        <p className="mt-3 text-sm text-foreground-muted">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('courses.discussion.signIn')}
          </Link>
        </p>
      </div>
    );
  }

  const locked = list.isError && list.error instanceof ApiError && list.error.status === 403;
  const rows = list.data ?? [];

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-foreground">{t('courses.discussion.title')}</h2>

      {locked ? (
        <Card variant="default" className="mt-4 flex flex-col items-center p-8 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-muted text-foreground-subtle">
            <Lock className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm text-foreground-muted">{t('courses.discussion.locked')}</p>
        </Card>
      ) : (
        <>
          <Card variant="default" className="mt-4 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) post.mutate();
              }}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('courses.discussion.placeholder')}
                rows={2}
                className="min-w-0 flex-1 resize-y rounded-lg border border-border-strong bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-foreground-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" loading={post.isPending} disabled={!message.trim()} className="shrink-0">
                <Send className="size-4" aria-hidden="true" />
                {t('courses.discussion.post')}
              </Button>
            </form>
          </Card>

          {rows.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {rows.map((msg) => (
                <Card as="li" key={msg.id} variant="default" className="flex gap-3 p-4">
                  <Avatar user={msg.user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-foreground">{msg.user.name}</span>
                      <span className="text-xs text-foreground-subtle">{format.date(msg.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground-muted">{msg.body}</p>
                  </div>
                  {msg.user.id === session.data.user.id ? (
                    <button
                      type="button"
                      onClick={() => remove.mutate(msg.id)}
                      disabled={remove.isPending && remove.variables === msg.id}
                      aria-label={t('courses.discussion.remove')}
                      className="shrink-0 self-start rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-error-soft hover:text-error disabled:opacity-60"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </Card>
              ))}
            </ul>
          ) : !list.isPending ? (
            <div className="mt-5 flex flex-col items-center py-8 text-center">
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <MessagesSquare className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm text-foreground-muted">{t('courses.discussion.empty')}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
