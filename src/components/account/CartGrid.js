'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, ClipboardCheck, ShoppingCart, Trash2, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CoursePrice from '@/components/ui/CoursePrice';
import { useI18n } from '@/i18n/I18nProvider';
import { Link, useLocaleRouter } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { cartKeys, clearCart, listMyCart, removeFromCart } from '@/services/cart.service';
import { orderKeys, placeOrder } from '@/services/orders.service';
import { toast } from '@/stores/toast-store';

/** One cart item: cover, title, price and an explicit remove button. */
function CartItemCard({ item, locale, format, t, onRemove, removing }) {
  const title = locale === 'ar' ? item.course.titleAr : item.course.titleEn;

  return (
    <Card variant="glass" className="flex flex-col p-3">
      <Link href={`/courses/${item.course.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
          {item.course.imageUrl ? (
            <Image src={item.course.imageUrl} alt="" fill sizes="(min-width: 1024px) 320px, 90vw" unoptimized className="object-cover" />
          ) : (
            <div className="grid size-full place-items-center bg-surface-muted text-foreground-subtle">
              <BookOpen className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 font-semibold text-foreground hover:text-primary">{title}</h3>
        <div className="mt-2 flex-1">
          <CoursePrice priceCents={item.course.priceCents} compareAtPriceCents={item.course.compareAtPriceCents} format={format} t={t} />
        </div>
      </Link>
      <button
        type="button"
        onClick={() => onRemove(item.course.id)}
        disabled={removing}
        aria-label={t('courses.detail.removeFromCart')}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-error/30 hover:bg-error-soft hover:text-error disabled:opacity-60"
      >
        <X className="size-4 shrink-0" aria-hidden="true" />
        {t('courses.detail.removeFromCart')}
      </button>
    </Card>
  );
}

/** The full cart as a grid of cards, a running subtotal and a "Clear cart" action. Shown on the standalone `/cart` page. */
export default function CartGrid() {
  const { t, locale, format } = useI18n();
  const router = useLocaleRouter();
  const queryClient = useQueryClient();
  const cart = useQuery({ queryKey: cartKeys.mine(), queryFn: listMyCart });
  const rows = cart.data?.items ?? [];
  const [confirmingClear, setConfirmingClear] = useState(false);

  const place = useMutation({
    mutationFn: placeOrder,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      router.push('/orders');
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const remove = useMutation({
    mutationFn: (courseId) => removeFromCart(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: cartKeys.mine() });
      setConfirmingClear(false);
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (cart.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={t('account.cart.loading')}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (cart.isError) return <Alert tone="error" title={errorMessage(cart.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <ShoppingCart className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-foreground-muted">{t('account.cart.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.cart.browse')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => setConfirmingClear(true)}>
          <Trash2 className="size-4" aria-hidden="true" />
          {t('account.cart.clear')}
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            locale={locale}
            format={format}
            t={t}
            onRemove={(courseId) => remove.mutate(courseId)}
            removing={remove.isPending && remove.variables === item.course.id}
          />
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{t('account.cart.total')}</span>
          <span className="text-xl font-semibold text-foreground">{format.currency(cart.data.totalCents / 100)}</span>
        </div>
        <Button className="mt-4 w-full" loading={place.isPending} onClick={() => place.mutate()}>
          <ClipboardCheck className="size-4" aria-hidden="true" />
          {t('account.cart.placeOrder')}
        </Button>
        <p className="mt-3 text-sm text-foreground-subtle">{t('account.cart.checkoutComingSoon')}</p>
      </div>
      <ConfirmDialog
        open={confirmingClear}
        icon={Trash2}
        tone="danger"
        title={t('account.cart.clearConfirmTitle')}
        description={t('account.cart.clearConfirmDescription')}
        confirmLabel={t('account.cart.clear')}
        loading={clear.isPending}
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => clear.mutate()}
      />
    </div>
  );
}
