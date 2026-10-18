'use client';

import { Heart } from 'lucide-react';
import RequireSession from '@/components/account/RequireSession';
import WishlistGrid from '@/components/account/WishlistGrid';
import { useI18n } from '@/i18n/I18nProvider';

/** Standalone `/wishlist` page: every saved course as a card (image, title, price, add-to-cart, remove). */
export default function WishlistView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Heart className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{t('account.wishlist.title')}</h1>
          <p className="mt-1 text-foreground-muted">{t('account.wishlist.description')}</p>
        </div>
      </div>
      <div className="mt-8">
        <RequireSession next="/wishlist" loadingLabel={t('account.wishlist.loading')}>
          {() => <WishlistGrid />}
        </RequireSession>
      </div>
    </div>
  );
}
