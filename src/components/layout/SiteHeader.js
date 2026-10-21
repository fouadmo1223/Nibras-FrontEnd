'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useSession } from '@/hooks/use-auth';
import { splitLocale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { isActivePath, NAV_ITEMS } from './nav-items';
import NotificationBell from './NotificationBell';
import { LanguageMenu, ThemeMenu } from './PreferenceMenus';
import UserMenu from './UserMenu';
import WishlistCartNavIcons from './WishlistCartNavIcons';

/** Sticky site header: brand, primary navigation, language/theme menus and the account entry point. */
export default function SiteHeader() {
  const { t, locale } = useI18n();
  const session = useSession();
  const current = splitLocale(usePathname()).path;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
      <a
        href="#main"
        className="absolute start-4 top-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>
      <div
        className={cn(
          'glass mx-auto flex max-w-6xl items-center gap-6 rounded-2xl border px-4 transition-[height,box-shadow,background-color] duration-300 sm:px-6 lg:px-8',
          scrolled ? 'h-14 shadow-elevation-3' : 'h-16 shadow-elevation-2',
        )}
      >
        <Link href="/" aria-label={t('common.brandHome')} className="shrink-0 rounded-md">
          <Logo markClassName="size-7" wordClassName="text-xl" lang={locale} />
        </Link>

        <nav aria-label={t('nav.main')} className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface/50 p-1">
            {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
              const active = isActivePath(current, href);
              return (
                <li key={key} className="relative">
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors',
                      active ? 'text-foreground' : 'text-foreground-muted hover:text-foreground',
                    )}
                  >
                    {active && (
                      // Shared-layout pill: glides between items when the route changes.
                      <motion.span
                        layoutId="site-nav-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 -z-10 rounded-lg bg-surface-muted shadow-elevation-1"
                      />
                    )}
                    {Icon && <Icon className="size-4 text-primary transition-transform duration-200 group-hover:-rotate-6" aria-hidden="true" />}
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto hidden items-center gap-1.5 lg:flex">
          <div className="flex items-center gap-0.5">
            <LanguageMenu />
            <ThemeMenu />
          </div>
          <span className="mx-1.5 h-6 w-px bg-border" aria-hidden="true" />

          {session.isPending ? (
            <span className="size-9 animate-pulse rounded-full bg-surface-muted" aria-hidden="true" />
          ) : session.data ? (
            <>
              <WishlistCartNavIcons />
              <NotificationBell />
              <UserMenu user={session.data.user} />
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login" className="inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium text-foreground-muted hover:text-foreground">
                {t('nav.signIn')}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-elevation-1 transition-colors hover:bg-primary-hover"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile (<lg): no hamburger drawer — a fixed bottom tab bar (MobileTabBar, in SiteLayout)
            carries primary navigation instead. Just the avatar/sign-in stays reachable up here. */}
        <div className="ms-auto lg:hidden">
          {session.isPending ? (
            <span className="size-9 animate-pulse rounded-full bg-surface-muted" aria-hidden="true" />
          ) : session.data ? (
            <UserMenu user={session.data.user} />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-elevation-1"
            >
              {t('nav.signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
