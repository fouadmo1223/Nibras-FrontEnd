'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api-errors';
import { addToCart, cartKeys, listMyCart, removeFromCart } from '@/services/cart.service';
import { toast } from '@/stores/toast-store';

/**
 * Add/remove-from-cart toggle for a paid course. `compact` renders an icon-only button for
 * overlaying on a course card image (mirrors `WishlistButton`); otherwise icon + label, for the
 * course detail page. `priceCents` (optional) keeps the account page's cart subtotal accurate
 * during the optimistic update, before the real row lands. Hidden for guests.
 */
export default function CartButton({ courseId, priceCents, compact = false, className }) {
  const { t } = useI18n();
  const session = useSession();
  const signedIn = Boolean(session.data);
  const queryClient = useQueryClient();

  const cart = useQuery({ queryKey: cartKeys.mine(), queryFn: listMyCart, enabled: signedIn });
  const inCart = Boolean(cart.data?.items.some((item) => item.course.id === courseId));

  // Optimistic: flips the button (and every other one watching this course) instantly on click
  // instead of waiting for a round trip, then reconciles with the server in the background.
  const toggle = useMutation({
    mutationFn: () => (inCart ? removeFromCart(courseId) : addToCart(courseId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKeys.mine() });
      const previous = queryClient.getQueryData(cartKeys.mine());
      queryClient.setQueryData(cartKeys.mine(), (current) => {
        const items = current?.items ?? [];
        const nextItems = inCart
          ? items.filter((item) => item.course.id !== courseId)
          : [...items, { id: `optimistic-${courseId}`, course: { id: courseId, priceCents: priceCents ?? 0 } }];
        return { items: nextItems, totalCents: nextItems.reduce((sum, item) => sum + (item.course.priceCents ?? 0), 0) };
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(cartKeys.mine(), context.previous);
      toast.error(errorMessage(error, t));
    },
    onSuccess: (result) => toast.success(result.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKeys.mine() }),
  });

  if (!signedIn) return null;

  // The accessible name stays fully descriptive; the visible label on the non-compact (detail
  // page) variant stays short on purpose — "Remove from cart" wraps onto three lines in a narrow
  // sidebar next to the wishlist button, which reads as broken, not busy.
  const fullLabel = inCart ? t('courses.detail.removeFromCart') : t('courses.detail.addToCart');
  const shortLabel = inCart ? t('courses.detail.inCart') : t('courses.detail.addToCartShort');

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle.mutate();
      }}
      disabled={toggle.isPending}
      aria-pressed={inCart}
      aria-label={fullLabel}
      title={fullLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-60',
        compact
          ? cn(
              'rounded-full p-1.5 shadow-elevation-1 backdrop-blur-sm',
              inCart ? 'bg-primary text-primary-foreground' : 'bg-surface/90 text-foreground-subtle hover:text-primary',
            )
          : cn(
              'w-full rounded-md border px-4 py-2.5',
              inCart ? 'border-primary/30 bg-primary-soft text-primary' : 'border-border-strong bg-surface text-foreground hover:bg-surface-muted',
            ),
        className,
      )}
    >
      {/* Reflects the optimistic state immediately (see onMutate above) — `disabled` alone is
          enough of a busy cue, and it keeps a second click from racing the first. */}
      <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
      {compact ? null : <span className="whitespace-nowrap">{shortLabel}</span>}
    </button>
  );
}
