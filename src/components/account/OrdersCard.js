'use client';

import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { errorMessage } from '@/lib/api-errors';
import { listMyOrders, orderKeys } from '@/services/orders.service';

const STATUS_TONE = {
  PENDING: 'bg-warning/15 text-warning',
  PAID: 'bg-success-soft text-success',
  CANCELLED: 'bg-error-soft text-error',
};

/** The signed-in user's recent orders. Shown on the account page. */
export default function OrdersCard() {
  const { t, format } = useI18n();
  const orders = useQuery({ queryKey: orderKeys.mine(), queryFn: listMyOrders });
  const rows = (orders.data ?? []).slice(0, 3);

  if (orders.isPending) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('account.orders.loading')}>
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (orders.isError) return <Alert tone="error" title={errorMessage(orders.error, t)} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <ClipboardList className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm text-foreground-muted">{t('account.orders.empty')}</p>
        <Link href="/courses" className="mt-3 text-sm font-medium text-primary hover:underline">
          {t('account.orders.browse')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((order) => (
        <li key={order.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-sm text-foreground-muted">
            {t('account.orders.placedOn', { date: format.date(order.createdAt, { dateStyle: 'medium' }) })}
          </span>
          <span className="shrink-0 text-sm font-medium text-foreground">{format.currency(order.totalCents / 100)}</span>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_TONE[order.status]}`}>
            {t(`account.orders.status.${order.status}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}
