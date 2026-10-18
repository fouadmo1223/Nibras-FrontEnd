import { Suspense } from 'react';
import OrdersView from '@/components/account/OrdersView';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.orders'), robots: { index: false } };
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
