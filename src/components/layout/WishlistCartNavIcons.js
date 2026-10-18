'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { cartKeys, listMyCart } from '@/services/cart.service';
import { listMyWishlist, wishlistKeys } from '@/services/wishlist.service';

function NavIconLink({ href, icon: Icon, count, label }) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      title={label}
      className="relative inline-grid size-9 shrink-0 place-items-center rounded-full text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Icon className="size-[1.125rem]" aria-hidden="true" />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}

/** Wishlist + cart icon links for signed-in users, each with an item-count badge. Both open the account page, where the full lists live. */
export default function WishlistCartNavIcons({ className }) {
  const { t } = useI18n();
  const wishlist = useQuery({ queryKey: wishlistKeys.mine(), queryFn: listMyWishlist });
  const cart = useQuery({ queryKey: cartKeys.mine(), queryFn: listMyCart });

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <NavIconLink href="/wishlist" icon={Heart} count={wishlist.data?.length ?? 0} label={t('nav.wishlist')} />
      <NavIconLink href="/cart" icon={ShoppingCart} count={cart.data?.items.length ?? 0} label={t('nav.cart')} />
    </div>
  );
}
