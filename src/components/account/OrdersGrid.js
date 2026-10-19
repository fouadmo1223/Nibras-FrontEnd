'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, X } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { cancelMyOrder, listMyOrders, orderKeys } from '@/services/orders.service';
import { toast } from '@/stores/toast-store';

const STATUS_TONE = {
  PENDING: 'bg-warning/15 text-warning',
  PAID: 'bg-success-soft text-success',
  CANCELLED: 'bg-error-soft text-error',
};

function OrderCard({ order, locale, format, t, onCancel, cancelling }) {
  return (
    <Card variant="glass" className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground-subtle">{t('account.orders.placedOn', { date: format.date(order.createdAt, { dateStyle: 'medium' }) })}</p>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_TONE[order.status]}`}>
          {t(`account.orders.status.${order.status}`)}
        </span>
      </div>
      <ul className="mt-3 space-y-2 border-t border-border pt-3">
        {order.items.map((orderItem) => {
          const title = locale === 'ar' ? orderItem.courseTitleAr : orderItem.courseTitleEn;
          return (
            <li key={orderItem.id} className="flex items-center justify-between gap-3 text-sm">
              {orderItem.course ? (
                <Link href={`/courses/${orderItem.course.slug}`} className="min-w-0 flex-1 truncate font-medium text-foreground hover:text-primary">
                  {title}
                </Link>
              ) : (
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
              )}
              <span className="shrink-0 text-foreground-subtle">{format.currency(orderItem.priceCentsAtPurchase / 100)}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 border-t border-border pt-3 text-sm">
        {order.discountCents > 0 ? (
          <>
            <div className="flex items-center justify-between text-foreground-subtle">
              <span>{t('account.orders.subtotal')}</span>
              <span>{format.currency(order.subtotalCents / 100)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-success">
              <span>{t('account.orders.discount', { code: order.couponCode })}</span>
              <span>−{format.currency(order.discountCents / 100)}</span>
            </div>
          </>
        ) : null}
        <div className="mt-1 flex items-center justify-between">
          <span className="font-medium text-foreground">{t('account.orders.total')}</span>
          <span className="font-semibold text-foreground">{format.currency(order.totalCents / 100)}</span>
        </div>
      </div>
      {order.status === 'PENDING' && (
        <button
          type="button"
          onClick={() => onCancel(order.id)}
          disabled={cancelling}
          className="mt-3 inline-flex items-center justify-center gap-2 self-start rounded-md border border-border-strong px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:border-error/30 hover:bg-error-soft hover:text-error disabled:opacity-60"
        >
          <X className="size-4" aria-hidden="true" />
          {t('account.orders.cancel')}
        </button>
      )}
    </Card>
  );
}

/** The full order history as a grid of cards, each cancellable while still PENDING. */
export default function OrdersGrid() {
  const { t, locale, format } = useI18n();
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: orderKeys.mine(), queryFn: listMyOrders });
  const rows = orders.data ?? [];
  const [cancellingId, setCancellingId] = useState(null);

  const cancel = useMutation({
    mutationFn: (id) => cancelMyOrder(id),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: orderKeys.mine() });
      setCancellingId(null);
    },
    onError: (error) => toast.error(errorMessage(error, t)),
  });

  if (orders.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label={t('account.orders.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (orders.isError) return <Alert tone="error" title={errorMessage(orders.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <ClipboardList className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-foreground-muted">{t('account.orders.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.orders.browse')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            locale={locale}
            format={format}
            t={t}
            onCancel={setCancellingId}
            cancelling={cancel.isPending && cancel.variables === order.id}
          />
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(cancellingId)}
        icon={X}
        tone="danger"
        title={t('account.orders.cancelConfirmTitle')}
        description={t('account.orders.cancelConfirmDescription')}
        confirmLabel={t('account.orders.cancel')}
        loading={cancel.isPending}
        onCancel={() => setCancellingId(null)}
        onConfirm={() => cancel.mutate(cancellingId)}
      />
    </div>
  );
}
