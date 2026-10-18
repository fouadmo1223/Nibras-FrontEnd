'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { listMyWishlist, removeFromWishlist, wishlistKeys } from '@/services/wishlist.service';
import { toast } from '@/stores/toast-store';

/** The signed-in user's saved courses. Shown on the account page. */
export default function WishlistCard() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const wishlist = useQuery({ queryKey: wishlistKeys.mine(), queryFn: listMyWishlist });
  const rows = wishlist.data ?? [];

  const remove = useMutation({
    mutationFn: (courseId) => removeFromWishlist(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.mine() });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (wishlist.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('account.wishlist.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (wishlist.isError) return <Alert tone="error" title={errorMessage(wishlist.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Heart className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-foreground-muted">{t('account.wishlist.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.wishlist.browse')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((item) => {
        const title = locale === 'ar' ? item.course.titleAr : item.course.titleEn;
        return (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <Link href={`/courses/${item.course.slug}`} className="min-w-0 flex-1 truncate font-medium text-foreground hover:text-primary">
              {title}
            </Link>
            <button
              type="button"
              onClick={() => remove.mutate(item.course.id)}
              disabled={remove.isPending && remove.variables === item.course.id}
              aria-label={t('account.wishlist.remove')}
              className="shrink-0 rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-error-soft hover:text-error disabled:opacity-60"
            >
              {remove.isPending && remove.variables === item.course.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <X className="size-4" aria-hidden="true" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
