'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api-errors';
import { addToWishlist, listMyWishlist, removeFromWishlist, wishlistKeys } from '@/services/wishlist.service';
import { toast } from '@/stores/toast-store';

/**
 * A heart toggle for saving a course to the wishlist. `compact` renders an icon-only button for
 * overlaying on a course card image; otherwise it renders icon + label, for the course detail page.
 * Hidden entirely for guests — there's nothing to toggle until they're signed in.
 */
export default function WishlistButton({ courseId, compact = false, className }) {
  const { t } = useI18n();
  const session = useSession();
  const signedIn = Boolean(session.data);
  const queryClient = useQueryClient();

  const wishlist = useQuery({ queryKey: wishlistKeys.mine(), queryFn: listMyWishlist, enabled: signedIn });
  const wishlisted = Boolean(wishlist.data?.some((item) => item.course.id === courseId));

  // Optimistic: flips the heart (and every other button watching this same course) instantly on
  // click instead of waiting for a round trip, then reconciles with the server in the background.
  const toggle = useMutation({
    mutationFn: () => (wishlisted ? removeFromWishlist(courseId) : addToWishlist(courseId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: wishlistKeys.mine() });
      const previous = queryClient.getQueryData(wishlistKeys.mine());
      queryClient.setQueryData(wishlistKeys.mine(), (current = []) =>
        wishlisted
          ? current.filter((item) => item.course.id !== courseId)
          : [...current, { id: `optimistic-${courseId}`, course: { id: courseId } }],
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(wishlistKeys.mine(), context.previous);
      toast.error(errorMessage(error, t));
    },
    onSuccess: (result) => toast.success(result.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.mine() }),
  });

  if (!signedIn) return null;

  // The accessible name stays fully descriptive ("Remove from wishlist"); the visible label on the
  // non-compact (detail page) variant stays short on purpose — "Remove from wishlist" wraps onto
  // three lines in a narrow sidebar next to the cart button, which reads as broken, not busy.
  const fullLabel = wishlisted ? t('courses.card.removeFromWishlist') : t('courses.card.addToWishlist');
  const shortLabel = wishlisted ? t('courses.detail.wishlisted') : t('courses.detail.wishlist');

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle.mutate();
      }}
      disabled={toggle.isPending}
      aria-pressed={wishlisted}
      aria-label={fullLabel}
      title={fullLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-60',
        compact
          ? 'rounded-full bg-surface/90 p-1.5 text-foreground-subtle shadow-elevation-1 backdrop-blur-sm hover:text-error'
          : cn(
              'rounded-md border px-4 py-2.5',
              wishlisted
                ? 'border-error/30 bg-error-soft text-error hover:bg-error-soft/80'
                : 'border-border-strong bg-surface text-foreground hover:bg-surface-muted',
            ),
        className,
      )}
    >
      {/* The heart reflects the optimistic state immediately (see onMutate above) — it doesn't wait
          for the request, so no loading spinner would ever actually be seen here. `disabled` alone
          is enough of a busy cue, and it keeps a second click from racing the first. */}
      <Heart className={cn('size-4 shrink-0', wishlisted && 'fill-error text-error')} aria-hidden="true" />
      {compact ? null : <span className="whitespace-nowrap">{shortLabel}</span>}
    </button>
  );
}
