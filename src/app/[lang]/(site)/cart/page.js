import { Suspense } from 'react';
import CartView from '@/components/account/CartView';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.cart'), robots: { index: false } };
}

export default function CartPage() {
  return (
    <Suspense>
      <CartView />
    </Suspense>
  );
}
