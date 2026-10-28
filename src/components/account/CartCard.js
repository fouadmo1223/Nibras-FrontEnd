'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { cartKeys, listMyCart, removeFromCart } from '@/services/cart.service';
import { toast } from '@/stores/toast-store';

/** The signed-in user's cart — paid courses they intend to buy. Checkout itself happens on the full `/cart` page. */
export default function CartCard() {
  const { t, locale, format } = useI18n();
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: cartKeys.mine(), queryFn: listMyCart });
  const rows = cart.data?.items ?? [];

  const remove = useMutation({
    mutationFn: (courseId) => removeFromCart(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (cart.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('account.cart.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (cart.isError) return <Alert tone="error" title={errorMessage(cart.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <ShoppingCart className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-foreground-muted">{t('account.cart.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.cart.browse')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {rows.map((item) => {
          const title = locale === 'ar' ? item.course.titleAr : item.course.titleEn;
          return (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
              <Link href={`/courses/${item.course.slug}`} className="min-w-0 flex-1 truncate font-medium text-foreground hover:text-primary">
                {title}
              </Link>
              <span className="shrink-0 text-sm text-foreground-subtle">{format.currency(item.course.priceCents / 100)}</span>
              <button
                type="button"
                onClick={() => remove.mutate(item.course.id)}
                disabled={remove.isPending && remove.variables === item.course.id}
                aria-label={t('account.cart.remove')}
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
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="font-medium text-foreground">{t('account.cart.total')}</span>
        <span className="font-semibold text-foreground">{format.currency(cart.data.totalCents / 100)}</span>
      </div>
      <Link href="/cart" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        {t('account.cart.goToCart')}
      </Link>
    </div>
  );
}
