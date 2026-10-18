'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Heart, House, ShoppingCart, UserRound } from 'lucide-react';
import { useSession } from '@/hooks/use-auth';
import { splitLocale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { cartKeys, listMyCart } from '@/services/cart.service';
import { listMyWishlist, wishlistKeys } from '@/services/wishlist.service';
import { isActivePath } from './nav-items';

function TabLink({ href, icon: Icon, label, active, count }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5"
    >
      <span className={cn('relative grid size-9 place-items-center rounded-full transition-colors', active && 'bg-primary-soft')}>
        <Icon className={cn('size-[1.35rem]', active ? 'text-primary' : 'text-foreground-subtle')} strokeWidth={active ? 2.25 : 2} aria-hidden="true" />
        {count > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-semibold leading-none text-white"
          >
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </span>
      <span className={cn('max-w-full truncate text-[11px] leading-none', active ? 'font-semibold text-primary' : 'font-medium text-foreground-subtle')}>
        {label}
      </span>
    </Link>
  );
}

/**
 * Bottom tab bar for narrow screens — replaces the old hamburger slide-out menu with primary,
 * always-visible navigation (the app-like pattern users expect on a phone). Wishlist/cart badge
 * counts only fetch once signed in; for guests the icons still navigate, landing on a sign-in
 * prompt same as clicking them from the desktop header would.
 */
export default function MobileTabBar() {
  const { t } = useI18n();
  const session = useSession();
  const signedIn = Boolean(session.data);
  const current = splitLocale(usePathname()).path;

  const wishlist = useQuery({ queryKey: wishlistKeys.mine(), queryFn: listMyWishlist, enabled: signedIn });
  const cart = useQuery({ queryKey: cartKeys.mine(), queryFn: listMyCart, enabled: signedIn });

  const tabs = [
    { key: 'home', href: '/', icon: House, label: t('nav.home') },
    { key: 'courses', href: '/courses', icon: BookOpen, label: t('nav.courses') },
    { key: 'wishlist', href: '/wishlist', icon: Heart, label: t('nav.wishlist'), count: wishlist.data?.length ?? 0 },
    { key: 'cart', href: '/cart', icon: ShoppingCart, label: t('nav.cart'), count: cart.data?.items.length ?? 0 },
    { key: 'account', href: signedIn ? '/account' : '/login', icon: UserRound, label: t('nav.account') },
  ];

  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-stretch px-1">
        {tabs.map((tab) => (
          <TabLink key={tab.key} href={tab.href} icon={tab.icon} label={tab.label} active={isActivePath(current, tab.href)} count={tab.count} />
        ))}
      </div>
    </nav>
  );
}
