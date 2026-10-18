'use client';

import { ShoppingCart } from 'lucide-react';
import CartGrid from '@/components/account/CartGrid';
import RequireSession from '@/components/account/RequireSession';
import { useI18n } from '@/i18n/I18nProvider';

/** Standalone `/cart` page: every cart item as a card (image, title, price, remove), a subtotal and "Clear cart". */
export default function CartView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <ShoppingCart className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{t('account.cart.title')}</h1>
          <p className="mt-1 text-foreground-muted">{t('account.cart.description')}</p>
        </div>
      </div>
      <div className="mt-8">
        <RequireSession next="/cart" loadingLabel={t('account.cart.loading')}>
          {() => <CartGrid />}
        </RequireSession>
      </div>
    </div>
  );
}
