'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useSession } from '@/hooks/use-auth';
import { splitLocale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import MobileNav from './MobileNav';
import { isActivePath, NAV_ITEMS } from './nav-items';
import { LanguageMenu, ThemeMenu } from './PreferenceMenus';
import UserMenu from './UserMenu';

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
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200',
        scrolled ? 'border-border bg-background/80 shadow-elevation-1 backdrop-blur-xl' : 'border-transparent',
      )}
    >
      <a
        href="#main"
        className="absolute start-4 top-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
      >
        {t('common.skipToContent')}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t('common.brandHome')} className="shrink-0 rounded-md">
          <Logo markClassName="size-7" wordClassName="text-xl" lang={locale} />
        </Link>

        <nav aria-label={t('nav.main')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ key, href }) => {
              const active = isActivePath(current, href);
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors',
                      active ? 'bg-surface-muted text-foreground' : 'text-foreground-muted hover:text-foreground',
                    )}
                  >
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <div className="hidden items-center gap-0.5 lg:flex">
            <LanguageMenu />
            <ThemeMenu />
          </div>
          <span className="mx-1.5 hidden h-6 w-px bg-border lg:block" aria-hidden="true" />

          {session.isPending ? (
            <span className="size-9 animate-pulse rounded-full bg-surface-muted" aria-hidden="true" />
          ) : session.data ? (
            <UserMenu user={session.data.user} />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/login" className="inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium text-foreground-muted hover:text-foreground">
                {t('nav.signIn')}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-elevation-1 transition-colors hover:bg-primary-hover"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          )}
          <MobileNav session={session.data} />
        </div>
      </div>
    </header>
  );
}
