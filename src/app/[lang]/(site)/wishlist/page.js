import { Suspense } from 'react';
import WishlistView from '@/components/account/WishlistView';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.wishlist'), robots: { index: false } };
}

export default function WishlistPage() {
  return (
    <Suspense>
      <WishlistView />
    </Suspense>
  );
}
