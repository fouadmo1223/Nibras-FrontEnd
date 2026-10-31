'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Loader2, Trash2, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card, { CardGlow } from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CartButton from '@/components/ui/CartButton';
import CoursePrice from '@/components/ui/CoursePrice';
import { EmptyWishlistIllustration } from './EmptyStateIllustration';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { clearWishlist, listMyWishlist, removeFromWishlist, wishlistKeys } from '@/services/wishlist.service';
import { toast } from '@/stores/toast-store';

/** One saved course: cover, title, price, add-to-cart (paid courses) and an explicit remove button. */
function WishlistItemCard({ item, locale, format, t, onRemove, removing }) {
  const title = locale === 'ar' ? item.course.titleAr : item.course.titleEn;

  return (
    <Card variant="glass" hover className="flex flex-col p-3">
      <CardGlow />
      <Link href={`/courses/${item.course.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
          {item.course.imageUrl ? (
            <Image
              src={item.course.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, 90vw"
              unoptimized
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center bg-surface-muted text-foreground-subtle">
              <BookOpen className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <h3 className="relative mt-3 line-clamp-2 font-semibold text-foreground group-hover:text-primary">{title}</h3>
        <div className="relative mt-2 flex-1">
          <CoursePrice priceCents={item.course.priceCents} compareAtPriceCents={item.course.compareAtPriceCents} format={format} t={t} />
        </div>
      </Link>
      <div className="relative mt-3 flex items-center gap-2">
        {item.course.priceCents > 0 ? <CartButton courseId={item.course.id} priceCents={item.course.priceCents} className="flex-1" /> : null}
        <button
          type="button"
          onClick={() => onRemove(item.course.id)}
          disabled={removing}
          aria-busy={removing || undefined}
          aria-label={t('courses.card.removeFromWishlist')}
          title={t('courses.card.removeFromWishlist')}
          className={
            item.course.priceCents > 0
              ? 'shrink-0 rounded-md border border-border-strong p-2.5 text-foreground-subtle transition-colors hover:border-error/30 hover:bg-error-soft hover:text-error disabled:pointer-events-none disabled:opacity-60'
              : 'inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-error/30 hover:bg-error-soft hover:text-error disabled:pointer-events-none disabled:opacity-60'
          }
        >
          {removing ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <X className="size-4 shrink-0" aria-hidden="true" />
          )}
          {item.course.priceCents > 0 ? null : t('courses.card.removeFromWishlist')}
        </button>
      </div>
    </Card>
  );
}

/** The full wishlist as a grid of cards, with a "Clear wishlist" action. Shown on the standalone `/wishlist` page. */
export default function WishlistGrid() {
  const { t, locale, format } = useI18n();
  const queryClient = useQueryClient();
  const wishlist = useQuery({ queryKey: wishlistKeys.mine(), queryFn: listMyWishlist });
  const rows = wishlist.data ?? [];
  const [confirmingClear, setConfirmingClear] = useState(false);

  const remove = useMutation({
    mutationFn: (courseId) => removeFromWishlist(courseId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.mine() });
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  const clear = useMutation({
    mutationFn: clearWishlist,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: wishlistKeys.mine() });
      setConfirmingClear(false);
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (wishlist.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label={t('account.wishlist.loading')}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (wishlist.isError) return <Alert tone="error" title={errorMessage(wishlist.error, t)} />;

  if (rows.length === 0) {
    return (
      <Card variant="dashed" className="flex flex-col items-center px-6 py-14 text-center">
        <EmptyWishlistIllustration className="h-36 w-36" />
        <p className="mt-5 font-display text-xl tracking-tight text-foreground">{t('account.wishlist.empty')}</p>
        <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">{t('account.wishlist.emptyHint')}</p>
        <Link href="/courses" className="mt-5 text-sm font-medium text-primary hover:underline">
          {t('account.wishlist.browse')}
        </Link>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground-muted">{t('account.wishlist.itemCount', { count: rows.length })}</p>
        <Button variant="secondary" size="sm" onClick={() => setConfirmingClear(true)}>
          <Trash2 className="size-4" aria-hidden="true" />
          {t('account.wishlist.clear')}
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((item) => (
          <WishlistItemCard
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
      <ConfirmDialog
        open={confirmingClear}
        icon={Trash2}
        tone="danger"
        title={t('account.wishlist.clearConfirmTitle')}
        description={t('account.wishlist.clearConfirmDescription')}
        confirmLabel={t('account.wishlist.clear')}
        loading={clear.isPending}
        onCancel={() => setConfirmingClear(false)}
        onConfirm={() => clear.mutate()}
      />
    </div>
  );
}
